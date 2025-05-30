import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const documentType = formData.get("documentType") as string

    if (!file) {
      return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.includes("pdf")) {
      return NextResponse.json({ success: false, message: "Only PDF files are allowed" }, { status: 400 })
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: "File size must be less than 10MB" }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "uploads")
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${documentType}_${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
    const filepath = join(uploadsDir, filename)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Store file info in a simple JSON file (in production, use a database)
    const metadataPath = join(uploadsDir, "metadata.json")
    let metadata = []

    try {
      if (existsSync(metadataPath)) {
        const metadataContent = await import("fs").then((fs) => fs.readFileSync(metadataPath, "utf-8"))
        metadata = JSON.parse(metadataContent)
      }
    } catch (error) {
      console.log("No existing metadata file, creating new one")
    }

    // Add new file metadata
    metadata.push({
      id: timestamp,
      originalName: file.name,
      filename,
      filepath,
      documentType,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      mimeType: file.type,
    })

    // Save updated metadata
    await writeFile(metadataPath, JSON.stringify(metadata, null, 2))

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      fileId: timestamp,
      filename: file.name,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ success: false, message: "Failed to upload file" }, { status: 500 })
  }
}
