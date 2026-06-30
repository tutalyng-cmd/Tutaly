import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Custom rule to ban hex and rgba in inline styles
const noInlineColorsRule = {
  meta: { type: "problem", messages: { noInlineColor: "Do not use hardcoded hex or rgba colors in inline styles. Use CSS components and variables." } },
  create(context) {
    return {
      "JSXAttribute[name.name='style'] Property Literal"(node) {
        if (typeof node.value === 'string' && (node.value.includes('#') || node.value.includes('rgba') || node.value.includes('rgb('))) {
          context.report({ node, messageId: "noInlineColor" });
        }
      },
      "JSXAttribute[name.name='style'] Property TemplateLiteral"(node) {
        const str = node.quasis.map(q => q.value.raw).join('');
        if (str.includes('#') || str.includes('rgba') || str.includes('rgb(')) {
          context.report({ node, messageId: "noInlineColor" });
        }
      }
    };
  }
};

const noArbitraryTailwindRule = {
  meta: { type: "problem", messages: { noArbitrary: "Do not use arbitrary Tailwind values (e.g. `[100px]`, `[#fff]`). Use CSS tokens or standard Tailwind utilities." } },
  create(context) {
    return {
      "JSXAttribute[name.name='className'] Literal"(node) {
if (typeof node.value === 'string' && node.value.includes('[')) {
          const invalidClasses = node.value.split(' ').filter(c => c.includes('[') && !c.includes('content-[') && !c.startsWith('[&') && !c.includes('scrollbar') && !c.includes('[-ms') && !c.includes('content'));
          if (invalidClasses.length > 0) {
            context.report({ node, messageId: "noArbitrary" });
          }
        }
      },
      "JSXAttribute[name.name='className'] TemplateLiteral"(node) {
const str = node.quasis.map(q => q.value.raw).join('');
        if (str.includes('[')) {
          const invalidClasses = str.split(' ').filter(c => c.includes('[') && !c.includes('content-[') && !c.startsWith('[&') && !c.includes('scrollbar') && !c.includes('[-ms') && !c.includes('content'));
          if (invalidClasses.length > 0) {
            context.report({ node, messageId: "noArbitrary" });
          }
        }
      }
    };
  }
};

const customPlugin = {
  rules: {
    "no-inline-colors": noInlineColorsRule,
    "no-arbitrary-tailwind": noArbitraryTailwindRule
  }
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    plugins: {
      "custom": customPlugin
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "react/no-unescaped-entities": "warn",
      "custom/no-inline-colors": "error",
      "custom/no-arbitrary-tailwind": "error"
    }
  }
]);

export default eslintConfig;
