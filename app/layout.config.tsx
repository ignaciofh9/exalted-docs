// docs/exalted-docs/app/layout.config.tsx
import { type DocsLayoutProps } from 'fumadocs-ui/layout';
import { type HomeLayoutProps } from 'fumadocs-ui/home-layout';
import { pageTree } from '@/app/source';
import React from 'react';
import VersionSelector from '@/app/components/VersionSelector';
import SiteTitle from './components/SiteTitle';

// shared configuration
export const baseOptions: HomeLayoutProps = {
  nav: {
    title: <SiteTitle />,
  },
  links: [
    {
      text: 'Documentation',
      url: '/docs',
      active: 'nested-url',
    },
  ],
};

// docs layout configuration
export const docsOptions: DocsLayoutProps = {
  ...baseOptions,
  tree: pageTree,
  sidebar: {
    banner: <VersionSelector /> as React.ReactNode,
  },
};
