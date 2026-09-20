(() => {
  const VIDEO_ACCESS_STORAGE_KEY = "rusafe:video-access:v1";

  function hasVideoAccess() {
    try {
      const storedAccess = JSON.parse(window.localStorage.getItem(VIDEO_ACCESS_STORAGE_KEY));
      const expiresAt = Number(storedAccess?.expiresAt);

      if (Number.isFinite(expiresAt) && expiresAt > Date.now()) {
        return true;
      }

      window.localStorage.removeItem(VIDEO_ACCESS_STORAGE_KEY);
    } catch {
      // Without storage, the utility navigation remains the safe fallback.
    }

    return false;
  }

  function initEntryNavigation() {
    const entryNav = document.querySelector("[data-entry-nav]");

    if (!entryNav || !hasVideoAccess()) {
      return;
    }

    const isEnglish = document.documentElement.lang === "en";
    const currentPage = window.location.pathname.split("/").pop() || "";
    const languageSwitcher = entryNav.querySelector(".language-switcher");
    const navigation = isEnglish
      ? [
        ["accueil.html", "Home"], ["equipe.html", "Team"], ["approche.html", "Our approach"], ["expertise.html", "Expertise"],
        ["solutions.html", "Solutions"], ["partenaires.html", "Partners"], ["formation.html", "Training"],
        ["contact.html", "Contact us", true]
      ]
      : [
        ["accueil.html", "Accueil"], ["equipe.html", "Équipe"], ["approche.html", "Notre approche"], ["expertise.html", "Expertise"],
        ["solutions.html", "Solutions"], ["partenaires.html", "Partenaires"], ["formation.html", "Formation"],
        ["contact.html", "Nous contacter", true]
      ];
    const mobileToggle = document.createElement("button");

    mobileToggle.className = "mobile-toggle";
    mobileToggle.id = "mobileToggle";
    mobileToggle.type = "button";
    mobileToggle.setAttribute("aria-label", isEnglish ? "Open menu" : "Ouvrir le menu");
    mobileToggle.setAttribute("aria-controls", "navLinks");
    mobileToggle.setAttribute("aria-expanded", "false");
    mobileToggle.innerHTML = `<span id="mobileToggleIcon" aria-hidden="true">☰</span>`;

    entryNav.className = "nav-links";
    entryNav.id = "navLinks";
    entryNav.setAttribute("aria-label", isEnglish ? "Main navigation" : "Navigation principale");
    entryNav.replaceChildren();
    navigation.forEach(([href, label, isButton]) => {
      const link = document.createElement("a");
      link.setAttribute("href", href);
      link.textContent = label;
      if (isButton) link.className = "button primary";
      if (href === currentPage) link.setAttribute("aria-current", "page");
      entryNav.append(link);
    });
    if (languageSwitcher) entryNav.append(languageSwitcher);
    entryNav.before(mobileToggle);
  }

  initEntryNavigation();

  const topbar = document.querySelector(".topbar");
  const mobileToggle = document.getElementById("mobileToggle");
  const mobileToggleIcon = document.getElementById("mobileToggleIcon");
  const navLinks = document.getElementById("navLinks");
  const scrollSentinel = document.getElementById("scrollSentinel");
  const desktopMedia = window.matchMedia("(min-width: 901px)");
  const isEnglish = document.documentElement.lang === "en";
  function setMenuState(isOpen, returnFocus = false) {
    navLinks?.classList.toggle("open", isOpen);
    topbar?.classList.toggle("menu-open", isOpen);
    mobileToggle?.setAttribute("aria-expanded", String(isOpen));
    mobileToggle?.setAttribute("aria-label", isOpen
      ? (isEnglish ? "Close menu" : "Fermer le menu")
      : (isEnglish ? "Open menu" : "Ouvrir le menu"));

    if (mobileToggleIcon) {
      mobileToggleIcon.textContent = isOpen ? "✕" : "☰";
    }

    if (returnFocus) {
      mobileToggle?.focus();
    }
  }

  if (topbar && scrollSentinel && "IntersectionObserver" in window) {
    const headerObserver = new IntersectionObserver(([entry]) => {
      topbar.classList.toggle("is-scrolled", !entry.isIntersecting);
    });

    headerObserver.observe(scrollSentinel);
  } else if (topbar) {
    const updateHeader = () => topbar.classList.toggle("is-scrolled", window.scrollY > 16);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  mobileToggle?.addEventListener("click", () => {
    setMenuState(mobileToggle.getAttribute("aria-expanded") !== "true");
  });

  navLinks?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobileToggle?.getAttribute("aria-expanded") === "true") {
      setMenuState(false, true);
    }
  });

  document.addEventListener("pointerdown", (event) => {
    if (mobileToggle?.getAttribute("aria-expanded") === "true" && !topbar?.contains(event.target)) {
      setMenuState(false);
    }
  });

  desktopMedia.addEventListener("change", (event) => {
    if (event.matches) {
      setMenuState(false);
    }
  });

  function initBackToTop() {
    if (!document.body.classList.contains("site-page")) {
      return;
    }

    const button = document.createElement("button");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    button.className = "back-to-top";
    button.type = "button";
    button.setAttribute("aria-label", isEnglish ? "Back to top" : "Revenir en haut de la page");
    button.innerHTML = '<span aria-hidden="true">↑</span>';
    document.body.append(button);

    const updateVisibility = () => {
      button.classList.toggle("is-visible", window.scrollY > 480);
    };

    button.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduceMotion.matches ? "auto" : "smooth" });
    });

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
  }

  initBackToTop();

  function initTeamProfiles() {
    document.querySelectorAll(".team-grid").forEach((grid) => {
      const cards = [...grid.querySelectorAll(":scope > .team-card")];
      cards.sort((left, right) => {
        const leftHeading = left.querySelector("h4");
        const rightHeading = right.querySelector("h4");
        const leftName = leftHeading?.textContent.trim() || "";
        const rightName = rightHeading?.textContent.trim() || "";
        const byFirstName = leftName.localeCompare(rightName, "fr", { sensitivity: "base" });
        if (byFirstName !== 0) return byFirstName;
        const leftSurname = leftHeading?.dataset.teamSurname || "";
        const rightSurname = rightHeading?.dataset.teamSurname || "";
        return leftSurname.localeCompare(rightSurname, "fr", { sensitivity: "base" });
      });
      cards.forEach((card) => grid.append(card));
    });

    const cards = [...document.querySelectorAll(".team-card")];
    const teamRecords = cards.map((card) => {
      const heading = card.querySelector("h4");
      const rawName = heading?.textContent.trim() || "";
      const surnameMatch = rawName.match(/\s+([A-ZÀ-ÖØ-Þ][A-Za-zÀ-ÖØ-öø-ÿ]*)\.?$/u);
      const surnameHint = heading?.dataset.teamSurname || surnameMatch?.[1] || "";
      const firstName = surnameMatch ? rawName.slice(0, surnameMatch.index).trim() : rawName;
      return { card, rawName, firstName, surnameHint };
    });
    const recordsByFirstName = new Map();
    teamRecords.forEach((record) => {
      const records = recordsByFirstName.get(record.firstName) || [];
      records.push(record);
      recordsByFirstName.set(record.firstName, records);
    });

    const displayNameFor = (record) => {
      const homonyms = recordsByFirstName.get(record.firstName) || [];
      if (homonyms.length < 2) return record.firstName;

      const initial = record.surnameHint.slice(0, 1).toUpperCase();
      const sameInitial = homonyms.filter((item) => item.surnameHint.slice(0, 1).toUpperCase() === initial);
      if (sameInitial.length < 2) return `${record.firstName} ${initial}.`;

      const sameInitialIndex = sameInitial.indexOf(record);
      if (sameInitialIndex === 0) return `${record.firstName} ${initial}.`;
      const extendedHint = record.surnameHint.slice(0, 2);
      return `${record.firstName} ${extendedHint.length > 1 ? extendedHint : initial}.`;
    };

    teamRecords.forEach(({ card, rawName, firstName, ...record }, index) => {
      if (card.querySelector(".team-card__profile")) return;

      const avatar = card.querySelector(".team-avatar");
      const role = card.querySelector(".team-card__role");
      const heading = card.querySelector("h4");
      const mobility = card.querySelector(".team-card__mobility");
      const bio = card.querySelector(".team-card__bio");
      if (!avatar || !role || !heading || !bio) return;

      const name = displayNameFor({ card, rawName, firstName, ...record });
      heading.textContent = name;
      const hasBio = bio.querySelector("p") !== null;
      const profile = document.createElement(hasBio ? "details" : "div");
      const surface = document.createElement(hasBio ? "summary" : "div");
      const portraitPanel = document.createElement("span");
      const portrait = document.createElement("span");
      const identity = document.createElement("span");
      const nameLabel = document.createElement("span");
      const roleLabel = document.createElement("span");
      const sheetLink = document.createElement("span");
      const barcode = document.createElement("span");
      const sheetLabel = document.createElement("span");

      profile.className = "team-card__profile";
      surface.className = "team-card__summary";
      if (!hasBio) {
        profile.classList.add("team-card__profile--unavailable");
        surface.setAttribute("aria-disabled", "true");
      }
      portraitPanel.className = "team-card__portrait-panel";
      portrait.className = "team-card__portrait";
      portrait.setAttribute("aria-hidden", "true");
      identity.className = "team-card__identity";
      nameLabel.className = "team-card__name";
      roleLabel.className = "team-card__role";
      sheetLink.className = "team-card__sheet-link";
      barcode.className = "team-card__barcode";
      barcode.setAttribute("aria-hidden", "true");
      barcode.style.backgroundPosition = `${(index * 7) % 19}px 0, ${(index * 11) % 23}px 0`;
      sheetLabel.className = "team-card__sheet-label";

      while (avatar.firstChild) portrait.append(avatar.firstChild);
      // When no profile picture is available, show only the first-name initial.
      // Keep the fallback generated from the canonical first name so FR/EN stay aligned.
      if (!portrait.querySelector("img")) {
        let fallback = portrait.querySelector("span");
        if (!fallback) {
          fallback = document.createElement("span");
          portrait.append(fallback);
        }
        fallback.textContent = firstName.trim().slice(0, 1).toLocaleUpperCase();
        fallback.setAttribute("aria-hidden", "true");
      }
      nameLabel.textContent = name;
      roleLabel.textContent = role.textContent.trim();
      sheetLabel.textContent = isEnglish ? "Profile" : "Fiche synthèse";

      portraitPanel.append(portrait);
      sheetLink.append(barcode, sheetLabel);
      identity.append(nameLabel, roleLabel);
      if (mobility) identity.append(mobility);
      identity.append(sheetLink);
      surface.append(portraitPanel, identity);
      profile.append(surface);

      if (hasBio) {
        const expanded = document.createElement("div");
        const expandedTitle = document.createElement("p");
        expanded.className = "team-card__expanded";
        expandedTitle.className = "team-card__expanded-title";
        expandedTitle.textContent = isEnglish ? `Profile — ${name}` : `Fiche synthèse — ${name}`;
        expanded.append(expandedTitle, bio);
        profile.append(expanded);
      } else {
        bio.remove();
      }

      avatar.remove();
      role.remove();
      heading.remove();
      card.append(profile);

      if (!hasBio) return;

      profile.addEventListener("toggle", () => {
        if (!profile.open) return;

        card.closest(".team-grid")?.querySelectorAll(".team-card__profile[open]").forEach((otherProfile) => {
          if (otherProfile !== profile) otherProfile.open = false;
        });

        window.requestAnimationFrame(() => {
          card.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
            block: "start",
          });
        });
      });
    });
  }

  initTeamProfiles();

  function initTeamMobility() {
    const visibleFlagCount = 6;

    document.querySelectorAll(".team-card__flags").forEach((flags) => {
      const flagItems = [...flags.querySelectorAll(":scope > .team-card__flag")];
      if (flagItems.length <= visibleFlagCount || flags.querySelector(".team-card__flags-toggle")) return;

      const extraFlags = flagItems.slice(visibleFlagCount);
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "team-card__flags-toggle";

      const setExpanded = (expanded) => {
        extraFlags.forEach((flag) => { flag.hidden = !expanded; });
        toggle.textContent = expanded ? "−" : `+${extraFlags.length}`;
        toggle.setAttribute("aria-expanded", String(expanded));
        toggle.setAttribute("aria-label", isEnglish
          ? (expanded ? `Hide ${extraFlags.length} additional countries` : `Show ${extraFlags.length} more countries`)
          : (expanded ? `Masquer les ${extraFlags.length} pays supplémentaires` : `Afficher ${extraFlags.length} pays supplémentaires`));
      };

      toggle.addEventListener("click", (event) => {
        // The toggle sits in the card summary: keep this interaction independent
        // from opening the team profile.
        event.preventDefault();
        event.stopPropagation();
        setExpanded(toggle.getAttribute("aria-expanded") !== "true");
      });

      flags.append(toggle);
      setExpanded(false);
    });
  }

  initTeamMobility();

  const contactForm = document.querySelector("[data-contact-form]");

  if (contactForm) {
    const status = contactForm.querySelector("[data-contact-status]");
    const submitButton = contactForm.querySelector('[type="submit"]');
    const messages = isEnglish ? {
      invalid: "Please complete all required fields and describe your situation in at least 20 characters.",
      sending: "Sending your request…",
      success: "Thank you. Your request has been sent. We will get back to you shortly.",
      pending: "Your request has been recorded. Delivery confirmation may take a few moments. We will contact you if necessary.",
      demo: "This is the GitHub Pages preview: email sending is intentionally disabled here. Your request has not been sent.",
      error: "Your request could not be sent. Please try again or contact us at contact@rusafe.fr."
    } : {
      invalid: "Veuillez renseigner les champs obligatoires et fournir au moins 20 caractères de contexte.",
      sending: "Envoi de votre demande…",
      success: "Merci. Votre demande a bien été envoyée ; nous vous répondrons prochainement.",
      pending: "Votre demande a été prise en compte. La confirmation de livraison peut prendre quelques instants ; nous vous recontacterons si nécessaire.",
      demo: "Ceci est la pré-production GitHub Pages : l’envoi d’e-mail y est volontairement désactivé. Votre demande n’a pas été envoyée.",
      error: "Votre demande n’a pas pu être envoyée. Réessayez ou écrivez-nous à contact@rusafe.fr."
    };

    const setStatus = (message, state) => {
      if (!status) return;
      status.hidden = false;
      status.textContent = message;
      status.dataset.state = state;
    };

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        setStatus(messages.invalid, "error");
        return;
      }

      if (contactForm.dataset.contactMode === "demo") {
        setStatus(messages.demo, "info");
        return;
      }

      submitButton.disabled = true;
      submitButton.setAttribute("aria-busy", "true");
      setStatus(messages.sending, "loading");

      try {
        const response = await fetch(contactForm.action, {
          method: "POST",
          body: new FormData(contactForm),
          headers: { Accept: "application/json" }
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || !payload.ok) throw new Error(payload.message || "Contact request failed");

        const isPending = payload.delivery_status === "pending";
        contactForm.reset();
        setStatus(isPending ? messages.pending : messages.success, isPending ? "pending" : "success");
      } catch {
        setStatus(messages.error, "error");
      } finally {
        submitButton.disabled = false;
        submitButton.removeAttribute("aria-busy");
      }
    });
  }
})();

(() => {
  document.querySelectorAll("[data-media-dialog-open]").forEach((trigger) => {
    const dialog = document.getElementById(trigger.dataset.mediaDialogOpen);
    const closeButton = dialog?.querySelector("[data-media-dialog-close]");

    if (!dialog) return;

    trigger.addEventListener("click", () => dialog.showModal());
    closeButton?.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  });
})();
