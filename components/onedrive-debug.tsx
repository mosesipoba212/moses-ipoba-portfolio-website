"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Bug } from "lucide-react"

interface DebugResult {
  timestamp: string
  environment: {
    hasClientId: boolean
    hasClientSecret: boolean
    hasTenantId: boolean
    hasDocumentId: boolean
    documentId: string
    clientIdLength: number
    tenantIdLength: number
  }
  tests: Array<{
    name: string
    status: "PASS" | "FAIL" | "ERROR" | "SKIP"
    details: any
  }>
}

export function OneDriveDebug() {
  const [debugResult, setDebugResult] = useState<DebugResult | null>(null)
  const [loading, setLoading] = useState(false)

  const runDiagnostics = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug/onedrive")
      const result = await response.json()
      setDebugResult(result)
    } catch (error) {
      console.error("Debug failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PASS":
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case "FAIL":
        return <XCircle className="w-4 h-4 text-red-400" />
      case "ERROR":
        return <AlertCircle className="w-4 h-4 text-orange-400" />
      case "SKIP":
        return <AlertCircle className="w-4 h-4 text-gray-400" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PASS":
        return <Badge className="bg-green-600/20 text-green-400 border-green-500/30">PASS</Badge>
      case "FAIL":
        return <Badge className="bg-red-600/20 text-red-400 border-red-500/30">FAIL</Badge>
      case "ERROR":
        return <Badge className="bg-orange-600/20 text-orange-400 border-orange-500/30">ERROR</Badge>
      case "SKIP":
        return <Badge className="bg-gray-600/20 text-gray-400 border-gray-500/30">SKIP</Badge>
      default:
        return <Badge className="bg-gray-600/20 text-gray-400 border-gray-500/30">UNKNOWN</Badge>
    }
  }

  return (
    <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-sm border border-white/10 rounded-2xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Bug className="w-6 h-6 text-orange-400" />
          OneDrive Diagnostics
        </CardTitle>
        <CardDescription className="text-gray-400">Comprehensive testing of your OneDrive integration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button
          onClick={runDiagnostics}
          disabled={loading}
          className="w-full bg-orange-600 hover:bg-orange-700 transition-all duration-300"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Running Diagnostics...
            </>
          ) : (
            <>
              <Bug className="w-4 h-4 mr-2" />
              Run Full Diagnostics
            </>
          )}
        </Button>

        {debugResult && (
          <div className="space-y-4">
            <div className="text-xs text-gray-500">Last run: {new Date(debugResult.timestamp).toLocaleString()}</div>

            {/* Environment Check */}
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <h4 className="font-medium text-white mb-3">Environment Variables</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  {debugResult.environment.hasClientId ? (
                    <CheckCircle className="w-3 h-3 text-green-400" />
                  ) : (
                    <XCircle className="w-3 h-3 text-red-400" />
                  )}
                  <span className="text-gray-300">Client ID ({debugResult.environment.clientIdLength} chars)</span>
                </div>
                <div className="flex items-center gap-2">
                  {debugResult.environment.hasClientSecret ? (
                    <CheckCircle className="w-3 h-3 text-green-400" />
                  ) : (
                    <XCircle className="w-3 h-3 text-red-400" />
                  )}
                  <span className="text-gray-300">Client Secret</span>
                </div>
                <div className="flex items-center gap-2">
                  {debugResult.environment.hasTenantId ? (
                    <CheckCircle className="w-3 h-3 text-green-400" />
                  ) : (
                    <XCircle className="w-3 h-3 text-red-400" />
                  )}
                  <span className="text-gray-300">Tenant ID ({debugResult.environment.tenantIdLength} chars)</span>
                </div>
                <div className="flex items-center gap-2">
                  {debugResult.environment.hasDocumentId ? (
                    <CheckCircle className="w-3 h-3 text-green-400" />
                  ) : (
                    <XCircle className="w-3 h-3 text-red-400" />
                  )}
                  <span className="text-gray-300">Document ID</span>
                </div>
              </div>
              {debugResult.environment.documentId && (
                <div className="mt-2 text-xs text-gray-500 font-mono break-all">
                  Document ID: {debugResult.environment.documentId}
                </div>
              )}
            </div>

            {/* Test Results */}
            <div className="space-y-3">
              <h4 className="font-medium text-white">Test Results</h4>
              {debugResult.tests.map((test, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    test.status === "PASS"
                      ? "bg-green-900/20 border-green-500/20"
                      : test.status === "FAIL"
                        ? "bg-red-900/20 border-red-500/20"
                        : test.status === "ERROR"
                          ? "bg-orange-900/20 border-orange-500/20"
                          : "bg-gray-800/50 border-gray-600/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(test.status)}
                      <span className="font-medium text-white">{test.name}</span>
                    </div>
                    {getStatusBadge(test.status)}
                  </div>

                  {test.details && (
                    <div className="text-sm text-gray-300">
                      <pre className="whitespace-pre-wrap font-mono text-xs bg-black/20 p-2 rounded mt-2 overflow-x-auto">
                        {JSON.stringify(test.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/20">
              <h4 className="font-medium text-blue-300 mb-2">Summary</h4>
              <div className="text-sm text-blue-200">
                <div>✅ Passed: {debugResult.tests.filter((t) => t.status === "PASS").length}</div>
                <div>❌ Failed: {debugResult.tests.filter((t) => t.status === "FAIL").length}</div>
                <div>⚠️ Errors: {debugResult.tests.filter((t) => t.status === "ERROR").length}</div>
                <div>⏭️ Skipped: {debugResult.tests.filter((t) => t.status === "SKIP").length}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
