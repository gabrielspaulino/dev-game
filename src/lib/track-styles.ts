export interface TrackStyle {
  id: string;
  title: string;
  description: string;
  icon: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
}

const TRACK_MAP: Record<string, TrackStyle> = {
  JavaScript: {
    id: "JavaScript",
    title: "JavaScript",
    description: "Master the language of the web",
    icon: "js",
    bgClass: "bg-amber-500",
    borderClass: "border-amber-500",
    textClass: "text-amber-600 dark:text-amber-400",
  },
  Git: {
    id: "Git",
    title: "Git",
    description: "Version control and collaboration workflows",
    icon: "git",
    bgClass: "bg-orange-500",
    borderClass: "border-orange-500",
    textClass: "text-orange-600 dark:text-orange-400",
  },
  Python: {
    id: "Python",
    title: "Python",
    description: "From scripting to data science and backends",
    icon: "python",
    bgClass: "bg-blue-500",
    borderClass: "border-blue-500",
    textClass: "text-blue-600 dark:text-blue-400",
  },
  SQL: {
    id: "SQL",
    title: "SQL",
    description: "Query, join, and aggregate relational data",
    icon: "sql",
    bgClass: "bg-cyan-500",
    borderClass: "border-cyan-500",
    textClass: "text-cyan-600 dark:text-cyan-400",
  },
  "Systems Design": {
    id: "Systems Design",
    title: "Systems Design",
    description: "Design scalable, reliable distributed systems",
    icon: "system-design",
    bgClass: "bg-indigo-500",
    borderClass: "border-indigo-500",
    textClass: "text-indigo-600 dark:text-indigo-400",
  },
  Java: {
    id: "Java",
    title: "Java",
    description: "OOP, collections, concurrency and design patterns",
    icon: "java",
    bgClass: "bg-red-500",
    borderClass: "border-red-500",
    textClass: "text-red-600 dark:text-red-400",
  },
};

const DEFAULT_STYLE: TrackStyle = {
  id: "unknown",
  title: "Unknown",
  description: "",
  icon: "package",
  bgClass: "bg-gray-500",
  borderClass: "border-gray-500",
  textClass: "text-gray-600 dark:text-gray-400",
};

export function getTrackStyle(category: string): TrackStyle {
  return TRACK_MAP[category] ?? { ...DEFAULT_STYLE, id: category, title: category };
}

export const CATEGORY_ORDER = ["JavaScript", "Git", "Python", "SQL", "Systems Design", "Java"];

export const SKILL_ORDER: Record<string, string[]> = {
  JavaScript: [
    "js-variables",
    "js-operators",
    "js-functions",
    "js-closures",
    "js-arrays",
    "js-collections",
    "js-async",
    "js-prototypes",
  ],
  Git: ["git-basics", "git-branching", "git-remote"],
  Python: ["py-syntax", "py-collections", "py-functions"],
  SQL: ["sql-select", "sql-joins", "sql-aggregates"],
  "Systems Design": [
    "sd-fundamentals",
    "sd-networking",
    "sd-data",
    "sd-asynchronous-communication",
    "sd-security",
    "sd-patterns",
  ],
  Java: ["java-core", "java-oop", "java-collections", "java-concurrency", "java-spring"],
};
