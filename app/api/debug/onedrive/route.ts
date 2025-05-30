import { NextResponse } from "next/server"
import { microsoftGraph } from "@/lib/microsoft-graph"

export async function GET() {
  const debug = {
    timestamp: new Date().toISOString(),
    environment: {
      hasClientId: !!process.env.MICROSOFT_CLIENT_ID,
      hasClientSecret: !!process.env.MICROSOFT_CLIENT_SECRET,
      hasTenantId: !!process.env.MICROSOFT_TENANT_ID,
      hasDocumentId: !!process.env.ONEDRIVE_DOCUMENT_ID,
      documentId: process.env.ONEDRIVE_DOCUMENT_ID,
      clientIdLength: process.env.MICROSOFT_CLIENT_ID?.length || 0,
      tenantIdLength: process.env.MICROSOFT_TENANT_ID?.length || 0,
    },
    tests: [] as any[],
  }

  // Test 1: Environment Variables
  debug.tests.push({
    name: "Environment Variables",
    status:
      debug.environment.hasClientId && debug.environment.hasClientSecret && debug.environment.hasTenantId
        ? "PASS"
        : "FAIL",
    details: debug.environment,
  })

  // Test 2: Token Request
  try {
    console.log("Testing token request...")
    const token = await microsoftGraph.getAccessToken()
    debug.tests.push({
      name: "Access Token",
      status: "PASS",
      details: {
        tokenLength: token.length,
        tokenPrefix: token.substring(0, 20) + "...",
      },
    })

    // Test 3: User Profile
    try {
      console.log("Testing user profile...")
      const userResponse = await fetch("https://graph.microsoft.com/v1.0/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (userResponse.ok) {
        const user = await userResponse.json()
        debug.tests.push({
          name: "User Profile",
          status: "PASS",
          details: {
            displayName: user.displayName,
            mail: user.mail,
            userPrincipalName: user.userPrincipalName,
          },
        })
      } else {
        const errorText = await userResponse.text()
        debug.tests.push({
          name: "User Profile",
          status: "FAIL",
          details: {
            status: userResponse.status,
            statusText: userResponse.statusText,
            error: errorText,
          },
        })
      }
    } catch (error) {
      debug.tests.push({
        name: "User Profile",
        status: "ERROR",
        details: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      })
    }

    // Test 4: Document Access
    if (process.env.ONEDRIVE_DOCUMENT_ID) {
      try {
        console.log("Testing document access...")
        const docResponse = await fetch(
          `https://graph.microsoft.com/v1.0/me/drive/items/${process.env.ONEDRIVE_DOCUMENT_ID}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        if (docResponse.ok) {
          const doc = await docResponse.json()
          debug.tests.push({
            name: "Document Access",
            status: "PASS",
            details: {
              name: doc.name,
              size: doc.size,
              lastModified: doc.lastModifiedDateTime,
              webUrl: doc.webUrl,
            },
          })
        } else {
          const errorText = await docResponse.text()
          debug.tests.push({
            name: "Document Access",
            status: "FAIL",
            details: {
              status: docResponse.status,
              statusText: docResponse.statusText,
              error: errorText,
              documentId: process.env.ONEDRIVE_DOCUMENT_ID,
            },
          })
        }
      } catch (error) {
        debug.tests.push({
          name: "Document Access",
          status: "ERROR",
          details: {
            error: error instanceof Error ? error.message : "Unknown error",
            documentId: process.env.ONEDRIVE_DOCUMENT_ID,
          },
        })
      }

      // Test 5: Document Download
      try {
        console.log("Testing document download...")
        const downloadResponse = await fetch(
          `https://graph.microsoft.com/v1.0/me/drive/items/${process.env.ONEDRIVE_DOCUMENT_ID}/content`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        if (downloadResponse.ok) {
          const contentLength = downloadResponse.headers.get("content-length")
          debug.tests.push({
            name: "Document Download",
            status: "PASS",
            details: {
              contentLength: contentLength ? Number.parseInt(contentLength) : "unknown",
              contentType: downloadResponse.headers.get("content-type"),
            },
          })
        } else {
          const errorText = await downloadResponse.text()
          debug.tests.push({
            name: "Document Download",
            status: "FAIL",
            details: {
              status: downloadResponse.status,
              statusText: downloadResponse.statusText,
              error: errorText,
            },
          })
        }
      } catch (error) {
        debug.tests.push({
          name: "Document Download",
          status: "ERROR",
          details: {
            error: error instanceof Error ? error.message : "Unknown error",
          },
        })
      }
    } else {
      debug.tests.push({
        name: "Document Access",
        status: "SKIP",
        details: {
          reason: "No document ID provided",
        },
      })
    }
  } catch (error) {
    debug.tests.push({
      name: "Access Token",
      status: "FAIL",
      details: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    })
  }

  return NextResponse.json(debug, { status: 200 })
}
