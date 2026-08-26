function initLandingPage() {
  const landingShell = document.querySelector(".landing-shell");
  const stageSlider = document.querySelector("[data-stage-slider]");
  const stagePanels = document.querySelectorAll("[data-stage]");
  const SLOGAN_SWAP_DELAY_MS = 180;
  const SLOGAN_ROTATION_MS = 4200;
  const VIDEO_ACCESS_STORAGE_KEY = "rusafe:video-access:v1";
  const VIDEO_ACCESS_DURATION_MS = 60 * 24 * 60 * 60 * 1000;
  const VIDEO_SEEK_TOLERANCE_SECONDS = 0.1;
  const VIDEO_COMPLETION_TOLERANCE_SECONDS = 1;
  const MOCKUP_CONFIG = {
    handphoneLeft: {
      frame: "assets/mockups/handphoneLeft.png",
      nativeWidth: 1333,
      nativeHeight: 652,
      screenX: 357,
      screenY: 106,
      screenWidth: 934,
      screenHeight: 400,
      screenRadius: 0
    },
    laptop: {
      frame: "assets/mockups/laptop.png",
      nativeWidth: 1076,
      nativeHeight: 560,
      screenX: 103,
      screenY: 26,
      screenWidth: 866,
      screenHeight: 438,
      screenRadius: 0
    },
    moniteur: {
      frame: "assets/mockups/moniteur.png",
      nativeWidth: 1019,
      nativeHeight: 688,
      screenX: 24,
      screenY: 24,
      screenWidth: 969,
      screenHeight: 495,
      screenRadius: 0
    },
    handphoneRight: {
      frame: "assets/mockups/handphoneright.png",
      nativeWidth: 1341,
      nativeHeight: 664,
      screenX: 50,
      screenY: 106,
      screenWidth: 934,
      screenHeight: 400,
      screenRadius: 0
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
      video: "assets/DORA.web.mp4",
      poster: "assets/DORA.png",
      mockup: "handphoneLeft"
    },
    ausecaf: {
      description: "Votre trésorerie est une cible : auditez vos applis, pas seulement vos process.",
      title: "AUSECAF",
      video: "assets/AUSECAF.web.mp4",
      poster: "assets/AUSECAF.png",
      mockup: "laptop"
    },
    secedi: {
      description: "Moins d’angles morts sur vos plateformes EDI bancaires.",
      title: "SECEDI",
      video: "assets/SECEDI.web.mp4",
      poster: "assets/SECEDI.png",
      mockup: "moniteur"
    },
    diag62030: {
      description: "Diagnostic 2030 : état des lieux, gaps, roadmap, budget, échéances.",
      title: "DIAG6 2030",
      video: "assets/DIAG6.web.mp4",
      poster: "assets/DIAG6 2030.png",
      mockup: "handphoneRight"
    }
  };
  const openGateButton = document.querySelector("[data-open-gate]");
  const backToLandingButton = document.querySelector("[data-back-to-landing]");
  const sloganNode = document.querySelector("[data-slogan]");
  const gateCard = document.querySelector(".gate-card");
  const gateTabs = document.querySelectorAll("[data-gate-tab]");
  const gateDescription = document.querySelector("[data-gate-description]");
  const gateMediaStage = document.querySelector("[data-gate-stage]");
  const gateMediaLayers = Array.from(document.querySelectorAll("[data-gate-media-layer]")).map((layerElement) => ({
    element: layerElement,
    anchor: layerElement.querySelector(".video-mockup-anchor"),
    mockup: layerElement.querySelector("[data-video-mockup]"),
    frame: layerElement.querySelector("[data-gate-frame]"),
    video: layerElement.querySelector("[data-gate-video]"),
    key: null
  }));
  const gateAccess = document.querySelector("[data-gate-access]");
  const gateAccessWrap = document.querySelector("[data-gate-access-wrap]");
  const gateAccessStatus = document.querySelector("[data-gate-access-status]");
  const mockupHeightFactor = Math.max(
    ...Object.values(MOCKUP_CONFIG).map((config) => config.nativeHeight / config.screenHeight)
  );
  const mediaImageAssets = [
    ...new Set([
      ...Object.values(MOCKUP_CONFIG).map((config) => config.frame),
      ...Object.values(gateContent).map((content) => content.poster)
    ])
  ];
  const imageWarmCache = new Map();
  const videoPlaybackStates = new WeakMap();
  let sloganIndex = 0;
  let activeGateLayerIndex = 0;
  let gateActiveKey = "";
  let gateSwapSequence = 0;
  let gateRealignFrame = 0;
  let gateUnlocked = false;

  function hasStoredGateAccess() {
    try {
      const storedAccess = JSON.parse(window.localStorage.getItem(VIDEO_ACCESS_STORAGE_KEY));
      const expiresAt = Number(storedAccess?.expiresAt);

      if (Number.isFinite(expiresAt) && expiresAt > Date.now()) {
        return true;
      }

      window.localStorage.removeItem(VIDEO_ACCESS_STORAGE_KEY);
    } catch {
      // The gate still works for the current visit if storage is unavailable.
    }

    return false;
  }

  function rememberGateAccess() {
    const unlockedAt = Date.now();

    try {
      window.localStorage.setItem(VIDEO_ACCESS_STORAGE_KEY, JSON.stringify({
        unlockedAt,
        expiresAt: unlockedAt + VIDEO_ACCESS_DURATION_MS
      }));
    } catch {
      // Private browsing or strict browser settings may prevent persistence.
    }
  }

  function setGateAccessState(isUnlocked, { announce = false } = {}) {
    gateUnlocked = isUnlocked;
    gateAccess?.classList.toggle("is-locked", !isUnlocked);
    gateAccessWrap?.classList.toggle("is-locked", !isUnlocked);

    if (isUnlocked) {
      gateAccess?.removeAttribute("aria-disabled");
      gateAccess?.removeAttribute("aria-describedby");
    } else {
      gateAccess?.setAttribute("aria-disabled", "true");
      gateAccess?.setAttribute("aria-describedby", "gate-access-help");
    }

    if (announce && gateAccessStatus) {
      gateAccessStatus.textContent = isUnlocked
        ? "Accès au site déverrouillé."
        : "Regardez une vidéo jusqu’au bout pour accéder au site.";
    }
  }

  function unlockGateAccess() {
    if (gateUnlocked) {
      return;
    }

    rememberGateAccess();
    setGateAccessState(true, { announce: true });
  }

  function getPlayedDuration(video) {
    let playedDuration = 0;

    for (let index = 0; index < video.played.length; index += 1) {
      playedDuration += video.played.end(index) - video.played.start(index);
    }

    return playedDuration;
  }

  function resetVideoPlaybackState(video) {
    const playbackState = videoPlaybackStates.get(video);

    if (!playbackState) {
      return;
    }

    playbackState.furthestTime = 0;
    playbackState.isRestoringSeek = false;
  }

  function protectGateVideo(video) {
    if (!video || videoPlaybackStates.has(video)) {
      return;
    }

    const playbackState = {
      furthestTime: 0,
      isRestoringSeek: false
    };

    videoPlaybackStates.set(video, playbackState);

    video.addEventListener("loadedmetadata", () => {
      resetVideoPlaybackState(video);
    });

    video.addEventListener("timeupdate", () => {
      if (video.seeking || video.paused || playbackState.isRestoringSeek) {
        return;
      }

      playbackState.furthestTime = Math.max(playbackState.furthestTime, video.currentTime);
    });

    video.addEventListener("seeking", () => {
      if (video.currentTime > playbackState.furthestTime + VIDEO_SEEK_TOLERANCE_SECONDS) {
        playbackState.isRestoringSeek = true;
        video.currentTime = playbackState.furthestTime;
      }
    });

    video.addEventListener("seeked", () => {
      playbackState.isRestoringSeek = false;
    });

    video.addEventListener("ratechange", () => {
      if (video.playbackRate !== 1) {
        video.playbackRate = 1;
      }
    });

    video.addEventListener("keydown", (event) => {
      if (["ArrowRight", "End", "PageDown"].includes(event.key)) {
        event.preventDefault();
      }
    });

    video.addEventListener("ended", () => {
      const duration = video.duration;

      if (!Number.isFinite(duration) || duration <= 0) {
        return;
      }

      if (getPlayedDuration(video) >= duration - VIDEO_COMPLETION_TOLERANCE_SECONDS) {
        unlockGateAccess();
      }
    });
  }

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

    if (isGateStage) {
      window.requestAnimationFrame(realignGateMedia);
    }
  }

  function updateGateTabs(key) {
    gateTabs.forEach((tab) => {
      const isActive = tab.dataset.gateTab === key;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
      tab.setAttribute("tabindex", isActive ? "0" : "-1");
    });
  }

  function setLayerState(layer, { mounted, visible }) {
    if (!layer) {
      return;
    }

    layer.element.classList.toggle("is-mounted", mounted);
    layer.element.classList.toggle("is-visible", mounted && visible);
    layer.element.setAttribute("aria-hidden", String(!visible));

    if ("inert" in layer.element) {
      layer.element.inert = !visible;
    }

    if (!mounted) {
      layer.key = null;
    }
  }

  function clearGateMediaSwapState() {
    gateMediaLayers.forEach((layer, index) => {
      if (!layer.video) {
        return;
      }

      if (index !== activeGateLayerIndex) {
        setLayerState(layer, { mounted: false, visible: false });
      }
    });
  }

  function warmImage(src) {
    if (!src) {
      return Promise.resolve();
    }

    if (imageWarmCache.has(src)) {
      return imageWarmCache.get(src);
    }

    const imagePromise = new Promise((resolve) => {
      const image = new Image();
      let settled = false;

      const finalize = () => {
        if (settled) {
          return;
        }

        settled = true;
        image.onload = null;
        image.onerror = null;
        resolve();
      };

      const finalizeAfterDecode = () => {
        if (typeof image.decode === "function") {
          image.decode().catch(() => {}).finally(finalize);
          return;
        }

        finalize();
      };

      image.onload = finalizeAfterDecode;
      image.onerror = finalize;
      image.src = src;

      if (image.complete && image.naturalWidth > 0) {
        finalizeAfterDecode();
      }
    });

    imageWarmCache.set(src, imagePromise);

    return imagePromise;
  }

  function warmGateMediaAssets() {
    mediaImageAssets.forEach((src) => {
      void warmImage(src);
    });
  }

  function getTargetScreenHeight() {
    const styles = getComputedStyle(gateCard || gateMediaStage || document.documentElement);
    const rawValue = parseFloat(styles.getPropertyValue("--gate-mockup-screen-height"));

    return Number.isFinite(rawValue) ? rawValue : 0;
  }

  function getTabCenterX(key) {
    if (!gateMediaStage) {
      return 0;
    }

    const tab = document.querySelector(`[data-gate-tab="${key}"]`);

    if (!tab) {
      return 0;
    }

    const stageRect = gateMediaStage.getBoundingClientRect();
    const tabRect = tab.getBoundingClientRect();

    return tabRect.left + (tabRect.width / 2) - stageRect.left;
  }

  function positionMockupLayer(layer, key, mockupKey) {
    if (!layer?.anchor || !MOCKUP_CONFIG[mockupKey]) {
      return;
    }

    const config = MOCKUP_CONFIG[mockupKey];
    const screenHeight = getTargetScreenHeight();
    const scale = screenHeight / config.screenHeight;
    const screenCenter = (config.screenX + (config.screenWidth / 2)) * scale;
    const left = getTabCenterX(key) - screenCenter;

    layer.anchor.style.setProperty("--mockup-left", `${left}px`);
  }

  function realignGateMedia() {
    gateMediaLayers.forEach((layer) => {
      if (!layer.key || !gateContent[layer.key]) {
        return;
      }

      positionMockupLayer(layer, layer.key, gateContent[layer.key].mockup);
    });
  }

  function scheduleGateMediaRealign() {
    window.cancelAnimationFrame(gateRealignFrame);
    gateRealignFrame = window.requestAnimationFrame(realignGateMedia);
  }

  function applyMockupLayout(layer, mockupKey) {
    if (!layer?.mockup || !layer.frame || !MOCKUP_CONFIG[mockupKey]) {
      return;
    }

    const config = MOCKUP_CONFIG[mockupKey];
    const toPercent = (value, total) => `${((value / total) * 100).toFixed(4)}%`;

    layer.mockup.dataset.mockupType = mockupKey;
    layer.mockup.style.setProperty("--mockup-aspect-ratio", `${config.nativeWidth} / ${config.nativeHeight}`);
    layer.mockup.style.setProperty("--mockup-width-factor", (config.nativeWidth / config.screenHeight).toFixed(6));
    layer.mockup.style.setProperty("--mockup-screen-left", toPercent(config.screenX, config.nativeWidth));
    layer.mockup.style.setProperty("--mockup-screen-top", toPercent(config.screenY, config.nativeHeight));
    layer.mockup.style.setProperty("--mockup-screen-width", toPercent(config.screenWidth, config.nativeWidth));
    layer.mockup.style.setProperty("--mockup-screen-height", toPercent(config.screenHeight, config.nativeHeight));
    layer.mockup.style.setProperty("--mockup-screen-radius", `${config.screenRadius}px`);
    layer.mockup.style.setProperty("--mockup-video-scale", String(config.videoScale ?? 1));
    layer.mockup.style.setProperty("--mockup-video-offset-x", `${config.videoOffsetX ?? 0}px`);
    layer.mockup.style.setProperty("--mockup-video-offset-y", `${config.videoOffsetY ?? 0}px`);

    layer.frame.src = config.frame;
    layer.frame.width = config.nativeWidth;
    layer.frame.height = config.nativeHeight;
  }

  function prepareGateMediaLayer(layer, key, swapSequence) {
    const nextContent = gateContent[key];

    if (!layer || !layer.video || !nextContent) {
      return;
    }

    const nextMockup = MOCKUP_CONFIG[nextContent.mockup];

    setLayerState(layer, { mounted: true, visible: false });
    layer.key = key;

    Promise.all([
      warmImage(nextMockup.frame),
      warmImage(nextContent.poster)
    ]).then(() => {
      if (swapSequence !== gateSwapSequence) {
        return;
      }

      applyMockupLayout(layer, nextContent.mockup);
      positionMockupLayer(layer, key, nextContent.mockup);
      layer.video.pause();
      resetVideoPlaybackState(layer.video);
      layer.video.currentTime = 0;
      layer.video.poster = nextContent.poster;
      layer.video.src = nextContent.video;
      layer.video.setAttribute("aria-label", `Vidéo ${nextContent.title}`);
      layer.video.load();

      const previousLayer = gateMediaLayers[activeGateLayerIndex];

      setLayerState(layer, { mounted: true, visible: false });

      window.requestAnimationFrame(() => {
        if (swapSequence !== gateSwapSequence) {
          return;
        }

        if (previousLayer && previousLayer !== layer) {
          setLayerState(previousLayer, { mounted: false, visible: false });
          previousLayer.video?.pause();
        }

        gateDescription.textContent = nextContent.description;
        setLayerState(layer, { mounted: true, visible: true });
        gateDescription.classList.remove("is-swapping");
        activeGateLayerIndex = gateMediaLayers.indexOf(layer);
        gateActiveKey = key;
        layer.key = key;
        gateAccess.classList.remove("is-swapping");
      });
    });
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
    }, SLOGAN_SWAP_DELAY_MS);
  }

  function setGateTab(key) {
    if (!gateDescription || !gateAccess || !gateContent[key] || gateMediaLayers.length === 0) {
      return;
    }

    if (key === gateActiveKey) {
      return;
    }

    const swapSequence = ++gateSwapSequence;
    const nextLayerIndex = gateMediaLayers.length > 1 ? (activeGateLayerIndex + 1) % gateMediaLayers.length : activeGateLayerIndex;
    const nextLayer = gateMediaLayers[nextLayerIndex];
    updateGateTabs(key);

    gateCard?.setAttribute("data-active-tab", key);
    clearGateMediaSwapState();
    gateMediaLayers.forEach((layer) => layer.video?.pause());

    gateDescription.classList.add("is-swapping");
    gateAccess.classList.add("is-swapping");

    prepareGateMediaLayer(nextLayer, key, swapSequence);
  }

  function initializeGateMedia() {
    const initialKey = "dora";
    const initialLayer = gateMediaLayers[0];

    if (!initialLayer || !gateContent[initialKey]) {
      return;
    }

    applyMockupLayout(initialLayer, gateContent[initialKey].mockup);
    positionMockupLayer(initialLayer, initialKey, gateContent[initialKey].mockup);
    resetVideoPlaybackState(initialLayer.video);
    initialLayer.video.poster = gateContent[initialKey].poster;
    initialLayer.video.src = gateContent[initialKey].video;
    initialLayer.video.setAttribute("aria-label", `Vidéo ${gateContent[initialKey].title}`);
    initialLayer.video.load();
    initialLayer.key = initialKey;
    setLayerState(initialLayer, { mounted: true, visible: true });

    gateMediaLayers.slice(1).forEach((layer) => setLayerState(layer, { mounted: false, visible: false }));
    gateCard?.setAttribute("data-active-tab", initialKey);
    gateDescription.textContent = gateContent[initialKey].description;
    updateGateTabs(initialKey);
    gateActiveKey = initialKey;
  }

  openGateButton?.addEventListener("click", () => setStage("gate"));
  backToLandingButton?.addEventListener("click", () => setStage("landing"));

  gateTabs.forEach((tab) => {
    tab.addEventListener("click", () => setGateTab(tab.dataset.gateTab));
  });

  gateAccess?.addEventListener("click", (event) => {
    if (gateUnlocked) {
      return;
    }

    event.preventDefault();
    setGateAccessState(false, { announce: true });
  });

  window.addEventListener("resize", scheduleGateMediaRealign, { passive: true });
  window.addEventListener("orientationchange", scheduleGateMediaRealign, { passive: true });

  if (sloganNode) {
    window.setInterval(swapSlogan, SLOGAN_ROTATION_MS);
  }

  gateCard?.style.setProperty("--gate-mockup-stage-factor", mockupHeightFactor.toFixed(6));
  gateMediaLayers.forEach((layer) => protectGateVideo(layer.video));
  setGateAccessState(hasStoredGateAccess());
  warmGateMediaAssets();
  initializeGateMedia();
  scheduleGateMediaRealign();
  setStage("landing");
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
