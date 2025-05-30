import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Test different tenant configurations
    const configs = [
      {
        name: "Current Config (Specific Tenant)",
        tenantId: process.env.MICROSOFT_TENANT_ID,
        endpoint: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/oauth2/v2.0/authorize`,
      },
      {
        name: "Multi-tenant Config (Common)",
        tenantId: "common",
        endpoint: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
      },
      {
        name: "Consumer Config (Consumers)",
        tenantId: "consumers",
        endpoint: "https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize",
      },
    ]

    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"

    const testUrls = configs.map((config) => {
      const params = new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID!,
        response_type: "code",
        redirect_uri: `${baseUrl}/api/auth/microsoft/callback`,
        scope: "https://graph.microsoft.com/Files.Read.All https://graph.microsoft.com/User.Read offline_access",
        response_mode: "query",
        state: "resume-sync",
        prompt: "select_account",
      })

      return {
        ...config,
        fullUrl: `${config.endpoint}?${params}`,
      }
    })

    return NextResponse.json({
      message: "Azure configuration test URLs",
      environment: {
        clientId: process.env.MICROSOFT_CLIENT_ID,
        tenantId: process.env.MICROSOFT_TENANT_ID,
        hasClientSecret: !!process.env.MICROSOFT_CLIENT_SECRET,
      },
      testUrls,
      recommendation: "Try the 'Common' endpoint for personal accounts",
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to generate test URLs",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
