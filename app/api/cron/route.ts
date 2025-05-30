import { NextResponse } from "next/server"
import { fetchGitHubUser, fetchGitHubRepos } from "@/lib/github"
import { syncAllData } from "@/lib/actions"

// Replace the existing cron job logic:
export async function GET() {
  try {
    // Update GitHub, LinkedIn, and OneDrive data
    const [user, repos, allDataSync] = await Promise.all([fetchGitHubUser(), fetchGitHubRepos(), syncAllData()])

    console.log("Cron job executed:", {
      user: user?.login,
      repoCount: repos.length,
      allDataSync: allDataSync.success ? "success" : "failed",
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: "All data sources updated successfully",
      data: {
        github: {
          userUpdated: !!user,
          reposCount: repos.length,
        },
        integrations: allDataSync,
      },
    })
  } catch (error) {
    console.error("Cron job failed:", error)
    return NextResponse.json({ success: false, error: "Failed to update data" }, { status: 500 })
  }
}
