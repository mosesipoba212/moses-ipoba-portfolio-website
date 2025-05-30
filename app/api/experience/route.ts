import { type NextRequest, NextResponse } from "next/server"
import { getExperienceWithAllSources, addExperience, updateExperience, deleteExperience } from "@/lib/actions"

export async function GET() {
  try {
    const experiences = await getExperienceWithAllSources()
    return NextResponse.json(experiences)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch experiences" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const newExperience = await addExperience(body)
    return NextResponse.json(newExperience)
  } catch (error) {
    return NextResponse.json({ error: "Failed to add experience" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    await updateExperience(body)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update experience" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Experience ID is required" }, { status: 400 })
    }

    await deleteExperience(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete experience" }, { status: 500 })
  }
}
