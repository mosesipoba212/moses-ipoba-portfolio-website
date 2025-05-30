import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Circle, FileText, LinkIcon } from "lucide-react"

export function OneDriveSetupGuide() {
  const hasCredentials = !!(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET)
  const hasDocumentId = !!process.env.ONEDRIVE_DOCUMENT_ID

  const steps = [
    {
      title: "Create Azure App Registration",
      description: "Register your app in Azure Portal to get client credentials",
      completed: hasCredentials,
      icon: <LinkIcon className="w-5 h-5" />,
    },
    {
      title: "Configure API Permissions",
      description: "Add Files.Read.All and Sites.Read.All permissions",
      completed: hasCredentials,
      icon: <CheckCircle className="w-5 h-5" />,
    },
    {
      title: "Get Document ID",
      description: "Extract the document ID from your OneDrive sharing URL",
      completed: hasDocumentId,
      icon: <FileText className="w-5 h-5" />,
    },
    {
      title: "Set Environment Variables",
      description: "Configure MICROSOFT_CLIENT_ID, CLIENT_SECRET, TENANT_ID, and ONEDRIVE_DOCUMENT_ID",
      completed: hasCredentials && hasDocumentId,
      icon: <CheckCircle className="w-5 h-5" />,
    },
  ]

  return (
    <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-sm border border-white/10 rounded-2xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-400" />
          OneDrive Integration Setup
        </CardTitle>
        <CardDescription className="text-gray-400">
          Connect your Word document for automatic resume updates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className={`mt-0.5 ${step.completed ? "text-green-400" : "text-gray-500"}`}>
                {step.completed ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-white">{step.title}</h4>
                  {step.completed && <Badge className="bg-green-600/20 text-green-400 border-green-500/30">Done</Badge>}
                </div>
                <p className="text-sm text-gray-400">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-500/20">
          <h4 className="font-medium text-blue-300 mb-3">Document Structure Tips</h4>
          <div className="text-sm text-blue-200 space-y-2">
            <div>• Use clear section headers: "Experience", "Skills", "Education"</div>
            <div>• Format experience as: "Position - Company"</div>
            <div>• Include date ranges in YYYY format</div>
            <div>• List skills separated by commas</div>
            <div>• Keep descriptions concise and professional</div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-green-900/20 rounded-lg border border-green-500/20">
          <h4 className="font-medium text-green-300 mb-2">Your Document</h4>
          <p className="text-sm text-green-200">
            Connected to: <span className="font-mono">Moses Ipoba Resume.docx</span>
          </p>
          <p className="text-xs text-green-300 mt-1">
            Changes to this document will automatically update your resume within 5 minutes.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
