import { microsoftGraph } from "./microsoft-graph"
import { documentParser } from "./document-parser"
import type { Experience, Skill } from "@/types/resume"

interface SyncResult {
  success: boolean
  lastModified?: string
  changes?: {
    experience: number
    skills: number
    education: number
    certifications: number
  }
  error?: string
}

export class OneDriveService {
  private documentId: string | null = null

  constructor() {
    this.documentId = process.env.ONEDRIVE_DOCUMENT_ID || null
  }

  async isConfigured(): Promise<boolean> {
    return !!(this.documentId && process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET)
  }

  async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    if (!(await this.isConfigured())) {
      return {
        success: false,
        message: "OneDrive integration not configured. Missing environment variables.",
      }
    }

    return await microsoftGraph.testConnection()
  }

  async getDocumentInfo() {
    if (!this.documentId) {
      throw new Error("Document ID not configured")
    }

    return await microsoftGraph.getDocument(this.documentId)
  }

  async syncDocument(): Promise<SyncResult> {
    try {
      if (!(await this.isConfigured())) {
        return {
          success: false,
          error: "OneDrive integration not configured",
        }
      }

      console.log("Starting OneDrive document sync...")

      // Get document metadata
      const documentInfo = await this.getDocumentInfo()
      if (!documentInfo) {
        return {
          success: false,
          error: "Failed to fetch document information",
        }
      }

      console.log(`Syncing document: ${documentInfo.name}`)

      // Download document content
      const documentBuffer = await microsoftGraph.downloadDocument(this.documentId!)
      if (!documentBuffer) {
        return {
          success: false,
          error: "Failed to download document content",
        }
      }

      // Parse document content
      const parsedContent = documentParser.parseWordDocument(documentBuffer)

      console.log("Document parsed successfully:", {
        experience: parsedContent.experience.length,
        skills: parsedContent.skills.length,
        education: parsedContent.education.length,
        certifications: parsedContent.certifications.length,
      })

      // Store parsed content (in a real app, you'd save to database)
      await this.storeDocumentData(parsedContent)

      return {
        success: true,
        lastModified: documentInfo.lastModifiedDateTime,
        changes: {
          experience: parsedContent.experience.length,
          skills: parsedContent.skills.length,
          education: parsedContent.education.length,
          certifications: parsedContent.certifications.length,
        },
      }
    } catch (error) {
      console.error("OneDrive sync error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async setupWebhook(baseUrl: string): Promise<{ success: boolean; subscriptionId?: string; error?: string }> {
    try {
      if (!this.documentId) {
        throw new Error("Document ID not configured")
      }

      const notificationUrl = `${baseUrl}/api/webhook/onedrive`
      const subscription = await microsoftGraph.createWebhook(this.documentId, notificationUrl)

      if (!subscription) {
        return {
          success: false,
          error: "Failed to create webhook subscription",
        }
      }

      console.log("Webhook created successfully:", subscription.id)

      return {
        success: true,
        subscriptionId: subscription.id,
      }
    } catch (error) {
      console.error("Webhook setup error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async renewWebhook(subscriptionId: string): Promise<boolean> {
    return await microsoftGraph.renewWebhook(subscriptionId)
  }

  private async storeDocumentData(data: any): Promise<void> {
    // In a real application, you would store this data in your database
    // For now, we'll just log it
    console.log("Storing document data:", {
      personalInfo: data.personalInfo,
      experienceCount: data.experience.length,
      skillsCount: data.skills.length,
      educationCount: data.education.length,
      certificationsCount: data.certifications.length,
    })

    // You could also cache this data in memory or a temporary store
    // to be retrieved by your actions
  }

  async getExperienceFromDocument(): Promise<Experience[]> {
    try {
      if (!(await this.isConfigured())) {
        return []
      }

      const documentBuffer = await microsoftGraph.downloadDocument(this.documentId!)
      if (!documentBuffer) {
        return []
      }

      const parsedContent = documentParser.parseWordDocument(documentBuffer)
      return parsedContent.experience
    } catch (error) {
      console.error("Error getting experience from document:", error)
      return []
    }
  }

  async getSkillsFromDocument(): Promise<Skill[]> {
    try {
      if (!(await this.isConfigured())) {
        return []
      }

      const documentBuffer = await microsoftGraph.downloadDocument(this.documentId!)
      if (!documentBuffer) {
        return []
      }

      const parsedContent = documentParser.parseWordDocument(documentBuffer)
      return parsedContent.skills
    } catch (error) {
      console.error("Error getting skills from document:", error)
      return []
    }
  }
}

export const oneDriveService = new OneDriveService()
