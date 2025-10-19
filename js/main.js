console.log("main.js lastet");

document.addEventListener("DOMContentLoaded", () => {
  /* Hide header ved scroll */
  let lastScroll = window.pageYOffset || document.documentElement.scrollTop;
  const header = document.querySelector("header");
  const deadzone = 20;
  if (header) {
    window.addEventListener("scroll", () => {
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
      if (currentScroll <= 0) {
        header.style.transform = "translateY(0)";
      } else if (currentScroll > lastScroll + deadzone && currentScroll > 120) {
        header.style.transform = "translateY(-100%)";
        lastScroll = currentScroll;
      } else if (currentScroll < lastScroll - deadzone) {
        header.style.transform = "translateY(0)";
        lastScroll = currentScroll;
      }
    });
  }

  /* Accordion */
  document.querySelectorAll(".accordion-header").forEach(h => {
    h.addEventListener("click", () => {
      const body = h.nextElementSibling;
      if (body) body.classList.toggle("active");
    });
  });

  /* Landing: tabs -> vis seksjon først ved klikk (eller hash) */
  const tabsContainer = document.getElementById("tabs-container");
  const topTabs = document.querySelectorAll(".tabs .tab");
  const privatWrapper = document.getElementById("privat-content");
  const bedriftWrapper = document.getElementById("bedrift-content");

  function showSection(name) {
    if (privatWrapper) privatWrapper.style.display = "none";
    if (bedriftWrapper) bedriftWrapper.style.display = "none";
    if (name === "privat" && privatWrapper) privatWrapper.style.display = "block";
    if (name === "bedrift" && bedriftWrapper) bedriftWrapper.style.display = "block";
  }

  function openAndHideTabs(name) {
    showSection(name);
    if (tabsContainer) tabsContainer.style.display = "none";
  }

  // Ikke rør tabs-container ved load; vis landing. Åpne via hash hvis satt.
  if (location.hash === "#privat") openAndHideTabs("privat");
  else if (location.hash === "#bedrift") openAndHideTabs("bedrift");
  // Klikk på knapper
  topTabs.forEach(btn => {
    btn.addEventListener("click", () => openAndHideTabs(btn.dataset.tab));
  });

  /* Hero scroll-indikator */
  function attachScrollDetection(container) {
    if (!container) return;
    if (container._scrollHandler) {
      container.removeEventListener("scroll", container._scrollHandler);
    }
    const handler = () => {
      const scrollBottom = container.scrollHeight - container.clientHeight - container.scrollTop;
      const isScrollable = container.scrollHeight > container.clientHeight + 5;
      const isAtBottom = scrollBottom <= 15;
      container.classList.toggle("scrolled-to-bottom", !isScrollable || isAtBottom);
    };
    container._scrollHandler = handler;
    container.addEventListener("scroll", handler);
    handler();
  }

  /* Generisk hero-setup (separat for p- og b-innhold) */
  function setupHero(scopeEl, tabSelector, panelSelector, dataAttr, idPrefix) {
    if (!scopeEl) return;
    const tabs = scopeEl.querySelectorAll(tabSelector);
    const panels = scopeEl.querySelectorAll(panelSelector);

    function activate(id) {
      tabs.forEach(t => t.classList.remove("active"));
      panels.forEach(p => p.classList.remove("active"));
      const activeTab = Array.from(tabs).find(t => t.getAttribute(dataAttr) === id);
      const activePanel = scopeEl.querySelector(`${idPrefix}${id}`);
      if (activeTab) activeTab.classList.add("active");
      if (activePanel) activePanel.classList.add("active");

      scopeEl.querySelectorAll(".hero-knapper .cta-button").forEach(b => b.classList.remove("cta-active"));
      if (activePanel) {
        const sel = id === "1" ? ".chat-btn" : id === "2" ? ".avtal-btn" : id === "3" ? ".kurs-btn" : null;
        if (sel) activePanel.querySelector(sel)?.classList.add("cta-active");
      }
      attachScrollDetection(activePanel?.querySelector(".hero-content-scroll"));
    }

    tabs.forEach(t => t.addEventListener("click", () => activate(t.getAttribute(dataAttr))));
    const initId = scopeEl.querySelector(`${tabSelector}.active`)?.getAttribute(dataAttr) || tabs[0]?.getAttribute(dataAttr);
    if (initId) activate(initId);
  }

  // Sett opp begge (uavhengig)
  setupHero(privatWrapper, ".p-tab", ".p-tab-content", "data-p", "#p-tab-");
  setupHero(bedriftWrapper, ".b-tab", ".b-tab-content", "data-b", "#b-tab-");

  /* Hamburger-meny */
  const menuBtn = document.getElementById("menu-btn");
  const mobileNav = document.getElementById("mobile-nav");
  if (menuBtn && mobileNav) {
    let open = false;
    menuBtn.addEventListener("click", e => {
      e.stopPropagation();
      open = !open;
      mobileNav.classList.toggle("open", open);
    });
    mobileNav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
      open = false;
      mobileNav.classList.remove("open");
    }));
    document.addEventListener("click", e => {
      if (open && !mobileNav.contains(e.target) && e.target !== menuBtn) {
        open = false;
        mobileNav.classList.remove("open");
      }
    });
  }

  /* Åpne/lukke widget overlay */
  const overlay = document.getElementById("bilinfobetaling-overlay");
  document.addEventListener("click", e => {
    const openBtn = e.target.closest("[data-open-widget]");
    const closeBtn = e.target.closest("[data-close-widget]");
    if (openBtn && overlay) overlay.style.display = "block";
    if (closeBtn && overlay) overlay.style.display = "none";
  });
});