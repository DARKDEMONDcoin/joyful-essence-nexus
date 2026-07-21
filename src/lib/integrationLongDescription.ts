import type { Integration } from "@/lib/integrationsData";

const CATEGORY_USES: Record<string, { intro: string; uses: string[] }> = {
  Development: {
    intro: "A powerful development tool for managing code and engineering projects.",
    uses: [
      "Create and push code directly from chat",
      "Track commits, issues, and pull requests",
      "Read repository files for analysis and review",
      "Automate CI/CD workflows and deployments",
    ],
  },
  Productivity: {
    intro: "A productivity tool that streamlines your daily work and documents.",
    uses: [
      "Create and edit documents and notes automatically",
      "Summarize or update existing content on the fly",
      "Organize tasks and projects across your workspace",
      "Keep information in sync between your tools",
    ],
  },
  Communication: {
    intro: "A communication channel that keeps you close to your team and customers.",
    uses: [
      "Send messages and alerts directly to channels",
      "Read and summarize ongoing conversations",
      "Create automated notifications for key events",
      "Reply to customers and manage conversations",
    ],
  },
  Marketing: {
    intro: "A marketing tool for reaching your audience and measuring campaigns.",
    uses: [
      "Create and schedule marketing campaigns",
      "Track ad performance and outcomes",
      "Manage customer lists and audiences",
      "Generate tailored marketing content",
    ],
  },
  Storage: {
    intro: "Cloud storage to save and share your files securely.",
    uses: [
      "Upload and manage files from chat",
      "Read file contents for analysis",
      "Share files with the team automatically",
      "Organize folders and back up data",
    ],
  },
  Notifications: {
    intro: "A notification channel that delivers important updates instantly.",
    uses: [
      "Get alerts the moment tasks complete",
      "Receive security and billing updates",
      "Custom notifications for account activity",
      "Real-time alerts for critical events",
    ],
  },
  Deployment: {
    intro: "A deployment platform for shipping your apps and sites to the internet.",
    uses: [
      "Deploy sites and apps with a single click",
      "Manage development and production environments",
      "Monitor logs and performance after deploy",
      "Attach custom domains and SSL automatically",
    ],
  },
  Analytics: {
    intro: "An analytics tool to understand user data and product performance.",
    uses: [
      "Read and summarize performance reports",
      "Track user behavior in real time",
      "Build custom dashboards",
      "Spot trends and make data-driven decisions",
    ],
  },
  Social: {
    intro: "A social platform for managing your digital presence.",
    uses: [
      "Publish content automatically at the right time",
      "Reply to comments and direct messages",
      "Read engagement and analyze performance",
      "Schedule campaigns and manage content",
    ],
  },
  Design: {
    intro: "A design tool for creating and editing visual content.",
    uses: [
      "Generate designs and images from a prompt",
      "Edit and refine graphic files",
      "Import design assets into your projects",
      "Produce ready-to-use templates",
    ],
  },
  Support: {
    intro: "A support platform to manage customer tickets efficiently.",
    uses: [
      "Reply to customer inquiries automatically",
      "Create and categorize tickets",
      "Track request and issue status",
      "Analyze satisfaction and improve service",
    ],
  },
  Payments: {
    intro: "A payments gateway for managing transactions and subscriptions.",
    uses: [
      "Create payment links and invoices",
      "Monitor transactions and subscriptions",
      "Pull sales reports and revenue data",
      "Automate billing and reminders",
    ],
  },
  Scheduling: {
    intro: "A scheduling tool to organize meetings and appointments automatically.",
    uses: [
      "Book meetings with no conflicts",
      "Send invitations and reminders",
      "Sync multiple calendars in one place",
      "Manage team availability",
    ],
  },
  Automation: {
    intro: "An automation platform to connect apps and run workflows on autopilot.",
    uses: [
      "Build workflows that link multiple apps",
      "Run recurring tasks without manual work",
      "Move data between platforms automatically",
      "Trigger notifications based on events",
    ],
  },
};

export function getLongDescription(integration: Integration): {
  intro: string;
  uses: string[];
} {
  const cat = CATEGORY_USES[integration.category] ?? {
    intro: "An integration that helps you automate everyday tasks.",
    uses: [
      "Secure connection via OAuth",
      "Use the tool directly from chat",
      "Automate repetitive workflows",
      "Get real-time updates",
    ],
  };
  const intro = `${integration.description} ${cat.intro} Once ${integration.name} is connected, Megsy can act on your behalf securely — no need to open the app.`;
  return { intro, uses: cat.uses };
}
