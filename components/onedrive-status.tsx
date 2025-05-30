"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, CheckCircle, AlertCircle, RefreshCw, ExternalLink } from "lucide-react"

interface OneDriveStatus {
  isConfigured: boolean
  connectionStatus: "connected" | "error" | "testing" | "unknown"
  document?: {
    name: string
    lastModified: string
    size: number
    webUrl?: string
  }
  lastSync?: string
  error?: string
}

export function OneDriveStatus() {
  const [status, setStatus] = useState<OneDriveStatus>({
    isConfigured: false,
    connectionStatus: "unknown",
  })
  const [testing, setTesting] = useState(false)

  const testConnection = async () => {
    setTesting(true)
    setStatus((prev) => ({ ...prev, connectionStatus: "testing" }))

    try {
      const response = await fetch("/api/test/onedrive")
      const result = await response.json()

      if (result.success) {
        setStatus({
          isConfigured: true,
          connectionStatus: "connected",
          document: result.documentTest?.success ? result.documentTest.document : undefined,
          error: result.documentTest?.error,
        })
      } else {
        setStatus({
          isConfigured: result.environment?.isConfigured || false,
          connectionStatus: "error",
          error: result.message,
        })
      }
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        connectionStatus: "error",
        error: "Failed to test connection",
      }))
    } finally {
      setTesting(false)
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  const getStatusIcon = () => {
    switch (status.connectionStatus) {
      case "connected":
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-400" />
      case "testing":
        return <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
      default:
        return <FileText className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusBadge = () => {
    switch (status.connectionStatus) {
      case "connected":
        return <Badge className="bg-green-600/20 text-green-400 border-green-500/30">Connected</Badge>
      case "error":
        return <Badge className="bg-red-600/20 text-red-400 border-red-500/30">Error</Badge>
      case "testing":
        return <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/30">Testing...</Badge>
      default:
        return <Badge className="bg-gray-600/20 text-gray-400 border-gray-500/30">Unknown</Badge>
    }
  }

  return (
    <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-sm border border-white/10 rounded-2xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          {getStatusIcon()}
          OneDrive Document Status
        </CardTitle>
        <CardDescription className="text-gray-400">Real-time status of your Word document integration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Connection Status</p>
            <div className="flex items-center gap-2 mt-1">{getStatusBadge()}</div>
          </div>
          <Button
            onClick={testConnection}
            disabled={testing}
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
          >
            {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Test"}
          </Button>
        </div>

        {status.document && (
          <div className="space-y-4">
            <div className="p-4 bg-green-900/20 rounded-lg border border-green-500/20">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-green-300 mb-2">Document Found</h4>
                  <div className="space-y-1 text-sm">
                    <div className="text-green-200">
                      <span className="text-green-400">Name:</span> {status.document.name}
                    </div>
                    <div className="text-green-200">
                      <span className="text-green-400">Size:</span> {Math.round(status.document.size / 1024)} KB
                    </div>
                    <div className="text-green-200">
                      <span className="text-green-400">Modified:</span>{" "}
                      {new Date(status.document.lastModified).toLocaleString()}
                    </div>
                  </div>
                </div>
                {status.document.webUrl && (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="border-green-500/30 text-green-400 hover:bg-green-600/10"
                  >
                    <a href={status.document.webUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {status.error && (
          <div className="p-4 bg-red-900/20 rounded-lg border border-red-500/20">
            <h4 className="font-medium text-red-300 mb-2">Error Details</h4>
            <p className="text-sm text-red-200">{status.error}</p>
          </div>
        )}

        <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/20">
          <h4 className="font-medium text-blue-300 mb-2">Document ID</h4>
          <p className="text-sm text-blue-200 font-mono break-all">ETzy7uxAp59Hj_ZX4NtB5bUBRiZ1HguU-qrc1NPshCULVw</p>
          <p className="text-xs text-blue-300 mt-2">
            This document will be automatically synced when changes are detected.
          </p>
        </div>

        {!status.isConfigured && (
          <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-500/20">
            <h4 className="font-medium text-yellow-300 mb-2">Setup Required</h4>
            <p className="text-sm text-yellow-200">
              Please configure your Microsoft credentials in the environment variables to enable OneDrive integration.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
