"use client"

import { useState, useEffect } from "react"
import { LinkedInSetupGuide } from "@/components/linkedin-setup-guide"
import { ExperienceManager } from "@/components/experience-manager"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Settings,
  RefreshCw,
  Home,
  CheckCircle,
  XCircle,
  AlertCircle,
  Github,
  Linkedin,
  FileText,
  TestTube,
  FolderSyncIcon as Sync,
} from "lucide-react"

export default function AdminPage() {
  const [authStatus, setAuthStatus] = useState<{
    isAuthenticated: boolean
    user?: string
    documentAccess?: boolean
    error?: string
  }>({ isAuthenticated: false })

  const [testResults, setTestResults] = useState<{
    linkedin?: any
    onedrive?: any
    azure?: any
  }>({})

  const [loading, setLoading] = useState<{
    linkedin?: boolean
    onedrive?: boolean
    azure?: boolean
    sync?: boolean
  }>({})

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

  const handleTest = async (service: "linkedin" | "onedrive" | "azure") => {
    setLoading((prev) => ({ ...prev, [service]: true }))

    try {
      let response
      switch (service) {
        case "linkedin":
          response = await fetch("/api/test/linkedin")
          break
        case "onedrive":
          response = await fetch("/api/test/onedrive")
          break
        case "azure":
          response = await fetch("/api/debug/azure-config")
          break
      }

      const result = await response.json()
      setTestResults((prev) => ({ ...prev, [service]: result }))
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        [service]: { success: false, error: error.message },
      }))
    } finally {
      setLoading((prev) => ({ ...prev, [service]: false }))
    }
  }

  const handleSync = async (service: "all" | "linkedin" | "onedrive") => {
    setLoading((prev) => ({ ...prev, sync: true }))

    try {
      const endpoint = service === "all" ? "/api/sync/all" : `/api/sync/${service}`
      const response = await fetch(endpoint, { method: "POST" })
      const result = await response.json()

      if (result.success) {
        alert(`✅ ${service === "all" ? "All services" : service} synced successfully!`)
      } else {
        alert(`❌ Sync failed: ${result.error}`)
      }
    } catch (error) {
      alert(`❌ Sync failed: ${error.message}`)
    } finally {
      setLoading((prev) => ({ ...prev, sync: false }))
    }
  }

  const handleMicrosoftAuth = async () => {
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
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-400 mt-2">Manage your resume integrations and data sources</p>
            </div>
            <Button
              asChild
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105"
            >
              <a href="/">
                <Home className="w-5 h-5 mr-2" />
                Back to Resume
              </a>
            </Button>
          </div>
        </div>

        {/* Authentication Status */}
        {authStatus.isAuthenticated ? (
          <Card className="mb-8 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-500/30">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center gap-2">
                <CheckCircle className="w-6 h-6" />
                Authentication Successful
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-green-200">
                  ✅ Signed in as: <span className="font-semibold">{authStatus.user || "Unknown User"}</span>
                </p>
                <p className="text-green-200">
                  {authStatus.documentAccess ? "✅ Document access granted" : "⚠️ Document access pending"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : authStatus.error ? (
          <Card className="mb-8 bg-gradient-to-r from-red-900/20 to-red-800/20 border-red-500/30">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center gap-2">
                <XCircle className="w-6 h-6" />
                Authentication Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-200 mb-4">Error: {authStatus.error}</p>
              <Button
                onClick={handleMicrosoftAuth}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition-all duration-300"
              >
                <User className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-500/30">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center gap-2">
                <AlertCircle className="w-6 h-6" />
                Authentication Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-yellow-200 mb-4">
                Sign in with Microsoft to access your OneDrive documents and enable automatic syncing.
              </p>
              <Button
                onClick={handleMicrosoftAuth}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition-all duration-300"
              >
                <User className="w-4 h-4 mr-2" />
                Sign in with Microsoft
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Integration Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* GitHub Status */}
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Github className="w-5 h-5 text-green-400" />
                GitHub
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="bg-green-600/20 text-green-400 border-green-500/30 mb-3">✅ Connected</Badge>
              <p className="text-sm text-gray-400 mb-4">Auto-sync enabled</p>
              <Button
                onClick={() => handleSync("all")}
                disabled={loading.sync}
                className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium transition-all duration-300"
              >
                {loading.sync ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Sync className="w-4 h-4 mr-2" />}
                Sync Now
              </Button>
            </CardContent>
          </Card>

          {/* LinkedIn Status */}
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Linkedin className="w-5 h-5 text-blue-400" />
                LinkedIn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/30 mb-3">✅ Mock Data</Badge>
              <p className="text-sm text-gray-400 mb-4">Demo integration</p>
              <div className="space-y-2">
                <Button
                  onClick={() => handleTest("linkedin")}
                  disabled={loading.linkedin}
                  className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-all duration-300"
                >
                  {loading.linkedin ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <TestTube className="w-4 h-4 mr-2" />
                  )}
                  Test Connection
                </Button>
                <Button
                  onClick={() => handleSync("linkedin")}
                  disabled={loading.sync}
                  variant="outline"
                  className="w-full border-blue-500/30 text-blue-400 hover:bg-blue-600/10 px-4 py-2 rounded-lg font-medium transition-all duration-300"
                >
                  <Sync className="w-4 h-4 mr-2" />
                  Sync LinkedIn
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* OneDrive Status */}
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-400" />
                OneDrive
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                className={`mb-3 ${
                  authStatus.isAuthenticated
                    ? "bg-green-600/20 text-green-400 border-green-500/30"
                    : "bg-yellow-600/20 text-yellow-400 border-yellow-500/30"
                }`}
              >
                {authStatus.isAuthenticated ? "✅ Connected" : "⚠️ Auth Required"}
              </Badge>
              <p className="text-sm text-gray-400 mb-4">
                {authStatus.isAuthenticated ? "Ready to sync" : "Sign in first"}
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => handleTest("onedrive")}
                  disabled={loading.onedrive}
                  className="w-full bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg font-medium transition-all duration-300"
                >
                  {loading.onedrive ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <TestTube className="w-4 h-4 mr-2" />
                  )}
                  Test Connection
                </Button>
                <Button
                  onClick={() => handleSync("onedrive")}
                  disabled={loading.sync}
                  variant="outline"
                  className="w-full border-orange-500/30 text-orange-400 hover:bg-orange-600/10 px-4 py-2 rounded-lg font-medium transition-all duration-300"
                >
                  <Sync className="w-4 h-4 mr-2" />
                  Sync OneDrive
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-6 h-6 text-purple-400" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common administrative tasks and testing tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                onClick={() => handleSync("all")}
                disabled={loading.sync}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-lg font-medium transition-all duration-300 h-auto flex-col gap-2"
              >
                {loading.sync ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sync className="w-5 h-5" />}
                <span className="text-sm">Sync All Sources</span>
              </Button>

              <Button
                onClick={() => handleTest("azure")}
                disabled={loading.azure}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700 px-4 py-3 rounded-lg font-medium transition-all duration-300 h-auto flex-col gap-2"
              >
                {loading.azure ? <RefreshCw className="w-5 h-5 animate-spin" /> : <TestTube className="w-5 h-5" />}
                <span className="text-sm">Test Azure Config</span>
              </Button>

              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700 px-4 py-3 rounded-lg font-medium transition-all duration-300 h-auto flex-col gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                <span className="text-sm">Refresh Dashboard</span>
              </Button>

              <Button
                asChild
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700 px-4 py-3 rounded-lg font-medium transition-all duration-300 h-auto flex-col gap-2"
              >
                <a href="/" target="_blank" rel="noreferrer">
                  <Home className="w-5 h-5" />
                  <span className="text-sm">Preview Resume</span>
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        {Object.keys(testResults).length > 0 && (
          <Card className="mb-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50">
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(testResults).map(([service, result]) => (
                  <div key={service} className="p-4 bg-gray-900/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium capitalize">{service}</h4>
                      <Badge
                        className={
                          result.success
                            ? "bg-green-600/20 text-green-400 border-green-500/30"
                            : "bg-red-600/20 text-red-400 border-red-500/30"
                        }
                      >
                        {result.success ? "Success" : "Failed"}
                      </Badge>
                    </div>
                    <pre className="text-xs bg-black/20 p-3 rounded overflow-x-auto text-gray-300">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Setup Guides */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <LinkedInSetupGuide />
          <ExperienceManager />
        </div>
      </div>
    </div>
  )
}
