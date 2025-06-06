import type { GitHubRepo, GitHubUser } from "@/types/resume"

const GITHUB_API_BASE = "https://api.github.com"

export async function fetchGitHubUser(): Promise<GitHubUser | null> {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/users/${process.env.GITHUB_USERNAME}`, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
      next: { revalidate: 3600 }, // Revalidate every hour instead of no-cache
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching GitHub user:", error)
    return null
  }
}

export async function fetchGitHubRepos(): Promise<GitHubRepo[]> {
  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/users/${process.env.GITHUB_USERNAME}/repos?sort=updated&per_page=10`,
      {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
        next: { revalidate: 3600 }, // Revalidate every hour instead of no-cache
      },
    )

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const repos = await response.json()
    return repos.filter(
      (repo: GitHubRepo) => !repo.name.includes(".github.io") && repo.name !== process.env.GITHUB_USERNAME,
    )
  } catch (error) {
    console.error("Error fetching GitHub repos:", error)
    return []
  }
}
