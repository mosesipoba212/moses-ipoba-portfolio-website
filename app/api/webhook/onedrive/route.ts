import { type NextRequest, NextResponse } from "next/server"
import { oneDriveService } from "@/lib/onedrive-service"
import { revalidatePath } from "next/cache"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log("OneDrive webhook received:", JSON.stringify(body, null, 2))

    // Verify the webhook is from Microsoft
    const validationToken = request.nextUrl.searchParams.get("validationToken")
    if (validationToken) {
      console.log("Webhook validation request")
      return new Response(validationToken, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      })
    }

    // Process change notifications
    if (body.value && Array.isArray(body.value)) {
      for (const notification of body.value) {
        console.log("Processing notification:", notification)

        // Check if this is for our document
        if (notification.resource && notification.resource.includes("drive/items")) {
          console.log("Document change detected, syncing...")

          // Sync the document
          const syncResult = await oneDriveService.syncDocument()

          if (syncResult.success) {
            // Revalidate the pages to show updated content
            revalidatePath("/")
            revalidatePath("/admin")

            console.log("OneDrive sync completed successfully:", syncResult.changes)
          } else {
            console.error("OneDrive sync failed:", syncResult.error)
          }
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("OneDrive webhook error:", error)
    return NextResponse.json({ success: false, error: "Webhook processing failed" }, { status: 500 })
  }
}

// Handle webhook validation
export async function GET(request: NextRequest) {
  const validationToken = request.nextUrl.searchParams.get("validationToken")

  if (validationToken) {
    console.log("Webhook validation token received:", validationToken)
    return new Response(validationToken, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    })
  }

  return NextResponse.json({ error: "No validation token provided" }, { status: 400 })
}
