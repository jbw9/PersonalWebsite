export interface Experience {
  title: string;
  company: string;
  companyIcon: string;
  period: string;
  description: string;
  website?: string;
  technologies: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  technologies: string[];
  features: string[];
  github?: string;
  demo: string;
  image: string;
}

export interface Guide {
  id: string;
  title: string;
  description: string;
  category: string;
  publishDate: string;
  content: string;
}

export interface Education {
  degree: string;
  school: string;
  image: string;
  period: string;
  gpa?: string;
  description?: string;
  relevantCourses?: string[];
}

export interface Involvement {
  role: string;
  organization: string;
  period: string;
  description: string;
  image: string;
}

export const experiences = [
  {
    title: "Software Engineer Intern",
    company: "Kredivo Group",
    companyIcon:
      "https://media.licdn.com/dms/image/v2/D560BAQEcTpBN5xjLQQ/company-logo_200_200/company-logo_200_200/0/1693461125877/kredivo_group_logo?e=1754524800&v=beta&t=KuobEwkUY_KV9dnjITlcVJMRwO1KZIgUOP9vniH6NXo",
    period: "Summer 2025",
    description:
      "Developing an MCP server, and integrating it with the company's LLM and customer support system",
    technologies: ["Python", "Ollama", "Flask", "MCP"],
  },
  {
    title: "Co-Founder & CTO",
    company: "Tulip",
    companyIcon:
      "https://media.licdn.com/dms/image/v2/D560BAQGwgNKT8En_Fw/company-logo_200_200/company-logo_200_200/0/1729296904460/tulipestate_logo?e=1754524800&v=beta&t=aS4WoWT6VvmIVhbPysGi5ZSbaZd9AQLlt2F_8HXRki0",
    period: "Jan 2024 - May 2025",
    description:
      "Led development of Tulip's mobile app, beta website and Automated Market Maker (AMM) algorithm.",
    website: "https://www.tulip.markets/",
    technologies: ["Python", "AWS", "React Native", "React", "Flask"],
  },
  {
    title: "Founder in Residence (iV10)",
    company: "Iventure Accelerator",
    companyIcon:
      "https://media.licdn.com/dms/image/v2/C4D0BAQGxjXbhDRFjRw/company-logo_100_100/company-logo_100_100/0/1663165310322/iventureaccelerator_logo?e=1754524800&v=beta&t=XmqJmtwGRMC7MhOVqEs5CU4YMfN_GjhcWs_U66cMCoc",
    period: "Jan 2024 - May 2025",
    description: "Building Tulip",
    technologies: [],
  },
  {
    title: "Software Engineer Intern",
    company: "We Hear You, Inc",
    companyIcon:
      "https://media.licdn.com/dms/image/v2/D560BAQFvP6vMuT95LA/company-logo_200_200/company-logo_200_200/0/1726942046647?e=1754524800&v=beta&t=eyNEd3jiRfir4MXf2vf6KMY6YUCrgkovsWswWWXHSLw",
    period: "Summer 2024",
    description:
      "Developed a real time American Sign Language to English Android application. Optimized translation system through machine learning.",
    technologies: ["Python", "TensorFlow", "Android Studio"],
  },
];

export const projects = [
  {
    id: "explorify",
    title: "explorify",
    description:
      "A full-stack IOS app that simplifies the process of finding events around the UIUC campus. With a built in RSVP feature, allowing users to RSVP in less than 3 seconds",
    longDescription:
      "I first came up with the idea after noticing the difficulty in finding events on the UIUC campus. As theres over 1800 student organizations across the campus, but there is no single platform for organizations to post their events. Therefore, organizations posts events on their individual Instagram accounts. It was also annoying to RSVP for events as we need to fill out a seperate google forms and fill in all of our details from scratch everytime we want to RSVP for an event.\n\nTherefore, I developed explorify! An app that allows our users to easily find events in a all in one platform that aggregates all events throughout the UIUC campus. Our built in RSVP system also allows users to RSVP for events in under 3 seconds, also storing previous answers so users don't need to fill in the form from scratch everytime.",
    technologies: ["React Native", "Supabase", "Nativewind"],
    features: [
      "Explore events posted by 1800+ organizations across UIUC",
      "RSVP for events in under 3 seconds (no third party forms are required anymore)",
      "Let organizers know your dietary restrictions, contact and party size",
      "Allowing organizers to check in users in the app",
      "RSVP and Saved events tab",
    ],
    github: undefined,
    demo: "https://apps.apple.com/us/app/explorifyy/id6739402841",
    image: "/explorify.png",
  },
];

export const guides = [
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

export const education = [
  {
    degree: "Bachelor of Science in Computer Science",
    school: "University of Illinois at Urbana - Champaign",
    image:
      "https://media.licdn.com/dms/image/v2/C4E0BAQGFFDl_Z9pIAA/company-logo_100_100/company-logo_100_100/0/1630611684443/university_of_illinois_at_urbana_champaign_logo?e=1754524800&v=beta&t=yXHWVm7AICqQokMi7Aj7XGmgzURFf3ltojHzoaq3EnQ",
    period: "2022 - 2026",
    gpa: "3.87/4.0",
    relevantCourses: [
      "Data Structures & Algorithms",
      "Database Systems",
      "Data Mining",
      "Discrete Math",
    ],
  },
  {
    degree: "YC AI Startup School",
    school: "Y Combinator",
    period: "2025",
    image:
      "https://media.licdn.com/dms/image/v2/C4D0BAQGPzdBPNxrmEg/company-logo_100_100/company-logo_100_100/0/1673555093250/y_combinator_logo?e=1754524800&v=beta&t=Zaeq6nS7bCLmXIoIScDFQ_CS78JmcrLyTM9l-d6w_Ro",
    description:
      "One of 2000 undergrad and grad students selected for the first ever YC AI Startup School. Link - https://events.ycombinator.com/ai-sus",
  },
];

export const involvements = [
  {
    role: "Consultant",
    organization: "OTCR Consulting",
    period: "Aug 2023 - June 2024",
    description:
      "The university's premier consulting organization with a 5% acceptance rate. Led an engagement with a startup to develop and evaluate expansion strategies, resulting in a validated go-to-market plan.",
    image:
      "https://media.licdn.com/dms/image/v2/C4E0BAQEjAlC8LwihOQ/company-logo_100_100/company-logo_100_100/0/1631348661882?e=1754524800&v=beta&t=jHh41QTnM_D_uw0HHgi_rc9thn5iFlrp8OyyL8pS5Ks",
  },
  {
    role: "Technology & Fundraising Officer",
    organization: "Permias UIUC",
    period: "Aug 2023 - May 2025",
    description:
      "Led development of the official https://permiasuiuc.org/ website. Built with React, Typescript, and Tailwind CSS.",
    image:
      "https://media.licdn.com/dms/image/v2/C510BAQGHwSXiJ6nXjA/company-logo_100_100/company-logo_100_100/0/1631353110459?e=1754524800&v=beta&t=Sc0tsniMiGKbag6fxN3tFmekQEJoWCZ6BVpVkuZqBV4",
  },
  {
    role: "CS128 Course Assistant",
    organization: "Siebel School of Computing and Data Science",
    period: "Jan 2025 - Present",
    description:
      "Assisting students with course material through hosting office hours and answering forum questions.",
    image:
      "https://media.licdn.com/dms/image/v2/D4D0BAQHnn2vmCGlTeg/company-logo_100_100/B4DZYQ355YHsAg-/0/1744039813085/illinoiscds_logo?e=1754524800&v=beta&t=7kKDSDh2F7Gk23eGryH1AT8UB9M9l4gK8_9T82rKcQY",
  },
];
