import { NextResponse } from "next/server"
import { oneDriveService } from "@/lib/onedrive-service"

export async function GET() {
  try {
    const result = await oneDriveService.testConnection()

    // Additional environment check
    const environment = {
      hasClientId: !!process.env.MICROSOFT_CLIENT_ID,
      hasClientSecret: !!process.env.MICROSOFT_CLIENT_SECRET,
      hasTenantId: !!process.env.MICROSOFT_TENANT_ID,
      hasDocumentId: !!process.env.ONEDRIVE_DOCUMENT_ID,
      isConfigured: await oneDriveService.isConfigured(),
    }

    // Test document access if configured
    let documentTest = null
    if (environment.hasDocumentId) {
      try {
        const docInfo = await oneDriveService.getDocumentInfo()
        documentTest = {
          success: true,
          document: {
            name: docInfo?.name,
            lastModified: docInfo?.lastModifiedDateTime,
            size: docInfo?.size,
            webUrl: docInfo?.webUrl,
          },
        }
      } catch (error) {
        documentTest = {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }
      }
    }

    return NextResponse.json({
      ...result,
      timestamp: new Date().toISOString(),
      environment,
      documentTest,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: `Test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
