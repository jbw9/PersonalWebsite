export interface Experience {
  title: string;
  company: string;
  companyIcon: string;
  period: string;
  description: string;
  website?: string;
}

export interface Education {
  degree: string;
  school: string;
  image: string;
  period: string;
  gpa?: string;
  description?: string;
  relevantCourses?: string[];
  photos?: { src: string; caption: string }[];
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
    title: "Incoming Software Engineer",
    company: "Amazon Web Services (AWS)",
    companyIcon: "/awsLogo.png",
    period: "Feb 2027",
    description:
      "AWS Managed Streaming for Apache Kafka (MSK)",
    summary: "Returning full-time to the Amazon MSK team",
    tags: ["Java", "Apache Kafka", "AWS"],
    details:
      "Coming back full-time to the team I interned with: Amazon Managed Streaming for Apache Kafka (MSK), the managed service that runs Kafka clusters for AWS customers.",
  },
  {
    title: "SDE Intern",
    company: "Amazon Web Services (AWS)",
    companyIcon: "/awsLogo.png",
    period: "Jun 2026 - Aug 2026",
    description:
      "AWS Managed Streaming for Apache Kafka (MSK)",
    summary: "Building on Amazon MSK, managed Apache Kafka",
    tags: ["Java", "Apache Kafka", "AWS"],
    details:
      "Interned on Amazon MSK (Managed Streaming for Apache Kafka), the service that runs and scales Kafka clusters for AWS customers. Very challenging, and I learned a lot from much smarter people. It turned into a full-time return offer in Sep 2026.",
  },
  {
    title: "Software Engineer Intern",
    company: "Massive, Inc.",
    companyIcon: "/massiveLogo.png",
    period: "Jul 2025 - Nov 2025",
    description:
      "Developing an algorithm to predict an artist's annual revenue from 130+ parameters",
    summary: "Predicting an artist's yearly revenue from 130+ signals",
    tags: ["Python", "Machine learning", "Data modeling"],
    details:
      "I developed an algorithm to predict an artist's annual revenue from 130+ parameters.",
  },
  {
    title: "Software Engineer Intern",
    company: "Kredivo Group",
    companyIcon: "kredivoLogo.png",
    period: "May 2025 - Jul 2025",
    description:
      "Developing an MCP server, and integrating it with the company's LLM and customer support system",
    summary: "MCP servers, agents and a support chatbot for a fintech's LLM",
    tags: ["MCP", "LangChain", "LangGraph"],
    details:
      "Kredivo is a buy-now-pay-later and credit fintech in Southeast Asia. I built a Model Context Protocol (MCP) server so the company's LLM could use internal tools, and worked on agents and the customer support chatbot with LangChain and LangGraph.",
  },
  {
    title: "Co-Founder & CTO",
    company: "Tulip",
    companyIcon: "/tulip.png",
    period: "May 2024 - May 2025",
    description:
      "Led development of Tulip's mobile app, beta website and Automated Market Maker (AMM) algorithm.",
    summary: "Co-founded a $1 real estate investing app and led its engineering",
    tags: ["React Native", "TypeScript", "AMM"],
    details:
      "Tulip lets anyone invest in real estate with just $1. We raised $10k in non-dilutive funding from the iVenture Accelerator (cohort 10). I joined as a software engineer intern in Jan 2024 and was promoted to co-founder & CTO in May 2024, leading the mobile app, the beta website, and the Automated Market Maker (AMM) algorithm.",
    website: "https://www.tulip.markets/",
    screenshot: "/tulip-website.jpg",
  },
  {
    title: "Founder in Residence (iV10)",
    company: "Iventure Accelerator",
    companyIcon: "/iventure_logo.png",
    period: "May 2024 - May 2025",
    description: "Building Tulip",
    summary: "Building Tulip in the iV10 founder cohort",
    tags: ["Startups", "Product", "Fundraising"],
    details:
      "We raised $10k in non-dilutive funding for Tulip from iVenture Accelerator's 10th cohort (iV10). I was a Founder in Residence while building it.",
  },
  {
    title: "Software Engineer Intern",
    company: "We Hear You, Inc",
    companyIcon: "wehearyouLogo.png",
    period: "May 2024 - Aug 2024",
    description:
      "Developed a real time American Sign Language to English Android application. Optimized translation system through machine learning.",
    summary: "Real-time sign language to English, on an Android phone",
    tags: ["Android", "Machine learning", "Computer vision"],
    details:
      "I developed a real-time American Sign Language to English Android app, and optimized the translation system through machine learning.",
  },
  {
    title: "Software Engineer Intern",
    company: "Tulip",
    companyIcon: "/tulip.png",
    period: "Jan 2024 - May 2024",
    description: "Software engineer intern at Tulip, before being promoted to co-founder & CTO.",
    summary: "Joined Tulip as a software engineer intern",
    tags: ["React Native", "TypeScript", "AMM"],
    details:
      "Joined Tulip, an app that lets anyone invest in real estate with just $1, as a software engineer intern. Promoted to co-founder & CTO in May 2024.",
    website: "https://www.tulip.markets/",
  },
];

export const education = [
  {
    degree: "Bachelor of Science in Computer Science + Economics",
    school: "University of Illinois at Urbana - Champaign",
    image: "https://brand.illinois.edu/wp-content/uploads/2024/02/Block-I-orange-blue-background.png",
    period: "Aug 2023 - Dec 2026",
    gpa: "3.88/4.0",
    relevantCourses: [
      "Data Structures & Algorithms",
      "Database Systems",
      "Computer Systems",
      "Discrete Math",
    ],
  },
  {
    degree: "YC AI Startup School",
    school: "Y Combinator",
    period: "June 2025",
    image: "/ycLogo.svg",
    description: "Event Details - https://events.ycombinator.com/ai-sus",
    photos: [
      { src: "/story/yc-badge.jpg", caption: "" },
      { src: "/story/yc-stage.jpg", caption: "Sam Altman and Garry Tan" },
      { src: "/story/yc-llm-os.jpg", caption: "Andrej Karpathy" },
    ],
  },
];

export const involvements = [
  {
    role: "Consultant",
    organization: "OTCR Consulting",
    period: "Aug 2023 - June 2024",
    description:
      "The university's premier consulting organization with a 5% acceptance rate. Led an engagement with a startup to develop and evaluate expansion strategies, resulting in a validated go-to-market plan.",
    image: "/otcrLogo.png",
  },
  {
    role: "Technology & Fundraising Officer",
    organization: "Permias UIUC",
    period: "Aug 2023 - May 2025",
    description:
      "Led development of the official https://permiasuiuc.org/ website. Built with React, Typescript, and Tailwind CSS.",
    image: "/permiasLogo.png",
  },
  {
    role: "Built Talenta",
    organization: "Cozad New Venture Competition",
    period: "Jan 2024 - May 2024",
    description:
      "Developed Talenta, a K-12 student development platform that helps teachers identify student strengths and create individualized growth pathways. Won $2k in prizes.",
    image: "https://brand.illinois.edu/wp-content/uploads/2024/02/Block-I-orange-blue-background.png",
  },
  {
    role: "CS128 Course Assistant",
    organization: "Siebel School of Computing and Data Science",
    period: "Jan 2025 - May 2025",
    description:
      "Assisting students with course material through hosting office hours and answering forum questions.",
    image: "https://brand.illinois.edu/wp-content/uploads/2024/02/Block-I-orange-blue-background.png",
  },
];
