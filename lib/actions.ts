"use server"

import { revalidatePath } from "next/cache"
import type { Experience, Skill, LinkedInProfile } from "@/types/resume"
import { oneDriveService } from "@/lib/onedrive-service"
import { linkedInService } from "@/lib/linkedin"

// Mock database - in a real app, you'd use a proper database
let mockExperience: Experience[] = []

let mockSkills: Skill[] = [
  { id: "1", name: "React", category: "Frontend", level: 9, isVisible: true, source: "manual" },
  { id: "2", name: "Next.js", category: "Frontend", level: 8, isVisible: true, source: "manual" },
  { id: "3", name: "TypeScript", category: "Language", level: 8, isVisible: true, source: "manual" },
  { id: "4", name: "Node.js", category: "Backend", level: 7, isVisible: true, source: "manual" },
  { id: "5", name: "PostgreSQL", category: "Database", level: 7, isVisible: true, source: "manual" },
  { id: "6", name: "Python", category: "Language", level: 6, isVisible: true, source: "manual" },
]

let mockLinkedInProfile: LinkedInProfile | null = null

export async function getExperienceWithAllSources(): Promise<Experience[]> {
  try {
    console.log("Fetching experience from all sources...")

    // Get data from all sources with error handling
    const [manualExperience, oneDriveExperience, linkedInExperience] = await Promise.all([
      getExperience(),
      oneDriveService.getExperienceFromDocument().catch((error) => {
        console.warn("OneDrive fetch failed:", error)
        return []
      }),
      linkedInService.fetchExperience().catch((error) => {
        console.warn("LinkedIn fetch failed:", error)
        return []
      }),
    ])

    console.log("Experience sources:", {
      manual: manualExperience.length,
      oneDrive: oneDriveExperience.length,
      linkedin: linkedInExperience.length,
    })

    // Combine all sources (LinkedIn takes highest precedence, then OneDrive, then manual)
    const combined = [...linkedInExperience, ...oneDriveExperience, ...manualExperience]

    // Deduplicate based on company and position
    const uniqueExperience = combined.filter(
      (exp, index, arr) =>
        arr.findIndex(
          (e) =>
            e.company.toLowerCase() === exp.company.toLowerCase() &&
            e.position.toLowerCase() === exp.position.toLowerCase(),
        ) === index,
    )

    // Sort by start date (most recent first)
    return uniqueExperience.sort((a, b) => {
      if (!a.startDate) return 1
      if (!b.startDate) return -1
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    })
  } catch (error) {
    console.error("Error getting experience from all sources:", error)
    // Fallback to manual experience only
    return getExperience()
  }
}

export async function getSkillsWithAllSources(): Promise<Skill[]> {
  try {
    console.log("Fetching skills from all sources...")

    const [manualSkills, oneDriveSkills, linkedInSkills] = await Promise.all([
      getSkills(),
      oneDriveService.getSkillsFromDocument().catch((error) => {
        console.warn("OneDrive skills fetch failed:", error)
        return []
      }),
      linkedInService.fetchSkills().catch((error) => {
        console.warn("LinkedIn skills fetch failed:", error)
        return []
      }),
    ])

    console.log("Skills sources:", {
      manual: manualSkills.length,
      oneDrive: oneDriveSkills.length,
      linkedin: linkedInSkills.length,
    })

    // Combine and deduplicate (LinkedIn takes precedence)
    const combined = [...linkedInSkills, ...oneDriveSkills, ...manualSkills]
    const uniqueSkills = combined.filter(
      (skill, index, arr) => arr.findIndex((s) => s.name.toLowerCase() === skill.name.toLowerCase()) === index,
    )

    return uniqueSkills
  } catch (error) {
    console.error("Error getting skills from all sources:", error)
    return getSkills()
  }
}

export async function getLinkedInProfile(): Promise<LinkedInProfile | null> {
  try {
    if (mockLinkedInProfile) {
      return mockLinkedInProfile
    }

    const profile = await linkedInService.fetchProfile()
    if (profile) {
      mockLinkedInProfile = profile
    }
    return profile
  } catch (error) {
    console.error("Error getting LinkedIn profile:", error)
    return null
  }
}

export async function syncAllData() {
  try {
    console.log("Starting sync of all data sources...")

    const [oneDriveResult, linkedInResult] = await Promise.all([
      oneDriveService.syncDocument().catch((error) => {
        console.warn("OneDrive sync failed:", error)
        return { success: false, error: error.message }
      }),
      syncLinkedInData().catch((error) => {
        console.warn("LinkedIn sync failed:", error)
        return { success: false, error: error.message }
      }),
    ])

    console.log("Sync results:", { oneDrive: oneDriveResult, linkedin: linkedInResult })

    revalidatePath("/admin")
    revalidatePath("/")

    return {
      success: true,
      oneDrive: oneDriveResult,
      linkedin: linkedInResult,
    }
  } catch (error) {
    console.error("Error syncing all data:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function syncLinkedInData() {
  try {
    const result = await linkedInService.syncLinkedInData()
    if (result.success && result.profile) {
      mockLinkedInProfile = result.profile
    }
    console.log(
      `Synced LinkedIn data: ${result.experience?.length || 0} experiences, ${result.skills?.length || 0} skills`,
    )
    revalidatePath("/admin")
    revalidatePath("/")
    return { success: true, ...result }
  } catch (error) {
    console.error("Error syncing LinkedIn data:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function syncNotionData() {
  try {
    // TODO: Implement Notion sync when Notion service is ready
    console.log("Notion sync not yet implemented")
    revalidatePath("/admin")
    revalidatePath("/")
    return {
      success: true,
      message: "Notion sync not yet implemented",
      experience: [],
      skills: [],
    }
  } catch (error) {
    console.error("Error syncing Notion data:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function testLinkedInConnection() {
  try {
    return await linkedInService.testConnection()
  } catch (error) {
    return {
      success: false,
      message: `LinkedIn test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

// Keep existing functions
export async function testOneDriveConnection() {
  try {
    return await oneDriveService.testConnection()
  } catch (error) {
    return {
      success: false,
      message: `OneDrive test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

export async function setupOneDriveWebhook(baseUrl: string) {
  try {
    return await oneDriveService.setupWebhook(baseUrl)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function getOneDriveDocumentInfo() {
  try {
    const info = await oneDriveService.getDocumentInfo()
    return { success: true, document: info }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function getExperience(): Promise<Experience[]> {
  return mockExperience
}

export async function getSkills(): Promise<Skill[]> {
  return mockSkills
}

export async function addExperience(experience: Omit<Experience, "id">) {
  const newExperience: Experience = {
    ...experience,
    id: Date.now().toString(),
    source: "manual",
  }
  mockExperience.push(newExperience)
  revalidatePath("/admin")
  revalidatePath("/")
  return newExperience
}

export async function updateExperience(experience: Experience) {
  const index = mockExperience.findIndex((exp) => exp.id === experience.id)
  if (index !== -1) {
    mockExperience[index] = experience
  } else {
    mockExperience.push(experience)
  }
  revalidatePath("/admin")
  revalidatePath("/")
}

export async function updateSkill(skill: Skill) {
  const index = mockSkills.findIndex((s) => s.id === skill.id)
  if (index !== -1) {
    mockSkills[index] = skill
  } else {
    mockSkills.push(skill)
  }
  revalidatePath("/admin")
  revalidatePath("/")
}

export async function deleteExperience(id: string) {
  mockExperience = mockExperience.filter((exp) => exp.id !== id)
  revalidatePath("/admin")
  revalidatePath("/")
}

export async function deleteSkill(id: string) {
  mockSkills = mockSkills.filter((skill) => skill.id !== id)
  revalidatePath("/admin")
  revalidatePath("/")
}

export async function getExperienceWithOneDrive(): Promise<Experience[]> {
  try {
    console.log("Fetching experience from OneDrive...")
    return await oneDriveService.getExperienceFromDocument()
  } catch (error) {
    console.error("Error fetching experience from OneDrive:", error)
    return []
  }
}

export async function getSkillsWithOneDrive(): Promise<Skill[]> {
  try {
    console.log("Fetching skills from OneDrive...")
    return await oneDriveService.getSkillsFromDocument()
  } catch (error) {
    console.error("Error fetching skills from OneDrive:", error)
    return []
  }
}
