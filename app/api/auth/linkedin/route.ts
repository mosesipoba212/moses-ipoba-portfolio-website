import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if required environment variables are present
    if (!process.env.LINKEDIN_CLIENT_ID || !process.env.LINKEDIN_CLIENT_SECRET) {
      return NextResponse.json(
        {
          error: "Missing LinkedIn credentials",
          details: "Please configure LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET",
        },
        { status: 500 },
      )
    }

    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NODE_ENV === "production"
        ? "https://your-app.vercel.app"
        : "http://localhost:3000"

    const redirectUri = `${baseUrl}/api/auth/linkedin/callback`

    const params = new URLSearchParams({
      response_type: "code",
      client_id: process.env.LINKEDIN_CLIENT_ID,
      redirect_uri: redirectUri,
      scope: "r_liteprofile r_emailaddress",
      state: "linkedin-resume-sync",
    })

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params}`

    console.log("Generated LinkedIn auth URL:", authUrl)

    return NextResponse.json({
      authUrl,
      message: "Redirect to this URL to authenticate with LinkedIn",
    })
  } catch (error) {
    console.error("LinkedIn auth initiation failed:", error)
    return NextResponse.json(
      {
        error: "Failed to initiate LinkedIn authentication",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
