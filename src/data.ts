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
  photo?: string;
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
  },
  {
    title: "SDE Intern",
    company: "Amazon Web Services (AWS)",
    companyIcon: "/awsLogo.png",
    period: "Jun 2026 - Aug 2026",
    description:
      "AWS Managed Streaming for Apache Kafka (MSK)",
  },
  {
    title: "Software Engineer Intern",
    company: "Massive, Inc.",
    companyIcon: "/massiveLogo.png",
    period: "Jul 2025 - Nov 2025",
    description:
      "Developing an algorithm to predict an artist's annual revenue from 130+ parameters",
  },
  {
    title: "Software Engineer Intern",
    company: "Kredivo Group",
    companyIcon: "kredivoLogo.png",
    period: "May 2025 - Jul 2025",
    description:
      "Developing an MCP server, and integrating it with the company's LLM and customer support system",
  },
  {
    title: "Co-Founder & CTO",
    company: "Tulip",
    companyIcon: "/tulip.png",
    period: "Jan 2024 - May 2025",
    description:
      "Led development of Tulip's mobile app, beta website and Automated Market Maker (AMM) algorithm.",
    website: "https://www.tulip.markets/",
  },
  {
    title: "Founder in Residence (iV10)",
    company: "Iventure Accelerator",
    companyIcon: "/iventure_logo.png",
    period: "Jan 2024 - May 2025",
    description: "Building Tulip",
  },
  {
    title: "Software Engineer Intern",
    company: "We Hear You, Inc",
    companyIcon: "wehearyouLogo.png",
    period: "May 2024 - Aug 2024",
    description:
      "Developed a real time American Sign Language to English Android application. Optimized translation system through machine learning.",
  },
];

export const education = [
  {
    degree: "Bachelor of Science in Computer Science",
    school: "University of Illinois at Urbana - Champaign",
    image: "https://brand.illinois.edu/wp-content/uploads/2024/02/Block-I-orange-blue-background.png",
    period: "Aug 2023 - May 2027",
    gpa: "3.90/4.0",
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
    photo: "/yc-ai-sus.jpg",
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
    role: "CS128 Course Assistant",
    organization: "Siebel School of Computing and Data Science",
    period: "Jan 2025 - May 2025",
    description:
      "Assisting students with course material through hosting office hours and answering forum questions.",
    image: "https://brand.illinois.edu/wp-content/uploads/2024/02/Block-I-orange-blue-background.png",
  },
];
