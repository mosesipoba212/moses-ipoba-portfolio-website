import { NextResponse } from "next/server"
import { readFile, writeFile, unlink } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function DELETE() {
  try {
    const uploadsDir = join(process.cwd(), "uploads")
    const metadataPath = join(uploadsDir, "metadata.json")

    if (!existsSync(metadataPath)) {
      return NextResponse.json({ success: false, message: "No files found" }, { status: 404 })
    }

    // Read metadata
    const metadataContent = await readFile(metadataPath, "utf-8")
    const metadata = JSON.parse(metadataContent)

    // Find resume files
    const resumeFiles = metadata.filter((file: any) => file.documentType === "resume")
    const otherFiles = metadata.filter((file: any) => file.documentType !== "resume")

    // Delete all resume files
    for (const resumeFile of resumeFiles) {
      if (existsSync(resumeFile.filepath)) {
        await unlink(resumeFile.filepath)
      }
    }

    // Update metadata to remove resume files
    await writeFile(metadataPath, JSON.stringify(otherFiles, null, 2))

    return NextResponse.json({ success: true, message: "Resume files deleted successfully" })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ success: false, message: "Failed to delete files" }, { status: 500 })
  }
}
