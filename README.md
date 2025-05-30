# Self-Updating Resume Website

## Overview

This project is a dynamic, self-updating resume website that automatically syncs with various data sources to keep your professional information current without manual updates. The website pulls data from GitHub, LinkedIn, and Microsoft OneDrive to create a comprehensive view of your professional experience, projects, and skills.

## Key Features

- **🔄 Auto-Syncing Data**: Automatically pulls your latest information from:
  - GitHub (repositories, contributions, activity)
  - LinkedIn (work experience, education, skills)
  - OneDrive (documents and files)

- **🔒 Secure Admin Dashboard**: Password-protected admin area for managing integrations and triggering manual syncs

- **📊 GitHub Stats**: Visual representation of your GitHub activity and contributions

- **💼 Experience Timeline**: Chronological display of your work and education history

- **🛠️ Skills Showcase**: Dynamic display of your technical and professional skills

- **🔍 SEO Optimized**: Server-side rendered content for better search engine visibility

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Authentication**: Custom JWT-based auth system
- **Deployment**: Vercel
- **Data Sources**: GitHub API, LinkedIn API, Microsoft Graph API

## Setup and Configuration

### Prerequisites

- Node.js 18+ and npm/pnpm
- GitHub account
- LinkedIn account
- Microsoft account (for OneDrive)

### Environment Variables

The following environment variables are required:

\`\`\`env
# Admin Authentication
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password

# GitHub Integration
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_USERNAME=your_github_username

# Microsoft/OneDrive Integration
MICROSOFT_CLIENT_ID=your_microsoft_app_client_id
MICROSOFT_TENANT_ID=your_microsoft_tenant_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
ONEDRIVE_DOCUMENT_ID=your_onedrive_document_id

# LinkedIn Integration
LINKEDIN_CLIENT_ID=your_linkedin_app_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_app_client_secret
LINKEDIN_ACCESS_TOKEN=your_linkedin_access_token
\`\`\`

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/self-updating-resume.git
   cd self-updating-resume
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   # or
   pnpm install
   \`\`\`

3. Run the development server:
   \`\`\`bash
   npm run dev
   # or
   pnpm dev
   \`\`\`

4. Open [http://localhost:3000](http://localhost:3000) to view the site

## Admin Dashboard

The admin dashboard is accessible at `/admin` and protected by username/password authentication. From here, you can:

- View integration status
- Manually trigger data syncs
- Configure integration settings
- View sync logs and errors

## Data Sources and Integration

### GitHub Integration

- Displays your latest repositories
- Shows contribution statistics
- Updates automatically with your GitHub activity

### LinkedIn Integration

- Pulls your work experience
- Imports education history
- Syncs professional skills

### OneDrive Integration

- Syncs documents and files
- Supports webhook notifications for real-time updates

## Deployment

This project is optimized for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Configure the environment variables
3. Deploy

## Customization

You can customize the website by:

- Editing the theme in `tailwind.config.js`
- Modifying the layout in `app/layout.tsx`
- Updating the content sections in `app/page.tsx`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Next.js team for the amazing framework
- Vercel for the hosting platform
- All the open-source libraries used in this project
