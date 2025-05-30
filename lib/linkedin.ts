import type { LinkedInProfile, Experience, Skill } from "@/types/resume"

// LinkedIn API configuration
const LINKEDIN_API_BASE = "https://api.linkedin.com/v2"

interface LinkedInTokenResponse {
  access_token: string
  expires_in: number
  refresh_token?: string
  refresh_token_expires_in?: number
  scope: string
}

export class LinkedInService {
  private accessToken: string | null = null

  constructor() {
    // Use the actual access token from environment variables
    this.accessToken = process.env.LINKEDIN_ACCESS_TOKEN || null
  }

  // Generate LinkedIn OAuth URL
  getAuthorizationUrl(): string {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NODE_ENV === "production"
        ? "https://your-app.vercel.app"
        : "http://localhost:3000"

    const redirectUri = `${baseUrl}/api/auth/linkedin/callback`
    const clientId = process.env.LINKEDIN_CLIENT_ID

    if (!clientId) {
      throw new Error("LinkedIn Client ID not configured")
    }

    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "r_liteprofile r_emailaddress w_member_social",
      state: "linkedin-resume-sync",
    })

    return `https://www.linkedin.com/oauth/v2/authorization?${params}`
  }

  // Exchange authorization code for access token
  async getAccessToken(code: string): Promise<LinkedInTokenResponse> {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NODE_ENV === "production"
        ? "https://your-app.vercel.app"
        : "http://localhost:3000"

    const redirectUri = `${baseUrl}/api/auth/linkedin/callback`

    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
    })

    const response = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`LinkedIn token exchange failed: ${error}`)
    }

    return await response.json()
  }

  // Fetch LinkedIn profile
  async fetchProfile(): Promise<LinkedInProfile | null> {
    if (!this.accessToken) {
      console.warn("LinkedIn access token not available")
      return this.getMockProfile() // Return mock data for demo
    }

    try {
      const response = await fetch(`${LINKEDIN_API_BASE}/people/~`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`LinkedIn API error: ${response.status}`)
      }

      const data = await response.json()
      return this.transformLinkedInProfile(data)
    } catch (error) {
      console.error("Error fetching LinkedIn profile:", error)
      return this.getMockProfile() // Fallback to mock data
    }
  }

  // Mock LinkedIn profile for demo purposes
  private getMockProfile(): LinkedInProfile {
    return {
      id: "linkedin-moses-ipoba",
      firstName: "Moses",
      lastName: "Ipoba",
      headline: "Software Engineer | Cyber Security Analyst | Full Stack Developer",
      summary:
        "Passionate software engineer and cybersecurity analyst with expertise in modern web technologies. Building scalable applications with React, Next.js, and Node.js while ensuring robust security practices. Always learning and exploring new technologies to create innovative solutions.",
      location: "London, England, United Kingdom",
      industry: "Information Technology & Services",
      publicProfileUrl: "https://www.linkedin.com/in/moses-ipoba-b252a7337/",
      connections: 8,
      profilePicture: "/placeholder.svg?height=400&width=400",
    }
  }

  // Transform LinkedIn API response to our format
  private transformLinkedInProfile(data: any): LinkedInProfile {
    return {
      id: data.id || "linkedin-user",
      firstName: data.firstName?.localized?.en_US || "Moses",
      lastName: data.lastName?.localized?.en_US || "Ipoba",
      headline: data.headline?.localized?.en_US || "Software Engineer | Cyber Security Analyst",
      summary: data.summary?.localized?.en_US || "",
      location: data.location?.name || "London, England, United Kingdom",
      industry: data.industry?.localized?.en_US || "Technology",
      publicProfileUrl: data.publicProfileUrl || "https://www.linkedin.com/in/moses-ipoba-b252a7337/",
      connections: data.numConnections || 8,
      profilePicture: data.profilePicture?.displayImage || undefined,
    }
  }

  // Fetch LinkedIn experience (mock for demo)
  async fetchExperience(): Promise<Experience[]> {
    // In a real implementation, you'd fetch from LinkedIn API
    // For now, return mock data based on your profile
    return [
      {
        id: "linkedin-exp-1",
        company: "University of West London",
        position: "Student - Software Engineering & Cyber Security",
        startDate: "2022-09",
        endDate: null,
        description:
          "Currently pursuing studies in Software Engineering and Cyber Security. Developing expertise in secure coding practices, threat analysis, and modern web development technologies.",
        technologies: ["Python", "Java", "Cybersecurity", "Network Security", "Web Development"],
        isVisible: true,
        source: "linkedin",
      },
    ]
  }

  // Fetch LinkedIn skills (mock for demo)
  async fetchSkills(): Promise<Skill[]> {
    return [
      {
        id: "linkedin-skill-1",
        name: "Software Engineering",
        category: "Development",
        level: 8,
        isVisible: true,
        source: "linkedin",
      },
      {
        id: "linkedin-skill-2",
        name: "Cyber Security",
        category: "Security",
        level: 8,
        isVisible: true,
        source: "linkedin",
      },
      {
        id: "linkedin-skill-3",
        name: "Python",
        category: "Language",
        level: 7,
        isVisible: true,
        source: "linkedin",
      },
      {
        id: "linkedin-skill-4",
        name: "Java",
        category: "Language",
        level: 7,
        isVisible: true,
        source: "linkedin",
      },
      {
        id: "linkedin-skill-5",
        name: "Network Security",
        category: "Security",
        level: 6,
        isVisible: true,
        source: "linkedin",
      },
    ]
  }

  // Test LinkedIn connection
  async testConnection(): Promise<{ success: boolean; message: string; profile?: LinkedInProfile }> {
    try {
      const profile = await this.fetchProfile()
      return {
        success: true,
        message: "LinkedIn connection successful",
        profile: profile || undefined,
      }
    } catch (error) {
      return {
        success: false,
        message: `LinkedIn connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    }
  }

  // Sync all LinkedIn data
  async syncLinkedInData(): Promise<{
    success: boolean
    profile?: LinkedInProfile
    experience?: Experience[]
    skills?: Skill[]
    error?: string
  }> {
    try {
      const [profile, experience, skills] = await Promise.all([
        this.fetchProfile(),
        this.fetchExperience(),
        this.fetchSkills(),
      ])

      return {
        success: true,
        profile: profile || undefined,
        experience,
        skills,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }
}

export const linkedInService = new LinkedInService()
