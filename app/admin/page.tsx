"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { AdminLogin } from "@/components/admin-login"
import { LinkedInSetupGuide } from "@/components/linkedin-setup-guide"
import { ExperienceManager } from "@/components/experience-manager"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
  Database,
  LayoutDashboard,
  Code,
  Cog,
  ArrowLeft,
  LogOut,
} from "lucide-react"

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
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
    upload?: boolean
  }>({})

  const [uploadStatus, setUploadStatus] = useState<{
    success?: boolean
    message?: string
    error?: string
  }>({})

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Check if user is already logged in
    const loggedIn = localStorage.getItem("adminLoggedIn")
    const loginTime = localStorage.getItem("adminLoginTime")

    if (loggedIn === "true" && loginTime) {
      // Check if login is still valid (24 hours)
      const now = Date.now()
      const loginTimestamp = Number.parseInt(loginTime)
      const twentyFourHours = 24 * 60 * 60 * 1000

      if (now - loginTimestamp < twentyFourHours) {
        setIsLoggedIn(true)
      } else {
        // Login expired
        localStorage.removeItem("adminLoggedIn")
        localStorage.removeItem("adminLoginTime")
      }
    }

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

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn")
    localStorage.removeItem("adminLoginTime")
    setIsLoggedIn(false)
  }

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

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading((prev) => ({ ...prev, upload: true }))
    setUploadStatus({})

    try {
      if (!fileInputRef.current?.files?.length) {
        throw new Error("No file selected")
      }

      const file = fileInputRef.current.files[0]
      const formData = new FormData()
      formData.append("file", file)
      formData.append("documentType", "resume")

      const response = await fetch("/api/upload/document", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Upload failed")
      }

      const result = await response.json()
      setUploadStatus({
        success: true,
        message: "Document uploaded successfully!",
      })

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      setUploadStatus({
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      })
    } finally {
      setLoading((prev) => ({ ...prev, upload: false }))
    }
  }

  // Show login form if not logged in
  if (!isLoggedIn) {
    return <AdminLogin onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-400 mt-2">Manage your resume integrations and data sources</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-600/10 px-6 py-3 rounded-xl font-medium transition-all duration-300"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </Button>
              <Button
                asChild
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105"
              >
                <a href="/">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Resume
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Authentication Status */}
        {authStatus.isAuthenticated ? (
          <Alert className="mb-8 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-500/30">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <AlertTitle className="text-green-400">Authentication Successful</AlertTitle>
            <AlertDescription className="text-green-200">
              ✅ Signed in as: <span className="font-semibold">{authStatus.user || "Unknown User"}</span>
              <br />
              {authStatus.documentAccess ? "✅ Document access granted" : "⚠️ Document access pending"}
            </AlertDescription>
          </Alert>
        ) : authStatus.error ? (
          <Alert className="mb-8 bg-gradient-to-r from-red-900/20 to-red-800/20 border-red-500/30">
            <XCircle className="h-5 w-5 text-red-400" />
            <AlertTitle className="text-red-400">Authentication Failed</AlertTitle>
            <AlertDescription className="text-red-200">
              <p className="mb-4">Error: {authStatus.error}</p>
              <Button
                onClick={handleMicrosoftAuth}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition-all duration-300"
              >
                <User className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="mb-8 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-500/30">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <AlertTitle className="text-yellow-400">Authentication Required</AlertTitle>
            <AlertDescription className="text-yellow-200">
              <p className="mb-4">
                Sign in with Microsoft to access your OneDrive documents and enable automatic syncing.
              </p>
              <Button
                onClick={handleMicrosoftAuth}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition-all duration-300"
              >
                <User className="w-4 h-4 mr-2" />
                Sign in with Microsoft
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="dashboard" className="mb-8">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="dashboard" className="text-base py-3">
              <LayoutDashboard className="w-5 h-5 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="integrations" className="text-base py-3">
              <Code className="w-5 h-5 mr-2" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="content" className="text-base py-3">
              <FileText className="w-5 h-5 mr-2" />
              Content
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-base py-3">
              <Cog className="w-5 h-5 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
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
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-4 py-2 rounded-lg font-medium transition-all duration-300"
                  >
                    {loading.sync ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Sync className="w-4 h-4 mr-2" />
                    )}
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
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-4 py-2 rounded-lg font-medium transition-all duration-300"
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
                      className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 px-4 py-2 rounded-lg font-medium transition-all duration-300"
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
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-4 py-3 rounded-lg font-medium transition-all duration-300 h-auto flex-col gap-2"
                  >
                    {loading.sync ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sync className="w-5 h-5" />}
                    <span className="text-sm">Sync All Sources</span>
                  </Button>

                  <Button
                    onClick={() => handleTest("azure")}
                    disabled={loading.azure}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-4 py-3 rounded-lg font-medium transition-all duration-300 h-auto flex-col gap-2"
                  >
                    {loading.azure ? <RefreshCw className="w-5 h-5 animate-spin" /> : <TestTube className="w-5 h-5" />}
                    <span className="text-sm">Test Azure Config</span>
                  </Button>

                  <Button
                    onClick={() => window.location.reload()}
                    className="bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700 px-4 py-3 rounded-lg font-medium transition-all duration-300 h-auto flex-col gap-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span className="text-sm">Refresh Dashboard</span>
                  </Button>

                  <Button
                    asChild
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-4 py-3 rounded-lg font-medium transition-all duration-300 h-auto flex-col gap-2"
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
          </TabsContent>

          <TabsContent value="integrations">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <LinkedInSetupGuide />
              <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-blue-400" />
                    Data Sources
                  </CardTitle>
                  <CardDescription>Configure your data integrations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gray-900/50 rounded-lg flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white mb-1">GitHub</h3>
                      <p className="text-sm text-gray-400">Repository integration</p>
                    </div>
                    <Badge className="bg-green-600/20 text-green-400 border-green-500/30">Connected</Badge>
                  </div>

                  <div className="p-4 bg-gray-900/50 rounded-lg flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white mb-1">LinkedIn</h3>
                      <p className="text-sm text-gray-400">Profile and experience data</p>
                    </div>
                    <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/30">Mock Data</Badge>
                  </div>

                  <div className="p-4 bg-gray-900/50 rounded-lg flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white mb-1">OneDrive</h3>
                      <p className="text-sm text-gray-400">Document integration</p>
                    </div>
                    <Badge
                      className={
                        authStatus.isAuthenticated
                          ? "bg-green-600/20 text-green-400 border-green-500/30"
                          : "bg-yellow-600/20 text-yellow-400 border-yellow-500/30"
                      }
                    >
                      {authStatus.isAuthenticated ? "Connected" : "Auth Required"}
                    </Badge>
                  </div>

                  <div className="p-4 bg-gray-900/50 rounded-lg flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white mb-1">Notion</h3>
                      <p className="text-sm text-gray-400">Notes and documentation</p>
                    </div>
                    <Badge className="bg-gray-600/20 text-gray-400 border-gray-500/30">Not Configured</Badge>
                  </div>

                  <Button
                    onClick={() => handleSync("all")}
                    disabled={loading.sync}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-4 py-2 rounded-lg font-medium transition-all duration-300 mt-4"
                  >
                    {loading.sync ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Sync className="w-4 h-4 mr-2" />
                    )}
                    Sync All Data Sources
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content">
            <div className="grid grid-cols-1 gap-8 mb-8">
              <ExperienceManager />
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-400" />
                    Account Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="display-name">Display Name</Label>
                    <Input id="display-name" defaultValue="Moses Ipoba" className="bg-gray-900/50 border-gray-700" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue="mosesipoba212@gmail.com"
                      className="bg-gray-900/50 border-gray-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="job-title">Job Title</Label>
                    <Input
                      id="job-title"
                      defaultValue="Software Engineer | Cyber Security Analyst"
                      className="bg-gray-900/50 border-gray-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      defaultValue="London, England, United Kingdom"
                      className="bg-gray-900/50 border-gray-700"
                    />
                  </div>

                  <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-4 py-2 rounded-lg font-medium transition-all duration-300">
                    Save Changes
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-purple-400" />
                    System Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-white">Auto-Sync</h3>
                      <p className="text-sm text-gray-400">Automatically sync data from all sources</p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="auto-sync"
                        defaultChecked
                        className="w-5 h-5 rounded bg-gray-700 border-gray-600"
                      />
                      <Label htmlFor="auto-sync" className="ml-2">
                        Enabled
                      </Label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-white">Email Notifications</h3>
                      <p className="text-sm text-gray-400">Receive email alerts for sync events</p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="email-notifications"
                        className="w-5 h-5 rounded bg-gray-700 border-gray-600"
                      />
                      <Label htmlFor="email-notifications" className="ml-2">
                        Disabled
                      </Label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-white">Debug Mode</h3>
                      <p className="text-sm text-gray-400">Show detailed logs and debug information</p>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="debug-mode" className="w-5 h-5 rounded bg-gray-700 border-gray-600" />
                      <Label htmlFor="debug-mode" className="ml-2">
                        Disabled
                      </Label>
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-4 py-2 rounded-lg font-medium transition-all duration-300">
                    Save Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
