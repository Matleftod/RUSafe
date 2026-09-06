(() => {
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

  function initTeamProfiles() {
    document.querySelectorAll(".team-card").forEach((card, index) => {
      if (card.querySelector(".team-card__profile")) return;

      const avatar = card.querySelector(".team-avatar");
      const role = card.querySelector(".team-card__role");
      const heading = card.querySelector("h4");
      const bio = card.querySelector(".team-card__bio");
      if (!avatar || !role || !heading || !bio) return;

      const name = heading.textContent.trim();
      const bioText = bio.textContent.trim();
      const hasBio = bioText !== "" && !/^(?:Bio à compléter|Bio to be completed)\.?$/i.test(bioText);
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
      if (hasBio) {
        surface.setAttribute("aria-label", isEnglish ? `View ${name}'s profile` : `Afficher la fiche synthèse de ${name}`);
      } else {
        profile.classList.add("team-card__profile--unavailable");
        surface.setAttribute("aria-disabled", "true");
      }
      portraitPanel.className = "team-card__portrait-panel";
      portrait.className = "team-card__portrait";
      portrait.setAttribute("role", "img");
      portrait.setAttribute("aria-label", avatar.getAttribute("aria-label") || (isEnglish ? `${name}'s avatar` : `Avatar de ${name}`));
      identity.className = "team-card__identity";
      nameLabel.className = "team-card__name";
      roleLabel.className = "team-card__role";
      sheetLink.className = "team-card__sheet-link";
      barcode.className = "team-card__barcode";
      barcode.setAttribute("aria-hidden", "true");
      barcode.style.backgroundPosition = `${(index * 7) % 19}px 0, ${(index * 11) % 23}px 0`;
      sheetLabel.className = "team-card__sheet-label";

      while (avatar.firstChild) portrait.append(avatar.firstChild);
      nameLabel.textContent = name;
      roleLabel.textContent = role.textContent.trim();
      sheetLabel.textContent = isEnglish ? "Profile" : "Fiche synthèse";

      portraitPanel.append(portrait);
      sheetLink.append(barcode, sheetLabel);
      identity.append(nameLabel, roleLabel, sheetLink);
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
        surface.setAttribute("aria-label", isEnglish
          ? `${profile.open ? "Close" : "View"} ${name}'s profile`
          : `${profile.open ? "Fermer" : "Afficher"} la fiche synthèse de ${name}`);
        if (!profile.open) return;

        card.closest(".team-grid")?.querySelectorAll(".team-card__profile[open]").forEach((otherProfile) => {
          if (otherProfile !== profile) otherProfile.open = false;
        });
      });
    });
  }

  initTeamProfiles();

  const contactForm = document.querySelector("[data-contact-form]");

  if (contactForm) {
    const status = contactForm.querySelector("[data-contact-status]");
    const submitButton = contactForm.querySelector('[type="submit"]');
    const messages = isEnglish ? {
      invalid: "Please complete the required fields and provide at least 20 characters of context.",
      sending: "Sending your request…",
      success: "Thank you. Your request has been sent; we will get back to you shortly.",
      demo: "This is the GitHub Pages preview: email sending is intentionally disabled here. Your request has not been sent.",
      error: "Your request could not be sent. Please try again or contact us at contact@rusafe.fr."
    } : {
      invalid: "Veuillez renseigner les champs obligatoires et fournir au moins 20 caractères de contexte.",
      sending: "Envoi de votre demande…",
      success: "Merci. Votre demande a bien été envoyée ; nous vous répondrons prochainement.",
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

        contactForm.reset();
        setStatus(messages.success, "success");
      } catch {
        setStatus(messages.error, "error");
      } finally {
        submitButton.disabled = false;
        submitButton.removeAttribute("aria-busy");
      }
    });
  }
})();
