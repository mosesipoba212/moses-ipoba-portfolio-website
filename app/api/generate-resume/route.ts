import { type NextRequest, NextResponse } from "next/server"
import { jsPDF } from "jspdf"

export async function POST(request: NextRequest) {
  try {
    const { format, data, preview = false, readonly = true } = await request.json()
    const { personalInfo, experience, skills, projects } = data

    if (format === "pdf") {
      // Generate PDF with read-only protection
      const doc = new jsPDF()
      let yPosition = 20

      // Add read-only watermark/header
      if (readonly) {
        doc.setFontSize(8)
        doc.setTextColor(128, 128, 128)
        doc.text("READ-ONLY DOCUMENT - Generated from Live Resume", 20, 10)
        doc.setTextColor(0, 0, 0) // Reset to black
      }

      // Helper function to add text with word wrapping
      const addText = (text: string, x: number, y: number, maxWidth = 180) => {
        const lines = doc.splitTextToSize(text, maxWidth)
        doc.text(lines, x, y)
        return y + lines.length * 7
      }

      // Header
      doc.setFontSize(24)
      doc.setFont(undefined, "bold")
      yPosition = addText(personalInfo.name, 20, yPosition)

      doc.setFontSize(16)
      doc.setFont(undefined, "normal")
      yPosition = addText(personalInfo.title, 20, yPosition + 5)

      doc.setFontSize(10)
      yPosition = addText(`${personalInfo.email} | ${personalInfo.phone} | ${personalInfo.location}`, 20, yPosition + 5)

      if (personalInfo.linkedinUrl) {
        yPosition = addText(`LinkedIn: ${personalInfo.linkedinUrl}`, 20, yPosition + 3)
      }

      yPosition += 10

      // Experience Section
      doc.setFontSize(16)
      doc.setFont(undefined, "bold")
      yPosition = addText("WORK EXPERIENCE", 20, yPosition)
      doc.line(20, yPosition + 2, 190, yPosition + 2)
      yPosition += 10

      experience.forEach((exp) => {
        if (yPosition > 250) {
          doc.addPage()
          yPosition = 20

          // Add read-only header on new pages
          if (readonly) {
            doc.setFontSize(8)
            doc.setTextColor(128, 128, 128)
            doc.text("READ-ONLY DOCUMENT", 20, 10)
            doc.setTextColor(0, 0, 0)
          }
        }

        doc.setFontSize(12)
        doc.setFont(undefined, "bold")
        yPosition = addText(`${exp.position} - ${exp.company}`, 20, yPosition)

        doc.setFontSize(10)
        doc.setFont(undefined, "italic")
        yPosition = addText(`${exp.startDate} - ${exp.endDate || "Present"}`, 20, yPosition + 3)

        doc.setFont(undefined, "normal")
        yPosition = addText(exp.description, 20, yPosition + 5) + 3

        if (exp.technologies.length > 0) {
          yPosition = addText(`Technologies: ${exp.technologies.join(", ")}`, 20, yPosition + 2) + 5
        }

        yPosition += 5
      })

      // Skills Section
      if (yPosition > 200) {
        doc.addPage()
        yPosition = 20

        if (readonly) {
          doc.setFontSize(8)
          doc.setTextColor(128, 128, 128)
          doc.text("READ-ONLY DOCUMENT", 20, 10)
          doc.setTextColor(0, 0, 0)
        }
      }

      doc.setFontSize(16)
      doc.setFont(undefined, "bold")
      yPosition = addText("SKILLS & EXPERTISE", 20, yPosition)
      doc.line(20, yPosition + 2, 190, yPosition + 2)
      yPosition += 10

      // Group skills by category
      const skillsByCategory = skills.reduce((acc: any, skill: any) => {
        if (!acc[skill.category]) acc[skill.category] = []
        acc[skill.category].push(skill.name)
        return acc
      }, {})

      Object.entries(skillsByCategory).forEach(([category, categorySkills]: [string, any]) => {
        doc.setFontSize(12)
        doc.setFont(undefined, "bold")
        yPosition = addText(`${category}:`, 20, yPosition)

        doc.setFont(undefined, "normal")
        yPosition = addText((categorySkills as string[]).join(", "), 30, yPosition + 3) + 5
      })

      // Projects Section
      if (projects.length > 0) {
        if (yPosition > 200) {
          doc.addPage()
          yPosition = 20

          if (readonly) {
            doc.setFontSize(8)
            doc.setTextColor(128, 128, 128)
            doc.text("READ-ONLY DOCUMENT", 20, 10)
            doc.setTextColor(0, 0, 0)
          }
        }

        doc.setFontSize(16)
        doc.setFont(undefined, "bold")
        yPosition = addText("FEATURED PROJECTS", 20, yPosition)
        doc.line(20, yPosition + 2, 190, yPosition + 2)
        yPosition += 10

        projects.slice(0, 6).forEach((project: any) => {
          if (yPosition > 250) {
            doc.addPage()
            yPosition = 20

            if (readonly) {
              doc.setFontSize(8)
              doc.setTextColor(128, 128, 128)
              doc.text("READ-ONLY DOCUMENT", 20, 10)
              doc.setTextColor(0, 0, 0)
            }
          }

          doc.setFontSize(12)
          doc.setFont(undefined, "bold")
          yPosition = addText(project.name, 20, yPosition)

          doc.setFontSize(10)
          doc.setFont(undefined, "normal")
          if (project.description) {
            yPosition = addText(project.description, 20, yPosition + 3) + 2
          }

          if (project.language) {
            yPosition = addText(`Primary Language: ${project.language}`, 20, yPosition + 2) + 2
          }

          yPosition = addText(`Repository: ${project.html_url}`, 20, yPosition + 2) + 5
        })
      }

      // Add footer with read-only notice
      if (readonly) {
        const pageCount = doc.getNumberOfPages()
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i)
          doc.setFontSize(8)
          doc.setTextColor(128, 128, 128)
          doc.text(
            `🔒 READ-ONLY RESUME - Generated ${new Date().toLocaleDateString()} - Page ${i} of ${pageCount}`,
            20,
            285,
          )
        }
      }

      const pdfBuffer = doc.output("arraybuffer")

      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": preview
            ? "inline"
            : `attachment; filename="${personalInfo.name.replace(/\s+/g, "_")}_Resume_ReadOnly.pdf"`,
          "X-Content-Type-Options": "nosniff",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      })
    }

    // For DOCX format - create read-only version
    const docxContent = `READ-ONLY RESUME - Generated ${new Date().toLocaleDateString()}
🔒 This document is view-only and cannot be edited

${personalInfo.name}
${personalInfo.title}
${personalInfo.email} | ${personalInfo.phone} | ${personalInfo.location}
${personalInfo.linkedinUrl || ""}

═══════════════════════════════════════════════════════════════

WORK EXPERIENCE
${experience
  .map(
    (exp) => `
${exp.position} - ${exp.company}
${exp.startDate} - ${exp.endDate || "Present"}
${exp.description}
Technologies Used: ${exp.technologies.join(", ")}
`,
  )
  .join("\n")}

═══════════════════════════════════════════════════════════════

SKILLS & EXPERTISE
${Object.entries(
  skills.reduce((acc: any, skill: any) => {
    if (!acc[skill.category]) acc[skill.category] = []
    acc[skill.category].push(skill.name)
    return acc
  }, {}),
)
  .map(([category, categorySkills]: [string, any]) => `${category}: ${(categorySkills as string[]).join(", ")}`)
  .join("\n")}

═══════════════════════════════════════════════════════════════

FEATURED PROJECTS
${projects
  .slice(0, 6)
  .map(
    (project: any) => `
${project.name}
${project.description || ""}
Primary Language: ${project.language || "N/A"}
Repository: ${project.html_url}
`,
  )
  .join("\n")}

═══════════════════════════════════════════════════════════════
🔒 READ-ONLY DOCUMENT - This resume was automatically generated from live data
📅 Generated: ${new Date().toLocaleDateString()}
🚫 Content cannot be modified - Contact ${personalInfo.email} for updates
    `

    return new NextResponse(docxContent, {
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": preview
          ? "inline"
          : `attachment; filename="${personalInfo.name.replace(/\s+/g, "_")}_Resume_ReadOnly.txt"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  } catch (error) {
    console.error("Resume generation error:", error)
    return NextResponse.json({ error: "Failed to generate resume" }, { status: 500 })
  }
}
