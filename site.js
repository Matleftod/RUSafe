(() => {
  const topbar = document.querySelector(".topbar");
  const mobileToggle = document.getElementById("mobileToggle");
  const mobileToggleIcon = document.getElementById("mobileToggleIcon");
  const navLinks = document.getElementById("navLinks");
  const scrollSentinel = document.getElementById("scrollSentinel");
  const desktopMedia = window.matchMedia("(min-width: 901px)");

  function setMenuState(isOpen, returnFocus = false) {
    navLinks?.classList.toggle("open", isOpen);
    topbar?.classList.toggle("menu-open", isOpen);
    mobileToggle?.setAttribute("aria-expanded", String(isOpen));
    mobileToggle?.setAttribute("aria-label", isOpen ? "Fermer le menu" : "Ouvrir le menu");

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
      const details = document.createElement("details");
      const summary = document.createElement("summary");
      const portraitPanel = document.createElement("span");
      const portrait = document.createElement("span");
      const identity = document.createElement("span");
      const nameLabel = document.createElement("span");
      const roleLabel = document.createElement("span");
      const sheetLink = document.createElement("span");
      const barcode = document.createElement("span");
      const sheetLabel = document.createElement("span");
      const expanded = document.createElement("div");
      const expandedTitle = document.createElement("p");

      details.className = "team-card__profile";
      summary.setAttribute("aria-label", `Afficher la fiche synthèse de ${name}`);
      portraitPanel.className = "team-card__portrait-panel";
      portrait.className = "team-card__portrait";
      portrait.setAttribute("role", "img");
      portrait.setAttribute("aria-label", avatar.getAttribute("aria-label") || `Avatar de ${name}`);
      identity.className = "team-card__identity";
      nameLabel.className = "team-card__name";
      roleLabel.className = "team-card__role";
      sheetLink.className = "team-card__sheet-link";
      barcode.className = "team-card__barcode";
      barcode.setAttribute("aria-hidden", "true");
      barcode.style.backgroundPosition = `${(index * 7) % 19}px 0, ${(index * 11) % 23}px 0`;
      sheetLabel.className = "team-card__sheet-label";
      expanded.className = "team-card__expanded";
      expandedTitle.className = "team-card__expanded-title";

      while (avatar.firstChild) portrait.append(avatar.firstChild);
      nameLabel.textContent = name;
      roleLabel.textContent = role.textContent.trim();
      sheetLabel.textContent = "Fiche synthèse";
      expandedTitle.textContent = `Fiche synthèse — ${name}`;

      portraitPanel.append(portrait);
      sheetLink.append(barcode, sheetLabel);
      identity.append(nameLabel, roleLabel, sheetLink);
      summary.append(portraitPanel, identity);
      expanded.append(expandedTitle, bio);
      details.append(summary, expanded);

      avatar.remove();
      role.remove();
      heading.remove();
      card.append(details);

      details.addEventListener("toggle", () => {
        summary.setAttribute("aria-label", `${details.open ? "Fermer" : "Afficher"} la fiche synthèse de ${name}`);
        if (!details.open) return;

        card.closest(".team-grid")?.querySelectorAll(".team-card__profile[open]").forEach((profile) => {
          if (profile !== details) profile.open = false;
        });
      });
    });
  }

  initTeamProfiles();

  const contactForm = document.querySelector("[data-recipient]");

  contactForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(contactForm);
    const subject = "Échange R’U SAFE — " + (data.get("need") || "Nouveau besoin");
    const body = [
      "Nom : " + (data.get("name") || ""),
      "Organisation : " + (data.get("organisation") || ""),
      "Fonction : " + (data.get("role") || ""),
      "E-mail : " + (data.get("email") || ""),
      "Besoin : " + (data.get("need") || ""),
      "Échéance : " + (data.get("deadline") || ""),
      "",
      String(data.get("message") || "")
    ].join("\n");

    const recipient = contactForm.dataset.recipient || "contact@rusafe.fr";
    window.location.href = "mailto:" + recipient + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  });
})();
