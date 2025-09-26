import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
      "prefer-const": "warn"
    }
  },
  {
    ignores: ["dist", "node_modules", "old_project_files"]
  }
];