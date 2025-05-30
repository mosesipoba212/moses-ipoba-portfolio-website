import { NextResponse } from "next/server"
import { testLinkedInConnection } from "@/lib/actions"

export async function GET() {
  try {
    const result = await testLinkedInConnection()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
