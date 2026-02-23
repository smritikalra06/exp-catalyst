/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards block (container block).
 * Base: cards. Source: https://www.abbvie.com/sustainability.html. Generated: 2026-02-23
 *
 * Block library structure (3 columns per row):
 *   Row 1: block name "cards"
 *   Row N: [card label, image cell, text cell]
 *   Each row represents a single card.
 *
 * UE Model (card item):
 *   - image (reference) → Column 2 with <!-- field:image --> hint
 *   - text (richtext) → Column 3 with <!-- field:text --> hint
 *
 * Source DOM (.grid.cmp-grid-custom:first-of-type .grid-row):
 *   Each .grid-row__col-with-4.grid-cell is a card containing:
 *     - .image .cmp-image__image (card image)
 *     - .header .cmp-header__text (card heading, role="heading" aria-level="2")
 *     - .text .cmp-text p (card description)
 *     - .button a.cmp-button (CTA link with .cmp-button__text)
 */
export default function parse(element, { document }) {
  // Find all card cells in the grid row
  const cardCells = element.querySelectorAll('.grid-row__col-with-4.grid-cell');
  if (!cardCells || cardCells.length === 0) return;

  const cells = [];

  cardCells.forEach((card) => {
    // Cell 1: card item type label (no field hint needed)
    const labelCell = 'card';

    // Cell 2: image with field hint
    const imageFragment = document.createDocumentFragment();
    imageFragment.appendChild(document.createComment(' field:image '));
    const img = card.querySelector('.cmp-image__image, .cmp-image img');
    if (img) {
      imageFragment.appendChild(img);
    }

    // Cell 3: text content (heading + description + CTA) with field hint
    const textFragment = document.createDocumentFragment();
    textFragment.appendChild(document.createComment(' field:text '));

    // Extract heading from .cmp-header__text
    const headerSpan = card.querySelector('.cmp-header__text');
    if (headerSpan) {
      const headingLevel = headerSpan.getAttribute('aria-level') || '2';
      const h = document.createElement(`h${headingLevel}`);
      h.textContent = headerSpan.textContent.trim();
      textFragment.appendChild(h);
    }

    // Extract description from .cmp-text p
    const descPs = card.querySelectorAll('.cmp-text p');
    descPs.forEach((p) => {
      textFragment.appendChild(p);
    });

    // Extract CTA link from .cmp-button
    const ctaLink = card.querySelector('a.cmp-button');
    if (ctaLink) {
      // Create a clean link with just the text
      const link = document.createElement('a');
      link.href = ctaLink.getAttribute('href');
      const btnText = ctaLink.querySelector('.cmp-button__text');
      link.textContent = btnText ? btnText.textContent.trim() : ctaLink.textContent.trim();
      const p = document.createElement('p');
      p.appendChild(link);
      textFragment.appendChild(p);
    }

    cells.push([labelCell, imageFragment, textFragment]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
