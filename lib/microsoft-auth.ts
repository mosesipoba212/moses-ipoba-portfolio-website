// Updated delegated authentication service with multi-tenant support
const GRAPH_API_BASE = "https://graph.microsoft.com/v1.0"

interface AuthConfig {
  clientId: string
  clientSecret: string
  tenantId: string
  redirectUri: string
}

interface TokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
}

export class MicrosoftDelegatedAuth {
  private config: AuthConfig

  constructor() {
    this.config = {
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      tenantId: "common", // Changed to "common" for multi-tenant support
      redirectUri: `${process.env.VERCEL_URL || "http://localhost:3000"}/api/auth/microsoft/callback`,
    }
  }

  // Generate authorization URL for user login (now supports any Microsoft account)
  getAuthorizationUrl(): string {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NODE_ENV === "production"
        ? "https://your-app.vercel.app" // Replace with your actual domain
        : "http://localhost:3000"

    const redirectUri = `${baseUrl}/api/auth/microsoft/callback`

    console.log("Using redirect URI:", redirectUri)

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: "code",
      redirect_uri: redirectUri,
      scope: "https://graph.microsoft.com/Files.Read.All https://graph.microsoft.com/User.Read offline_access",
      response_mode: "query",
      state: "resume-sync",
      prompt: "select_account", // Allow user to choose account
    })

    // Use "common" endpoint to support any Microsoft account
    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params}`
  }

  // Exchange authorization code for access token
  async getTokenFromCode(code: string): Promise<TokenResponse> {
    // Use "common" endpoint for token exchange
    const tokenUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/token`

    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NODE_ENV === "production"
        ? "https://your-app.vercel.app"
        : "http://localhost:3000"

    const redirectUri = `${baseUrl}/api/auth/microsoft/callback`

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    })

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Token exchange failed: ${error}`)
    }

    return await response.json()
  }

  // Refresh access token using refresh token
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const tokenUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/token`

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    })

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Token refresh failed: ${error}`)
    }

    return await response.json()
  }

  // Test user access with delegated token
  async testUserAccess(accessToken: string) {
    try {
      // Test user profile access
      const userResponse = await fetch(`${GRAPH_API_BASE}/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!userResponse.ok) {
        throw new Error(`User profile access failed: ${userResponse.status}`)
      }

      const user = await userResponse.json()

      // Test document access
      let documentTest = null
      if (process.env.ONEDRIVE_DOCUMENT_ID) {
        const docResponse = await fetch(`${GRAPH_API_BASE}/me/drive/items/${process.env.ONEDRIVE_DOCUMENT_ID}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        if (docResponse.ok) {
          documentTest = await docResponse.json()
        } else {
          const error = await docResponse.text()
          documentTest = { error: `Document access failed: ${error}` }
        }
      }

      return {
        success: true,
        user: {
          displayName: user.displayName,
          mail: user.mail,
          userPrincipalName: user.userPrincipalName,
        },
        document: documentTest,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }
}

export const microsoftAuth = new MicrosoftDelegatedAuth()
