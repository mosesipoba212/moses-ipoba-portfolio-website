import { type NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function GET(request: NextRequest) {
  try {
    const uploadsDir = join(process.cwd(), "uploads")
    const metadataPath = join(uploadsDir, "metadata.json")

    if (!existsSync(metadataPath)) {
      return NextResponse.json({ success: false, message: "No uploaded files found" }, { status: 404 })
    }

    // Read metadata to find the latest resume
    const metadataContent = await readFile(metadataPath, "utf-8")
    const metadata = JSON.parse(metadataContent)

    // Find the most recent resume file
    const resumeFiles = metadata
      .filter((file: any) => file.documentType === "resume")
      .sort((a: any, b: any) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())

    if (resumeFiles.length === 0) {
      return NextResponse.json({ success: false, message: "No resume files found" }, { status: 404 })
    }

    const latestResume = resumeFiles[0]
    const filepath = latestResume.filepath

    if (!existsSync(filepath)) {
      return NextResponse.json({ success: false, message: "Resume file not found" }, { status: 404 })
    }

    // Read the file
    const fileBuffer = await readFile(filepath)

    // Return the file
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${latestResume.originalName}"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json({ success: false, message: "Failed to download file" }, { status: 500 })
  }
}
