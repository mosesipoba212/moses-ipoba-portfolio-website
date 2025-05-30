import type { Experience, Skill } from "@/types/resume"

interface ParsedDocument {
  personalInfo: {
    name: string
    email: string
    phone: string
    title: string
    summary: string
    location?: string
  }
  experience: Experience[]
  skills: Skill[]
  education: Array<{
    id: string
    institution: string
    degree: string
    field: string
    startDate: string
    endDate: string | null
    description?: string
  }>
  certifications: Array<{
    id: string
    name: string
    issuer: string
    date: string
    expiryDate?: string | null
    credentialId?: string
  }>
}

export class DocumentParser {
  // For now, we'll use a text-based parser
  // In production, you'd want to use mammoth.js for proper Word document parsing
  parseWordDocument(buffer: ArrayBuffer): ParsedDocument {
    // Convert ArrayBuffer to text (this is a simplified approach)
    // In reality, you'd use mammoth.js or similar library
    const text = this.extractTextFromBuffer(buffer)
    return this.parseText(text)
  }

  private extractTextFromBuffer(buffer: ArrayBuffer): string {
    // This is a placeholder - in production use mammoth.js
    // For now, return mock text that represents a typical resume structure
    return `
MOSES IPOBA
Full Stack Developer
Email: mosesipoba212@gmail.com
Phone: 07535287863
Location: London, UK

SUMMARY
Passionate full-stack developer with 5+ years of experience building modern web applications. 
Expertise in React, Node.js, and cloud technologies. Strong focus on user experience and performance optimization.

EXPERIENCE

Senior Full Stack Developer - TechCorp Ltd
January 2022 - Present
• Led development of customer-facing web applications using React and Next.js
• Implemented microservices architecture with Node.js and Docker
• Mentored junior developers and established coding standards
• Technologies: React, Next.js, TypeScript, Node.js, PostgreSQL, AWS

Frontend Developer - StartupXYZ
June 2020 - December 2021
• Built responsive web applications with modern JavaScript frameworks
• Collaborated with design team to implement pixel-perfect interfaces
• Optimized application performance and improved Core Web Vitals
• Technologies: React, JavaScript, CSS, Redux, Firebase

Junior Developer - WebSolutions Inc
March 2019 - May 2020
• Developed and maintained client websites using various technologies
• Participated in code reviews and agile development processes
• Learned best practices for web development and version control
• Technologies: HTML, CSS, JavaScript, PHP, MySQL

SKILLS
Frontend: React, Next.js, TypeScript, JavaScript, HTML5, CSS3, Tailwind CSS
Backend: Node.js, Express.js, Python, PHP
Databases: PostgreSQL, MongoDB, MySQL, Redis
Cloud & DevOps: AWS, Docker, Kubernetes, CI/CD, Git
Tools: VS Code, Figma, Postman, Jest

EDUCATION
Bachelor of Science in Computer Science
University of Technology
September 2015 - June 2019
Graduated with First Class Honours

CERTIFICATIONS
AWS Certified Solutions Architect
Amazon Web Services
Issued: March 2023
Credential ID: AWS-SAA-123456

React Developer Certification
Meta (Facebook)
Issued: January 2022
Credential ID: META-REACT-789012
    `
  }

  private parseText(text: string): ParsedDocument {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)

    const sections = this.identifySections(lines)

    return {
      personalInfo: this.parsePersonalInfo(sections.personal || []),
      experience: this.parseExperience(sections.experience || []),
      skills: this.parseSkills(sections.skills || []),
      education: this.parseEducation(sections.education || []),
      certifications: this.parseCertifications(sections.certifications || []),
    }
  }

  private identifySections(lines: string[]): Record<string, string[]> {
    const sections: Record<string, string[]> = {}
    let currentSection = "personal"

    for (const line of lines) {
      const lowerLine = line.toLowerCase()

      // Detect section headers
      if (lowerLine.includes("summary") || lowerLine.includes("about")) {
        currentSection = "summary"
      } else if (lowerLine.includes("experience") || lowerLine.includes("work history")) {
        currentSection = "experience"
      } else if (lowerLine.includes("skills") || lowerLine.includes("technical")) {
        currentSection = "skills"
      } else if (lowerLine.includes("education")) {
        currentSection = "education"
      } else if (lowerLine.includes("certification")) {
        currentSection = "certifications"
      } else {
        // Add content to current section
        if (!sections[currentSection]) {
          sections[currentSection] = []
        }
        sections[currentSection].push(line)
      }
    }

    return sections
  }

  private parsePersonalInfo(lines: string[]): ParsedDocument["personalInfo"] {
    const info = {
      name: "Moses Ipoba",
      email: "mosesipoba212@gmail.com",
      phone: "07535287863",
      title: "Full Stack Developer",
      summary: "",
      location: "",
    }

    for (const line of lines) {
      // Extract email
      const emailMatch = line.match(/[\w.-]+@[\w.-]+\.\w+/)
      if (emailMatch) {
        info.email = emailMatch[0]
        continue
      }

      // Extract phone
      const phoneMatch = line.match(/[\d\s\-+$$$$]{8,}/)
      if (phoneMatch) {
        info.phone = phoneMatch[0].trim()
        continue
      }

      // Extract location
      if (line.toLowerCase().includes("location:") || line.toLowerCase().includes("address:")) {
        info.location = line.replace(/location:|address:/i, "").trim()
        continue
      }

      // Extract title (usually second line after name)
      if (line.length > 5 && line.length < 50 && !line.includes("@") && !line.match(/\d/)) {
        if (line.toLowerCase().includes("developer") || line.toLowerCase().includes("engineer")) {
          info.title = line
        }
      }
    }

    return info
  }

  private parseExperience(lines: string[]): Experience[] {
    const experiences: Experience[] = []
    let currentExp: Partial<Experience> = {}

    for (const line of lines) {
      // Look for job title and company pattern
      if (line.includes(" - ") && !line.includes("•") && !line.includes("Technologies:")) {
        // Save previous experience
        if (currentExp.company && currentExp.position) {
          experiences.push(this.completeExperience(currentExp))
        }

        const [position, company] = line.split(" - ")
        currentExp = {
          id: `doc-exp-${Date.now()}-${Math.random()}`,
          position: position.trim(),
          company: company.trim(),
          technologies: [],
          isVisible: true,
          description: "",
        }
      }
      // Look for date ranges
      else if (line.match(/\d{4}/) && (line.includes("-") || line.includes("Present"))) {
        const dateMatch = line.match(/(\w+\s+\d{4})\s*-\s*(\w+\s+\d{4}|Present)/i)
        if (dateMatch && currentExp.position) {
          currentExp.startDate = this.parseDate(dateMatch[1])
          currentExp.endDate = dateMatch[2].toLowerCase() === "present" ? null : this.parseDate(dateMatch[2])
        }
      }
      // Look for bullet points (description)
      else if (line.startsWith("•") || line.startsWith("-")) {
        if (currentExp.position) {
          const description = line.replace(/^[•-]\s*/, "")
          currentExp.description = currentExp.description
            ? `${currentExp.description}\n• ${description}`
            : `• ${description}`
        }
      }
      // Look for technologies
      else if (line.toLowerCase().includes("technologies:")) {
        const techString = line.replace(/technologies:/i, "").trim()
        currentExp.technologies = this.parseTechnologies(techString)
      }
    }

    // Don't forget the last experience
    if (currentExp.company && currentExp.position) {
      experiences.push(this.completeExperience(currentExp))
    }

    return experiences
  }

  private parseSkills(lines: string[]): Skill[] {
    const skills: Skill[] = []

    for (const line of lines) {
      // Look for category: skills pattern
      const categoryMatch = line.match(/^([^:]+):\s*(.+)$/)
      if (categoryMatch) {
        const [, category, skillsText] = categoryMatch
        const skillNames = this.parseTechnologies(skillsText)

        for (const skillName of skillNames) {
          skills.push({
            id: `doc-skill-${Date.now()}-${Math.random()}`,
            name: skillName,
            category: this.normalizeCategory(category),
            level: this.estimateSkillLevel(skillName),
            isVisible: true,
          })
        }
      }
    }

    return skills
  }

  private parseEducation(lines: string[]): ParsedDocument["education"] {
    const education: ParsedDocument["education"] = []
    let currentEdu: any = {}

    for (const line of lines) {
      // Look for degree patterns
      if (line.match(/bachelor|master|phd|diploma|certificate/i)) {
        if (currentEdu.degree) {
          education.push(currentEdu)
        }
        currentEdu = {
          id: `doc-edu-${Date.now()}-${Math.random()}`,
          degree: line,
          institution: "",
          field: "",
          startDate: "",
          endDate: null,
        }
      }
      // Look for institution names
      else if (line.match(/university|college|institute|school/i) && currentEdu.degree) {
        currentEdu.institution = line
      }
      // Look for dates
      else if (line.match(/\d{4}/) && currentEdu.degree) {
        const dateMatch = line.match(/(\d{4})\s*-\s*(\d{4})/)
        if (dateMatch) {
          currentEdu.startDate = `${dateMatch[1]}-09`
          currentEdu.endDate = `${dateMatch[2]}-06`
        }
      }
    }

    if (currentEdu.degree) {
      education.push(currentEdu)
    }

    return education
  }

  private parseCertifications(lines: string[]): ParsedDocument["certifications"] {
    const certifications: ParsedDocument["certifications"] = []
    let currentCert: any = {}

    for (const line of lines) {
      // Look for certification names
      if (line.match(/certified|certification/i) && !line.toLowerCase().includes("issued")) {
        if (currentCert.name) {
          certifications.push(currentCert)
        }
        currentCert = {
          id: `doc-cert-${Date.now()}-${Math.random()}`,
          name: line,
          issuer: "",
          date: "",
        }
      }
      // Look for issuers
      else if (currentCert.name && !currentCert.issuer && !line.toLowerCase().includes("issued")) {
        currentCert.issuer = line
      }
      // Look for issue dates
      else if (line.toLowerCase().includes("issued:") && currentCert.name) {
        const dateText = line.replace(/issued:/i, "").trim()
        currentCert.date = this.parseDate(dateText)
      }
      // Look for credential IDs
      else if (line.toLowerCase().includes("credential") && currentCert.name) {
        currentCert.credentialId = line.replace(/credential\s*id:/i, "").trim()
      }
    }

    if (currentCert.name) {
      certifications.push(currentCert)
    }

    return certifications
  }

  private completeExperience(exp: Partial<Experience>): Experience {
    return {
      id: exp.id || `doc-exp-${Date.now()}-${Math.random()}`,
      company: exp.company || "",
      position: exp.position || "",
      startDate: exp.startDate || "",
      endDate: exp.endDate || null,
      description: exp.description || "",
      technologies: exp.technologies || [],
      isVisible: true,
    }
  }

  private parseTechnologies(text: string): string[] {
    return text
      .split(/[,;]/)
      .map((tech) => tech.trim())
      .filter((tech) => tech.length > 0 && tech.length < 30)
  }

  private parseDate(dateText: string): string {
    // Convert various date formats to YYYY-MM
    const monthMap: Record<string, string> = {
      january: "01",
      february: "02",
      march: "03",
      april: "04",
      may: "05",
      june: "06",
      july: "07",
      august: "08",
      september: "09",
      october: "10",
      november: "11",
      december: "12",
      jan: "01",
      feb: "02",
      mar: "03",
      apr: "04",
      jun: "06",
      jul: "07",
      aug: "08",
      sep: "09",
      oct: "10",
      nov: "11",
      dec: "12",
    }

    const yearMatch = dateText.match(/\d{4}/)
    if (!yearMatch) return ""

    const year = yearMatch[0]

    for (const [month, num] of Object.entries(monthMap)) {
      if (dateText.toLowerCase().includes(month)) {
        return `${year}-${num}`
      }
    }

    return `${year}-01` // Default to January if no month found
  }

  private normalizeCategory(category: string): string {
    const cat = category.toLowerCase()
    if (cat.includes("frontend") || cat.includes("front-end")) return "Frontend"
    if (cat.includes("backend") || cat.includes("back-end")) return "Backend"
    if (cat.includes("database")) return "Database"
    if (cat.includes("cloud") || cat.includes("devops")) return "DevOps"
    if (cat.includes("language")) return "Language"
    if (cat.includes("tool")) return "Tools"
    return "Other"
  }

  private estimateSkillLevel(skillName: string): number {
    // Simple heuristic - in reality you might want more sophisticated logic
    const skill = skillName.toLowerCase()
    if (skill.includes("react") || skill.includes("javascript") || skill.includes("typescript")) return 9
    if (skill.includes("node") || skill.includes("python")) return 8
    if (skill.includes("aws") || skill.includes("docker")) return 7
    return 6 // Default level
  }
}

export const documentParser = new DocumentParser()
