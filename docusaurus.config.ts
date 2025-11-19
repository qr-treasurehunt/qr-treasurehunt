import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'QR-TreasureHunt',
  tagline: 'Create and play QR code-based treasure hunts!',
  favicon: 'img/treasurehunter.png',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://qr-treasurehunt.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'QR-treasurehunt', // Usually your GitHub org/user name.
  projectName: 'QR-treasurehunt', // Usually your repo name.

  onBrokenLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/qr-treasurehunt/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/treasurehunter.png',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'QR TreasureHunt',
      logo: {
        alt: 'QR TreasureHunt Logo',
        src: 'img/treasurehunter.png',
      },
      items: [
        {
          to: '/docs/treasurehunter/create-treasure-hunt',
          label: 'Create Hunt',
          position: 'right',
        },
        {
          to: '/qr-scanner',
          label: 'Scanner',
          position: 'right',
        },
        {
          to: '/docs/treasurehunter/instructions',
          label: 'Instructions',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Resources',
          items: [
            {
              label: 'Instructions',
              to: '/docs/treasurehunter/instructions',
            },
            {
              label: 'QR Codes PDF',
              href: '/pdf/qrcodes.pdf',
              target: '_blank',
              rel: 'noopener noreferrer',
            },
            {
              label: 'GitHub Repository',
              href: 'https://github.com/QR-treasurehunt/QR-treasurehunt',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} QR TreasureHunt.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
