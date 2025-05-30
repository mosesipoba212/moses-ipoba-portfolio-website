const GRAPH_API_BASE = "https://graph.microsoft.com/v1.0"

interface MicrosoftTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  error?: string
  error_description?: string
}

interface DriveItem {
  id: string
  name: string
  lastModifiedDateTime: string
  size: number
  webUrl: string
  downloadUrl?: string
  "@microsoft.graph.downloadUrl"?: string
}

interface SubscriptionResponse {
  id: string
  resource: string
  applicationId: string
  changeType: string
  clientState?: string
  notificationUrl: string
  expirationDateTime: string
}

// Token cache
let tokenCache: { token: string; expires: number } | null = null

export class MicrosoftGraphService {
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (tokenCache && Date.now() < tokenCache.expires) {
      return tokenCache.token
    }

    const requiredEnvVars = {
      clientId: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      tenantId: process.env.MICROSOFT_TENANT_ID,
    }

    // Validate environment variables
    const missingVars = Object.entries(requiredEnvVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key)

    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`)
    }

    const tokenUrl = `https://login.microsoftonline.com/${requiredEnvVars.tenantId}/oauth2/v2.0/token`

    const params = new URLSearchParams({
      client_id: requiredEnvVars.clientId!,
      client_secret: requiredEnvVars.clientSecret!,
      scope: "https://graph.microsoft.com/.default",
      grant_type: "client_credentials",
    })

    try {
      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          `Authentication failed (${response.status}): ${errorData.error_description || errorData.error || "Unknown error"}`,
        )
      }

      const data: MicrosoftTokenResponse = await response.json()

      if (!data.access_token) {
        throw new Error("No access token received")
      }

      // Cache token with 10-minute buffer
      tokenCache = {
        token: data.access_token,
        expires: Date.now() + (data.expires_in - 600) * 1000,
      }

      return data.access_token
    } catch (error) {
      console.error("Microsoft Graph authentication error:", error)
      throw error
    }
  }

  async getDocument(documentId: string): Promise<DriveItem | null> {
    try {
      const token = await this.getAccessToken()

      const response = await fetch(`${GRAPH_API_BASE}/me/drive/items/${documentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Document not found. Please check the document ID and permissions.")
        }
        throw new Error(`Failed to fetch document metadata: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching document metadata:", error)
      return null
    }
  }

  async downloadDocument(documentId: string): Promise<ArrayBuffer | null> {
    try {
      const token = await this.getAccessToken()

      const response = await fetch(`${GRAPH_API_BASE}/me/drive/items/${documentId}/content`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 300 },
      })

      if (!response.ok) {
        throw new Error(`Failed to download document: ${response.status}`)
      }

      return await response.arrayBuffer()
    } catch (error) {
      console.error("Error downloading document:", error)
      return null
    }
  }

  async createWebhook(documentId: string, notificationUrl: string): Promise<SubscriptionResponse | null> {
    try {
      const token = await this.getAccessToken()

      const subscription = {
        changeType: "updated",
        notificationUrl,
        resource: `/me/drive/items/${documentId}`,
        expirationDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        clientState: "resume-sync-webhook",
      }

      const response = await fetch(`${GRAPH_API_BASE}/subscriptions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Failed to create webhook: ${response.status} - ${JSON.stringify(errorData)}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error creating webhook:", error)
      return null
    }
  }

  async renewWebhook(subscriptionId: string): Promise<boolean> {
    try {
      const token = await this.getAccessToken()

      const response = await fetch(`${GRAPH_API_BASE}/subscriptions/${subscriptionId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          expirationDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }),
      })

      return response.ok
    } catch (error) {
      console.error("Error renewing webhook:", error)
      return false
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      // Test 1: Get access token
      const token = await this.getAccessToken()

      // Test 2: Get user profile
      const userResponse = await fetch(`${GRAPH_API_BASE}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!userResponse.ok) {
        throw new Error(`User profile fetch failed: ${userResponse.status}`)
      }

      const user = await userResponse.json()

      // Test 3: Test document access if document ID is provided
      let documentTest = null
      if (process.env.ONEDRIVE_DOCUMENT_ID) {
        documentTest = await this.getDocument(process.env.ONEDRIVE_DOCUMENT_ID)
      }

      return {
        success: true,
        message: "Microsoft Graph connection successful",
        details: {
          user: {
            displayName: user.displayName,
            mail: user.mail,
          },
          document: documentTest
            ? {
                name: documentTest.name,
                lastModified: documentTest.lastModifiedDateTime,
                size: documentTest.size,
              }
            : "No document ID configured",
        },
      }
    } catch (error) {
      return {
        success: false,
        message: `Connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    }
  }
}

// Singleton instance
export const microsoftGraph = new MicrosoftGraphService()
