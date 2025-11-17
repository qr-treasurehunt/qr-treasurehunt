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
  url: 'https://your-docusaurus-site.example.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'facebook', // Usually your GitHub org/user name.
  projectName: 'docusaurus', // Usually your repo name.

  onBrokenLinks: 'throw',

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
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
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
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'QR TreasureHunt',
      logo: {
        alt: 'QR TreasureHunt Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          to: '/docs/treasurehunter/create-treasure-hunt',
          label: 'Create Hunt',
          position: 'left',
        },
        {
          to: '/qr-scanner',
          label: 'Scanner',
          position: 'left',
        },
        {
          to: '/docs/treasurehunter/instructions',
          label: 'Instructions',
          position: 'left',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Treasure Hunt',
          items: [
            {
              label: 'Create Hunt',
              to: '/docs/treasurehunter/create-treasure-hunt',
            },
            {
              label: 'QR Scanner',
              to: '/qr-scanner',
            },
            {
              label: 'Instructions',
              to: '/docs/treasurehunter/instructions',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'QR Codes PDF',
              to: '/pdf/qrcodes.pdf',
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
