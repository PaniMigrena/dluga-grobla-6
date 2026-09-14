(() => {
  "use strict";

  /* ---------------------------------------------------------
     Sticky header background on scroll
  --------------------------------------------------------- */
  const header = document.getElementById("siteHeader");
  const backToTop = document.getElementById("backToTop");

  const onScroll = () => {
    const scrolled = window.scrollY > 40;
    header.classList.toggle("is-scrolled", scrolled);
    backToTop.classList.toggle("is-visible", window.scrollY > 600);
  };
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------------------------------------------------------
     Mobile navigation
  --------------------------------------------------------- */
  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");
  const navScrim = document.getElementById("navScrim");

  const closeNav = () => {
    mainNav.classList.remove("is-open");
    navScrim.classList.remove("is-active");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };
  const openNav = () => {
    mainNav.classList.add("is-open");
    navScrim.classList.add("is-active");
    navToggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  };

  navToggle.addEventListener("click", () => {
    mainNav.classList.contains("is-open") ? closeNav() : openNav();
  });
  navScrim.addEventListener("click", closeNav);
  mainNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNav));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNav();
  });

  /* ---------------------------------------------------------
     Scroll reveal animations (IntersectionObserver)
  --------------------------------------------------------- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------------------------------------------------------
     Apartment thumbnail galleries (swap main image)
  --------------------------------------------------------- */
  document.querySelectorAll(".apt-gallery").forEach((gallery) => {
    const mainImg = gallery.querySelector(".apt-main-img");
    const thumbs = gallery.querySelectorAll(".apt-thumb");

    thumbs.forEach((thumb) => {
      thumb.addEventListener("click", () => {
        const src = thumb.getAttribute("data-src");
        if (!src || src === mainImg.getAttribute("src")) return;
        mainImg.style.opacity = "0";
        window.setTimeout(() => {
          mainImg.setAttribute("src", src);
          mainImg.setAttribute("data-index", thumb.getAttribute("data-index"));
          mainImg.style.opacity = "1";
        }, 180);
        thumbs.forEach((t) => t.classList.remove("is-active"));
        thumb.classList.add("is-active");

        const openBtn = gallery.querySelector(".gallery-open");
        if (openBtn) openBtn.setAttribute("data-open-index", thumb.getAttribute("data-index"));
      });
    });
  });

  /* ---------------------------------------------------------
     Lightbox
  --------------------------------------------------------- */
  const galleries = {
    morze: Array.from(document.querySelectorAll('[data-gallery="morze"] .apt-thumb')).map((t) => ({
      src: t.getAttribute("data-src"),
      alt: "Apartament Morze",
    })),
    las: Array.from(document.querySelectorAll('[data-gallery="las"] .apt-thumb')).map((t) => ({
      src: t.getAttribute("data-src"),
      alt: "Apartament Las",
    })),
    okolica: Array.from(document.querySelectorAll('[data-gallery="okolica"] .loc-photo img')).map((img) => ({
      src: img.getAttribute("src"),
      alt: img.getAttribute("alt"),
    })),
  };

  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxCount = document.getElementById("lightboxCount");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxPrev = document.getElementById("lightboxPrev");
  const lightboxNext = document.getElementById("lightboxNext");

  let currentGallery = [];
  let currentIndex = 0;
  let lastFocused = null;

  const renderLightbox = () => {
    const item = currentGallery[currentIndex];
    if (!item) return;
    lightboxImg.setAttribute("src", item.src);
    lightboxImg.setAttribute("alt", item.alt || "");
    lightboxCount.textContent = `${currentIndex + 1} / ${currentGallery.length}`;
  };

  const openLightbox = (galleryKey, index) => {
    const set = galleries[galleryKey];
    if (!set || !set.length) return;
    currentGallery = set;
    currentIndex = index >= 0 && index < set.length ? index : 0;
    renderLightbox();
    lastFocused = document.activeElement;
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    lightboxClose.focus();
  };

  const closeLightbox = () => {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  };

  const showNext = () => {
    currentIndex = (currentIndex + 1) % currentGallery.length;
    renderLightbox();
  };
  const showPrev = () => {
    currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
    renderLightbox();
  };

  document.querySelectorAll("[data-open-lightbox]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const key = trigger.getAttribute("data-open-lightbox");
      const index = parseInt(trigger.getAttribute("data-open-index"), 10) || 0;
      openLightbox(key, index);
    });
  });

  lightboxClose.addEventListener("click", closeLightbox);
  lightboxNext.addEventListener("click", showNext);
  lightboxPrev.addEventListener("click", showPrev);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") showNext();
    if (e.key === "ArrowLeft") showPrev();
  });

  /* Basic swipe support for touch devices */
  let touchStartX = 0;
  lightbox.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener("touchend", (e) => {
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 50) {
      delta > 0 ? showPrev() : showNext();
    }
  }, { passive: true });

  /* ---------------------------------------------------------
     FAQ accordion
  --------------------------------------------------------- */
  document.querySelectorAll(".faq-item").forEach((item) => {
    const question = item.querySelector(".faq-question");
    question.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");
      document.querySelectorAll(".faq-item.is-open").forEach((openItem) => {
        openItem.classList.remove("is-open");
        openItem.querySelector(".faq-question").setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("is-open");
        question.setAttribute("aria-expanded", "true");
      }
    });
  });
})();
