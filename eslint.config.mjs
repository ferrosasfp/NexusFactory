import nextConfig from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = [
    {
        ignores: [
            ".next/**",
            "node_modules/**",
            "out/**",
            "dist/**",
            "coverage/**",
            "*.min.*",
        ],
    },
    ...nextConfig,
    ...nextTs,
];

export default eslintConfig;
