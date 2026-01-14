import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/__docusaurus/debug',
    component: ComponentCreator('/__docusaurus/debug', '5ff'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/config',
    component: ComponentCreator('/__docusaurus/debug/config', '5ba'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/content',
    component: ComponentCreator('/__docusaurus/debug/content', 'a2b'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/globalData',
    component: ComponentCreator('/__docusaurus/debug/globalData', 'c3c'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/metadata',
    component: ComponentCreator('/__docusaurus/debug/metadata', '156'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/registry',
    component: ComponentCreator('/__docusaurus/debug/registry', '88c'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/routes',
    component: ComponentCreator('/__docusaurus/debug/routes', '000'),
    exact: true
  },
  {
    path: '/',
    component: ComponentCreator('/', '947'),
    routes: [
      {
        path: '/',
        component: ComponentCreator('/', '00a'),
        routes: [
          {
            path: '/',
            component: ComponentCreator('/', '2b6'),
            routes: [
              {
                path: '/caching/redis-caching-documentation-index',
                component: ComponentCreator('/caching/redis-caching-documentation-index', '6ce'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/caching/redis-caching-examples',
                component: ComponentCreator('/caching/redis-caching-examples', 'e40'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/caching/redis-caching-executive-summary',
                component: ComponentCreator('/caching/redis-caching-executive-summary', 'd5d'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/caching/redis-caching-guide',
                component: ComponentCreator('/caching/redis-caching-guide', '310'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/caching/redis-caching-implementation-complete',
                component: ComponentCreator('/caching/redis-caching-implementation-complete', '932'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/caching/redis-caching-overview',
                component: ComponentCreator('/caching/redis-caching-overview', 'a75'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/caching/redis-caching-quick-reference',
                component: ComponentCreator('/caching/redis-caching-quick-reference', 'a3b'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/caching/redis-caching-visual-reference',
                component: ComponentCreator('/caching/redis-caching-visual-reference', '40b'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/caching/redis-environment-setup',
                component: ComponentCreator('/caching/redis-environment-setup', '0a3'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/compliance/annex-b-functional-checklist',
                component: ComponentCreator('/compliance/annex-b-functional-checklist', '616'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/compliance/annex-c1-process-flow',
                component: ComponentCreator('/compliance/annex-c1-process-flow', '5b4'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/compliance/disaster-recovery',
                component: ComponentCreator('/compliance/disaster-recovery', '37a'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/operations/redis-deployment-test-results',
                component: ComponentCreator('/operations/redis-deployment-test-results', '1a3'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/operations/test-commands',
                component: ComponentCreator('/operations/test-commands', '687'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/technical/api-documentation',
                component: ComponentCreator('/technical/api-documentation', '4c9'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/technical/architecture-overview',
                component: ComponentCreator('/technical/architecture-overview', '1f4'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/technical/delivery-summary',
                component: ComponentCreator('/technical/delivery-summary', 'a25'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/technical/docker-guide',
                component: ComponentCreator('/technical/docker-guide', '684'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/technical/docker-implementation-complete',
                component: ComponentCreator('/technical/docker-implementation-complete', '5b5'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/technical/docker-quick-reference',
                component: ComponentCreator('/technical/docker-quick-reference', 'ed1'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/technical/erd-tenant-isolation',
                component: ComponentCreator('/technical/erd-tenant-isolation', '29d'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/technical/file-manifest',
                component: ComponentCreator('/technical/file-manifest', 'a92'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/technical/implementation-guide',
                component: ComponentCreator('/technical/implementation-guide', 'cb0'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/technical/installation-complete',
                component: ComponentCreator('/technical/installation-complete', '7df'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/technical/project-completion',
                component: ComponentCreator('/technical/project-completion', '120'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/technical/setup-guide',
                component: ComponentCreator('/technical/setup-guide', '7ea'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/technical/transaction-lifecycle',
                component: ComponentCreator('/technical/transaction-lifecycle', '480'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/',
                component: ComponentCreator('/', 'bea'),
                exact: true,
                sidebar: "docs"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
