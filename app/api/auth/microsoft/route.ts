import { NextResponse } from "next/server"
import { microsoftAuth } from "@/lib/microsoft-auth"

export async function GET() {
  try {
    // Check if required environment variables are present
    if (!process.env.MICROSOFT_CLIENT_ID || !process.env.MICROSOFT_CLIENT_SECRET || !process.env.MICROSOFT_TENANT_ID) {
      return NextResponse.json(
        {
          error: "Missing Microsoft credentials",
          details: "Please configure MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, and MICROSOFT_TENANT_ID",
        },
        { status: 500 },
      )
    }

    // Generate authorization URL
    const authUrl = microsoftAuth.getAuthorizationUrl()

    console.log("Generated auth URL:", authUrl)

    // Return the URL as JSON instead of redirecting
    return NextResponse.json({
      authUrl,
      message: "Redirect to this URL to authenticate",
    })
  } catch (error) {
    console.error("Microsoft auth initiation failed:", error)
    return NextResponse.json(
      {
        error: "Failed to initiate Microsoft authentication",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
