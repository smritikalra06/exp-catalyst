/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns block.
 * Base: columns. Source: https://www.abbvie.com/sustainability.html. Generated: 2026-02-23
 *
 * Block library structure (multiple columns, multiple rows):
 *   Row 1: block name "columns"
 *   Row N: [cell1, cell2, ...]
 *   Each cell contains default content (text, images, links).
 *
 * UE Model: columns (number), rows (number) - structural fields only.
 * Special rule: NO field comments for Columns blocks.
 *
 * Source DOM instances:
 *   1. Stats: .grid.cmp-grid-custom:nth-of-type(2) .grid-row
 *      - col-with-1 (spacer), col-with-4 (intro), col-with-1 (spacer),
 *        col-with-3 (stats col 1), col-with-3 (stats col 2)
 *   2. Video: #container-f223873380 .grid-row
 *      - col-with-6 (video), col-with-1 (spacer), col-with-5 (heading+text)
 *   3. Principles: #container-dabaa83ad0 .grid-row
 *      - col-with-6 (image), col-with-1 (spacer), col-with-5 (heading+text+CTA)
 */
export default function parse(element, { document }) {
  const allCols = Array.from(element.querySelectorAll(':scope > .grid-cell'));

  // Filter out empty spacer columns (typically col-with-1 with no content)
  const contentCols = allCols.filter((col) => col.textContent.trim() !== '');

  if (contentCols.length === 0) return;

  // Build a single row with all content columns
  const row = contentCols.map((col) => {
    const frag = document.createDocumentFragment();

    // For video columns, extract the thumbnail image and video info
    const videoPanel = col.querySelector('.cmp-video__panel');
    if (videoPanel) {
      const videoImg = videoPanel.querySelector('.cmp-image__image, img');
      if (videoImg) {
        frag.appendChild(videoImg);
      }
      const videoTitle = videoPanel.querySelector('[role="heading"]');
      if (videoTitle) {
        const h = document.createElement('h2');
        h.textContent = videoTitle.textContent.trim();
        frag.appendChild(h);
      }
      const videoDesc = videoPanel.querySelector('p');
      if (videoDesc) {
        frag.appendChild(videoDesc);
      }
      return frag;
    }

    // For regular columns, move all child content
    Array.from(col.children).forEach((child) => {
      frag.appendChild(child);
    });
    return frag;
  });

  const cells = [row];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells });
  element.replaceWith(block);
}
