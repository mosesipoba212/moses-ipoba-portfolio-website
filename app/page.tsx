import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { fetchGitHubRepos, fetchGitHubUser } from "@/lib/github"
import { getExperienceWithAllSources, getSkillsWithAllSources, getLinkedInProfile } from "@/lib/actions"
import { SkillUsageTracker } from "@/components/skill-usage-tracker"
import { Github, Mail, MapPin, Phone, Star, ArrowRight, Linkedin } from "lucide-react"
import Link from "next/link"

export default async function ResumePage() {
  const [githubUser, githubRepos, experience, skills, linkedInProfile] = await Promise.all([
    fetchGitHubUser(),
    fetchGitHubRepos(),
    getExperienceWithAllSources(),
    getSkillsWithAllSources(),
    getLinkedInProfile(),
  ])

  const visibleExperience = experience.filter((exp) => exp.isVisible)
  const visibleSkills = skills.filter((skill) => skill.isVisible)

  // Use LinkedIn profile data if available, fallback to GitHub
  const profileData = {
    name: linkedInProfile
      ? `${linkedInProfile.firstName} ${linkedInProfile.lastName}`
      : githubUser?.name || "Moses Ipoba",
    title: linkedInProfile?.headline || "Software Engineer | Cyber Security Analyst",
    bio:
      linkedInProfile?.summary ||
      githubUser?.bio ||
      "Passionate software engineer and cybersecurity analyst with expertise in modern web technologies.",
    location: linkedInProfile?.location || githubUser?.location || "London, England, United Kingdom",
    avatar: githubUser?.avatar_url || linkedInProfile?.profilePicture,
    linkedinUrl: linkedInProfile?.publicProfileUrl || "https://www.linkedin.com/in/moses-ipoba-b252a7337/",
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-black"></div>
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <div className="mb-8 animate-fade-in">
            {profileData.avatar && (
              <div className="relative inline-block">
                <img
                  src={profileData.avatar || "/placeholder.svg"}
                  alt="Profile"
                  className="w-40 h-40 rounded-full border-4 border-white/20 shadow-2xl backdrop-blur-sm mx-auto mb-8 hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20 animate-pulse"></div>
              </div>
            )}
          </div>

          <h1 className="text-7xl md:text-8xl font-thin tracking-tight mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent animate-slide-up">
            {profileData.name}
          </h1>

          <p className="text-2xl md:text-3xl font-light text-gray-300 mb-8 animate-slide-up-delay">
            {profileData.title}
          </p>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-delay">
            {profileData.bio}
          </p>

          <div className="flex flex-wrap justify-center gap-6 text-gray-400 mb-12 animate-fade-in-delay-2">
            <div className="flex items-center gap-2 hover:text-white transition-colors">
              <Mail className="w-5 h-5" />
              mosesipoba212@gmail.com
            </div>
            <div className="flex items-center gap-2 hover:text-white transition-colors">
              <Phone className="w-5 h-5" />
              07535287863
            </div>
            <div className="flex items-center gap-2 hover:text-white transition-colors">
              <MapPin className="w-5 h-5" />
              {profileData.location}
            </div>
            {linkedInProfile && (
              <a
                href={profileData.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-blue-400 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
                LinkedIn
              </a>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up-delay-3">
            <Button
              size="lg"
              asChild
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-8 py-4 rounded-full text-lg font-medium transition-all duration-300 hover:scale-105"
            >
              <Link href="#experience">
                <ArrowRight className="w-5 h-5 mr-2" />
                View Experience
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="py-32 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-thin mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Experience
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">Building the future, one line of code at a time</p>
          </div>

          <div className="space-y-12">
            {visibleExperience.map((exp, index) => (
              <div
                key={exp.id}
                className="group relative bg-gradient-to-r from-gray-900/50 to-gray-800/30 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
                        {exp.position}
                      </h3>
                      <p className="text-xl text-blue-400 font-medium">{exp.company}</p>
                      {exp.source && (
                        <div className="mt-2">
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
                        </div>
                      )}
                    </div>
                    <div className="text-gray-400 font-mono text-sm lg:text-right mt-4 lg:mt-0">
                      <div className="bg-gray-800/50 px-4 py-2 rounded-full border border-gray-700">
                        {exp.startDate} - {exp.endDate || "Present"}
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-300 text-lg leading-relaxed mb-6">{exp.description}</p>

                  <div className="flex flex-wrap gap-3">
                    {exp.technologies.map((tech) => (
                      <Badge
                        key={tech}
                        className="bg-gray-800/50 text-gray-300 border-gray-700 hover:bg-gray-700/50 hover:text-white transition-all duration-300 px-4 py-2 text-sm font-medium"
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
      </section>

      {/* Projects Section */}
      <section className="py-32 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-thin mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Projects
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Latest repositories from GitHub, updated automatically
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {githubRepos.slice(0, 6).map((repo, index) => (
              <div
                key={repo.id}
                className="group relative bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-blue-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-white group-hover:text-purple-300 transition-colors">
                      {repo.name}
                    </h3>
                    <div className="flex items-center gap-1 text-gray-400">
                      <Star className="w-4 h-4" />
                      <span className="text-sm">{repo.stargazers_count}</span>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                    {repo.description || "No description available"}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {repo.language && (
                      <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/30">{repo.language}</Badge>
                    )}
                    {repo.topics.slice(0, 2).map((topic) => (
                      <Badge key={topic} className="bg-gray-800/50 text-gray-400 border-gray-600/50">
                        {topic}
                      </Badge>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="w-full border-white/20 text-white hover:bg-white/10 transition-all duration-300 group-hover:border-purple-400/50 group-hover:text-purple-300"
                  >
                    <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                      <Github className="w-4 h-4 mr-2" />
                      View Code
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Section - Now with Usage Tracking */}
      <section className="py-32 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-thin mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Skills & Experience
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              See how each skill has been applied in real projects and work experience
            </p>
          </div>

          <SkillUsageTracker skills={visibleSkills} experiences={visibleExperience} projects={githubRepos} />
        </div>
      </section>

      {/* GitHub Stats */}
      {githubUser && (
        <section className="py-32 bg-gradient-to-b from-gray-900 to-black">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-6xl font-thin mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                GitHub Stats
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-blue-400/30 transition-all duration-500 hover:scale-105">
                <div className="text-4xl font-thin text-blue-400 mb-2">{githubUser.public_repos}</div>
                <div className="text-gray-400">Repositories</div>
              </div>
              <div className="text-center bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-purple-400/30 transition-all duration-500 hover:scale-105">
                <div className="text-4xl font-thin text-purple-400 mb-2">{githubUser.followers}</div>
                <div className="text-gray-400">Followers</div>
              </div>
              <div className="text-center bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-green-400/30 transition-all duration-500 hover:scale-105">
                <div className="text-4xl font-thin text-green-400 mb-2">{githubUser.following}</div>
                <div className="text-gray-400">Following</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-t from-black to-gray-900">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-5xl md:text-6xl font-thin mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Let's Build Something Amazing
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Ready to bring your ideas to life? Let's collaborate and create something extraordinary.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              size="lg"
              asChild
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 rounded-full text-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
            >
              <a href={profileData.linkedinUrl} target="_blank" rel="noopener noreferrer">
                <Linkedin className="w-5 h-5 mr-2" />
                Get In Touch
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="border-white/20 text-white hover:bg-white/10 px-12 py-4 rounded-full text-lg font-medium transition-all duration-300 hover:scale-105"
            >
              <Link href="/admin">Admin Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 bg-black">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-500 text-sm">
            Last updated: {new Date().toLocaleDateString()} • Automatically synced from GitHub, LinkedIn, and OneDrive
          </p>
        </div>
      </footer>
    </div>
  )
}
