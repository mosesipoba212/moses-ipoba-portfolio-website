import { NextResponse } from "next/server"
import { oneDriveService } from "@/lib/onedrive-service"
import { revalidatePath } from "next/cache"

export async function POST() {
  try {
    const result = await oneDriveService.syncDocument()

    if (result.success) {
      // Revalidate pages to show updated content
      revalidatePath("/")
      revalidatePath("/admin")
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
