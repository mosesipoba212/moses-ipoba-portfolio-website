"use client"

import { useState, useEffect } from "react"
import { LinkedInSetupGuide } from "@/components/linkedin-setup-guide"
import { ExperienceManager } from "@/components/experience-manager"

export default function AdminPage() {
  const [authStatus, setAuthStatus] = useState<{
    isAuthenticated: boolean
    user?: string
    documentAccess?: boolean
    error?: string
  }>({ isAuthenticated: false })

  const [azureConfig, setAzureConfig] = useState<any>(null)

  useEffect(() => {
    // Check URL parameters for auth results
    const urlParams = new URLSearchParams(window.location.search)
    const authSuccess = urlParams.get("auth_success")
    const authError = urlParams.get("auth_error")
    const user = urlParams.get("user")
    const documentAccess = urlParams.get("document_access")

    if (authSuccess === "true") {
      setAuthStatus({
        isAuthenticated: true,
        user: user || undefined,
        documentAccess: documentAccess === "true",
      })
      window.history.replaceState({}, "", "/admin")
    } else if (authError) {
      setAuthStatus({
        isAuthenticated: false,
        error: authError,
      })
      window.history.replaceState({}, "", "/admin")
    }
  }, [])

  const testAzureConfig = async () => {
    try {
      const response = await fetch("/api/debug/azure-config")
      const result = await response.json()
      setAzureConfig(result)
    } catch (error) {
      alert("Failed to test Azure config: " + error)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

        <div className="space-y-6">
          {/* Authentication Status */}
          {authStatus.isAuthenticated ? (
            <div className="bg-green-900/20 p-6 rounded-lg border border-green-500/30">
              <h2 className="text-2xl font-semibold mb-4 text-green-400">🎉 Authentication Successful!</h2>
              <div className="space-y-2">
                <p className="text-green-200">
                  ✅ Signed in as: <span className="font-semibold">{authStatus.user || "Unknown User"}</span>
                </p>
                <p className="text-green-200">
                  {authStatus.documentAccess ? "✅ Document access granted" : "⚠️ Document access pending"}
                </p>
              </div>
            </div>
          ) : authStatus.error ? (
            <div className="bg-red-900/20 p-6 rounded-lg border border-red-500/30">
              <h2 className="text-2xl font-semibold mb-4 text-red-400">❌ Authentication Failed</h2>
              <p className="text-red-200">Error: {authStatus.error}</p>
            </div>
          ) : (
            <div className="bg-red-900/20 p-6 rounded-lg border border-red-500/30">
              <h2 className="text-2xl font-semibold mb-4 text-red-400">🚨 Personal Account Rejected</h2>
              <p className="text-red-200 mb-4">
                Microsoft is rejecting personal accounts. This means the Azure app registration still needs
                configuration.
              </p>
              <div className="bg-gray-800 p-4 rounded text-sm">
                <p className="font-semibold mb-2 text-yellow-400">Required Azure Settings:</p>
                <ol className="list-decimal list-inside space-y-1 text-gray-300">
                  <li>Go to Azure Portal → App registrations → My-Auto-Resume</li>
                  <li>Click "Authentication" in left sidebar</li>
                  <li>
                    Under "Supported account types" select:{" "}
                    <span className="text-green-400 font-semibold">
                      "Accounts in any organizational directory and personal Microsoft accounts"
                    </span>
                  </li>
                  <li>Click Save</li>
                  <li>Wait 5-10 minutes for changes to propagate</li>
                </ol>
              </div>
            </div>
          )}

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Integration Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-900/20 p-4 rounded border border-green-500/30">
                <h3 className="font-semibold text-green-400">GitHub</h3>
                <p className="text-sm text-green-300">✅ Connected</p>
                <p className="text-xs text-gray-400">Auto-sync enabled</p>
              </div>

              <div className="bg-blue-900/20 p-4 rounded border border-blue-500/30">
                <h3 className="font-semibold text-blue-400">LinkedIn</h3>
                <p className="text-sm text-blue-300">✅ Mock Data</p>
                <p className="text-xs text-gray-400">Demo integration</p>
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/sync/linkedin", { method: "POST" })
                      const result = await response.json()
                      alert(result.success ? "✅ LinkedIn sync successful!" : "❌ LinkedIn sync failed")
                    } catch (error) {
                      alert("LinkedIn sync failed: " + error)
                    }
                  }}
                  className="mt-2 bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs text-white"
                >
                  Sync Now
                </button>
              </div>

              <div
                className={`p-4 rounded border ${
                  authStatus.isAuthenticated
                    ? "bg-green-900/20 border-green-500/30"
                    : "bg-yellow-900/20 border-yellow-500/30"
                }`}
              >
                <h3 className={`font-semibold ${authStatus.isAuthenticated ? "text-green-400" : "text-yellow-400"}`}>
                  OneDrive
                </h3>
                <p className={`text-sm ${authStatus.isAuthenticated ? "text-green-300" : "text-yellow-300"}`}>
                  {authStatus.isAuthenticated ? "✅ Connected" : "⚠️ Authentication Required"}
                </p>
                <p className="text-xs text-gray-400">
                  {authStatus.isAuthenticated ? "Ready to sync" : "Sign in first"}
                </p>
              </div>
            </div>
          </div>

          <LinkedInSetupGuide />

          <ExperienceManager />

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => (window.location.href = "/")}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
              >
                ← Back to Resume
              </button>

              {!authStatus.isAuthenticated && (
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/auth/microsoft")
                      const data = await response.json()
                      if (data.authUrl) {
                        window.location.href = data.authUrl
                      } else {
                        alert("Failed to get auth URL: " + JSON.stringify(data))
                      }
                    } catch (error) {
                      alert("Error: " + error)
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white"
                >
                  🔐 Sign in with Microsoft
                </button>
              )}

              <button
                onClick={async () => {
                  try {
                    const response = await fetch("/api/test/linkedin")
                    const result = await response.json()
                    alert(JSON.stringify(result, null, 2))
                  } catch (error) {
                    alert("LinkedIn test failed: " + error)
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
              >
                🔗 Test LinkedIn
              </button>

              <button
                onClick={async () => {
                  try {
                    const response = await fetch("/api/test/onedrive")
                    const result = await response.json()
                    alert(JSON.stringify(result, null, 2))
                  } catch (error) {
                    alert("Test failed: " + error)
                  }
                }}
                className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded text-white"
              >
                🧪 Test OneDrive
              </button>

              <button
                onClick={async () => {
                  try {
                    const response = await fetch("/api/sync/all", { method: "POST" })
                    const result = await response.json()
                    alert(
                      result.success ? "✅ All integrations synced successfully!" : `❌ Sync failed: ${result.error}`,
                    )
                  } catch (error) {
                    alert("Sync all failed: " + error)
                  }
                }}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-white"
              >
                🔄 Sync All Sources
              </button>

              <button onClick={testAzureConfig} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-white">
                🔍 Test Azure Config
              </button>
            </div>
          </div>

          {azureConfig && (
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">Azure Configuration Test</h2>
              <div className="space-y-3">
                {azureConfig.testUrls?.map((config: any, index: number) => (
                  <div key={index} className="border border-gray-600 p-3 rounded">
                    <h4 className="font-medium text-white mb-2">{config.name}</h4>
                    <p className="text-sm text-gray-400 mb-2">Tenant: {config.tenantId}</p>
                    <button
                      onClick={() => (window.location.href = config.fullUrl)}
                      className={`px-3 py-1 rounded text-sm ${
                        config.name.includes("Common")
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "bg-gray-600 hover:bg-gray-700 text-white"
                      }`}
                    >
                      {config.name.includes("Common") ? "🎯 Try This (Recommended)" : "Test This Config"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
