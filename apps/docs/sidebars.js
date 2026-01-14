/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    {
      type: 'doc',
      id: 'index',
      label: '🏠 Home'
    },
    {
      type: 'category',
      label: 'Compliance (BIR)',
      collapsed: false,
      items: [
        'compliance/annex-c1-process-flow',
        'compliance/annex-b-functional-checklist',
        'compliance/disaster-recovery'
      ]
    },
    {
      type: 'category',
      label: 'Technical',
      collapsed: false,
      items: [
        'technical/architecture-overview',
        'technical/api-documentation',
        'technical/erd-tenant-isolation',
        'technical/transaction-lifecycle',
        'technical/setup-guide',
        'technical/implementation-guide',
        'technical/delivery-summary',
        'technical/file-manifest',
        'technical/docker-guide',
        'technical/docker-quick-reference',
        'technical/docker-implementation-complete',
        'technical/installation-complete',
        'technical/project-completion'
      ]
    },
    {
      type: 'category',
      label: 'Caching & Performance',
      collapsed: false,
      items: [
        'caching/redis-caching-overview',
        'caching/redis-caching-executive-summary',
        'caching/redis-caching-guide',
        'caching/redis-caching-quick-reference',
        'caching/redis-caching-visual-reference',
        'caching/redis-caching-examples',
        'caching/redis-caching-implementation-complete',
        'caching/redis-caching-documentation-index',
        'caching/redis-environment-setup'
      ]
    },
    {
      type: 'category',
      label: 'Operations & Testing',
      collapsed: false,
      items: [
        'operations/redis-deployment-test-results',
        'operations/test-commands'
      ]
    }
  ]
};

module.exports = sidebars;
