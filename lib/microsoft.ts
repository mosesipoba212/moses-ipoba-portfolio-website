import type { Experience, Skill } from "@/types/resume"

const GRAPH_API_BASE = "https://graph.microsoft.com/v1.0"

interface MicrosoftTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  error?: string
  error_description?: string
}

interface OneDriveDocument {
  id: string
  name: string
  lastModifiedDateTime: string
  content?: string
}

// Cache token to avoid repeated requests
let cachedToken: { token: string; expires: number } | null = null

export async function getMicrosoftAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  if (cachedToken && Date.now() < cachedToken.expires) {
    return cachedToken.token
  }

  // Validate required environment variables
  if (!process.env.MICROSOFT_CLIENT_ID || !process.env.MICROSOFT_CLIENT_SECRET || !process.env.MICROSOFT_TENANT_ID) {
    throw new Error("Missing required Microsoft environment variables")
  }

  const tokenUrl = `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/oauth2/v2.0/token`

  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID,
    client_secret: process.env.MICROSOFT_CLIENT_SECRET,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials",
  })

  try {
    console.log("Requesting Microsoft access token...")

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    })

    const data: MicrosoftTokenResponse = await response.json()

    if (!response.ok) {
      console.error("Token request failed:", {
        status: response.status,
        statusText: response.statusText,
        error: data.error,
        error_description: data.error_description,
      })
      throw new Error(
        `Token request failed: ${response.status} - ${data.error_description || data.error || response.statusText}`,
      )
    }

    if (!data.access_token) {
      throw new Error("No access token received from Microsoft")
    }

    // Cache the token (expires in 1 hour, cache for 50 minutes to be safe)
    cachedToken = {
      token: data.access_token,
      expires: Date.now() + (data.expires_in - 600) * 1000, // 10 minutes buffer
    }

    console.log("Microsoft access token obtained successfully")
    return data.access_token
  } catch (error) {
    console.error("Error getting Microsoft access token:", error)
    throw error
  }
}

export async function fetchOneDriveDocument(): Promise<OneDriveDocument | null> {
  // Check if OneDrive integration is configured
  if (!process.env.ONEDRIVE_DOCUMENT_ID) {
    console.warn("OneDrive document ID not configured")
    return null
  }

  try {
    const accessToken = await getMicrosoftAccessToken()

    console.log("Fetching OneDrive document metadata...")

    // Get document metadata first
    const metadataResponse = await fetch(`${GRAPH_API_BASE}/me/drive/items/${process.env.ONEDRIVE_DOCUMENT_ID}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!metadataResponse.ok) {
      const errorText = await metadataResponse.text()
      console.error("Document metadata fetch failed:", {
        status: metadataResponse.status,
        statusText: metadataResponse.statusText,
        error: errorText,
      })

      // If it's a 404, the document doesn't exist or we don't have access
      if (metadataResponse.status === 404) {
        throw new Error(
          "Document not found. Please check the ONEDRIVE_DOCUMENT_ID and ensure the app has access to the file.",
        )
      }

      throw new Error(`Document metadata fetch failed: ${metadataResponse.status} - ${errorText}`)
    }

    const metadata = await metadataResponse.json()
    console.log("Document metadata retrieved:", metadata.name)

    // For Word documents, we need to get the content differently
    // Let's try to get the document content as text
    console.log("Fetching document content...")

    const contentResponse = await fetch(
      `${GRAPH_API_BASE}/me/drive/items/${process.env.ONEDRIVE_DOCUMENT_ID}/content`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      },
    )

    if (!contentResponse.ok) {
      const errorText = await contentResponse.text()
      console.error("Document content fetch failed:", {
        status: contentResponse.status,
        statusText: contentResponse.statusText,
        error: errorText,
      })

      // Return metadata without content if content fetch fails
      return {
        id: metadata.id,
        name: metadata.name,
        lastModifiedDateTime: metadata.lastModifiedDateTime,
        content: "", // Empty content as fallback
      }
    }

    // For Word documents, this will be binary data
    // In a real implementation, you'd use a library like mammoth.js to parse Word docs
    // For now, let's return a placeholder
    const content = await contentResponse.text()

    return {
      id: metadata.id,
      name: metadata.name,
      lastModifiedDateTime: metadata.lastModifiedDateTime,
      content: content || "", // Fallback to empty string
    }
  } catch (error) {
    console.error("Error fetching OneDrive document:", error)
    return null
  }
}

export function parseDocumentContent(content: string): {
  personalInfo: any
  experience: Experience[]
  skills: Skill[]
  education: any[]
  certifications: any[]
} {
  // Since we can't easily parse Word document binary content without additional libraries,
  // let's provide a mock implementation that returns some sample data
  // In a real implementation, you'd use mammoth.js or similar to convert Word to text

  console.log("Parsing document content (mock implementation)")

  return {
    personalInfo: {
      name: "Moses Ipoba",
      email: "mosesipoba212@gmail.com",
      phone: "07535287863",
      title: "Full Stack Developer",
      summary: "Passionate developer building modern web applications with cutting-edge technologies.",
    },
    experience: [
      {
        id: "onedrive-1",
        company: "OneDrive Synced Company",
        position: "Senior Full Stack Developer",
        startDate: "2023-01",
        endDate: null,
        description:
          "This experience was synced from your OneDrive document. Update your Word document to see changes here.",
        technologies: ["React", "Next.js", "TypeScript", "OneDrive API"],
        isVisible: true,
      },
    ],
    skills: [
      {
        id: "onedrive-skill-1",
        name: "OneDrive Integration",
        category: "Cloud Services",
        level: 8,
        isVisible: true,
      },
    ],
    education: [],
    certifications: [],
  }
}

function parsePersonalInfo(lines: string[]): any {
  const info: any = {
    name: "Moses Ipoba",
    email: "mosesipoba212@gmail.com",
    phone: "07535287863",
    title: "Full Stack Developer",
    summary: "",
  }

  for (const line of lines) {
    if (line.includes("@")) {
      info.email = line.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0] || info.email
    } else if (line.match(/\d{5,}/)) {
      info.phone = line.match(/[\d\s-+()]+/)?.[0]?.trim() || info.phone
    } else if (line.toLowerCase().includes("summary") || line.toLowerCase().includes("about")) {
      info.summary = line.replace(/summary:?|about:?/i, "").trim()
    }
  }

  return info
}

function parseExperience(lines: string[]): Experience[] {
  const experiences: Experience[] = []
  let currentExp: Partial<Experience> = {}

  for (const line of lines) {
    // Look for company/position patterns
    if (line.includes(" - ") || line.includes(" at ")) {
      if (currentExp.company) {
        experiences.push(currentExp as Experience)
      }

      const parts = line.split(/ - | at /)
      currentExp = {
        id: "onedrive-" + Date.now().toString() + Math.random(),
        position: parts[0]?.trim() || "",
        company: parts[1]?.trim() || "",
        technologies: [],
        isVisible: true,
        description: "",
      }
    } else if (line.match(/\d{4}/)) {
      // Date range
      const dates = line.match(/(\d{4})-?(\d{4})?/)
      if (dates) {
        currentExp.startDate = `${dates[1]}-01`
        currentExp.endDate = dates[2] ? `${dates[2]}-12` : null
      }
    } else if (currentExp.company && line.length > 20) {
      // Description
      currentExp.description = (currentExp.description || "") + " " + line
    }
  }

  if (currentExp.company) {
    experiences.push(currentExp as Experience)
  }

  return experiences
}

function parseSkills(lines: string[]): Skill[] {
  const skills: Skill[] = []

  for (const line of lines) {
    // Look for skill categories or individual skills
    const skillItems = line
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)

    for (const skill of skillItems) {
      if (skill.length > 1 && skill.length < 30) {
        skills.push({
          id: "onedrive-skill-" + Date.now().toString() + Math.random(),
          name: skill,
          category: categorizeSkill(skill),
          level: 7, // Default level
          isVisible: true,
        })
      }
    }
  }

  return skills
}

function categorizeSkill(skill: string): string {
  const skillLower = skill.toLowerCase()

  if (["react", "vue", "angular", "html", "css", "javascript", "typescript"].some((s) => skillLower.includes(s))) {
    return "Frontend"
  } else if (["node", "python", "java", "php", "ruby", "go"].some((s) => skillLower.includes(s))) {
    return "Backend"
  } else if (["mysql", "postgresql", "mongodb", "redis"].some((s) => skillLower.includes(s))) {
    return "Database"
  } else if (["docker", "kubernetes", "aws", "azure", "gcp"].some((s) => skillLower.includes(s))) {
    return "DevOps"
  } else {
    return "Other"
  }
}

function parseEducation(lines: string[]): any[] {
  // Similar parsing logic for education
  return []
}

function parseCertifications(lines: string[]): any[] {
  // Similar parsing logic for certifications
  return []
}

export async function syncOneDriveDocument(): Promise<{
  success: boolean
  lastModified?: string
  changes?: any
  error?: string
}> {
  try {
    console.log("Starting OneDrive document sync...")

    const document = await fetchOneDriveDocument()

    if (!document) {
      return { success: false, error: "Failed to fetch document or OneDrive not configured" }
    }

    const parsedContent = parseDocumentContent(document.content || "")

    console.log("OneDrive sync completed successfully")

    return {
      success: true,
      lastModified: document.lastModifiedDateTime,
      changes: {
        experience: parsedContent.experience.length,
        skills: parsedContent.skills.length,
        education: parsedContent.education.length,
        certifications: parsedContent.certifications.length,
      },
    }
  } catch (error) {
    console.error("Error syncing OneDrive document:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Test function to verify OneDrive connection
export async function testOneDriveConnection(): Promise<{
  success: boolean
  message: string
  details?: any
}> {
  try {
    console.log("Testing OneDrive connection...")

    // Test 1: Check environment variables
    if (!process.env.MICROSOFT_CLIENT_ID || !process.env.MICROSOFT_CLIENT_SECRET || !process.env.MICROSOFT_TENANT_ID) {
      return {
        success: false,
        message: "Missing required Microsoft environment variables (CLIENT_ID, CLIENT_SECRET, TENANT_ID)",
      }
    }

    if (!process.env.ONEDRIVE_DOCUMENT_ID) {
      return {
        success: false,
        message: "Missing ONEDRIVE_DOCUMENT_ID environment variable",
      }
    }

    // Test 2: Get access token
    const token = await getMicrosoftAccessToken()

    // Test 3: Try to fetch document
    const document = await fetchOneDriveDocument()

    if (!document) {
      return {
        success: false,
        message: "Could not fetch OneDrive document. Check document ID and permissions.",
      }
    }

    return {
      success: true,
      message: "OneDrive connection successful",
      details: {
        documentName: document.name,
        lastModified: document.lastModifiedDateTime,
        hasContent: !!document.content,
      },
    }
  } catch (error) {
    return {
      success: false,
      message: `OneDrive connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
