import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Prevent accidental use of `any`
      "@typescript-eslint/no-explicit-any": "error",
      // Enforce explicit return types on exported functions
      "@typescript-eslint/explicit-module-boundary-types": "off",
      // Disallow unused variables
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Prevent console.log in production code (use the logger)
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  {
    ignores: [".next/**", "node_modules/**", "coverage/**", "playwright-report/**"],
  },
];

export default eslintConfig;
