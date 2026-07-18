import js from "@eslint/js";
import globals from "globals";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import importPlugin from "eslint-plugin-import";
import unusedImports from "eslint-plugin-unused-imports";
import jsxA11y from "eslint-plugin-jsx-a11y";

export default [
  js.configs.recommended,

  // Node.js/CommonJS configuration for load tests
  {
    files: ["tests/load/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node
      }
    }
  },

  // TypeScript / React configuration
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: "latest",
        sourceType: "module"
      },
      globals: {
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        fetch: "readonly",
        HTMLMetaElement: "readonly",
        HTMLScriptElement: "readonly",
        HTMLLinkElement: "readonly",
        URLSearchParams: "readonly",
        File: "readonly",
        FormData: "readonly",
        Headers: "readonly",
        console: "readonly",
        process: "readonly",
        navigator: "readonly",
        RequestInit: "readonly",
        Response: "readonly"
      }
    },
    plugins: {
      "@typescript-eslint": ts,
      react,
      "react-hooks": reactHooks,
      import: importPlugin,
      "unused-imports": unusedImports,
      "jsx-a11y": jsxA11y
    },
    settings: {
      react: {
        version: "detect"
      }
    },
    rules: {
      ...ts.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,

      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "no-undef": "off",

      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-namespace": "off",

      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_"
        }
      ],

      "react-hooks/set-state-in-effect": "off",

      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          "newlines-between": "ignore",
          alphabetize: {
            order: "asc",
            caseInsensitive: true
          }
        }
      ],

      "import/no-unresolved": "off"
    }
  },

  {
    ignores: [
      "node_modules/",
      "dist/",
      "build/",
      ".husky/",
      "app.js",
      "*.config.js",
      "postcss.config.js",
      "tailwind.config.js"
    ]
  }
];
