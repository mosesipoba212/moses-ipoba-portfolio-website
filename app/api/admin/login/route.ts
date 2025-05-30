import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Get admin credentials from environment variables
    const adminUsername = process.env.ADMIN_USERNAME
    const adminPassword = process.env.ADMIN_PASSWORD

    // Check if environment variables are set
    if (!adminUsername || !adminPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin credentials not configured",
        },
        { status: 500 },
      )
    }

    // Validate credentials
    if (username === adminUsername && password === adminPassword) {
      return NextResponse.json({
        success: true,
        message: "Login successful",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid username or password",
        },
        { status: 401 },
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Login failed",
      },
      { status: 500 },
    )
  }
}
