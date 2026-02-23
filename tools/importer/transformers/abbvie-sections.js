/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: AbbVie section breaks and section-metadata.
 * Adds <hr> section breaks and section-metadata blocks based on template sections.
 * Runs in afterTransform only, after block parsing.
 *
 * Sections from page-templates.json:
 * 1. section-1-hero (no style)
 * 2. section-2-cards (no style)
 * 3. section-3-stats (no style)
 * 4. section-4-video-story (no style)
 * 5. section-5-principles (style: "light-blue")
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

/**
 * Find the first element matching a selector or array of selectors.
 */
function findSectionElement(element, selector) {
  if (Array.isArray(selector)) {
    for (const sel of selector) {
      const found = element.querySelector(sel);
      if (found) return found;
    }
    return null;
  }
  return element.querySelector(selector);
}

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.afterTransform) return;

  const { template } = payload || {};
  if (!template || !template.sections || template.sections.length < 2) return;

  const { document } = element.ownerDocument ? { document: element.ownerDocument } : { document: element };
  const doc = element.ownerDocument || element;

  const sections = template.sections;

  // Process sections in reverse order to avoid shifting positions
  for (let i = sections.length - 1; i >= 0; i--) {
    const section = sections[i];
    const sectionEl = findSectionElement(element, section.selector);

    if (!sectionEl) continue;

    // Add section-metadata block if section has a style
    if (section.style) {
      const sectionMetadata = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: [['style', section.style]],
      });

      // Find the last element that belongs to this section
      // Insert section-metadata after the section's content
      if (sectionEl.parentNode) {
        sectionEl.parentNode.insertBefore(sectionMetadata, sectionEl.nextSibling);
      }
    }

    // Add <hr> section break before this section (except the first section)
    if (i > 0 && sectionEl.parentNode) {
      const hr = doc.createElement('hr');
      sectionEl.parentNode.insertBefore(hr, sectionEl);
    }
  }
}
