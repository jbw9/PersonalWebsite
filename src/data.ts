export interface Experience {
  title: string;
  company: string;
  companyIcon: string;
  period: string;
  description: string;
  website?: string;
  technologies: string[];
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
    period: "Jul 2025 - Present",
    description:
      "Developing an algorithm to predict an artist's annual revenue from 130+ parameters",
    technologies: ["Python", "OpenAI API", "Flask"],
  },
  {
    title: "Software Engineer Intern",
    company: "Kredivo Group",
    companyIcon: "kredivoLogo.png",
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
    companyIcon: "/iventure_logo.png",
    period: "Jan 2024 - May 2025",
    description: "Building Tulip",
    technologies: [],
  },
  {
    title: "Software Engineer Intern",
    company: "We Hear You, Inc",
    companyIcon: "wehearyouLogo.png",
    period: "Summer 2024",
    description:
      "Developed a real time American Sign Language to English Android application. Optimized translation system through machine learning.",
    technologies: ["Python", "TensorFlow", "Android Studio"],
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
    period: "June 2025",
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
