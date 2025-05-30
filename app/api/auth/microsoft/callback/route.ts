import { type NextRequest, NextResponse } from "next/server"
import { microsoftAuth } from "@/lib/microsoft-auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const error = searchParams.get("error")
    const errorDescription = searchParams.get("error_description")
    const state = searchParams.get("state")

    console.log("Callback received:", { code: !!code, error, state })

    // Determine base URL for redirects
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NODE_ENV === "production"
        ? "https://your-app.vercel.app" // Replace with your actual domain
        : "http://localhost:3000"

    if (error) {
      console.error("Microsoft auth error:", error, errorDescription)
      const errorUrl = new URL(`${baseUrl}/admin`)
      errorUrl.searchParams.set("auth_error", error)
      if (errorDescription) {
        errorUrl.searchParams.set("error_description", errorDescription)
      }
      return NextResponse.redirect(errorUrl.toString())
    }

    if (!code) {
      const errorUrl = new URL(`${baseUrl}/admin`)
      errorUrl.searchParams.set("auth_error", "no_code")
      return NextResponse.redirect(errorUrl.toString())
    }

    if (state !== "resume-sync") {
      const errorUrl = new URL(`${baseUrl}/admin`)
      errorUrl.searchParams.set("auth_error", "invalid_state")
      return NextResponse.redirect(errorUrl.toString())
    }

    // Exchange code for tokens
    console.log("Exchanging code for tokens...")
    const tokens = await microsoftAuth.getTokenFromCode(code)
    console.log("Tokens received, testing access...")

    // Test the access
    const testResult = await microsoftAuth.testUserAccess(tokens.access_token)
    console.log("Access test result:", testResult.success)

    // In a real app, you'd store these tokens securely (database, encrypted cookies, etc.)
    // For now, we'll just redirect with success and show the test results

    const successUrl = new URL(`${baseUrl}/admin`)
    successUrl.searchParams.set("auth_success", "true")
    successUrl.searchParams.set("user", testResult.user?.displayName || "Unknown")

    if (testResult.document && !testResult.document.error) {
      successUrl.searchParams.set("document_access", "true")
    }

    return NextResponse.redirect(successUrl.toString())
  } catch (error) {
    console.error("Microsoft auth callback error:", error)

    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NODE_ENV === "production"
        ? "https://your-app.vercel.app" // Replace with your actual domain
        : "http://localhost:3000"

    const errorUrl = new URL(`${baseUrl}/admin`)
    errorUrl.searchParams.set("auth_error", "callback_failed")
    errorUrl.searchParams.set("error_details", error instanceof Error ? error.message : "Unknown error")

    return NextResponse.redirect(errorUrl.toString())
  }
}
