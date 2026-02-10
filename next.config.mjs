import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Activa el MCP server en /_next/mcp (Next.js 16+)
    experimental: {
        mcpServer: true,
    },
}

export default withNextIntl(nextConfig)
