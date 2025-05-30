"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Circle, Linkedin, ExternalLink, AlertCircle } from "lucide-react"

export function LinkedInSetupGuide() {
  const [testResult, setTestResult] = useState<any>(null)
  const [testing, setTesting] = useState(false)

  const hasCredentials = !!(
    process.env.LINKEDIN_CLIENT_ID &&
    process.env.LINKEDIN_CLIENT_SECRET &&
    process.env.LINKEDIN_ACCESS_TOKEN
  )

  const testLinkedInConnection = async () => {
    setTesting(true)
    try {
      const response = await fetch("/api/test/linkedin")
      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({
        success: false,
        message: "Failed to test LinkedIn connection",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setTesting(false)
    }
  }

  const steps = [
    {
      title: "Create LinkedIn App",
      description: "Go to LinkedIn Developer Portal and create a new app",
      completed: !!process.env.LINKEDIN_CLIENT_ID,
      url: "https://developer.linkedin.com/",
    },
    {
      title: "Configure App Permissions",
      description: "Add r_liteprofile, r_emailaddress, and w_member_social permissions",
      completed: !!process.env.LINKEDIN_CLIENT_ID,
    },
    {
      title: "Get Client Credentials",
      description: "Copy Client ID and Client Secret from your LinkedIn app",
      completed: !!(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET),
    },
    {
      title: "Generate Access Token",
      description: "Use LinkedIn's OAuth flow to get a user access token",
      completed: !!process.env.LINKEDIN_ACCESS_TOKEN,
    },
    {
      title: "Test Integration",
      description: "Verify that the LinkedIn API is working correctly",
      completed: testResult?.success,
    },
  ]

  return (
    <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-sm border border-white/10 rounded-2xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Linkedin className="w-6 h-6 text-blue-400" />
          LinkedIn Integration Setup
        </CardTitle>
        <CardDescription className="text-gray-400">
          Connect your LinkedIn profile for automatic resume updates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className={`mt-0.5 ${step.completed ? "text-green-400" : "text-gray-500"}`}>
                {step.completed ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-white">{step.title}</h4>
                  {step.completed && <Badge className="bg-green-600/20 text-green-400 border-green-500/30">Done</Badge>}
                  {step.url && (
                    <Button variant="ghost" size="sm" asChild className="h-6 px-2 text-blue-400 hover:text-blue-300">
                      <a href={step.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  )}
                </div>
                <p className="text-sm text-gray-400">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <Button
            onClick={testLinkedInConnection}
            disabled={testing}
            className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-300"
          >
            {testing ? "Testing..." : "Test LinkedIn Connection"}
          </Button>

          {testResult && (
            <Alert
              className={`border ${testResult.success ? "border-green-500/20 bg-green-900/20" : "border-red-500/20 bg-red-900/20"}`}
            >
              <AlertCircle className={`h-4 w-4 ${testResult.success ? "text-green-400" : "text-red-400"}`} />
              <AlertDescription className={testResult.success ? "text-green-200" : "text-red-200"}>
                {testResult.message}
                {testResult.profile && (
                  <div className="mt-2 text-sm">
                    Profile: {testResult.profile.firstName} {testResult.profile.lastName}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-500/20">
          <h4 className="font-medium text-blue-300 mb-3">Current Status</h4>
          <div className="text-sm text-blue-200 space-y-2">
            <div className="flex items-center justify-between">
              <span>Environment Variables:</span>
              <Badge
                className={
                  hasCredentials
                    ? "bg-green-600/20 text-green-400 border-green-500/30"
                    : "bg-red-600/20 text-red-400 border-red-500/30"
                }
              >
                {hasCredentials ? "✅ Configured" : "❌ Missing"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Integration Mode:</span>
              <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-500/30">🔄 Demo Mode</Badge>
            </div>
            <div className="text-xs text-blue-300 mt-2">
              Currently using mock LinkedIn data for demonstration. Real API integration requires OAuth setup.
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
          <h4 className="font-medium text-gray-300 mb-2">Quick Setup Guide:</h4>
          <div className="text-sm text-gray-400 space-y-1">
            <div>
              1. Visit{" "}
              <a
                href="https://developer.linkedin.com/"
                target="_blank"
                className="text-blue-400 underline"
                rel="noreferrer"
              >
                LinkedIn Developer Portal
              </a>
            </div>
            <div>2. Create a new app with your company/personal details</div>
            <div>
              3. Add redirect URI:{" "}
              <code className="bg-gray-700 px-1 rounded">
                {typeof window !== "undefined" ? window.location.origin : "your-domain"}/api/auth/linkedin/callback
              </code>
            </div>
            <div>4. Request r_liteprofile and r_emailaddress permissions</div>
            <div>5. Copy Client ID and Secret to environment variables</div>
            <div>6. Use OAuth flow to generate access token</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
