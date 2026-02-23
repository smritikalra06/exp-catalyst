var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-sustainability-page.js
  var import_sustainability_page_exports = {};
  __export(import_sustainability_page_exports, {
    default: () => import_sustainability_page_default
  });

  // tools/importer/parsers/hero.js
  function parse(element, { document }) {
    if (!element.parentNode) return;
    let bgImageEl;
    let textSource;
    const isBgContainer = element.classList.contains("large-radius") && element.classList.contains("cmp-container-full-width");
    const isTextOverlay = element.classList.contains("overlap-predecessor");
    if (isBgContainer) {
      bgImageEl = element.querySelector(".cmp-container__bg-image");
      const nextSib = element.nextElementSibling;
      if (nextSib && nextSib.classList.contains("overlap-predecessor")) {
        textSource = nextSib;
      }
    } else if (isTextOverlay) {
      const prevSib = element.previousElementSibling;
      if (prevSib) {
        bgImageEl = prevSib.querySelector(".cmp-container__bg-image");
      }
      textSource = element;
    } else {
      bgImageEl = element.querySelector(".cmp-container__bg-image");
      textSource = element;
    }
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(" field:image "));
    if (bgImageEl) {
      imageCell.appendChild(bgImageEl);
    }
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(" field:text "));
    if (textSource) {
      const heading = textSource.querySelector("h1.cmp-title__text, h1, h2");
      if (heading) {
        textCell.appendChild(heading);
      }
      const textDivs = textSource.querySelectorAll(".cmp-text");
      textDivs.forEach((textDiv) => {
        const paragraphs = textDiv.querySelectorAll("p");
        paragraphs.forEach((p) => {
          textCell.appendChild(p);
        });
      });
    }
    const cells = [
      [imageCell],
      [textCell]
    ];
    const block = WebImporter.Blocks.createBlock(document, { name: "hero", cells });
    if (isBgContainer && textSource && textSource !== element) {
      textSource.remove();
    } else if (isTextOverlay) {
      const prevSib = element.previousElementSibling;
      if (prevSib && prevSib.classList.contains("large-radius") && prevSib.classList.contains("cmp-container-full-width")) {
        prevSib.remove();
      }
    }
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards.js
  function parse2(element, { document }) {
    const cardCells = element.querySelectorAll(".grid-row__col-with-4.grid-cell");
    if (!cardCells || cardCells.length === 0) return;
    const cells = [];
    cardCells.forEach((card) => {
      const labelCell = "card";
      const imageFragment = document.createDocumentFragment();
      imageFragment.appendChild(document.createComment(" field:image "));
      const img = card.querySelector(".cmp-image__image, .cmp-image img");
      if (img) {
        imageFragment.appendChild(img);
      }
      const textFragment = document.createDocumentFragment();
      textFragment.appendChild(document.createComment(" field:text "));
      const headerSpan = card.querySelector(".cmp-header__text");
      if (headerSpan) {
        const headingLevel = headerSpan.getAttribute("aria-level") || "2";
        const h = document.createElement(`h${headingLevel}`);
        h.textContent = headerSpan.textContent.trim();
        textFragment.appendChild(h);
      }
      const descPs = card.querySelectorAll(".cmp-text p");
      descPs.forEach((p) => {
        textFragment.appendChild(p);
      });
      const ctaLink = card.querySelector("a.cmp-button");
      if (ctaLink) {
        const link = document.createElement("a");
        link.href = ctaLink.getAttribute("href");
        const btnText = ctaLink.querySelector(".cmp-button__text");
        link.textContent = btnText ? btnText.textContent.trim() : ctaLink.textContent.trim();
        const p = document.createElement("p");
        p.appendChild(link);
        textFragment.appendChild(p);
      }
      cells.push([labelCell, imageFragment, textFragment]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns.js
  function parse3(element, { document }) {
    const allCols = Array.from(element.querySelectorAll(":scope > .grid-cell"));
    const contentCols = allCols.filter((col) => col.textContent.trim() !== "");
    if (contentCols.length === 0) return;
    const row = contentCols.map((col) => {
      const frag = document.createDocumentFragment();
      const videoPanel = col.querySelector(".cmp-video__panel");
      if (videoPanel) {
        const videoImg = videoPanel.querySelector(".cmp-image__image, img");
        if (videoImg) {
          frag.appendChild(videoImg);
        }
        const videoTitle = videoPanel.querySelector('[role="heading"]');
        if (videoTitle) {
          const h = document.createElement("h2");
          h.textContent = videoTitle.textContent.trim();
          frag.appendChild(h);
        }
        const videoDesc = videoPanel.querySelector("p");
        if (videoDesc) {
          frag.appendChild(videoDesc);
        }
        return frag;
      }
      Array.from(col.children).forEach((child) => {
        frag.appendChild(child);
      });
      return frag;
    });
    const cells = [row];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/abbvie-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      element.querySelectorAll("[data-cmp-data-layer]").forEach((el) => {
        el.removeAttribute("data-cmp-data-layer");
      });
      element.querySelectorAll("[data-cmp-lazy]").forEach((el) => {
        el.removeAttribute("data-cmp-lazy");
        el.removeAttribute("data-cmp-lazythreshold");
        el.removeAttribute("data-cmp-src");
      });
      element.querySelectorAll("[data-cmp-clickable]").forEach((el) => {
        el.removeAttribute("data-cmp-clickable");
      });
      element.querySelectorAll("[data-cmp-hook-image]").forEach((el) => {
        el.removeAttribute("data-cmp-hook-image");
      });
      element.querySelectorAll("[itemscope]").forEach((el) => {
        el.removeAttribute("itemscope");
        el.removeAttribute("itemtype");
      });
      element.querySelectorAll("[itemprop]").forEach((el) => {
        el.removeAttribute("itemprop");
      });
      WebImporter.DOMUtils.remove(element, ['meta[itemprop="caption"]']);
      element.querySelectorAll("[data-warn-on-departure]").forEach((el) => {
        el.removeAttribute("data-warn-on-departure");
      });
      element.querySelectorAll("[data-asset]").forEach((el) => {
        el.removeAttribute("data-asset");
        el.removeAttribute("data-title");
      });
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header",
        "footer",
        "noscript",
        "link",
        "iframe"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".cmp-video__container.hide-visually",
        ".cmp-video__text-content-outside"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".separator"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("data-priority");
        el.removeAttribute("data-abbvie-cmp");
        el.removeAttribute("data-abbvie-cmp-video-playbtn");
        el.removeAttribute("data-abbvie-cmp-video-videopanel");
        el.removeAttribute("data-abbvie-cmp-video-imgpanel");
        el.removeAttribute("data-abbvie-cmp-video-url-param");
      });
    }
  }

  // tools/importer/transformers/abbvie-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
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
  function transform2(hookName, element, payload) {
    if (hookName !== TransformHook2.afterTransform) return;
    const { template } = payload || {};
    if (!template || !template.sections || template.sections.length < 2) return;
    const { document } = element.ownerDocument ? { document: element.ownerDocument } : { document: element };
    const doc = element.ownerDocument || element;
    const sections = template.sections;
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      const sectionEl = findSectionElement(element, section.selector);
      if (!sectionEl) continue;
      if (section.style) {
        const sectionMetadata = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: [["style", section.style]]
        });
        if (sectionEl.parentNode) {
          sectionEl.parentNode.insertBefore(sectionMetadata, sectionEl.nextSibling);
        }
      }
      if (i > 0 && sectionEl.parentNode) {
        const hr = doc.createElement("hr");
        sectionEl.parentNode.insertBefore(hr, sectionEl);
      }
    }
  }

  // tools/importer/import-sustainability-page.js
  var PAGE_TEMPLATE = {
    name: "sustainability-page",
    urls: [
      "https://www.abbvie.com/sustainability.html"
    ],
    description: "Sustainability landing page with overview of AbbVie ESG initiatives",
    blocks: [
      {
        name: "hero",
        instances: [
          ".container.large-radius.cmp-container-full-width.height-tall",
          ".container.overlap-predecessor"
        ]
      },
      {
        name: "cards",
        instances: [
          ".grid.cmp-grid-custom:first-of-type .grid-row"
        ]
      },
      {
        name: "columns",
        instances: [
          ".grid.cmp-grid-custom:nth-of-type(2) .grid-row",
          "#container-f223873380 .grid-row",
          "#container-dabaa83ad0 .grid-row"
        ]
      }
    ],
    sections: [
      {
        id: "section-1-hero",
        name: "Hero Section",
        selector: [
          ".container.large-radius.cmp-container-full-width.height-tall",
          ".container.overlap-predecessor"
        ],
        style: null,
        blocks: ["hero"],
        defaultContent: []
      },
      {
        id: "section-2-cards",
        name: "Initiative Cards Section",
        selector: [
          ".teaser.teaser__internal-link",
          ".grid.cmp-grid-custom:first-of-type"
        ],
        style: null,
        blocks: ["cards"],
        defaultContent: [
          ".cmp-teaser__title",
          ".cmp-teaser__description"
        ]
      },
      {
        id: "section-3-stats",
        name: "Impact Stats Section",
        selector: ".grid.cmp-grid-custom:nth-of-type(2)",
        style: null,
        blocks: ["columns"],
        defaultContent: [
          "#title-3e00a156e8 .cmp-title__text",
          "#text-a73ee4a8c1 .cmp-text"
        ]
      },
      {
        id: "section-4-video-story",
        name: "Video Story Section",
        selector: "#container-f223873380",
        style: null,
        blocks: ["columns"],
        defaultContent: []
      },
      {
        id: "section-5-principles",
        name: "Principles CTA Section",
        selector: "#container-dabaa83ad0",
        style: "light-blue",
        blocks: ["columns"],
        defaultContent: []
      }
    ]
  };
  var parsers = {
    "hero": parse,
    "cards": parse2,
    "columns": parse3
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_sustainability_page_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_sustainability_page_exports);
})();
