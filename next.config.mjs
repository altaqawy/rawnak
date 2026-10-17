import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const toolsHostRule = [{ type: 'host', value: 'tools.rawnakgroup.com' }];

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      // Visiting tools.rawnakgroup.com without a language opens the English toolkit.
      // This redirect keeps the same hostname.
      {
        source: '/',
        has: toolsHostRule,
        destination: '/en/',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return {
      // Host-based beforeFiles rules intentionally override /en and /ar homepages.
      // URLs visible to visitors: tools.rawnakgroup.com/en[/button-studio]
      // Internal routes: /en/tools[/button-studio].
      beforeFiles: [
        // The more specific rule comes first: Next.js can keep evaluating
        // beforeFiles rewrites, so /en must not become /en/tools/tools.
        {
          source: '/:locale(ar|en)/:tool',
          has: toolsHostRule,
          destination: '/:locale/tools/:tool',
        },
        {
          source: '/:locale(ar|en)',
          has: toolsHostRule,
          destination: '/:locale/tools',
        },
      ],
    };
  },
};

export default withNextIntl(nextConfig);
