"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, Loader2, CheckCircle, AlertCircle, Eye, Lock } from "lucide-react"

interface ResumeDownloadProps {
  personalInfo: {
    name: string
    title: string
    email: string
    phone: string
    location: string
    linkedinUrl?: string
  }
  experience: any[]
  skills: any[]
  projects: any[]
}

export function ResumeDownload({ personalInfo, experience, skills, projects }: ResumeDownloadProps) {
  const [generating, setGenerating] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState<"pdf" | "docx" | null>(null)

  const generateResume = async (format: "pdf" | "docx", preview = false) => {
    setGenerating(true)
    setError(null)

    try {
      const response = await fetch("/api/generate-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          format,
          preview,
          readonly: true, // Force read-only mode
          data: {
            personalInfo,
            experience,
            skills,
            projects: projects.slice(0, 6), // Limit to top 6 projects
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate resume")
      }

      if (preview) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)

        // Open in new tab for preview (read-only)
        const newWindow = window.open(url, "_blank")
        if (newWindow) {
          newWindow.document.title = `${personalInfo.name} - Resume Preview (Read Only)`
        }
        setPreviewMode(format)
      } else {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        setDownloadUrl(url)

        // Auto-download
        const a = document.createElement("a")
        a.href = url
        a.download = `${personalInfo.name.replace(/\s+/g, "_")}_Resume_ReadOnly.${format}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate resume")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-sm border border-white/10 rounded-2xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-green-400" />
          View & Download Resume
          <Lock className="w-5 h-5 text-yellow-400" />
        </CardTitle>
        <CardDescription className="text-gray-400">
          Get a read-only, professionally formatted copy of this resume
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preview Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={() => generateResume("pdf", true)}
            disabled={generating}
            variant="outline"
            className="border-blue-500/30 text-blue-400 hover:bg-blue-600/10 h-16"
          >
            {generating ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Eye className="w-5 h-5 mr-2" />}
            Preview PDF
            <Badge className="ml-2 bg-blue-700/30 text-blue-200">Read-Only</Badge>
          </Button>

          <Button
            onClick={() => generateResume("docx", true)}
            disabled={generating}
            variant="outline"
            className="border-purple-500/30 text-purple-400 hover:bg-purple-600/10 h-16"
          >
            {generating ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Eye className="w-5 h-5 mr-2" />}
            Preview Word
            <Badge className="ml-2 bg-purple-700/30 text-purple-200">Read-Only</Badge>
          </Button>
        </div>

        {/* Download Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={() => generateResume("pdf")}
            disabled={generating}
            className="bg-red-600 hover:bg-red-700 transition-all duration-300 h-16"
          >
            {generating ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Download className="w-5 h-5 mr-2" />}
            Download PDF
            <Badge className="ml-2 bg-red-700/30 text-red-200">Protected</Badge>
          </Button>

          <Button
            onClick={() => generateResume("docx")}
            disabled={generating}
            variant="outline"
            className="border-green-500/30 text-green-400 hover:bg-green-600/10 h-16"
          >
            {generating ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Download className="w-5 h-5 mr-2" />}
            Download Word
            <Badge className="ml-2 bg-green-700/30 text-green-200">View-Only</Badge>
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-red-900/20 rounded-lg border border-red-500/20 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-200">{error}</span>
          </div>
        )}

        {downloadUrl && (
          <div className="p-4 bg-green-900/20 rounded-lg border border-green-500/20 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-200">Resume generated successfully! (Read-only format)</span>
          </div>
        )}

        {previewMode && (
          <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/20 flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-400" />
            <span className="text-blue-200">
              Preview opened in new tab - {previewMode.toUpperCase()} format (View-only)
            </span>
          </div>
        )}

        <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-5 h-5 text-yellow-400" />
            <h4 className="font-medium text-yellow-300">Read-Only Protection</h4>
          </div>
          <div className="text-sm text-yellow-200 space-y-1">
            <div>• 🔒 Documents are generated in view-only mode</div>
            <div>• 👁️ Preview before downloading to see the format</div>
            <div>• 🚫 Content cannot be edited or modified</div>
            <div>• ✅ Perfect for sharing with employers and recruiters</div>
            <div>• 🔄 Always reflects your most current information</div>
          </div>
        </div>

        <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/20">
          <h4 className="font-medium text-blue-300 mb-2">What's included:</h4>
          <div className="text-sm text-blue-200 space-y-1">
            <div>• ✅ Complete work experience with skill usage details</div>
            <div>• ✅ Skills section showing real project applications</div>
            <div>• ✅ Top 6 GitHub projects with descriptions</div>
            <div>• ✅ Professional formatting and layout</div>
            <div>• ✅ Contact information and LinkedIn profile</div>
            <div>• ✅ Automatically updated from your latest data</div>
          </div>
        </div>

        <div className="text-center text-gray-500 text-sm">
          <p>Resume data is automatically synced from GitHub, LinkedIn, and OneDrive</p>
          <p className="mt-1">Last updated: {new Date().toLocaleDateString()}</p>
          <p className="mt-1 text-yellow-400 font-medium">🔒 All downloads are read-only protected</p>
        </div>
      </CardContent>
    </Card>
  )
}
