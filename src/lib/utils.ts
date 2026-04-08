import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns a Tailwind bg+text class pair based on the tech category.
 *   Green  → Programming languages
 *   Blue   → Cloud / infrastructure
 *   Amber  → Databases / storage
 *   Purple → Frameworks, libraries, AI/ML tools
 *   Slate  → Everything else (tools, config, etc.)
 */
export function getTechBadgeColor(tech: string): string {
  const t = tech.toLowerCase();

  // Languages
  if (
    ["python", "typescript", "javascript", "c++", "java", "swift",
      "kotlin", "go", "rust", "ruby", "html", "css", "sql"].some(
      (l) => t === l || t.startsWith(l + " ")
    )
  ) {
    return "bg-[#DCFCE7] text-[#166534]";
  }

  // Cloud / infrastructure
  if (
    ["aws", "vercel", "gcp", "azure", "heroku", "firebase",
      "fargate", "bedrock", "ecs fargate", "cloudflare", "s3",
      "github pages", "netlify"].some((l) => t.includes(l))
  ) {
    return "bg-[#DBEAFE] text-[#1E40AF]";
  }

  // Databases / storage
  if (
    ["postgresql", "postgres", "sqlite", "dynamodb", "supabase",
      "mysql", "mongodb", "redis", "firebase"].some((l) => t.includes(l))
  ) {
    return "bg-[#FEF3C7] text-[#92400E]";
  }

  // Frameworks, libraries, AI/ML
  if (
    ["react", "next", "flask", "langchain", "langgraph", "tensorflow",
      "pytorch", "nativewind", "android studio", "express", "fastapi",
      "django", "openai", "pydantic", "mcp", "mediapipe", "numpy",
      "pandas", "vite", "tauri"].some((l) => t.includes(l))
  ) {
    return "bg-[#EDE9FE] text-[#5B21B6]";
  }

  // Tools / other
  return "bg-[#F1F5F9] text-[#475569]";
}
