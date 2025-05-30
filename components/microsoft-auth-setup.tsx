"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, AlertCircle, CheckCircle, ExternalLink } from "lucide-react"

export function MicrosoftAuthSetup() {
  const [authStatus, setAuthStatus] = useState<{
    isAuthenticated: boolean
    user?: string
    documentAccess?: boolean
    error?: string
  }>({ isAuthenticated: false })

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

      // Clean up URL
      window.history.replaceState({}, "", "/admin")
    } else if (authError) {
      setAuthStatus({
        isAuthenticated: false,
        error: authError,
      })

      // Clean up URL
      window.history.replaceState({}, "", "/admin")
    }
  }, [])

  const handleLogin = async () => {
    try {
      // Get the auth URL from our API
      const response = await fetch("/api/auth/microsoft")
      const data = await response.json()

      if (data.authUrl) {
        // Redirect to Microsoft login
        window.location.href = data.authUrl
      } else {
        console.error("No auth URL received:", data)
        setAuthStatus({
          isAuthenticated: false,
          error: data.error || "Failed to get authentication URL",
        })
      }
    } catch (error) {
      console.error("Login initiation failed:", error)
      setAuthStatus({
        isAuthenticated: false,
        error: "Failed to initiate login",
      })
    }
  }

  return (
    <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-sm border border-white/10 rounded-2xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <User className="w-6 h-6 text-blue-400" />
          Microsoft Authentication Setup
        </CardTitle>
        <CardDescription className="text-gray-400">
          Sign in with your Microsoft account to access your OneDrive documents
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {authStatus.error && (
          <Alert className="border-red-500/20 bg-red-900/20">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-200">Authentication failed: {authStatus.error}</AlertDescription>
          </Alert>
        )}

        {authStatus.isAuthenticated ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-900/20 rounded-lg border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <h4 className="font-medium text-green-300">Authentication Successful!</h4>
              </div>

              {authStatus.user && (
                <p className="text-green-200 text-sm mb-2">
                  Signed in as: <span className="font-medium">{authStatus.user}</span>
                </p>
              )}

              <div className="flex items-center gap-2">
                <Badge className="bg-green-600/20 text-green-400 border-green-500/30">✓ User Access</Badge>
                {authStatus.documentAccess ? (
                  <Badge className="bg-green-600/20 text-green-400 border-green-500/30">✓ Document Access</Badge>
                ) : (
                  <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-500/30">
                    ⚠ Document Access Pending
                  </Badge>
                )}
              </div>
            </div>

            <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/20">
              <h4 className="font-medium text-blue-300 mb-2">Next Steps</h4>
              <div className="text-sm text-blue-200 space-y-1">
                <div>• ✅ Authentication is working with delegated permissions</div>
                <div>• ✅ You can now access your personal OneDrive files</div>
                <div>• 🔄 Try syncing your document now</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-500/20">
              <h4 className="font-medium text-yellow-300 mb-2">Authentication Required</h4>
              <p className="text-yellow-200 text-sm mb-3">
                To access your personal OneDrive files, you need to sign in with your Microsoft account. This uses
                delegated authentication which allows access to your personal files.
              </p>

              <Button onClick={handleLogin} className="bg-blue-600 hover:bg-blue-700 transition-all duration-300">
                <ExternalLink className="w-4 h-4 mr-2" />
                Sign in with Microsoft
              </Button>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-lg">
              <h4 className="font-medium text-gray-300 mb-2">What happens when you sign in:</h4>
              <div className="text-sm text-gray-400 space-y-1">
                <div>• You'll be redirected to Microsoft's secure login page</div>
                <div>• Grant permission to read your OneDrive files</div>
                <div>• Return here with access to your documents</div>
                <div>• Your resume will sync automatically from your Word document</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
