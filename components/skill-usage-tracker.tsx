"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronUp, Code, Briefcase, Calendar } from "lucide-react"
import { useState } from "react"
import type { Skill, Experience } from "@/types/resume"

interface SkillUsage {
  skill: Skill
  usedIn: Array<{
    type: "experience" | "project"
    title: string
    company?: string
    description: string
    date: string
    technologies: string[]
  }>
}

interface SkillUsageTrackerProps {
  skills: Skill[]
  experiences: Experience[]
  projects: any[]
}

export function SkillUsageTracker({ skills, experiences, projects }: SkillUsageTrackerProps) {
  const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set())

  const toggleSkill = (skillId: string) => {
    const newExpanded = new Set(expandedSkills)
    if (newExpanded.has(skillId)) {
      newExpanded.delete(skillId)
    } else {
      newExpanded.add(skillId)
    }
    setExpandedSkills(newExpanded)
  }

  // Create skill usage mapping
  const skillUsageMap: SkillUsage[] = skills.map((skill) => {
    const usedIn: SkillUsage["usedIn"] = []

    // Check experiences
    experiences.forEach((exp) => {
      if (
        exp.technologies.some(
          (tech) =>
            tech.toLowerCase().includes(skill.name.toLowerCase()) ||
            skill.name.toLowerCase().includes(tech.toLowerCase()),
        )
      ) {
        usedIn.push({
          type: "experience",
          title: exp.position,
          company: exp.company,
          description: exp.description,
          date: exp.startDate,
          technologies: exp.technologies,
        })
      }
    })

    // Check projects
    projects.forEach((project) => {
      if (
        project.language?.toLowerCase().includes(skill.name.toLowerCase()) ||
        project.topics?.some(
          (topic: string) =>
            topic.toLowerCase().includes(skill.name.toLowerCase()) ||
            skill.name.toLowerCase().includes(topic.toLowerCase()),
        )
      ) {
        usedIn.push({
          type: "project",
          title: project.name,
          description: project.description || "GitHub project showcasing practical implementation",
          date: project.updated_at,
          technologies: [project.language, ...project.topics].filter(Boolean),
        })
      }
    })

    return { skill, usedIn }
  })

  // Group by category
  const skillsByCategory = skillUsageMap.reduce(
    (acc, { skill, usedIn }) => {
      if (!acc[skill.category]) acc[skill.category] = []
      acc[skill.category].push({ skill, usedIn })
      return acc
    },
    {} as Record<string, SkillUsage[]>,
  )

  return (
    <div className="space-y-8">
      {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
        <Card
          key={category}
          className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-sm border border-white/10 rounded-2xl"
        >
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-white text-center">{category}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categorySkills.map(({ skill, usedIn }) => (
              <div key={skill.id} className="border border-gray-700/50 rounded-lg overflow-hidden">
                <div
                  className="p-4 bg-gray-800/30 cursor-pointer hover:bg-gray-800/50 transition-colors"
                  onClick={() => toggleSkill(skill.id)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-white text-lg">{skill.name}</h4>
                      <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/30">
                        Used in {usedIn.length} {usedIn.length === 1 ? "project" : "projects"}
                      </Badge>
                      {skill.source && (
                        <Badge
                          className={`text-xs ${
                            skill.source === "linkedin"
                              ? "bg-blue-600/20 text-blue-400 border-blue-500/30"
                              : skill.source === "onedrive"
                                ? "bg-green-600/20 text-green-400 border-green-500/30"
                                : "bg-gray-600/20 text-gray-400 border-gray-500/30"
                          }`}
                        >
                          {skill.source === "linkedin" ? "🔗" : skill.source === "onedrive" ? "📄" : "✏️"}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">
                        {usedIn.length > 0 ? "Click to see usage" : "No usage tracked yet"}
                      </span>
                      {usedIn.length > 0 &&
                        (expandedSkills.has(skill.id) ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        ))}
                    </div>
                  </div>
                </div>

                {expandedSkills.has(skill.id) && usedIn.length > 0 && (
                  <div className="p-4 bg-gray-900/30 border-t border-gray-700/50">
                    <div className="space-y-4">
                      {usedIn.map((usage, index) => (
                        <div key={index} className="flex gap-4 p-3 bg-gray-800/30 rounded-lg">
                          <div className="flex-shrink-0 mt-1">
                            {usage.type === "experience" ? (
                              <Briefcase className="w-5 h-5 text-purple-400" />
                            ) : (
                              <Code className="w-5 h-5 text-green-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h5 className="font-medium text-white">{usage.title}</h5>
                              {usage.company && (
                                <>
                                  <span className="text-gray-400">at</span>
                                  <span className="text-blue-400">{usage.company}</span>
                                </>
                              )}
                              <Badge
                                className={`text-xs ${
                                  usage.type === "experience"
                                    ? "bg-purple-600/20 text-purple-400 border-purple-500/30"
                                    : "bg-green-600/20 text-green-400 border-green-500/30"
                                }`}
                              >
                                {usage.type === "experience" ? "Work Experience" : "Project"}
                              </Badge>
                            </div>
                            <p className="text-gray-300 text-sm mb-3 leading-relaxed">{usage.description}</p>
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-500 text-xs">{new Date(usage.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {usage.technologies.map((tech) => (
                                <Badge
                                  key={tech}
                                  className={`text-xs ${
                                    tech.toLowerCase().includes(skill.name.toLowerCase()) ||
                                    skill.name.toLowerCase().includes(tech.toLowerCase())
                                      ? "bg-yellow-600/20 text-yellow-400 border-yellow-500/30"
                                      : "bg-gray-700/50 text-gray-400 border-gray-600/50"
                                  }`}
                                >
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
