"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, RefreshCw, Settings } from "lucide-react"

interface EnvDebugResult {
  timestamp: string
  environment: {
    hasClientId: boolean
    hasClientSecret: boolean
    hasTenantId: boolean
    hasDocumentId: boolean
    clientIdPrefix: string
    clientSecretPrefix: string
    clientSecretLength: number
    tenantIdPrefix: string
    documentIdPrefix: string
    clientSecretStartsWithQ: boolean
    clientIdMatches: boolean
    tenantIdMatches: boolean
  }
  tokenRequest: any
}

export function EnvironmentDebug() {
  const [debugResult, setDebugResult] = useState<EnvDebugResult | null>(null)
  const [loading, setLoading] = useState(false)

  const runEnvDebug = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug/env")
      const result = await response.json()
      setDebugResult(result)
    } catch (error) {
      console.error("Environment debug failed:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-sm border border-white/10 rounded-2xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-400" />
          Environment Variables Debug
        </CardTitle>
        <CardDescription className="text-gray-400">
          Check if your environment variables are properly configured
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button
          onClick={runEnvDebug}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-300"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Checking Environment...
            </>
          ) : (
            <>
              <Settings className="w-4 h-4 mr-2" />
              Check Environment Variables
            </>
          )}
        </Button>

        {debugResult && (
          <div className="space-y-4">
            <div className="text-xs text-gray-500">
              Last checked: {new Date(debugResult.timestamp).toLocaleString()}
            </div>

            {/* Environment Variables Status */}
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <h4 className="font-medium text-white mb-3">Environment Variables</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Client ID Present:</span>
                  <div className="flex items-center gap-2">
                    {debugResult.environment.hasClientId ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span className="font-mono text-xs">{debugResult.environment.clientIdPrefix}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Client Secret Present:</span>
                  <div className="flex items-center gap-2">
                    {debugResult.environment.hasClientSecret ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span className="font-mono text-xs">
                      {debugResult.environment.clientSecretPrefix} ({debugResult.environment.clientSecretLength} chars)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Tenant ID Present:</span>
                  <div className="flex items-center gap-2">
                    {debugResult.environment.hasTenantId ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span className="font-mono text-xs">{debugResult.environment.tenantIdPrefix}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Validation Checks */}
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <h4 className="font-medium text-white mb-3">Validation Checks</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Client Secret Format:</span>
                  {debugResult.environment.clientSecretStartsWithQ ? (
                    <Badge className="bg-green-600/20 text-green-400 border-green-500/30">✓ Correct Format</Badge>
                  ) : (
                    <Badge className="bg-red-600/20 text-red-400 border-red-500/30">✗ Wrong Format</Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Client ID Match:</span>
                  {debugResult.environment.clientIdMatches ? (
                    <Badge className="bg-green-600/20 text-green-400 border-green-500/30">✓ Matches</Badge>
                  ) : (
                    <Badge className="bg-red-600/20 text-red-400 border-red-500/30">✗ Mismatch</Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Tenant ID Match:</span>
                  {debugResult.environment.tenantIdMatches ? (
                    <Badge className="bg-green-600/20 text-green-400 border-green-500/30">✓ Matches</Badge>
                  ) : (
                    <Badge className="bg-red-600/20 text-red-400 border-red-500/30">✗ Mismatch</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Token Request Test */}
            {debugResult.tokenRequest && (
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <h4 className="font-medium text-white mb-3">Token Request Test</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Request Status:</span>
                    {debugResult.tokenRequest.success ? (
                      <Badge className="bg-green-600/20 text-green-400 border-green-500/30">Success</Badge>
                    ) : (
                      <Badge className="bg-red-600/20 text-red-400 border-red-500/30">
                        Failed ({debugResult.tokenRequest.status})
                      </Badge>
                    )}
                  </div>

                  {debugResult.tokenRequest.error && (
                    <div className="mt-3">
                      <h5 className="text-red-300 font-medium mb-2">Error Details:</h5>
                      <pre className="text-xs bg-red-900/20 p-3 rounded border border-red-500/20 text-red-200 overflow-x-auto">
                        {JSON.stringify(debugResult.tokenRequest.error, null, 2)}
                      </pre>
                    </div>
                  )}

                  {debugResult.tokenRequest.success && (
                    <div className="text-green-300">
                      ✅ Authentication successful! Token length: {debugResult.tokenRequest.tokenLength}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/20">
              <h4 className="font-medium text-blue-300 mb-2">Recommendations</h4>
              <div className="text-sm text-blue-200 space-y-1">
                {!debugResult.environment.clientSecretStartsWithQ && (
                  <div>• ⚠️ Client secret should start with "QsA8Q~" - check if you're using the value, not the ID</div>
                )}
                {!debugResult.environment.clientIdMatches && <div>• ⚠️ Client ID doesn't match expected value</div>}
                {!debugResult.environment.tenantIdMatches && <div>• ⚠️ Tenant ID doesn't match expected value</div>}
                {debugResult.tokenRequest?.success && (
                  <div>• ✅ Authentication is working! You can proceed to test document access</div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
