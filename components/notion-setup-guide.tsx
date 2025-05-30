import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Circle } from "lucide-react"

export function NotionSetupGuide() {
  const steps = [
    {
      title: "Create a Notion Integration",
      description: "Go to notion.so/my-integrations and create a new integration",
      completed: !!process.env.NOTION_TOKEN,
    },
    {
      title: "Get Integration Token",
      description: "Copy the Internal Integration Token from your integration settings",
      completed: !!process.env.NOTION_TOKEN,
    },
    {
      title: "Create Experience Database",
      description:
        "Create a database with columns: Company, Position, Start Date, End Date, Description, Technologies, Status, Visible",
      completed: false,
    },
    {
      title: "Share Database with Integration",
      description: "Click 'Share' on your database and invite your integration",
      completed: false,
    },
    {
      title: "Get Database ID",
      description: "Copy the database ID from the URL and add it to environment variables",
      completed: !!process.env.NOTION_DATABASE_ID,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notion Setup Guide</CardTitle>
        <CardDescription>Follow these steps to connect your Notion workspace</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start gap-3">
              {step.completed ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <Circle className="w-5 h-5 text-gray-400 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{step.title}</h4>
                  {step.completed && (
                    <Badge variant="outline" className="text-green-600">
                      Done
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Required Database Schema</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <div>
              <strong>Company:</strong> Title
            </div>
            <div>
              <strong>Position:</strong> Rich Text
            </div>
            <div>
              <strong>Start Date:</strong> Date
            </div>
            <div>
              <strong>End Date:</strong> Date (optional)
            </div>
            <div>
              <strong>Description:</strong> Rich Text
            </div>
            <div>
              <strong>Technologies:</strong> Multi-select
            </div>
            <div>
              <strong>Status:</strong> Select (Published, Draft)
            </div>
            <div>
              <strong>Visible:</strong> Checkbox
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
