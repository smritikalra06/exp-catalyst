/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: AbbVie site-wide cleanup.
 * Removes non-authorable content and cleans up DOM attributes.
 * Selectors verified against captured DOM from https://www.abbvie.com/sustainability.html
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove tracking data-layer attributes (found on .cmp-text, .cmp-teaser, .cmp-button, .cmp-video)
    element.querySelectorAll('[data-cmp-data-layer]').forEach((el) => {
      el.removeAttribute('data-cmp-data-layer');
    });

    // Remove lazy-loading attributes (found on .cmp-image elements)
    element.querySelectorAll('[data-cmp-lazy]').forEach((el) => {
      el.removeAttribute('data-cmp-lazy');
      el.removeAttribute('data-cmp-lazythreshold');
      el.removeAttribute('data-cmp-src');
    });

    // Remove data-cmp-clickable from buttons
    element.querySelectorAll('[data-cmp-clickable]').forEach((el) => {
      el.removeAttribute('data-cmp-clickable');
    });

    // Remove data-cmp-hook-image from images
    element.querySelectorAll('[data-cmp-hook-image]').forEach((el) => {
      el.removeAttribute('data-cmp-hook-image');
    });

    // Remove schema.org attributes (found on .cmp-image containers)
    element.querySelectorAll('[itemscope]').forEach((el) => {
      el.removeAttribute('itemscope');
      el.removeAttribute('itemtype');
    });
    element.querySelectorAll('[itemprop]').forEach((el) => {
      el.removeAttribute('itemprop');
    });

    // Remove meta elements inside image containers (caption metadata)
    WebImporter.DOMUtils.remove(element, ['meta[itemprop="caption"]']);

    // Remove data-warn-on-departure from links
    element.querySelectorAll('[data-warn-on-departure]').forEach((el) => {
      el.removeAttribute('data-warn-on-departure');
    });

    // Remove data-asset and data-title from image containers
    element.querySelectorAll('[data-asset]').forEach((el) => {
      el.removeAttribute('data-asset');
      el.removeAttribute('data-title');
    });
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove non-authorable site chrome
    WebImporter.DOMUtils.remove(element, [
      'header',
      'footer',
      'noscript',
      'link',
      'iframe',
    ]);

    // Remove video container internals that aren't content
    // (found inside .cmp-video: hidden video wrapper, outside text content)
    WebImporter.DOMUtils.remove(element, [
      '.cmp-video__container.hide-visually',
      '.cmp-video__text-content-outside',
    ]);

    // Remove visual-only separators (found as .separator in captured DOM)
    WebImporter.DOMUtils.remove(element, [
      '.separator',
    ]);

    // Clean up remaining data attributes on all elements
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('data-priority');
      el.removeAttribute('data-abbvie-cmp');
      el.removeAttribute('data-abbvie-cmp-video-playbtn');
      el.removeAttribute('data-abbvie-cmp-video-videopanel');
      el.removeAttribute('data-abbvie-cmp-video-imgpanel');
      el.removeAttribute('data-abbvie-cmp-video-url-param');
    });
  }
}
