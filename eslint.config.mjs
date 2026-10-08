import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "test-results/**", "playwright-report/**"]),
  // Playwright fixtures call use(), which the React hooks rule mistakes for a hook
  { files: ["e2e/**"], rules: { "react-hooks/rules-of-hooks": "off" } },
]);

export default eslintConfig;
