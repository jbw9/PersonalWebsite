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
  howItWorks?: string;
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
    company: "Massive, Inc.",
    companyIcon: "/massiveLogo.png",
    period: "Jully 2025 - Present",
    description:
      "Developing an algorithm to predict an artist's annual revenue from 130+ parameters",
    technologies: ["Python", "OpenAI API", "Flask"],
  },
  {
    title: "Software Engineer Intern",
    company: "Kredivo Group",
    companyIcon: "https://media.licdn.com/dms/image/v2/D560BAQEcTpBN5xjLQQ/company-logo_200_200/company-logo_200_200/0/1693461125877/kredivo_group_logo?e=1757548800&v=beta&t=2PiSp3Z7TPXoIl_mJSyshLxbbCS9pCEIOshtYek1h2Q",
    period: "Summer 2025",
    description:
      "Developing an MCP server, and integrating it with the company's LLM and customer support system",
    technologies: ["Python", "Ollama", "Flask", "MCP"],
  },
  {
    title: "Co-Founder & CTO",
    company: "Tulip",
    companyIcon: "https://www.tulip.markets/favicon.ico",
    period: "Jan 2024 - May 2025",
    description:
      "Led development of Tulip's mobile app, beta website and Automated Market Maker (AMM) algorithm.",
    website: "https://www.tulip.markets/",
    technologies: ["Python", "AWS", "React Native", "React", "Flask"],
  },
  {
    title: "Founder in Residence (iV10)",
    company: "Iventure Accelerator",
    companyIcon: "https://media.licdn.com/dms/image/v2/C4D0BAQGxjXbhDRFjRw/company-logo_200_200/company-logo_200_200/0/1663165310322/iventureaccelerator_logo?e=1757548800&v=beta&t=Ap4uGSRh1YnuGtD20BYz-ODgWHvKn0o-atIgXo82u-s",
    period: "Jan 2024 - May 2025",
    description: "Building Tulip",
    technologies: [],
  },
  {
    title: "Software Engineer Intern",
    company: "We Hear You, Inc",
    companyIcon: "https://media.licdn.com/dms/image/v2/D560BAQFvP6vMuT95LA/company-logo_200_200/company-logo_200_200/0/1726942046647?e=1757548800&v=beta&t=kJ9eyFCvh8F83I4Ylq8zNp_Psh6th7efeIefs-q7mB4",
    period: "Summer 2024",
    description:
      "Developed a real time American Sign Language to English Android application. Optimized translation system through machine learning.",
    technologies: ["Python", "TensorFlow", "Android Studio"],
  },
];

export const projects = [
  {
    id: "seam-carving",
    title: "Image Resizing Program",
    description:
      "Quickly resize images without losing information with the Seam Carving Algorithm.",
    longDescription:
      "This project implements the seam carving algorithm, a content-aware image resizing technique that intelligently removes or adds pixels while preserving important visual features. Unlike traditional scaling methods that uniformly stretch or compress images, seam carving identifies and removes the least visually important paths through the image.\n\nThe algorithm uses dynamic programming to find optimal seams - connected paths of pixels with minimal visual importance. By calculating energy values for each pixel based on color gradients, the algorithm can preserve edges, textures, and other important visual elements while changing image dimensions.",
    technologies: ["C++"],
    features: [
      "Content-aware image resizing that preserves important visual features",
      "Dynamic programming implementation for O(h × w) time complexity",
      "Energy function based on RGB color gradients to identify important pixels",
      "Intelligent seam selection using cumulative energy tables",
      "Border handling with pixel wrapping for edge cases",
      "Tie-breaking rules for optimal path selection when energies are equal",
    ],
    github: "https://github.com/jbw9/ImageResizing",
    demo: undefined,
    image: "/SeamCarving.png",
    howItWorks: `
  
  ### Energy Function
  The algorithm begins by calculating an **energy value** for each pixel, which represents its visual importance. The equation for calculating energy E of one pixel at (row, col) is as follows:
  
  \`\`\`
  E(row, col) = Δ²col(row, col) + Δ²row(row, col)
  
  Δ²col(row, col) = R²col(row, col) + G²col(row, col) + B²col(row, col)
  
  Rcol(row, col) = R(row, col - 1) - R(row, col + 1)
  Gcol(row, col) = G(row, col - 1) - G(row, col + 1)
  Bcol(row, col) = B(row, col - 1) - B(row, col + 1)
  
  Δ²row(row, col) = R²row(row, col) + G²row(row, col) + B²row(row, col)
  
  Rrow(row, col) = R(row - 1, col) - R(row + 1, col)
  Grow(row, col) = G(row - 1, col) - G(row + 1, col)
  Brow(row, col) = B(row - 1, col) - B(row + 1, col)
  \`\`\`
  
  Where R(row, col) is the red value of the pixel at (row, col) and G(row, col) and B(row, col) are the green and blue values, respectively.
  
  Where:
  - \`Δ²col\` measures horizontal color gradients (left-right pixel differences)
  - \`Δ²row\` measures vertical color gradients (up-down pixel differences)
  - Higher energy indicates more visual importance (edges, textures, etc.)
  
  ### Seam Definition
  A **seam** is a connected path of pixels that:
  - **Vertical seam**: Spans image height using one pixel per column
  - **Horizontal seam**: Spans image width using one pixel per row
  - Adjacent pixels in the path are connected (including diagonally)
  
  ## Algorithm Architecture
  
  ### Phase 1: Energy Calculation
  For each pixel (row, col):
  1. Calculate color differences with adjacent pixels
  2. Compute energy = sum of squared RGB differences
  3. Store in energy matrix
  
  ### Phase 2: Dynamic Programming Solution
  Create cumulative energy table working bottom-up:
  - For last row: \`cumulative[row][col] = energy[row][col]\`
  - For each previous row:
    - For each column:
      - Find minimum of three possible paths below
      - \`cumulative[row][col] = energy[row][col] + min(paths)\`
  
  ### Phase 3: Seam Identification
  1. Find starting point: \`minimum_column = argmin(cumulative[0])\`
  2. Trace optimal path:
     - For each subsequent row:
     - Choose adjacent pixel with minimum cumulative energy
     - Handle tie-breaking (prefer middle > left > right)
  
  ### Phase 4: Seam Removal
  For each row in the seam:
  1. Remove the identified pixel
  2. Shift remaining pixels to fill gap
  3. Update image dimensions
  
  ## Time & Space Complexity
  
  - **Time Complexity**: O(h × w) where h = height, w = width
  - **Space Complexity**: O(h × w) for the cumulative energy table
  - **Optimization**: Dynamic programming reduces naive O(3^h × w) recursive solution
  
  ## Algorithm Flow
  
  \`\`\`
  Input Image
      ↓
  Energy Calculation (gradient-based)
      ↓
  Dynamic Programming Table
      ↓
  Find Minimum Energy Seam
      ↓
  Trace Optimal Path
      ↓
  Remove Seam Pixels
      ↓
  Output Resized Image
  \`\`\`
  
  ## Key Implementation Details
  
  ### Border Handling
  For pixels at image boundaries, the algorithm "wraps around":
  - **Left edge**: Use rightmost pixel as left neighbor
  - **Right edge**: Use leftmost pixel as right neighbor
  - **Top/bottom**: Similar wrapping for vertical calculations
  
  ### Tie-Breaking Rules
  When multiple paths have equal minimum energy:
  1. **Starting position**: Choose leftmost (vertical) or topmost (horizontal)
  2. **Path tracing**: Prefer middle > left/top > right/bottom
  
  ### Optimization Techniques
  1. **Naive Recursion**: O(3^h × w) - calculates overlapping subproblems
  2. **Memoization**: O(h × w) - caches recursive results
  3. **Dynamic Programming**: O(h × w) - iterative bottom-up approach (optimal)`,
  },
  {
    id: "explorify",
    title: "Explorify",
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
  {
    id: "spending-tracker",
    title: "Spending Tracker",
    description:
      "Simple spending tracker website, developed from scratch in 2 hours.",
    longDescription:
      "I wanted to easily track my monthly spendings but I can't find an app that allowed to manually add transactions. The only alternative is using Google Sheets / Excel or Notion, but these 2 applications are not practical to use on mobile.\n\nTherefore, I developed this website in 2 hours! Feel free to contact me at jonathanbernard265@gmail.com for any feature requests.",
    technologies: ["React", "Typescript", "TailwindCSS", "Supabase"],
    features: [
      "Pie chart breaking down spendings based on categories",
      "Monthly bar graph to visualize monthly spending trends",
      "Filter transactions by category",
      "Sort transactions by date, amount and category",
      "Easily add transactions to the database",
      "Pie chart breaking down spendings based on categories",
    ],
    github: undefined,
    demo: "https://jbw9.github.io/SpendingTracker/",
    image: "/spendingtracker.png",
  },
  {
    id: "GoBites",
    title: "GoBites",
    description:
      "A simple IOS app that allows people to quickly track and navigate to food trucks around the UIUC campus.",
    longDescription:
      "I found it hard to find food trucks around campus, as nobody really knows their schedule and where they will park. \n\nTherefore, I took a weekend to develop this app, allowing users to easily locate food trucks around the UIUC campus using the app's built in map. Users can also search for their favorite food trucks and navigate to it using Google / Apple maps.\n\nFor food truck drivers, this will help them gain more customers. I also added features to make this app easier to use such as customizable sessions to indicate how long will they be in their current position and notes to make it even easier for users to locate them.",
    technologies: ["React Native", "Supabase", "Nativewind"],
    features: [
      "Use the built in map to locate food trucks",
      "Search your favorite food trucks",
      "Check walking time to food truck",
      "One tap navigation",
      "Customizable sessions for food truck owners",
      "Adding notes if food truck is still hard to locate",
    ],
    github: undefined,
    demo: "https://jbw9.github.io/SpendingTracker/",
    image: "/gobites.png",
  },
  {
    id: "akar",
    title: "akar.study",
    description:
      "An open-source flashcard platform utilizing spaced repetition to optimize learning, integrated a Pomodoro timer to boost productivity,",
    longDescription:
      "I'm a fan of using flashcards to study, however the current best flashcard platform is Anki. Although Anki is a great platform, it has a outdated UI/UX making it quite difficult to use especially for the non technical people.\n\nTherefore, I developed akar which has better UI/UX and an integrated Pomodoro timer to further improve user's productivity,",
    technologies: ["React", "Typescript", "TailwindCSS", "Supabase"],
    features: [
      "Built in Pomodoro timer to enhance productivity",
      "Statistics dashboard to track learning progress",
      "Utilizes spaced repetition algorithm",
    ],
    github: undefined,
    demo: "https://akar.study/",
    image: "/akar.png",
  },
];

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

export const education = [
  {
    degree: "Bachelor of Science in Computer Science",
    school: "University of Illinois at Urbana - Champaign",
    image: "https://brand.illinois.edu/wp-content/uploads/2024/02/Block-I-orange-blue-background.png",
    period: "Aug 2023 - Dec 2026",
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
    image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQEAAAEBCAMAAABPMuDPAAAAQlBMVEXyZSLyZSLyZSLyZSLyZSL6roH91br2ilD+6tr4nGn0eDf7wp3+9e3zbyz3k1z0gUP7uI/5pXX+38n8y6z////yZSKuMvVfAAAABXRSTlOAQMBgICelMzEAAAOgSURBVHhe5MABDQAAAIIw3eifmSB8vA3Zt5vcuGEgCsLeUBSpnxnb4f2vmn068xK5Z8FuFQ8gCB9q80Dw42Pc+3y8UQABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQACBR7GnuAF6MafNKnDsv+xx/+1mv3nOKjDKXwRWbwIWYJl4F6wigvclUCcWaCKCeRKwAtNFoBN4TC1wigjelMA2+S5YRATv+VyfXKC+NYIqEphVQEfgT2Dv0ws8VAT+BEqAXbCJCPwJHAEEuorAn0AAARGBO4H1CCFw7O+JoArIuQVGERH4EhgBBFQE/gQmF9ARnP4EljG5gB5Iiz+BGkBAreTqTyCAgIzAnUAogdMbwSIm0cQCeiAtvgR6MIEqInAkEEBARuBKIJzAwxOB5SsBb822n0dQxSoOJNBFBI4EAgmMp4jAkUAAATWQ6s8SaEFvz8vPIqhiWAYQcEQgEogqMD5FBBcS+BrBBPRAqtcTqIEF2vUIqsgmgIAjApFAaIF6NQKbwPcIKKAHUr2WQI8k4I+gilUcQMARgUggvEC/EkEzAM8E7wu2CxGsdhJFEvBH0MQqDiegV3J1JBBQ4NhFBDqBzyTvC4qIQCawjgwCOgKdQIstoFdydSQQRcD2rSNoVimRQPuPCFaLFF1AR7A5EggloK/BdAIZBPRVqE6ghxLwR7BaoBQCOgKdQDqBLiIQCSQSGJuIoNlJlEVAR3C8TKCkfHX7fLn+T5tASoFjf9X6YmlSCozyYvxVO4kSCegI1r8n0FIJ6IF0igQyCej9txiWZAI6gsfoViWxwPiy+2gzqzi1QLUR2ATSCeiBtBuSfAI6AjsWkguM738I9PQC3ZFADoGxKYC95xfQEZRxA4FRRALHLQSOXSSQXkBHsB75BXQEbWQV0APJruL8AmMVCaQW0BEsI5uAXsn21FsJVJFAZgH9juJmAsVOorsLlLsJIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAm3547QAAoGPFkAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBH6XAwc0AAAAEME2+ncWxOXNAI6Cs14i3Db7AAAAAElFTkSuQmCC",
    description: "Event Details - https://events.ycombinator.com/ai-sus",
  },
];

export const involvements = [
  {
    role: "Consultant",
    organization: "OTCR Consulting",
    period: "Aug 2023 - June 2024",
    description:
      "The university's premier consulting organization with a 5% acceptance rate. Led an engagement with a startup to develop and evaluate expansion strategies, resulting in a validated go-to-market plan.",
    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iNCIgZmlsbD0iIzEwN0M0MSIvPgo8dGV4dCB4PSIyNCIgeT0iMzIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIj5PVENSLHAVDGV4dD4KPC9zdmc+Cg==",
  },
  {
    role: "Technology & Fundraising Officer",
    organization: "Permias UIUC",
    period: "Aug 2023 - May 2025",
    description:
      "Led development of the official https://permiasuiuc.org/ website. Built with React, Typescript, and Tailwind CSS.",
    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iNCIgZmlsbD0iI0RDMjYyNiIvPgo8dGV4dCB4PSIyNCIgeT0iMzIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIj5QPC90ZXh0Pgo8L3N2Zz4K",
  },
  {
    role: "CS128 Course Assistant",
    organization: "Siebel School of Computing and Data Science",
    period: "Jan 2025 - Present",
    description:
      "Assisting students with course material through hosting office hours and answering forum questions.",
    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iNCIgZmlsbD0iI0ZGNUYwMCIvPgo8dGV4dCB4PSIyNCIgeT0iMzIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIj5DUzwvdGV4dD4KPC9zdmc+Cg==",
  },
];
