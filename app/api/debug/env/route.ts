import { NextResponse } from "next/server"

export async function GET() {
  // Debug environment variables (safely)
  const envDebug = {
    timestamp: new Date().toISOString(),
    environment: {
      hasClientId: !!process.env.MICROSOFT_CLIENT_ID,
      hasClientSecret: !!process.env.MICROSOFT_CLIENT_SECRET,
      hasTenantId: !!process.env.MICROSOFT_TENANT_ID,
      hasDocumentId: !!process.env.ONEDRIVE_DOCUMENT_ID,

      // Show partial values for debugging (safely)
      clientIdPrefix: process.env.MICROSOFT_CLIENT_ID?.substring(0, 8) + "...",
      clientSecretPrefix: process.env.MICROSOFT_CLIENT_SECRET?.substring(0, 8) + "...",
      clientSecretLength: process.env.MICROSOFT_CLIENT_SECRET?.length || 0,
      tenantIdPrefix: process.env.MICROSOFT_TENANT_ID?.substring(0, 8) + "...",
      documentIdPrefix: process.env.ONEDRIVE_DOCUMENT_ID?.substring(0, 8) + "...",

      // Check if we're getting the expected values
      clientSecretStartsWithQ: process.env.MICROSOFT_CLIENT_SECRET?.startsWith("QsA8Q~"),
      clientIdMatches: process.env.MICROSOFT_CLIENT_ID === "9f018c6a-fb66-46a0-b0c4-7bda62848b16",
      tenantIdMatches: process.env.MICROSOFT_TENANT_ID === "8674908c-db33-4387-a022-dd5da704a793",
    },

    // Test the exact token request
    tokenRequest: null as any,
  }

  // Try to make the token request and capture the exact error
  if (envDebug.environment.hasClientId && envDebug.environment.hasClientSecret && envDebug.environment.hasTenantId) {
    try {
      const tokenUrl = `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/oauth2/v2.0/token`

      const params = new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID!,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      })

      console.log("Making token request to:", tokenUrl)
      console.log("Client ID:", process.env.MICROSOFT_CLIENT_ID)
      console.log("Client Secret length:", process.env.MICROSOFT_CLIENT_SECRET?.length)
      console.log("Client Secret starts with:", process.env.MICROSOFT_CLIENT_SECRET?.substring(0, 10))

      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      })

      const responseText = await response.text()

      envDebug.tokenRequest = {
        status: response.status,
        statusText: response.statusText,
        responsePreview: responseText.substring(0, 500),
        headers: Object.fromEntries(response.headers.entries()),
      }

      if (response.ok) {
        const data = JSON.parse(responseText)
        envDebug.tokenRequest.success = true
        envDebug.tokenRequest.hasAccessToken = !!data.access_token
        envDebug.tokenRequest.tokenLength = data.access_token?.length || 0
      } else {
        envDebug.tokenRequest.success = false
        try {
          const errorData = JSON.parse(responseText)
          envDebug.tokenRequest.error = errorData
        } catch {
          envDebug.tokenRequest.error = responseText
        }
      }
    } catch (error) {
      envDebug.tokenRequest = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        exception: true,
      }
    }
  }

  return NextResponse.json(envDebug, { status: 200 })
}
