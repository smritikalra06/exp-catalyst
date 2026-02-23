/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroParser from './parsers/hero.js';
import cardsParser from './parsers/cards.js';
import columnsParser from './parsers/columns.js';

// TRANSFORMER IMPORTS
import abbvieCleanupTransformer from './transformers/abbvie-cleanup.js';
import abbvieSectionsTransformer from './transformers/abbvie-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'sustainability-page',
  urls: [
    'https://www.abbvie.com/sustainability.html'
  ],
  description: 'Sustainability landing page with overview of AbbVie ESG initiatives',
  blocks: [
    {
      name: 'hero',
      instances: [
        '.container.large-radius.cmp-container-full-width.height-tall',
        '.container.overlap-predecessor'
      ]
    },
    {
      name: 'cards',
      instances: [
        '.grid.cmp-grid-custom:first-of-type .grid-row'
      ]
    },
    {
      name: 'columns',
      instances: [
        '.grid.cmp-grid-custom:nth-of-type(2) .grid-row',
        '#container-f223873380 .grid-row',
        '#container-dabaa83ad0 .grid-row'
      ]
    }
  ],
  sections: [
    {
      id: 'section-1-hero',
      name: 'Hero Section',
      selector: [
        '.container.large-radius.cmp-container-full-width.height-tall',
        '.container.overlap-predecessor'
      ],
      style: null,
      blocks: ['hero'],
      defaultContent: []
    },
    {
      id: 'section-2-cards',
      name: 'Initiative Cards Section',
      selector: [
        '.teaser.teaser__internal-link',
        '.grid.cmp-grid-custom:first-of-type'
      ],
      style: null,
      blocks: ['cards'],
      defaultContent: [
        '.cmp-teaser__title',
        '.cmp-teaser__description'
      ]
    },
    {
      id: 'section-3-stats',
      name: 'Impact Stats Section',
      selector: '.grid.cmp-grid-custom:nth-of-type(2)',
      style: null,
      blocks: ['columns'],
      defaultContent: [
        '#title-3e00a156e8 .cmp-title__text',
        '#text-a73ee4a8c1 .cmp-text'
      ]
    },
    {
      id: 'section-4-video-story',
      name: 'Video Story Section',
      selector: '#container-f223873380',
      style: null,
      blocks: ['columns'],
      defaultContent: []
    },
    {
      id: 'section-5-principles',
      name: 'Principles CTA Section',
      selector: '#container-dabaa83ad0',
      style: 'light-blue',
      blocks: ['columns'],
      defaultContent: []
    }
  ]
};

// PARSER REGISTRY
const parsers = {
  'hero': heroParser,
  'cards': cardsParser,
  'columns': columnsParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  abbvieCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [abbvieSectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;

    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '')
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
