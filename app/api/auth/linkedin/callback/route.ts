import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const error = searchParams.get("error")
    const state = searchParams.get("state")

    console.log("LinkedIn callback received:", { code: !!code, error, state })

    // Determine base URL for redirects
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NODE_ENV === "production"
        ? "https://your-app.vercel.app"
        : "http://localhost:3000"

    if (error) {
      console.error("LinkedIn auth error:", error)
      const errorUrl = new URL(`${baseUrl}/admin`)
      errorUrl.searchParams.set("linkedin_error", error)
      return NextResponse.redirect(errorUrl.toString())
    }

    if (!code) {
      const errorUrl = new URL(`${baseUrl}/admin`)
      errorUrl.searchParams.set("linkedin_error", "no_code")
      return NextResponse.redirect(errorUrl.toString())
    }

    if (state !== "linkedin-resume-sync") {
      const errorUrl = new URL(`${baseUrl}/admin`)
      errorUrl.searchParams.set("linkedin_error", "invalid_state")
      return NextResponse.redirect(errorUrl.toString())
    }

    // Exchange code for access token
    console.log("Exchanging LinkedIn code for tokens...")

    const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: `${baseUrl}/api/auth/linkedin/callback`,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
      }),
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      throw new Error(`LinkedIn token exchange failed: ${error}`)
    }

    const tokens = await tokenResponse.json()
    console.log("LinkedIn tokens received")

    // Test the access token
    const profileResponse = await fetch("https://api.linkedin.com/v2/people/~", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    })

    let profileData = null
    if (profileResponse.ok) {
      profileData = await profileResponse.json()
    }

    // In a real app, you'd store these tokens securely
    // For now, redirect with success
    const successUrl = new URL(`${baseUrl}/admin`)
    successUrl.searchParams.set("linkedin_success", "true")
    if (profileData) {
      successUrl.searchParams.set("linkedin_user", profileData.firstName?.localized?.en_US || "LinkedIn User")
    }

    return NextResponse.redirect(successUrl.toString())
  } catch (error) {
    console.error("LinkedIn auth callback error:", error)

    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NODE_ENV === "production"
        ? "https://your-app.vercel.app"
        : "http://localhost:3000"

    const errorUrl = new URL(`${baseUrl}/admin`)
    errorUrl.searchParams.set("linkedin_error", "callback_failed")
    return NextResponse.redirect(errorUrl.toString())
  }
}
