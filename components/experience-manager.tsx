"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2, Save, X, Briefcase } from "lucide-react"
import type { Experience } from "@/types/resume"

export function ExperienceManager() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState<Partial<Experience>>({
    company: "",
    position: "",
    startDate: "",
    endDate: "",
    description: "",
    technologies: [],
    isVisible: true,
  })

  const fetchExperiences = async () => {
    try {
      const response = await fetch("/api/experience")
      if (response.ok) {
        const data = await response.json()
        setExperiences(data)
      }
    } catch (error) {
      console.error("Failed to fetch experiences:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExperiences()
  }, [])

  const handleSave = async (experience: Experience) => {
    try {
      const response = await fetch("/api/experience", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(experience),
      })

      if (response.ok) {
        await fetchExperiences()
        setEditingId(null)
      }
    } catch (error) {
      console.error("Failed to update experience:", error)
    }
  }

  const handleAdd = async () => {
    try {
      const response = await fetch("/api/experience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          technologies:
            typeof formData.technologies === "string"
              ? formData.technologies
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
              : formData.technologies || [],
        }),
      })

      if (response.ok) {
        await fetchExperiences()
        setShowAddForm(false)
        setFormData({
          company: "",
          position: "",
          startDate: "",
          endDate: "",
          description: "",
          technologies: [],
          isVisible: true,
        })
      }
    } catch (error) {
      console.error("Failed to add experience:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this experience?")) return

    try {
      const response = await fetch(`/api/experience?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchExperiences()
      }
    } catch (error) {
      console.error("Failed to delete experience:", error)
    }
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-sm border border-white/10 rounded-2xl">
        <CardContent className="p-6">
          <div className="text-center text-gray-400">Loading experiences...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-sm border border-white/10 rounded-2xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-purple-400" />
          Experience Manager
        </CardTitle>
        <CardDescription className="text-gray-400">Manage your work experience entries</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-400">
            {experiences.length} experience{experiences.length !== 1 ? "s" : ""} total
          </div>
          <Button onClick={() => setShowAddForm(true)} className="bg-purple-600 hover:bg-purple-700" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Experience
          </Button>
        </div>

        {showAddForm && (
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-600/50">
            <h4 className="font-medium text-white mb-4">Add New Experience</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company" className="text-gray-300">
                  Company
                </Label>
                <Input
                  id="company"
                  value={formData.company || ""}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="position" className="text-gray-300">
                  Position
                </Label>
                <Input
                  id="position"
                  value={formData.position || ""}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="startDate" className="text-gray-300">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="month"
                  value={formData.startDate || ""}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="endDate" className="text-gray-300">
                  End Date (leave empty if current)
                </Label>
                <Input
                  id="endDate"
                  type="month"
                  value={formData.endDate || ""}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description" className="text-gray-300">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                  rows={3}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="technologies" className="text-gray-300">
                  Technologies (comma-separated)
                </Label>
                <Input
                  id="technologies"
                  value={
                    Array.isArray(formData.technologies)
                      ? formData.technologies.join(", ")
                      : formData.technologies || ""
                  }
                  onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="React, Node.js, TypeScript"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700" size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button
                onClick={() => setShowAddForm(false)}
                variant="outline"
                className="border-gray-600 text-gray-300"
                size="sm"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="p-4 bg-gray-800/50 rounded-lg border border-gray-600/50 hover:border-gray-500/50 transition-colors"
            >
              {editingId === exp.id ? (
                <EditExperienceForm experience={exp} onSave={handleSave} onCancel={() => setEditingId(null)} />
              ) : (
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-white">{exp.position}</h4>
                      <span className="text-gray-400">at</span>
                      <span className="text-blue-400 font-medium">{exp.company}</span>
                      {exp.source && (
                        <Badge
                          className={`text-xs ${
                            exp.source === "linkedin"
                              ? "bg-blue-600/20 text-blue-400 border-blue-500/30"
                              : exp.source === "onedrive"
                                ? "bg-green-600/20 text-green-400 border-green-500/30"
                                : "bg-gray-600/20 text-gray-400 border-gray-500/30"
                          }`}
                        >
                          {exp.source === "linkedin"
                            ? "🔗 LinkedIn"
                            : exp.source === "onedrive"
                              ? "📄 OneDrive"
                              : "✏️ Manual"}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-400 mb-2">
                      {exp.startDate} - {exp.endDate || "Present"}
                    </div>
                    <p className="text-gray-300 text-sm mb-3">{exp.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {exp.technologies.map((tech) => (
                        <Badge key={tech} className="bg-gray-700/50 text-gray-300 border-gray-600/50 text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      onClick={() => setEditingId(exp.id)}
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(exp.id)}
                      variant="outline"
                      size="sm"
                      className="border-red-600 text-red-400 hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {experiences.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No experiences added yet.</p>
            <p className="text-sm">Add your first experience to get started!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function EditExperienceForm({
  experience,
  onSave,
  onCancel,
}: {
  experience: Experience
  onSave: (exp: Experience) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<Experience>({
    ...experience,
    technologies: experience.technologies || [],
  })

  const handleSave = () => {
    onSave({
      ...formData,
      technologies:
        typeof formData.technologies === "string"
          ? formData.technologies
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : formData.technologies || [],
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-company" className="text-gray-300">
            Company
          </Label>
          <Input
            id="edit-company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="bg-gray-700 border-gray-600 text-white"
          />
        </div>
        <div>
          <Label htmlFor="edit-position" className="text-gray-300">
            Position
          </Label>
          <Input
            id="edit-position"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            className="bg-gray-700 border-gray-600 text-white"
          />
        </div>
        <div>
          <Label htmlFor="edit-startDate" className="text-gray-300">
            Start Date
          </Label>
          <Input
            id="edit-startDate"
            type="month"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="bg-gray-700 border-gray-600 text-white"
          />
        </div>
        <div>
          <Label htmlFor="edit-endDate" className="text-gray-300">
            End Date
          </Label>
          <Input
            id="edit-endDate"
            type="month"
            value={formData.endDate || ""}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value || null })}
            className="bg-gray-700 border-gray-600 text-white"
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="edit-description" className="text-gray-300">
            Description
          </Label>
          <Textarea
            id="edit-description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="bg-gray-700 border-gray-600 text-white"
            rows={3}
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="edit-technologies" className="text-gray-300">
            Technologies
          </Label>
          <Input
            id="edit-technologies"
            value={Array.isArray(formData.technologies) ? formData.technologies.join(", ") : formData.technologies}
            onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
            className="bg-gray-700 border-gray-600 text-white"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700" size="sm">
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
        <Button onClick={onCancel} variant="outline" className="border-gray-600 text-gray-300" size="sm">
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  )
}
