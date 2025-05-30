import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function GET() {
  try {
    const uploadsDir = join(process.cwd(), "uploads")
    const metadataPath = join(uploadsDir, "metadata.json")

    if (!existsSync(metadataPath)) {
      return NextResponse.json({ hasFile: false })
    }

    // Read metadata to find the latest resume
    const metadataContent = await readFile(metadataPath, "utf-8")
    const metadata = JSON.parse(metadataContent)

    // Find the most recent resume file
    const resumeFiles = metadata
      .filter((file: any) => file.documentType === "resume")
      .sort((a: any, b: any) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())

    if (resumeFiles.length === 0) {
      return NextResponse.json({ hasFile: false })
    }

    const latestResume = resumeFiles[0]

    // Check if file still exists
    if (!existsSync(latestResume.filepath)) {
      return NextResponse.json({ hasFile: false })
    }

    return NextResponse.json({
      hasFile: true,
      filename: latestResume.originalName,
      uploadedAt: latestResume.uploadedAt,
    })
  } catch (error) {
    console.error("Check file error:", error)
    return NextResponse.json({ hasFile: false })
  }
}
