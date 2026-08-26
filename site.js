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

    const recipient = contactForm.dataset.recipient || "pmi@rusafe.fr";
    window.location.href = "mailto:" + recipient + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  });
})();
