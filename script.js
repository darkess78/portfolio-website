const yearNode = document.getElementById("year");
if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

const themeFiles = {
  default: "styles.css",
  aurora: "styles-aurora.css",
  carbon: "styles-carbon.css",
  night: "styles-night.css",
  paper: "styles-paper.css",
  lagoon: "styles-lagoon.css",
  ember: "styles-ember.css",
  mono: "styles-mono.css",
  meadow: "styles-meadow.css",
};
const themeOrder = [
  "default",
  "aurora",
  "carbon",
  "night",
  "paper",
  "lagoon",
  "ember",
  "mono",
  "meadow",
];
const themeLabels = {
  default: "Default",
  aurora: "Aurora",
  carbon: "Carbon",
  night: "Night",
  paper: "Paper",
  lagoon: "Lagoon",
  ember: "Ember",
  mono: "Mono",
  meadow: "Meadow",
};
const themeStorageKey = "portfolio-theme";
const themeParamKey = "theme";
const themeStylesheet = document.querySelector("[data-theme-stylesheet]");
const themeHrefMeta = (() => {
  const href = themeStylesheet?.getAttribute("href") || "";
  const match = href.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/);
  const path = match?.[1] || href;
  const search = match?.[2] || "";
  const hash = match?.[3] || "";
  const lastSlashIndex = path.lastIndexOf("/");
  return {
    directory: lastSlashIndex >= 0 ? path.slice(0, lastSlashIndex + 1) : "",
    suffix: `${search}${hash}`,
  };
})();
const themeToggleButton = document.querySelector("[data-theme-toggle]");
const themeMenu = document.querySelector("[data-theme-menu]");
const themeMenuWrap = document.querySelector(".theme-menu-wrap");
const a11yStorageKey = "portfolio-a11y";
const a11yToggleButton = document.querySelector("[data-a11y-toggle]");
const a11yMenu = document.querySelector("[data-a11y-menu]");
const a11yMenuWrap = document.querySelector(".a11y-menu-wrap");
const a11yStatus = document.querySelector("[data-a11y-status]");
const searchParams = new URLSearchParams(window.location.search);
const a11yDefaultSettings = Object.freeze({
  largeText: false,
  highContrast: false,
  reduceMotion: false,
  underlineLinks: false,
});
const a11yOptionMeta = [
  {
    key: "largeText",
    label: "Larger Text",
    className: "a11y-large-text",
    help: "Increase base text size across the site.",
  },
  {
    key: "highContrast",
    label: "High Contrast",
    className: "a11y-high-contrast",
    help: "Use stronger contrast and simplified backgrounds.",
  },
  {
    key: "reduceMotion",
    label: "Reduce Motion",
    className: "a11y-reduce-motion",
    help: "Minimize animations and transitions.",
  },
  {
    key: "underlineLinks",
    label: "Underline Links",
    className: "a11y-underline-links",
    help: "Always underline links for clarity.",
  },
];

function isSupportedTheme(themeName) {
  return Object.prototype.hasOwnProperty.call(themeFiles, themeName);
}

function readStoredTheme() {
  try {
    return localStorage.getItem(themeStorageKey);
  } catch {
    return null;
  }
}

function writeStoredTheme(themeName) {
  try {
    localStorage.setItem(themeStorageKey, themeName);
  } catch {
    // Ignore storage failures.
  }
}

function normalizeA11ySettings(rawSettings) {
  const normalized = { ...a11yDefaultSettings };
  if (!rawSettings || typeof rawSettings !== "object") {
    return normalized;
  }

  for (const option of a11yOptionMeta) {
    normalized[option.key] = Boolean(rawSettings[option.key]);
  }
  return normalized;
}

function readA11ySettings() {
  try {
    const raw = localStorage.getItem(a11yStorageKey);
    if (!raw) {
      return { ...a11yDefaultSettings };
    }
    return normalizeA11ySettings(JSON.parse(raw));
  } catch {
    return { ...a11yDefaultSettings };
  }
}

function writeA11ySettings(settings) {
  try {
    localStorage.setItem(a11yStorageKey, JSON.stringify(settings));
  } catch {
    // Ignore storage failures.
  }
}

function applyA11ySettings(settings) {
  const root = document.documentElement;
  for (const option of a11yOptionMeta) {
    root.classList.toggle(option.className, Boolean(settings[option.key]));
  }
}

function announceA11yStatus(message) {
  if (!a11yStatus) {
    return;
  }
  a11yStatus.textContent = "";
  window.setTimeout(() => {
    a11yStatus.textContent = message;
  }, 20);
}

function resolveActiveTheme() {
  const queryTheme = searchParams.get(themeParamKey);
  if (queryTheme && isSupportedTheme(queryTheme)) {
    writeStoredTheme(queryTheme);
    return queryTheme;
  }

  const storedTheme = readStoredTheme();
  if (storedTheme && isSupportedTheme(storedTheme)) {
    return storedTheme;
  }

  return "default";
}

function getThemeStylesheetHref(themeName) {
  const themeFile = themeFiles[themeName] || themeFiles.default;
  return `${themeHrefMeta.directory}${themeFile}${themeHrefMeta.suffix}`;
}

let activeTheme = resolveActiveTheme();
if (themeStylesheet) {
  themeStylesheet.setAttribute("href", getThemeStylesheetHref(activeTheme));
}
let activeA11ySettings = readA11ySettings();
applyA11ySettings(activeA11ySettings);

function buildThemeHref(themeName, baseHref) {
  return themeName === "default"
    ? baseHref
    : `${baseHref}?${themeParamKey}=${encodeURIComponent(themeName)}`;
}

function buildCurrentPageThemeUrl(themeName) {
  const url = new URL(window.location.href);
  if (themeName === "default") {
    url.searchParams.delete(themeParamKey);
  } else {
    url.searchParams.set(themeParamKey, themeName);
  }
  return `${url.pathname}${url.search}${url.hash}`;
}

function updateCurrentPageThemeUrl(themeName) {
  const nextUrl = buildCurrentPageThemeUrl(themeName);
  if (
    window.history &&
    typeof window.history.replaceState === "function" &&
    nextUrl !== `${window.location.pathname}${window.location.search}${window.location.hash}`
  ) {
    window.history.replaceState(null, "", nextUrl);
  }
}

// Keep active nav styling and internal page links in sync with the current theme.
function syncThemePageLinks(themeName) {
  const currentFile = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll("nav a");
  for (const link of navLinks) {
    const href = link.getAttribute("href");
    if (!href) {
      continue;
    }

    const baseHref = href.split("?")[0];
    if (baseHref === currentFile) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }

    link.setAttribute("href", buildThemeHref(themeName, baseHref));
  }

  const internalPageLinks = document.querySelectorAll("a[href]");
  for (const link of internalPageLinks) {
    const href = link.getAttribute("href");
    if (
      !href ||
      href.startsWith("http://") ||
      href.startsWith("https://") ||
      href.startsWith("mailto:") ||
      href.startsWith("#")
    ) {
      continue;
    }

    const baseHref = href.split("?")[0];
    if (!baseHref.endsWith(".html")) {
      continue;
    }

    link.setAttribute("href", buildThemeHref(themeName, baseHref));
  }
}

function updateThemeToggleButton(button, currentTheme) {
  const currentLabel = themeLabels[currentTheme] || currentTheme;
  button.setAttribute(
    "aria-label",
    `Open theme picker. Current theme: ${currentLabel}.`,
  );
  button.setAttribute(
    "title",
    `Theme picker: switch visual styles. Current: ${currentLabel}.`,
  );
}

if (themeToggleButton && themeMenu && themeMenuWrap) {
  function renderThemeMenu(currentTheme) {
    themeMenu.innerHTML = "";
    for (const themeName of themeOrder) {
      if (!isSupportedTheme(themeName)) {
        continue;
      }

      const isActive = themeName === currentTheme;
      const option = document.createElement("button");
      option.type = "button";
      option.className = "theme-option";
      option.setAttribute("role", "menuitemradio");
      option.setAttribute("aria-checked", isActive ? "true" : "false");
      option.setAttribute("data-theme-option", themeName);
      option.setAttribute(
        "title",
        isActive
          ? `${themeLabels[themeName]} theme (current)`
          : `Apply ${themeLabels[themeName]} theme`,
      );
      option.innerHTML = `<span class="theme-option-dot" aria-hidden="true">${isActive ? "●" : "○"}</span><span>${themeLabels[themeName]}</span>`;
      themeMenu.appendChild(option);
    }
  }

  function closeThemeMenu({ restoreFocus = false } = {}) {
    if (themeMenu.hidden) {
      return;
    }
    themeMenu.hidden = true;
    themeToggleButton.setAttribute("aria-expanded", "false");
    if (restoreFocus) {
      themeToggleButton.focus();
    }
  }

  function openThemeMenu() {
    themeMenu.hidden = false;
    themeToggleButton.setAttribute("aria-expanded", "true");
    const firstOption = themeMenu.querySelector(".theme-option");
    if (firstOption) {
      firstOption.focus();
    }
  }

  renderThemeMenu(activeTheme);
  updateThemeToggleButton(themeToggleButton, activeTheme);
  themeToggleButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (a11yMenu && !a11yMenu.hidden) {
      a11yMenu.hidden = true;
      if (a11yToggleButton) {
        a11yToggleButton.setAttribute("aria-expanded", "false");
      }
    }
    if (themeMenu.hidden) {
      openThemeMenu();
    } else {
      closeThemeMenu();
    }
  });

  themeMenu.addEventListener("click", (event) => {
    const selectedOption = event.target.closest("[data-theme-option]");
    if (!selectedOption) {
      return;
    }

    const selectedTheme = selectedOption.getAttribute("data-theme-option");
    if (!selectedTheme || !isSupportedTheme(selectedTheme)) {
      return;
    }

    activeTheme = selectedTheme;
    writeStoredTheme(activeTheme);
    if (themeStylesheet) {
      themeStylesheet.setAttribute("href", getThemeStylesheetHref(activeTheme));
    }
    renderThemeMenu(activeTheme);
    updateThemeToggleButton(themeToggleButton, activeTheme);
    syncThemePageLinks(activeTheme);
    updateCurrentPageThemeUrl(activeTheme);
    closeThemeMenu({ restoreFocus: true });
  });

  document.addEventListener("click", (event) => {
    if (themeMenu.hidden) {
      return;
    }
    if (themeMenuWrap.contains(event.target)) {
      return;
    }
    closeThemeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (themeMenu.hidden) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeThemeMenu({ restoreFocus: true });
    }
  });
}

function updateA11yToggleButton(button, settings) {
  const enabledCount = a11yOptionMeta.filter((option) =>
    Boolean(settings[option.key]),
  ).length;
  button.setAttribute(
    "aria-label",
    `Open accessibility options. ${enabledCount} setting${enabledCount === 1 ? "" : "s"} enabled.`,
  );
  button.setAttribute(
    "title",
    `Accessibility options: ${enabledCount} enabled. Use to change readability and motion settings.`,
  );
}

if (a11yToggleButton && a11yMenu && a11yMenuWrap) {
  function renderA11yMenu(settings) {
    a11yMenu.innerHTML = "";
    for (const optionMeta of a11yOptionMeta) {
      const isEnabled = Boolean(settings[optionMeta.key]);
      const option = document.createElement("button");
      option.type = "button";
      option.className = "a11y-option";
      option.setAttribute("role", "menuitemcheckbox");
      option.setAttribute("aria-checked", isEnabled ? "true" : "false");
      option.setAttribute("data-a11y-option", optionMeta.key);
      option.setAttribute(
        "title",
        `${optionMeta.label}: ${isEnabled ? "On" : "Off"}. ${optionMeta.help}`,
      );
      option.innerHTML = `<span class="a11y-option-dot" aria-hidden="true">${isEnabled ? "✓" : " "}</span><span>${optionMeta.label}</span>`;
      a11yMenu.appendChild(option);
    }
  }

  function closeA11yMenu({ restoreFocus = false } = {}) {
    if (a11yMenu.hidden) {
      return;
    }
    a11yMenu.hidden = true;
    a11yToggleButton.setAttribute("aria-expanded", "false");
    if (restoreFocus) {
      a11yToggleButton.focus();
    }
  }

  function openA11yMenu() {
    a11yMenu.hidden = false;
    a11yToggleButton.setAttribute("aria-expanded", "true");
    const firstEnabled = a11yMenu.querySelector('.a11y-option[aria-checked="true"]');
    const firstOption = a11yMenu.querySelector(".a11y-option");
    const target = firstEnabled || firstOption;
    if (target) {
      target.focus();
    }
  }

  renderA11yMenu(activeA11ySettings);
  updateA11yToggleButton(a11yToggleButton, activeA11ySettings);
  a11yToggleButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (themeMenu && !themeMenu.hidden) {
      themeMenu.hidden = true;
      if (themeToggleButton) {
        themeToggleButton.setAttribute("aria-expanded", "false");
      }
    }
    if (a11yMenu.hidden) {
      openA11yMenu();
    } else {
      closeA11yMenu();
    }
  });

  a11yMenu.addEventListener("click", (event) => {
    const selectedOption = event.target.closest("[data-a11y-option]");
    if (!selectedOption) {
      return;
    }

    const optionKey = selectedOption.getAttribute("data-a11y-option");
    const optionMeta = a11yOptionMeta.find((option) => option.key === optionKey);
    if (!optionMeta) {
      return;
    }

    activeA11ySettings = {
      ...activeA11ySettings,
      [optionMeta.key]: !activeA11ySettings[optionMeta.key],
    };
    applyA11ySettings(activeA11ySettings);
    writeA11ySettings(activeA11ySettings);
    renderA11yMenu(activeA11ySettings);
    updateA11yToggleButton(a11yToggleButton, activeA11ySettings);
    announceA11yStatus(
      `${optionMeta.label} ${
        activeA11ySettings[optionMeta.key] ? "enabled" : "disabled"
      }.`,
    );
  });

  document.addEventListener("click", (event) => {
    if (a11yMenu.hidden) {
      return;
    }
    if (a11yMenuWrap.contains(event.target)) {
      return;
    }
    closeA11yMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (a11yMenu.hidden) {
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeA11yMenu({ restoreFocus: true });
    }
  });
}

syncThemePageLinks(activeTheme);

// Project modal logic is only used on projects.html.
const projectCards = document.querySelectorAll("[data-project-card]");
const projectOverlay = document.querySelector("[data-project-overlay]");
const projectModal = document.querySelector("[data-project-modal]");
const modalTitle = document.querySelector("[data-project-modal-title]");
const modalSummary = document.querySelector("[data-project-modal-summary]");
const modalDetails = document.querySelector("[data-project-modal-details]");
const projectImageOverlay = document.querySelector("[data-project-image-overlay]");
const projectImageModal = document.querySelector("[data-project-image-modal]");
const projectImageModalImg = document.querySelector(
  "[data-project-image-modal-img]",
);
const projectImageModalCaption = document.querySelector(
  "[data-project-image-modal-caption]",
);
const pageHeader = document.querySelector(".site-header");
const pageMain = document.querySelector(".page-main");
const pageFooter = document.querySelector(".site-footer");

if (
  projectCards.length > 0 &&
  projectOverlay &&
  projectModal &&
  modalTitle &&
  modalSummary &&
  modalDetails
) {
  let activeCard = null;
  let activeOpenButton = null;
  let activeMediaTrigger = null;
  let isClosing = false;
  const hasProjectImageOverlay =
    projectImageOverlay &&
    projectImageModal &&
    projectImageModalImg &&
    projectImageModalCaption;

  function getFocusableElements(container) {
    return Array.from(
      container.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      ),
    );
  }

  // Hide the background page from screen readers and keyboard focus when modal is open.
  function setBackgroundInert(isInert) {
    const targets = [pageHeader, pageMain, pageFooter].filter(Boolean);
    for (const target of targets) {
      if (isInert) {
        target.setAttribute("aria-hidden", "true");
        target.setAttribute("inert", "");
      } else {
        target.removeAttribute("aria-hidden");
        target.removeAttribute("inert");
      }
    }
  }

  function injectProjectContent(card) {
    const title = card.querySelector("h3");
    const summary = card.querySelector(".project-summary");
    const details = card.querySelector(".project-details-inner");

    modalTitle.textContent = title ? title.textContent.trim() : "Project";
    modalSummary.textContent = summary ? summary.textContent.trim() : "";
    modalDetails.innerHTML = details
      ? details.innerHTML
      : "<p>Additional project details coming soon.</p>";
    setProjectMediaInteractive(modalDetails);
  }

  function setProjectMediaInteractive(container) {
    const mediaBlocks = container.querySelectorAll(".project-media");
    for (const mediaBlock of mediaBlocks) {
      const captionText =
        mediaBlock.querySelector("figcaption")?.textContent.trim() || "";
      mediaBlock.setAttribute("role", "button");
      mediaBlock.setAttribute("tabindex", "0");
      mediaBlock.setAttribute(
        "aria-label",
        captionText
          ? `Open screenshot preview: ${captionText}`
          : "Open screenshot preview",
      );
    }
  }

  function openProjectImage(mediaBlock) {
    if (!hasProjectImageOverlay || !mediaBlock) {
      return;
    }
    const sourceImage = mediaBlock.querySelector("img");
    if (!sourceImage) {
      return;
    }

    const captionText =
      mediaBlock.querySelector("figcaption")?.textContent.trim() || "";
    projectImageModalImg.src = sourceImage.getAttribute("src") || "";
    projectImageModalImg.alt = sourceImage.getAttribute("alt") || "";
    projectImageModalCaption.textContent = captionText;

    activeMediaTrigger = mediaBlock;
    projectImageOverlay.hidden = false;
    projectImageOverlay.setAttribute("aria-hidden", "false");
    projectImageOverlay.classList.add("is-visible");

    const imageFocusables = getFocusableElements(projectImageModal);
    const firstFocusable = imageFocusables[0] || projectImageModal;
    firstFocusable.focus();
  }

  function closeProjectImage(restoreFocus = true) {
    if (!hasProjectImageOverlay || projectImageOverlay.hidden) {
      return;
    }

    projectImageOverlay.classList.remove("is-visible");
    projectImageOverlay.setAttribute("aria-hidden", "true");
    projectImageOverlay.hidden = true;
    projectImageModalImg.removeAttribute("src");
    projectImageModalCaption.textContent = "";

    if (restoreFocus && activeMediaTrigger) {
      activeMediaTrigger.focus();
    }
    activeMediaTrigger = null;
  }

  // FLIP style animation: start from the clicked card bounds, then settle in modal bounds.
  function animateFromCard(card) {
    const sourceRect = card.getBoundingClientRect();
    const targetRect = projectModal.getBoundingClientRect();
    const deltaX = sourceRect.left - targetRect.left;
    const deltaY = sourceRect.top - targetRect.top;
    const scaleX = sourceRect.width / targetRect.width;
    const scaleY = sourceRect.height / targetRect.height;

    projectModal.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`;
    projectModal.style.opacity = "0.55";

    requestAnimationFrame(() => {
      projectModal.style.transform = "translate(0px, 0px) scale(1, 1)";
      projectModal.style.opacity = "1";
    });
  }

  function animateBackToCard(card) {
    const sourceRect = card.getBoundingClientRect();
    const currentRect = projectModal.getBoundingClientRect();
    const deltaX = sourceRect.left - currentRect.left;
    const deltaY = sourceRect.top - currentRect.top;
    const scaleX = sourceRect.width / currentRect.width;
    const scaleY = sourceRect.height / currentRect.height;

    projectModal.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`;
    projectModal.style.opacity = "0.2";
  }

  function openProject(card) {
    if (isClosing) {
      return;
    }

    const opener = card.querySelector("[data-project-open]");
    activeCard = card;
    activeOpenButton = opener || null;
    if (activeOpenButton) {
      activeOpenButton.setAttribute("aria-expanded", "true");
    }

    injectProjectContent(card);
    projectOverlay.hidden = false;
    projectOverlay.setAttribute("aria-hidden", "false");
    projectOverlay.classList.add("is-visible");
    projectOverlay.classList.remove("show-details");
    document.body.classList.add("modal-open");
    setBackgroundInert(true);

    // Ensure layout has settled before measuring and animating.
    void projectModal.offsetWidth;
    animateFromCard(card);

    window.setTimeout(() => {
      projectOverlay.classList.add("show-details");
    }, 180);

    const focusables = getFocusableElements(projectModal);
    const firstFocusable = focusables[0] || projectModal;
    firstFocusable.focus();
  }

  function closeProject() {
    if (projectOverlay.hidden || isClosing) {
      return;
    }
    isClosing = true;
    closeProjectImage(false);

    projectOverlay.classList.remove("show-details");
    projectOverlay.classList.remove("is-visible");
    projectOverlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    setBackgroundInert(false);

    if (activeOpenButton) {
      activeOpenButton.setAttribute("aria-expanded", "false");
    }

    if (activeCard) {
      animateBackToCard(activeCard);
    } else {
      projectModal.style.opacity = "0";
    }

    window.setTimeout(() => {
      projectOverlay.hidden = true;
      projectModal.style.transform = "";
      projectModal.style.opacity = "";
      if (activeOpenButton) {
        activeOpenButton.focus();
      }
      activeCard = null;
      activeOpenButton = null;
      isClosing = false;
    }, 300);
  }

  for (const card of projectCards) {
    const openButton = card.querySelector("[data-project-open]");
    if (!openButton) {
      continue;
    }
    openButton.setAttribute("aria-haspopup", "dialog");
    openButton.setAttribute("aria-controls", "project-modal");
    openButton.setAttribute("aria-expanded", "false");
    openButton.addEventListener("click", () => openProject(card));
  }

  const closeTargets = projectOverlay.querySelectorAll("[data-project-close]");
  for (const target of closeTargets) {
    target.addEventListener("click", closeProject);
  }

  if (hasProjectImageOverlay) {
    modalDetails.addEventListener("click", (event) => {
      const mediaBlock = event.target.closest(".project-media");
      if (!mediaBlock || !modalDetails.contains(mediaBlock)) {
        return;
      }
      openProjectImage(mediaBlock);
    });

    modalDetails.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }
      const mediaBlock = event.target.closest(".project-media");
      if (!mediaBlock || !modalDetails.contains(mediaBlock)) {
        return;
      }
      event.preventDefault();
      openProjectImage(mediaBlock);
    });

    const imageCloseTargets = projectImageOverlay.querySelectorAll(
      "[data-project-image-close]",
    );
    for (const target of imageCloseTargets) {
      target.addEventListener("click", () => closeProjectImage(true));
    }
  }

  document.addEventListener("keydown", (event) => {
    if (projectOverlay.hidden) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      if (hasProjectImageOverlay && !projectImageOverlay.hidden) {
        closeProjectImage(true);
        return;
      }
      closeProject();
      return;
    }

    if (hasProjectImageOverlay && !projectImageOverlay.hidden) {
      if (event.key !== "Tab") {
        return;
      }
      const imageFocusables = getFocusableElements(projectImageModal);
      if (imageFocusables.length === 0) {
        event.preventDefault();
        projectImageModal.focus();
        return;
      }
      const firstImageFocusable = imageFocusables[0];
      const lastImageFocusable = imageFocusables[imageFocusables.length - 1];
      if (!projectImageModal.contains(document.activeElement)) {
        event.preventDefault();
        firstImageFocusable.focus();
        return;
      }
      if (event.shiftKey && document.activeElement === firstImageFocusable) {
        event.preventDefault();
        lastImageFocusable.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === lastImageFocusable
      ) {
        event.preventDefault();
        firstImageFocusable.focus();
      }
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusables = getFocusableElements(projectModal);
    if (focusables.length === 0) {
      event.preventDefault();
      projectModal.focus();
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (!projectModal.contains(document.activeElement)) {
      event.preventDefault();
      first.focus();
      return;
    }

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}
