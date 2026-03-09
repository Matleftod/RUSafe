const sloganEntries = [
  { html: 'Grand angle sur <span class="accent">vos risques.</span>' },
  { html: 'Du rapport au <span class="accent">rempart.</span>' },
  { html: 'Tranquillité <span class="accent">approuvée.</span>' },
  { html: 'Les surprises, seulement si elles viennent avec du <span class="accent">champagne.</span>' }
];

const gateContent = {
  dora: {
    description: "Passez de la conformité « papier » à la résilience opérationnelle.",
    accent: "#4d73ef"
  },
  ausecaf: {
    description: "Votre trésorerie est une cible : auditez vos applis, pas seulement vos process.",
    accent: "#2097b2"
  },
  secedi: {
    description: "Moins d’angles morts sur vos plateformes EDI bancaires.",
    accent: "#6d56f6"
  },
  diag62030: {
    description: "Diagnostic 2030 : état des lieux, gaps, roadmap, budget, échéances.",
    accent: "#3a63dd"
  }
};

const stageSlider = document.querySelector("[data-stage-slider]");
const openGateButton = document.querySelector("[data-open-gate]");
const backToLandingButton = document.querySelector("[data-back-to-landing]");
const sloganNode = document.querySelector("[data-slogan]");
const gateTabs = document.querySelectorAll("[data-gate-tab]");
const gateDescription = document.querySelector("[data-gate-description]");
const gateMedia = document.querySelector("[data-gate-media]");

let sloganIndex = 0;

function setStage(stage) {
  if (!stageSlider) {
    return;
  }

  stageSlider.classList.toggle("is-gate", stage === "gate");
}

function swapSlogan() {
  if (!sloganNode || document.hidden || stageSlider?.classList.contains("is-gate")) {
    return;
  }

  sloganNode.classList.add("is-swapping");

  window.setTimeout(() => {
    sloganIndex = (sloganIndex + 1) % sloganEntries.length;
    sloganNode.innerHTML = sloganEntries[sloganIndex].html;
    sloganNode.classList.remove("is-swapping");
  }, 180);
}

function setGateTab(key) {
  if (!gateDescription || !gateMedia || !gateContent[key]) {
    return;
  }

  gateTabs.forEach((tab) => {
    const isActive = tab.dataset.gateTab === key;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  gateDescription.classList.add("is-swapping");
  gateMedia.classList.add("is-refreshing");

  window.setTimeout(() => {
    gateDescription.textContent = gateContent[key].description;
    gateDescription.classList.remove("is-swapping");
    gateMedia.classList.remove("is-refreshing");
  }, 180);
}

function updateLandingViewport() {
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  const designWidth = 1440;
  const designHeight = 920;
  const scale = Math.min(viewportWidth / designWidth, viewportHeight / designHeight, 1);

  document.documentElement.style.setProperty("--app-height", `${viewportHeight}px`);
  document.documentElement.style.setProperty("--stage-scale", scale.toFixed(4));
}

if (openGateButton) {
  openGateButton.addEventListener("click", () => setStage("gate"));
}

if (backToLandingButton) {
  backToLandingButton.addEventListener("click", () => setStage("landing"));
}

gateTabs.forEach((tab) => {
  tab.addEventListener("click", () => setGateTab(tab.dataset.gateTab));
});

if (sloganNode) {
  window.setInterval(swapSlogan, 4200);
}

window.addEventListener("resize", updateLandingViewport, { passive: true });
window.addEventListener("orientationchange", updateLandingViewport, { passive: true });

setGateTab("dora");
updateLandingViewport();

const homeNav = document.querySelector(".home-nav");

if (homeNav) {
  const hoverMediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
  const desktopSubmenuMediaQuery = window.matchMedia("(min-width: 961px)");
  const dropdownItems = homeNav.querySelectorAll(".home-nav__item--has-dropdown, .home-nav__submenu-item--has-dropdown");
  const mainDropdown = homeNav.querySelector(".home-nav__item--has-dropdown > .home-nav__dropdown");
  const closeTimers = new WeakMap();

  function clearCloseTimer(item) {
    const timer = closeTimers.get(item);

    if (timer) {
      window.clearTimeout(timer);
      closeTimers.delete(item);
    }
  }

  function getTrigger(item) {
    return item.querySelector(":scope > .home-nav__trigger, :scope > .home-nav__subtrigger");
  }

  function resetDropdownShift() {
    if (mainDropdown) {
      mainDropdown.style.setProperty("--nav-dropdown-shift", "0px");
    }
  }

  function getOpenNestedItem() {
    return homeNav.querySelector(".home-nav__submenu-item--has-dropdown.is-open");
  }

  function updateDropdownShift() {
    if (!mainDropdown) {
      return;
    }

    resetDropdownShift();

    if (!desktopSubmenuMediaQuery.matches) {
      return;
    }

    const openNestedItem = getOpenNestedItem();

    if (!openNestedItem) {
      return;
    }

    const subdropdown = openNestedItem.querySelector(":scope > .home-nav__subdropdown");

    if (!subdropdown) {
      return;
    }

    const mainRect = mainDropdown.getBoundingClientRect();
    const subRect = subdropdown.getBoundingClientRect();
    const viewportPadding = 16;
    const overflowRight = subRect.right - (window.innerWidth - viewportPadding);

    if (overflowRight <= 0) {
      return;
    }

    const maxShift = Math.max(0, mainRect.left - viewportPadding);
    const shift = Math.min(overflowRight, maxShift);

    mainDropdown.style.setProperty("--nav-dropdown-shift", `${Math.ceil(shift)}px`);
  }

  function refreshDropdownShift() {
    window.requestAnimationFrame(updateDropdownShift);
  }

  function closeItem(item) {
    clearCloseTimer(item);
    item.classList.remove("is-open");

    const trigger = getTrigger(item);

    if (trigger) {
      trigger.setAttribute("aria-expanded", "false");
    }

    item.querySelectorAll(".home-nav__submenu-item--has-dropdown").forEach((nestedItem) => {
      nestedItem.classList.remove("is-open");
      const nestedTrigger = getTrigger(nestedItem);

      if (nestedTrigger) {
        nestedTrigger.setAttribute("aria-expanded", "false");
      }

      clearCloseTimer(nestedItem);
    });

    refreshDropdownShift();
  }

  function closeSiblings(item) {
    const parentList = item.parentElement;

    if (!parentList) {
      return;
    }

    Array.from(parentList.children).forEach((sibling) => {
      if (sibling !== item && sibling.matches(".home-nav__item--has-dropdown, .home-nav__submenu-item--has-dropdown")) {
        closeItem(sibling);
      }
    });
  }

  function openItem(item) {
    clearCloseTimer(item);
    closeSiblings(item);
    item.classList.add("is-open");

    const trigger = getTrigger(item);

    if (trigger) {
      trigger.setAttribute("aria-expanded", "true");
    }

    let parentDropdownItem = item.parentElement?.closest(".home-nav__item--has-dropdown, .home-nav__submenu-item--has-dropdown");

    while (parentDropdownItem) {
      parentDropdownItem.classList.add("is-open");
      const parentTrigger = getTrigger(parentDropdownItem);

      if (parentTrigger) {
        parentTrigger.setAttribute("aria-expanded", "true");
      }

      parentDropdownItem = parentDropdownItem.parentElement?.closest(".home-nav__item--has-dropdown, .home-nav__submenu-item--has-dropdown");
    }

    refreshDropdownShift();
  }

  function scheduleClose(item, delay = 180) {
    clearCloseTimer(item);

    const timer = window.setTimeout(() => {
      closeItem(item);
    }, delay);

    closeTimers.set(item, timer);
  }

  function closeAll() {
    dropdownItems.forEach((item) => closeItem(item));
    resetDropdownShift();
  }

  dropdownItems.forEach((item) => {
    const trigger = getTrigger(item);

    if (!trigger) {
      return;
    }

    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (item.classList.contains("is-open")) {
        closeItem(item);
        return;
      }

      openItem(item);
    });

    item.addEventListener("mouseenter", () => {
      if (!hoverMediaQuery.matches) {
        return;
      }

      openItem(item);
    });

    item.addEventListener("mouseleave", () => {
      if (!hoverMediaQuery.matches) {
        return;
      }

      scheduleClose(item, 220);
    });

    item.addEventListener("focusin", () => {
      openItem(item);
    });
  });

  homeNav.addEventListener("mouseenter", () => {
    dropdownItems.forEach((item) => clearCloseTimer(item));
  });

  homeNav.addEventListener("mouseleave", () => {
    if (!hoverMediaQuery.matches) {
      return;
    }

    closeAll();
  });

  document.addEventListener("click", (event) => {
    if (!homeNav.contains(event.target)) {
      closeAll();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAll();
    }
  });

  homeNav.addEventListener("focusout", () => {
    window.setTimeout(() => {
      if (!homeNav.contains(document.activeElement)) {
        closeAll();
      }
    }, 0);
  });

  window.addEventListener("resize", refreshDropdownShift, { passive: true });
  window.addEventListener("orientationchange", refreshDropdownShift, { passive: true });
}
