import { NextResponse } from "next/server"
import { syncNotionData } from "@/lib/actions"

export async function POST() {
  try {
    const result = await syncNotionData()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
