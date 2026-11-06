import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [".next/**", "node_modules/**", "drizzle/**", "coverage/**", "playwright-report/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    // Dumb components rule (Section 4 & 6):
    // components/atoms|molecules|modules|templates must NOT import from services, containers,
    // stores, server, axios, or @tanstack/react-query.
    files: [
      "src/components/atoms/**/*.{ts,tsx}",
      "src/components/molecules/**/*.{ts,tsx}",
      "src/components/modules/**/*.{ts,tsx}",
      "src/components/templates/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/services/*",
                "@/containers/*",
                "@/stores/*",
                "@/server/*",
                "axios",
                "@tanstack/react-query",
              ],
              message:
                "Dumb atomic components (atoms, molecules, modules, templates) must not import services, containers, stores, server code, axios, or TanStack Query. Receive data and callbacks via props from containers.",
            },
          ],
        },
      ],
    },
  },
  {
    // Client code must not import from src/server/**
    files: [
      "src/components/**/*.{ts,tsx}",
      "src/containers/**/*.{ts,tsx}",
      "src/stores/**/*.{ts,tsx}",
      "src/hooks/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/server/*"],
              message: "Client-side layers must never import directly from @/server/*.",
            },
          ],
        },
      ],
    },
  },
  {
    // Ban axios on the server (Section 2, 4, 21)
    files: ["src/server/**/*.{ts,tsx}", "src/**/*.server.ts", "src/app/api/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "axios",
              message: "Axios is strictly banned on the server. Use native fetch instead.",
            },
            {
              name: "@/lib/http/axios",
              message: "Client Axios instance is banned on the server. Use native fetch instead.",
            },
          ],
        },
      ],
    },
  },
  {
    // Ban raw fetch in client services (*.service.ts must use shared Axios instance)
    files: ["src/services/**/*.service.ts"],
    rules: {
      "no-restricted-globals": [
        "error",
        {
          name: "fetch",
          message: "Use the shared Axios instance (@/lib/http/axios) in client *.service.ts files.",
        },
      ],
    },
  },
);
