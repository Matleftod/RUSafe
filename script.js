function initLandingPage() {
  const landingShell = document.querySelector(".landing-shell");
  const stageSlider = document.querySelector("[data-stage-slider]");
  const stagePanels = document.querySelectorAll("[data-stage]");
  const SWAP_DELAY_MS = 180;
  const MEDIA_REVEAL_FALLBACK_MS = 220;
  const SLOGAN_ROTATION_MS = 4200;
  const MOCKUP_CONFIG = {
    handphoneLeft: {
      frame: "assets/mockups/handphoneLeft.png",
      nativeWidth: 1333,
      nativeHeight: 652,
      screenX: 356,
      screenY: 97,
      screenWidth: 926,
      screenHeight: 474,
      screenRadius: 36
    },
    laptop: {
      frame: "assets/mockups/laptop.png",
      nativeWidth: 1076,
      nativeHeight: 560,
      screenX: 89,
      screenY: 26,
      screenWidth: 898,
      screenHeight: 424,
      screenRadius: 16
    },
    moniteur: {
      frame: "assets/mockups/moniteur.png",
      nativeWidth: 1019,
      nativeHeight: 688,
      screenX: 35,
      screenY: 26,
      screenWidth: 947,
      screenHeight: 490,
      screenRadius: 18
    },
    handphoneRight: {
      frame: "assets/mockups/handphoneright.png",
      nativeWidth: 1341,
      nativeHeight: 664,
      screenX: 58,
      screenY: 96,
      screenWidth: 938,
      screenHeight: 476,
      screenRadius: 36
    }
  };

  if (!stageSlider) {
    return;
  }

  const sloganEntries = [
    { html: 'Grand angle sur <span class="accent">vos risques.</span>' },
    { html: 'Du rapport au <span class="accent">rempart.</span>' },
    { html: 'Tranquillité <span class="accent">approuvée.</span>' },
    { html: 'Les surprises, seulement si elles viennent avec du <span class="accent">champagne.</span>' }
  ];
  const gateContent = {
    dora: {
      description: "Passez de la conformité « papier » à la résilience opérationnelle.",
      title: "DORA",
      video: "assets/DORA.mp4",
      mockup: "handphoneLeft"
    },
    ausecaf: {
      description: "Votre trésorerie est une cible : auditez vos applis, pas seulement vos process.",
      title: "AUSECAF",
      video: "assets/AUSECAF.mp4",
      mockup: "laptop"
    },
    secedi: {
      description: "Moins d’angles morts sur vos plateformes EDI bancaires.",
      title: "SECEDI",
      video: "assets/SECEDI.mp4",
      mockup: "moniteur"
    },
    diag62030: {
      description: "Diagnostic 2030 : état des lieux, gaps, roadmap, budget, échéances.",
      title: "DIAG6 2030",
      video: "assets/DIAG6.mp4",
      mockup: "handphoneRight"
    }
  };
  const openGateButton = document.querySelector("[data-open-gate]");
  const backToLandingButton = document.querySelector("[data-back-to-landing]");
  const sloganNode = document.querySelector("[data-slogan]");
  const gateCard = document.querySelector(".gate-card");
  const gateTabs = document.querySelectorAll("[data-gate-tab]");
  const gateDescription = document.querySelector("[data-gate-description]");
  const gateMedia = document.querySelector("[data-gate-media]");
  const gateVideo = document.querySelector("[data-gate-video]");
  const gateMockup = document.querySelector("[data-video-mockup]");
  const gateFrame = document.querySelector("[data-gate-frame]");
  const gateAccess = document.querySelector(".gate-access");
  let sloganIndex = 0;
  let gateMediaFallbackTimer = 0;

  function setStage(stage) {
    const isGateStage = stage === "gate";

    stageSlider.classList.toggle("is-gate", isGateStage);
    landingShell?.classList.toggle("is-gate", isGateStage);

    stagePanels.forEach((panel) => {
      const isActive = panel.dataset.stage === stage;
      panel.setAttribute("aria-hidden", String(!isActive));

      if ("inert" in panel) {
        panel.inert = !isActive;
      }
    });
  }

  function updateGateTabs(key) {
    gateTabs.forEach((tab) => {
      const isActive = tab.dataset.gateTab === key;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
      tab.setAttribute("tabindex", isActive ? "0" : "-1");
    });
  }

  function applyMockupLayout(mockupKey) {
    if (!gateMockup || !gateFrame || !MOCKUP_CONFIG[mockupKey]) {
      return;
    }

    const config = MOCKUP_CONFIG[mockupKey];
    const toPercent = (value, total) => `${((value / total) * 100).toFixed(4)}%`;

    gateMockup.dataset.mockupType = mockupKey;
    gateMockup.style.setProperty("--mockup-aspect-ratio", `${config.nativeWidth} / ${config.nativeHeight}`);
    gateMockup.style.setProperty("--mockup-width-factor", (config.nativeWidth / config.screenHeight).toFixed(6));
    gateMockup.style.setProperty("--mockup-height-factor", (config.nativeHeight / config.screenHeight).toFixed(6));
    gateMockup.style.setProperty("--mockup-screen-left", toPercent(config.screenX, config.nativeWidth));
    gateMockup.style.setProperty("--mockup-screen-top", toPercent(config.screenY, config.nativeHeight));
    gateMockup.style.setProperty("--mockup-screen-width", toPercent(config.screenWidth, config.nativeWidth));
    gateMockup.style.setProperty("--mockup-screen-height", toPercent(config.screenHeight, config.nativeHeight));
    gateMockup.style.setProperty("--mockup-screen-radius", `${config.screenRadius}px`);

    gateFrame.src = config.frame;
    gateFrame.width = config.nativeWidth;
    gateFrame.height = config.nativeHeight;
  }

  function swapSlogan() {
    if (!sloganNode || document.hidden || stageSlider.classList.contains("is-gate")) {
      return;
    }

    sloganNode.classList.add("is-swapping");

    window.setTimeout(() => {
      sloganIndex = (sloganIndex + 1) % sloganEntries.length;
      sloganNode.innerHTML = sloganEntries[sloganIndex].html;
      sloganNode.classList.remove("is-swapping");
    }, SWAP_DELAY_MS);
  }

  function setGateTab(key) {
    if (!gateDescription || !gateVideo || !gateAccess || !gateContent[key]) {
      return;
    }

    const nextContent = gateContent[key];
    updateGateTabs(key);

    gateCard?.setAttribute("data-active-tab", key);

    gateDescription.classList.add("is-swapping");
    gateMedia?.classList.add("is-swapping");
    gateAccess.classList.add("is-swapping");

    window.setTimeout(() => {
      gateDescription.textContent = nextContent.description;
      applyMockupLayout(nextContent.mockup);
      gateVideo.pause();
      gateVideo.currentTime = 0;
      gateVideo.onloadeddata = null;
      gateVideo.onerror = null;
      window.clearTimeout(gateMediaFallbackTimer);
      gateVideo.src = nextContent.video;
      gateVideo.setAttribute("aria-label", `Vidéo ${nextContent.title}`);
      gateVideo.load();

      const revealMedia = () => {
        window.clearTimeout(gateMediaFallbackTimer);
        gateMedia?.classList.remove("is-swapping");
        gateAccess.classList.remove("is-swapping");
        gateVideo.onloadeddata = null;
        gateVideo.onerror = null;
      };

      gateVideo.onloadeddata = revealMedia;
      gateVideo.onerror = revealMedia;
      gateMediaFallbackTimer = window.setTimeout(revealMedia, MEDIA_REVEAL_FALLBACK_MS);

      gateDescription.classList.remove("is-swapping");
    }, SWAP_DELAY_MS);
  }

  openGateButton?.addEventListener("click", () => setStage("gate"));
  backToLandingButton?.addEventListener("click", () => setStage("landing"));

  gateTabs.forEach((tab) => {
    tab.addEventListener("click", () => setGateTab(tab.dataset.gateTab));
  });

  if (sloganNode) {
    window.setInterval(swapSlogan, SLOGAN_ROTATION_MS);
  }

  setStage("landing");
  setGateTab("dora");
}

function initHomeNav() {
  const homeNav = document.querySelector(".home-nav");

  if (!homeNav) {
    return;
  }

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

  function getControlledMenu(trigger) {
    return document.getElementById(trigger?.getAttribute("aria-controls") || "");
  }

  function setExpandedState(trigger, isExpanded) {
    if (!trigger) {
      return;
    }

    trigger.setAttribute("aria-expanded", String(isExpanded));

    const controlledMenu = getControlledMenu(trigger);

    if (controlledMenu) {
      controlledMenu.setAttribute("aria-hidden", String(!isExpanded));
    }
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

  function closeNestedItems(item) {
    item.querySelectorAll(".home-nav__submenu-item--has-dropdown").forEach((nestedItem) => {
      nestedItem.classList.remove("is-open");
      setExpandedState(getTrigger(nestedItem), false);
      clearCloseTimer(nestedItem);
    });
  }

  function closeItem(item) {
    clearCloseTimer(item);
    item.classList.remove("is-open");
    setExpandedState(getTrigger(item), false);
    closeNestedItems(item);
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
    setExpandedState(getTrigger(item), true);

    let parentDropdownItem = item.parentElement?.closest(".home-nav__item--has-dropdown, .home-nav__submenu-item--has-dropdown");

    while (parentDropdownItem) {
      parentDropdownItem.classList.add("is-open");
      setExpandedState(getTrigger(parentDropdownItem), true);
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

    setExpandedState(trigger, false);

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

initLandingPage();
initHomeNav();
