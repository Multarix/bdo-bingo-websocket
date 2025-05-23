import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import stylistic from "@stylistic/eslint-plugin";
import { defineConfig } from "eslint/config";


export default defineConfig([
	tseslint.configs.recommended,
	{
		plugins: {
			'@stylistic': stylistic
		},
		rules: {
			"@stylistic/brace-style": ["error", "1tbs", { "allowSingleLine": false }],
			"use-isnan": "error",
			"@stylistic/comma-dangle": ["error", "never"],
			"@stylistic/comma-spacing": "error",
			"@stylistic/comma-style": "error",
			"curly": ["error", "multi-line", "consistent"],
			"@stylistic/dot-location": ["error", "property"],
			"@stylistic/indent": ["error", "tab", { "SwitchCase": 1 }],
			"max-nested-callbacks": ["error", { "max": 4 }],
			"@stylistic/max-statements-per-line": ["error", { "max": 4 }],
			"no-console": "off",
			"no-empty-function": "error",
			"@stylistic/no-floating-decimal": "error",
			"@stylistic/no-multi-spaces": "error",
			"@stylistic/no-multiple-empty-lines": ["error", { "max": 3, "maxEOF": 1, "maxBOF": 0 }],
			"@stylistic/no-trailing-spaces": ["error"],
			"no-unused-vars": ["error", { "varsIgnorePattern": "^_" }],
			"no-var": "error",
			"@stylistic/object-curly-spacing": ["error", "always"],
			"prefer-const": "error",
			"@stylistic/space-in-parens": "error",
			"@stylistic/space-infix-ops": "error",
			"@stylistic/space-unary-ops": "error",
			"@stylistic/spaced-comment": "error",
			"no-lonely-if": "error",
			"no-plusplus": ["error", { "allowForLoopAfterthoughts": true }],
			"@stylistic/space-before-blocks": ["error", { "functions": "never", "keywords": "never", "classes": "always" }],
			"@stylistic/space-before-function-paren": ["error", { "anonymous": "never", "named": "never", "asyncArrow": "always" }],
			"@stylistic/keyword-spacing": ["error", {
				"before": true,
				"after": true,
				"overrides": {
					"if": { "after": false },
					"for": { "after": false },
					"while": { "after": false },
					"switch": { "after": false }
				}
			}],
			"@stylistic/arrow-spacing": ["error", { "before": true, "after": true }],
			"constructor-super": "error",
			"for-direction": "error",
			"no-cond-assign": "error",
			"no-constructor-return": "error",
			"no-duplicate-imports": "error",
			"no-fallthrough": "error",
			"@stylistic/semi": ["error", "always"],
			"@stylistic/semi-style": ["error", "last"]
		}
	},
	{ files: ["**/*.{js,mjs,cjs,ts}"], plugins: { js }, extends: ["js/recommended"] },
	{ files: ["**/*.{js,mjs,cjs,ts}"], languageOptions: { globals: globals.node } }
]);