export interface GitHubRepo {
  id: number
  name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  topics: string[]
  updated_at: string
  homepage: string | null
}

export interface GitHubUser {
  login: string
  name: string
  bio: string | null
  location: string | null
  blog: string | null
  public_repos: number
  followers: number
  following: number
  avatar_url: string
}

export interface LinkedInProfile {
  id: string
  firstName: string
  lastName: string
  headline: string
  summary: string
  location: string
  industry: string
  profilePicture?: string
  publicProfileUrl: string
  connections: number
}

export interface LinkedInExperience {
  id: string
  title: string
  companyName: string
  description: string
  startDate: {
    month: number
    year: number
  }
  endDate?: {
    month: number
    year: number
  } | null
  location?: string
  skills?: string[]
}

export interface Experience {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string | null
  description: string
  technologies: string[]
  isVisible: boolean
  source?: "manual" | "notion" | "onedrive" | "linkedin"
}

export interface Skill {
  id: string
  name: string
  category: string
  level: number
  isVisible: boolean
  source?: "manual" | "notion" | "onedrive" | "linkedin"
}

export interface ResumeData {
  personalInfo: {
    name: string
    title: string
    email: string
    phone: string
    location: string
    website: string
    summary: string
    linkedinUrl?: string
  }
  experience: Experience[]
  skills: Skill[]
  githubRepos: GitHubRepo[]
  githubUser: GitHubUser | null
  linkedinProfile: LinkedInProfile | null
  lastUpdated: string
}

export interface NotionExperience {
  id: string
  properties: {
    Company: {
      title: Array<{
        plain_text: string
      }>
    }
    Position: {
      rich_text: Array<{
        plain_text: string
      }>
    }
    "Start Date": {
      date: {
        start: string
        end?: string | null
      } | null
    }
    "End Date": {
      date: {
        start: string
      } | null
    }
    Description: {
      rich_text: Array<{
        plain_text: string
      }>
    }
    Technologies: {
      multi_select: Array<{
        name: string
      }>
    }
    Status: {
      select: {
        name: string
      } | null
    }
    Visible: {
      checkbox: boolean
    }
  }
  created_time: string
  last_edited_time: string
}

export interface NotionResponse {
  results: NotionExperience[]
  has_more: boolean
  next_cursor: string | null
}
