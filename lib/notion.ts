import type { NotionExperience, NotionResponse, Experience } from "@/types/resume"

const NOTION_API_BASE = "https://api.notion.com/v1"
const NOTION_VERSION = "2022-06-28"

export async function fetchNotionExperience(): Promise<Experience[]> {
  if (!process.env.NOTION_TOKEN || !process.env.NOTION_DATABASE_ID) {
    console.warn("Notion credentials not configured")
    return []
  }

  try {
    const response = await fetch(`${NOTION_API_BASE}/databases/${process.env.NOTION_DATABASE_ID}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sorts: [
          {
            property: "Start Date",
            direction: "descending",
          },
        ],
        filter: {
          property: "Status",
          select: {
            equals: "Published",
          },
        },
      }),
      next: { revalidate: 1800 }, // Cache for 30 minutes
    })

    if (!response.ok) {
      throw new Error(`Notion API error: ${response.status} ${response.statusText}`)
    }

    const data: NotionResponse = await response.json()
    return data.results.map(transformNotionToExperience)
  } catch (error) {
    console.error("Error fetching Notion experience:", error)
    return []
  }
}

function transformNotionToExperience(notionExp: NotionExperience): Experience {
  const company = notionExp.properties.Company?.title?.[0]?.plain_text || ""
  const position = notionExp.properties.Position?.rich_text?.[0]?.plain_text || ""
  const description = notionExp.properties.Description?.rich_text?.map((text) => text.plain_text).join("") || ""

  const technologies = notionExp.properties.Technologies?.multi_select?.map((tech) => tech.name) || []

  // Handle start date
  const startDate = notionExp.properties["Start Date"]?.date?.start || ""
  const formattedStartDate = startDate ? formatDateForInput(startDate) : ""

  // Handle end date - check both "End Date" property and "Start Date" end field
  let endDate: string | null = null
  if (notionExp.properties["End Date"]?.date?.start) {
    endDate = formatDateForInput(notionExp.properties["End Date"].date.start)
  } else if (notionExp.properties["Start Date"]?.date?.end) {
    endDate = formatDateForInput(notionExp.properties["Start Date"].date.end)
  }

  return {
    id: `notion-${notionExp.id}`,
    company,
    position,
    startDate: formattedStartDate,
    endDate,
    description,
    technologies,
    isVisible: notionExp.properties.Visible?.checkbox ?? true,
  }
}

function formatDateForInput(dateString: string): string {
  // Convert YYYY-MM-DD to YYYY-MM format for HTML month input
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  return `${year}-${month}`
}

export async function syncNotionExperience(): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const notionExperience = await fetchNotionExperience()

    // In a real app, you'd save this to your database
    // For now, we'll just return the sync status

    return {
      success: true,
      count: notionExperience.length,
    }
  } catch (error) {
    console.error("Error syncing Notion experience:", error)
    return {
      success: false,
      count: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
