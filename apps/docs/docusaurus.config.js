/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'TALA Documentation',
  tagline: 'Docs-as-Code for Technical + BIR Compliance',
  url: 'http://localhost:3002',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/logo.svg',
  organizationName: 'tala',
  projectName: 'tala-docs',
  i18n: {
    defaultLocale: 'en',
    locales: ['en']
  },
  markdown: {
    mermaid: true
  },
  themes: ['@docusaurus/theme-mermaid'],
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: '/',
          editUrl: undefined
        },
        blog: false,
        pages: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css')
        }
      }
    ]
  ],
  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true
    },
    navbar: {
      title: 'TALA Docs',
      logo: {
        alt: 'TALA Logo',
        src: 'img/logo.svg',
        href: '/'
      },
      items: [
        { to: '/', label: 'Home', position: 'left' },
        { to: '/compliance/annex-b-functional-checklist', label: 'Compliance', position: 'left' },
        { to: '/technical/architecture-overview', label: 'Technical', position: 'left' },
        { href: 'https://github.com/', label: 'Source', position: 'right' }
      ]
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Compliance',
          items: [
            { label: 'Annex B (Checklist)', to: '/compliance/annex-b-functional-checklist' },
            { label: 'Annex C-1 (Process Flow)', to: '/compliance/annex-c1-process-flow' },
            { label: 'Disaster Recovery', to: '/compliance/disaster-recovery' }
          ]
        },
        {
          title: 'Technical',
          items: [
            { label: 'Architecture Overview', to: '/technical/architecture-overview' },
            { label: 'Setup Guide', to: '/technical/setup-guide' },
            { label: 'Docker', to: '/technical/docker-guide' }
          ]
        }
      ],
      copyright: `© ${new Date().getFullYear()} TALA` 
    },
    prism: {
      theme: require('prism-react-renderer').themes.github,
      darkTheme: require('prism-react-renderer').themes.dracula
    }
  }
};

module.exports = config;
