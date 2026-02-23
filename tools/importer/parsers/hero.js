/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero block.
 * Base: hero. Source: https://www.abbvie.com/sustainability.html. Generated: 2026-02-23
 *
 * Block library structure (1 column, 3 rows):
 *   Row 1: block name "hero"
 *   Row 2: background image
 *   Row 3: text content (heading, subheading, paragraphs)
 *
 * UE Model fields:
 *   - image (reference) → Row 2 with <!-- field:image --> hint
 *   - imageAlt (text, collapsed into image) → NO hint (collapsed field)
 *   - text (richtext) → Row 3 with <!-- field:text --> hint
 *
 * Source DOM:
 *   Element 1 (.container.large-radius.cmp-container-full-width.height-tall):
 *     - .cmp-container__bg-image (img with hero background)
 *   Element 2 (.container.overlap-predecessor):
 *     - h1.cmp-title__text (heading)
 *     - .cmp-text p (paragraphs)
 */
export default function parse(element, { document }) {
  // If element was already consumed by a prior parse call, skip
  if (!element.parentNode) return;

  let bgImageEl;
  let textSource;

  // Determine which element we received
  const isBgContainer = element.classList.contains('large-radius')
    && element.classList.contains('cmp-container-full-width');
  const isTextOverlay = element.classList.contains('overlap-predecessor');

  if (isBgContainer) {
    bgImageEl = element.querySelector('.cmp-container__bg-image');
    // Text is in the next sibling (overlap-predecessor)
    const nextSib = element.nextElementSibling;
    if (nextSib && nextSib.classList.contains('overlap-predecessor')) {
      textSource = nextSib;
    }
  } else if (isTextOverlay) {
    // Background image is in the previous sibling
    const prevSib = element.previousElementSibling;
    if (prevSib) {
      bgImageEl = prevSib.querySelector('.cmp-container__bg-image');
    }
    textSource = element;
  } else {
    // Fallback: try to find content within the element itself
    bgImageEl = element.querySelector('.cmp-container__bg-image');
    textSource = element;
  }

  // Build Row 1: image with field hint
  const imageCell = document.createDocumentFragment();
  imageCell.appendChild(document.createComment(' field:image '));
  if (bgImageEl) {
    imageCell.appendChild(bgImageEl);
  }

  // Build Row 2: text content with field hint
  const textCell = document.createDocumentFragment();
  textCell.appendChild(document.createComment(' field:text '));

  if (textSource) {
    // Extract heading (h1.cmp-title__text)
    const heading = textSource.querySelector('h1.cmp-title__text, h1, h2');
    if (heading) {
      textCell.appendChild(heading);
    }

    // Extract paragraphs from .cmp-text elements
    const textDivs = textSource.querySelectorAll('.cmp-text');
    textDivs.forEach((textDiv) => {
      const paragraphs = textDiv.querySelectorAll('p');
      paragraphs.forEach((p) => {
        textCell.appendChild(p);
      });
    });
  }

  const cells = [
    [imageCell],
    [textCell],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });

  // Remove the sibling element that was consumed
  if (isBgContainer && textSource && textSource !== element) {
    textSource.remove();
  } else if (isTextOverlay) {
    const prevSib = element.previousElementSibling;
    if (prevSib && prevSib.classList.contains('large-radius')
      && prevSib.classList.contains('cmp-container-full-width')) {
      prevSib.remove();
    }
  }

  element.replaceWith(block);
}
