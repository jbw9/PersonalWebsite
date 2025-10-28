export interface Guide {
  id: string;
  title: string;
  description: string;
  category: string;
  publishDate: string;
  content: string;
}

export const guides = [
  {
    id: "mcp-overview-guide",
    title: "Understanding Model Context Protocol (MCP)",
    description:
      "A short guide to understanding MCP, its benefits, architecture, and implementation",
    category: "AI/ML",
    publishDate: "June 2025",
    content: `# Model Context Protocol (MCP) - Complete Overview

## What is MCP?

Model Context Protocol (MCP) is a standardized communication protocol that enables AI applications to securely connect with external data sources and tools. We can think of MCP as a USB-C port for AI applications. It provides a unified interface for AI models to interact with various services without requiring custom integration for each tool.

## Why MCP?

Let's say I'm starting a phone company and my company creates its own charger called ABC. All devices from my company use ABC. If each company in the industry also creates its own charger, it'll be hard for third parties to create an accessory that works with all devices. It will be difficult for devices to interact since each company has its own charger.

In today's world we have USB-C which is an industry standard, allowing companies to make USB-C accessories, making it compatible with almost all modern devices. In this case USB-C is basically a MCP since it's compatible with most devices and companies won't need to modify their devices to make it compatible with other companies' devices.

## Benefits of Using MCP

### Standardization and Interoperability

Without MCP, each AI application would need custom integration for every service it needs which is highly inefficient. This also creates an NxM problem where N tools need M different integration for each AI platform. MCP solves this problem by providing a single standard protocol.

**Without MCP:**
![Fragmented AI Development](/withoutmcp.png)

**With MCP:**
![Standardized AI Development](/withmcp.png)

### Key Technical Benefits

• **Model Agnostic**: Works with any LLM that supports MCP
• **Reusable Servers**: Developers will only need to write a MCP server once, but can use it across multiple AI applications
• **Type Safety**: JSON Schema validation ensures data integrity
• **Natural Language Interface**: The AI can interact with MCP tools using natural language

## Core Architecture

### Client Server Model

MCP Protocol follows a Client-Server architecture where:

• **MCP Host**: The AI application like Claude Desktop that needs access to external capabilities
• **MCP Server**: A lightweight program that exposes specific capabilities through MCP
• **MCP Client**: Maintains 1:1 connections with servers, inside the host application

![Client Server Architecture](/client-server-architecture.png)

## How Does MCP Work?

MCP operates through a bidirectional communication protocol where clients invoke tools, query resources, and interpolate prompt templates:

![Client Server Interaction](/client-server-interaction.png)

### Flow:

1. Client requests available tools/resources/prompts
2. Client calls specific tools with parameters
3. Server returns structured data
4. Error handling standardizes error response for failed operations

## MCP Primitives

MCP has 3 core primitives that the MCP servers can expose:

![Primitives Descriptions](/primitives.png)

### Tools

Function calls that can be invoked by the client

• Executes specific actions such as API calls, database operations, and file modifications
• Accepts structured parameters with JSON Schema validation
• Return structured results that can be processed by the AI

\`\`\`python
@mcp.tool()
def get_user_detail(user_id: int) -> dict:
    return call_api("userDetail", user_id)
\`\`\`

### Resources

Read only data sources that can be queried

• Exposes structured data such as files, database records, and API response
• Support URI based addressing for specific resources
• Enable bulk data access without function calls

\`\`\`python
@mcp.resource("user://profile/{user_id}")
def get_user_profile(user_id: str) -> str:
    return json.dumps(fetch_user_data(user_id))
\`\`\`

### Prompt Templates

Pre defined templates for AI interactions

• Standardize common interaction patterns
• Include placeholders for dynamic content
• Reduce prompt engineering required

\`\`\`python
@mcp.prompt_template()
def customer_support_template(user_query: str, user_data: dict) -> str:
    return f"""
Customer Query: {user_query}
User Data: {json.dumps(user_data, indent=2)}
Provide a helpful, professional response based on this information.
"""
\`\`\`

## Getting Started with MCP

To start implementing MCP in your projects:

1. **Choose your primitive type** based on your use case:
   - Use **Tools** for actions and function calls
   - Use **Resources** for read-only data access
   - Use **Prompt Templates** for standardized AI interactions

2. **Set up the MCP server** to expose your capabilities

3. **Configure the MCP client** in your AI application

4. **Test the integration** using the MCP Inspector tool

## Commonly Asked Questions

### Who authors the MCP Server?

Anyone! Often the service provider itself will make their own MCP implementation. You can make a MCP server to wrap up access to some service.

### How is using an MCP Server different from just calling a service's API directly?

MCP Servers provide tool schemas + functions. If you want to directly call an API directly, you'll be authoring those on your own.

### Sounds like MCP Servers and tool use are the same thing.

MCP Servers provide tool schemas + functions already defined for you.

## Conclusion

MCP represents a significant step forward in AI tooling standardization, much like how USB-C revolutionized device connectivity. By providing a unified protocol for AI applications to interact with external services, MCP eliminates the need for custom integrations and enables a more efficient, scalable ecosystem for AI development.`,
  },
  {
    id: "new-react-app",
    title: "Creating a new react app with TailwindCSS & Vite",
    description:
      "A simple guide to create a new react app with Typescript, TailwindCSS, and Vite",
    category: "React",
    publishDate: "June 2024",
    content: `# Creating a New React App with TailwindCSS & Vite

This guide will walk you through setting up a modern React application using Vite as the build tool and TailwindCSS for styling, with TypeScript support.

## Making a New React App with Vite

First, create a new React application with TypeScript template using Vite:

\`\`\`bash
npm create vite@latest . -- --template react-ts
\`\`\`

This command will scaffold a new React project with TypeScript configuration in your current directory.

## Adding Tailwind CSS

Install TailwindCSS and the Vite plugin:

\`\`\`bash
npm install tailwindcss @tailwindcss/vite
\`\`\`

## Configure the Vite Plugin

Add the \`@tailwindcss/vite\` plugin to your Vite configuration file (\`vite.config.ts\`):

\`\`\`typescript
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
})
\`\`\`

## Import TailwindCSS

Add an \`@import\` to your CSS file that imports Tailwind CSS. This is typically done in your main CSS file (e.g., \`src/index.css\`):

\`\`\`css
@import 'tailwindcss';
\`\`\`

## Getting Started

After completing these steps, you'll have a fully configured React application with:
- **Vite** for fast development and building
- **TypeScript** for type safety
- **TailwindCSS** for utility-first styling

You can now start developing your application with modern tooling and best practices!`,
  },
  {
    id: "github-pages-hosting",
    title: "Deploy React App to GitHub Pages",
    description:
      "Complete guide to deploy your React application to GitHub Pages with custom domain support",
    category: "Deployment",
    publishDate: "June 2024",
    content: `# Deploy React App to GitHub Pages

This guide will walk you through deploying your React application to GitHub Pages, including setup for both GitHub domains and custom domains.

## Install gh-pages

First, install the gh-pages package as a development dependency:

\`\`\`bash
npm install gh-pages
\`\`\`

## Edit package.json

Update your \`package.json\` file with the homepage URL and deployment scripts:

\`\`\`json
{
  "name": "my-react-typescript-app",
  "version": "0.1.0",
  "homepage": "https://jbw9.github.io/", // for custom domain
  "homepage": "https://jbw9.github.io/repo-name", // for github domain
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
\`\`\`

## Create GitHub Actions Workflow

This will make deployment automatic everytime you push your code to GitHub! Create a workflow file at \`.github/workflows/main.yml\`:

\`\`\`yaml
name: Deploy static content to Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: CI=false npm run build
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: "./dist"
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
\`\`\`

## Configure Vite

Update your \`vite.config.ts\` file:

\`\`\`typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/repo-name/", // remove if using custom domain
});
\`\`\`

## GitHub Repository Settings

1. Go to your repository settings
2. Navigate to "Pages" section
3. Under "Build and deployment", select "GitHub Actions" as the source

## Custom Domain Setup

If you want to use a custom domain, you'll need to configure DNS records:

### Namecheap DNS Settings

Configure these DNS records in your Namecheap domain management panel:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A Record | @ | 185.199.108.153 | Automatic |
| A Record | @ | 185.199.109.153 | Automatic |
| A Record | @ | 185.199.110.153 | Automatic |
| A Record | @ | 185.199.111.153 | Automatic |
| CNAME Record | www | username.github.io | 60 min |

## Deployment Process

1. **Manual Deployment**: Run \`npm run deploy\` to deploy manually
2. **Automatic Deployment**: Push to the main branch to trigger automatic deployment via GitHub Actions

## Troubleshooting

- Ensure your repository is public or you have GitHub Pro for private repository Pages
- Check that GitHub Pages is enabled in repository settings
- Verify the base URL in \`vite.config.ts\` matches your deployment path
- For custom domains, ensure DNS propagation is complete (can take up to 24 hours)

Your React application should now be live on GitHub Pages!`,
  },
];
