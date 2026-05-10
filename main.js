const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasGsap = typeof window.gsap !== "undefined";

document.documentElement.classList.toggle("no-gsap", !hasGsap);

const screens = Array.from(document.querySelectorAll(".screen"));
const heroScreen = document.querySelector(".hero-screen");
const nextScreen = document.querySelector(".next-screen");
const canvasScreen = document.querySelector(".canvas-screen");
const featuredScreen = document.querySelector(".featured-screen");
const storyboardScreen = document.querySelector(".storyboard-screen");
const landingScreen = document.querySelector(".landing-screen");
const exploreButton = document.querySelector(".explore");
const secondExploreButton = document.querySelector(".second-explore");
const thirdExploreButton = document.querySelector(".third-explore");
const fourthExploreButton = document.querySelector(".fourth-explore");
const fifthExploreButton = document.querySelector(".fifth-explore");
const finalBackTopButton = document.querySelector(".final-back-top");
const figureFloat = document.querySelector(".figure-float");
const heroParallaxItems = Array.from(heroScreen?.querySelectorAll("[data-depth]") || []);
const secondParallaxItems = Array.from(nextScreen?.querySelectorAll("[data-second-depth]") || []);
const thirdParallaxItems = Array.from(canvasScreen?.querySelectorAll("[data-third-depth]") || []);
const fourthParallaxItems = Array.from(featuredScreen?.querySelectorAll("[data-fourth-depth]") || []);
const fifthParallaxItems = Array.from(storyboardScreen?.querySelectorAll("[data-fifth-depth]") || []);
const finalParallaxItems = Array.from(landingScreen?.querySelectorAll("[data-final-depth]") || []);

let currentScreen = 0;
let isTransitioning = false;
let pointerActive = false;
let scrollProgress = 0;
let scrollResetTimer = 0;
let ghostFadeTimer = 0;
let heroAdvanceQueued = false;
const HERO_SCROLL_STEP = 240;
const HERO_SCROLL_TRIGGER = 0.2;
const HERO_SCROLL_ADVANCE_DELAY = 110;
const HERO_SCROLL_DIRECT_DELTA = 48;
const HERO_SCROLL_MIN_DELTA = 6;
const PAGE_SCROLL_MIN_DELTA = 20;

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function setScreenState(index) {
  screens.forEach((screen, screenIndex) => {
    screen.classList.toggle("is-active", screenIndex === index);
    screen.setAttribute("aria-hidden", String(screenIndex !== index));
  });
}

function goToScreen(index) {
  const target = Math.max(0, Math.min(index, screens.length - 1));

  if (target === currentScreen || isTransitioning) {
    return;
  }

  if (target === 0 && currentScreen > 1) {
    jumpToScreen(0);
    return;
  }

  isTransitioning = true;

  if (!hasGsap || reduceMotion) {
    screens.forEach((screen, screenIndex) => {
      screen.style.opacity = screenIndex === target ? "1" : "0";
      screen.style.transform = screenIndex === target ? "translateY(0)" : "translateY(7vh)";
    });
    currentScreen = target;
    scrollProgress = 0;
    heroAdvanceQueued = false;
    setScreenState(currentScreen);
    window.setTimeout(() => {
      isTransitioning = false;
    }, 180);
    return;
  }

  const toNext = target > currentScreen;
  const tl = gsap.timeline({
    defaults: { ease: "power3.inOut" },
    onComplete: () => {
      currentScreen = target;
      scrollProgress = 0;
      heroAdvanceQueued = false;
      setScreenState(currentScreen);
      isTransitioning = false;
    },
  });

  if (currentScreen === 0 && target === 1) {
    tl.to(
      ".hero-piece",
      {
        autoAlpha: 0,
        y: -42,
        duration: 0.72,
        stagger: 0.025,
      },
      0,
    )
      .to(
        ".title-layer",
        {
          autoAlpha: 0,
          y: -72,
          scale: 0.96,
          duration: 0.76,
        },
        0.03,
      )
      .to(
        ".figure-layer",
        {
          autoAlpha: 0.16,
          xPercent: 3,
          scale: 1.035,
          duration: 0.9,
        },
        0.02,
      )
      .to(
        heroScreen,
        {
          autoAlpha: 0,
          duration: 0.86,
        },
        0.12,
      )
      .to(
        nextScreen,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.92,
        },
        0.18,
      )
      .fromTo(
        ".second-console-wrap",
        { autoAlpha: 0, x: 160, y: 36, scale: 0.985 },
        { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 1.02 },
        0.35,
      )
      .fromTo(
        ".second-figure-layer",
        { autoAlpha: 0, x: -54, y: 42, scale: 1.025 },
        { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 1.04 },
        0.42,
      )
      .fromTo(
        ".second-nav, .second-workflow, .second-hud, .second-explore",
        { autoAlpha: 0, y: 28 },
        { autoAlpha: 1, y: 0, duration: 0.76, stagger: 0.045 },
        0.58,
      );
  } else if (currentScreen === 1 && target === 2) {
    tl.to(
      ".second-piece",
      {
        autoAlpha: 0,
        y: -34,
        duration: 0.58,
        stagger: 0.018,
      },
      0,
    )
      .to(
        nextScreen,
        {
          autoAlpha: 0,
          y: "-5vh",
          duration: 0.78,
        },
        0.08,
      )
      .to(
        canvasScreen,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.94,
        },
        0.16,
      )
      .fromTo(
        ".third-canvas-wrap",
        { autoAlpha: 0, x: 170, y: 34, scale: 0.985 },
        { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 1.05 },
        0.34,
      )
      .fromTo(
        ".third-title-wrap",
        { autoAlpha: 0, x: -72, y: 28, scale: 0.985 },
        { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 0.95 },
        0.42,
      )
      .fromTo(
        ".third-figure-wrap",
        { autoAlpha: 0, x: -52, y: 72, scale: 1.035 },
        { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 1.08 },
        0.5,
      )
      .fromTo(
        ".third-nav, .third-orbits, .third-hud, .third-explore",
        { autoAlpha: 0, y: 26 },
        { autoAlpha: 1, y: 0, duration: 0.76, stagger: 0.045 },
        0.66,
      );
  } else if (currentScreen === 2 && target === 3) {
    tl.to(
      ".third-piece",
      {
        autoAlpha: 0,
        y: -34,
        duration: 0.58,
        stagger: 0.018,
      },
      0,
    )
      .to(
        canvasScreen,
        {
          autoAlpha: 0,
          y: "-5vh",
          duration: 0.78,
        },
        0.08,
      )
      .to(
        featuredScreen,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.94,
        },
        0.16,
      )
      .fromTo(
        ".fourth-canvas-wrap",
        { autoAlpha: 0, x: -160, y: 34, scale: 0.985 },
        { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 1.05 },
        0.34,
      )
      .fromTo(
        ".fourth-content-wrap, .fourth-interface-button",
        { autoAlpha: 0, x: 78, y: 26, scale: 0.985 },
        { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 0.96 },
        0.44,
      )
      .fromTo(
        ".fourth-figure-wrap",
        { autoAlpha: 0, x: 82, y: 60, scale: 1.035 },
        { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 1.12 },
        0.5,
      )
      .fromTo(
        ".fourth-nav, .fourth-orbits, .fourth-hud, .fourth-explore",
        { autoAlpha: 0, y: 26 },
        { autoAlpha: 1, y: 0, duration: 0.76, stagger: 0.045 },
        0.66,
      );
  } else if (currentScreen === 3 && target === 4) {
    tl.to(
      ".fourth-piece",
      {
        autoAlpha: 0,
        y: -34,
        duration: 0.58,
        stagger: 0.018,
      },
      0,
    )
      .to(
        featuredScreen,
        {
          autoAlpha: 0,
          y: "-5vh",
          duration: 0.78,
        },
        0.08,
      )
      .to(
        storyboardScreen,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.94,
        },
        0.16,
      )
      .fromTo(
        ".fifth-interface-wrap",
        { autoAlpha: 0, x: 168, y: 34, scale: 0.985 },
        { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 1.08 },
        0.32,
      )
      .fromTo(
        ".fifth-copy-wrap, .fifth-feature-cards",
        { autoAlpha: 0, x: -76, y: 28, scale: 0.985 },
        { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 0.98, stagger: 0.05 },
        0.42,
      )
      .fromTo(
        ".fifth-figure-wrap",
        { autoAlpha: 0, x: 86, y: 62, scale: 1.035 },
        { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 1.14 },
        0.48,
      )
      .fromTo(
        ".fifth-nav, .fifth-circuitry, .fifth-hud, .fifth-explore",
        { autoAlpha: 0, y: 26 },
        { autoAlpha: 1, y: 0, duration: 0.76, stagger: 0.045 },
        0.64,
      );
  } else if (currentScreen === 4 && target === 5) {
    tl.to(
      ".fifth-piece",
      {
        autoAlpha: 0,
        y: -34,
        duration: 0.58,
        stagger: 0.018,
      },
      0,
    )
      .to(
        storyboardScreen,
        {
          autoAlpha: 0,
          y: "-5vh",
          duration: 0.78,
        },
        0.08,
      )
      .to(
        landingScreen,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.94,
        },
        0.16,
      )
      .fromTo(
        ".final-figure-wrap",
        { autoAlpha: 0, y: 68, scale: 1.035 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 1.12 },
        0.3,
      )
      .fromTo(
        ".final-title-wrap",
        { autoAlpha: 0, y: 44, scale: 0.985 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.94 },
        0.46,
      )
      .fromTo(
        ".final-info, .final-download-cta",
        { autoAlpha: 0, y: 26 },
        { autoAlpha: 1, y: 0, duration: 0.78, stagger: 0.04 },
        0.58,
      )
      .fromTo(
        ".final-nav, .final-center-bg-wrap, .final-footer",
        { autoAlpha: 0, y: 28 },
        { autoAlpha: 1, y: 0, duration: 0.76, stagger: 0.045 },
        0.68,
      );
  } else if (currentScreen === 1 && target === 0) {
    tl.to(
      nextScreen,
      {
        autoAlpha: 0,
        y: "7vh",
        duration: 0.72,
        },
        0,
      )
      .to(
        ".second-piece",
        {
          autoAlpha: 0,
          y: 24,
          duration: 0.48,
          stagger: 0.018,
        },
        0,
      )
      .to(
        heroScreen,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
        },
        0.06,
      )
      .to(
        ".figure-layer",
        {
          autoAlpha: 1,
          xPercent: 0,
          scale: 1,
          duration: 0.78,
        },
        0.12,
      )
      .to(
        ".title-layer",
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.74,
        },
        0.18,
      )
      .to(
        ".hero-piece",
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.68,
          stagger: 0.025,
        },
        0.22,
      );
  } else if (currentScreen === 2 && target === 1) {
    tl.to(
      canvasScreen,
      {
        autoAlpha: 0,
        y: "7vh",
        duration: 0.72,
      },
      0,
    )
      .to(
        ".third-piece",
        {
          autoAlpha: 0,
          y: 24,
          duration: 0.5,
          stagger: 0.018,
        },
        0,
      )
      .to(
        nextScreen,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.68,
        },
        0.08,
      )
      .to(
        ".second-console-wrap",
        {
          autoAlpha: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.78,
        },
        0.16,
      )
      .to(
        ".second-figure-layer",
        {
          autoAlpha: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.78,
        },
        0.2,
      )
      .to(
        ".second-nav, .second-workflow, .second-hud, .second-explore",
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.64,
          stagger: 0.035,
        },
        0.24,
      );
  } else if (currentScreen === 3 && target === 2) {
    tl.to(
      featuredScreen,
      {
        autoAlpha: 0,
        y: "7vh",
        duration: 0.72,
      },
      0,
    )
      .to(
        ".fourth-piece",
        {
          autoAlpha: 0,
          y: 24,
          duration: 0.5,
          stagger: 0.018,
        },
        0,
      )
      .to(
        canvasScreen,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.68,
        },
        0.08,
      )
      .to(
        ".third-canvas-wrap, .third-title-wrap, .third-figure-wrap",
        {
          autoAlpha: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.78,
        },
        0.16,
      )
      .to(
        ".third-nav, .third-orbits, .third-hud, .third-explore",
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.64,
          stagger: 0.035,
        },
        0.24,
      );
  } else if (currentScreen === 4 && target === 3) {
    tl.to(
      storyboardScreen,
      {
        autoAlpha: 0,
        y: "7vh",
        duration: 0.72,
      },
      0,
    )
      .to(
        ".fifth-piece",
        {
          autoAlpha: 0,
          y: 24,
          duration: 0.5,
          stagger: 0.018,
        },
        0,
      )
      .to(
        featuredScreen,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.68,
        },
        0.08,
      )
      .to(
        ".fourth-canvas-wrap, .fourth-content-wrap, .fourth-interface-button, .fourth-figure-wrap",
        {
          autoAlpha: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.78,
        },
        0.16,
      )
      .to(
        ".fourth-nav, .fourth-orbits, .fourth-hud, .fourth-explore",
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.64,
          stagger: 0.035,
        },
        0.24,
      );
  } else if (currentScreen === 5 && target === 4) {
    tl.to(
      landingScreen,
      {
        autoAlpha: 0,
        y: "7vh",
        duration: 0.72,
      },
      0,
    )
      .to(
        ".final-piece",
        {
          autoAlpha: 0,
          y: 24,
          duration: 0.5,
          stagger: 0.018,
        },
        0,
      )
      .to(
        storyboardScreen,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.68,
        },
        0.08,
      )
      .to(
        ".fifth-interface-wrap, .fifth-copy-wrap, .fifth-feature-cards, .fifth-figure-wrap",
        {
          autoAlpha: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.78,
        },
        0.16,
      )
      .to(
        ".fifth-nav, .fifth-circuitry, .fifth-hud, .fifth-explore",
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.64,
          stagger: 0.035,
        },
        0.24,
      );
  } else {
    tl.to(screens[currentScreen], { autoAlpha: 0, y: toNext ? "-5vh" : "7vh", duration: 0.64 }, 0)
      .to(screens[target], { autoAlpha: 1, y: 0, duration: 0.72 }, 0.1);
  }
}

function jumpToScreen(index) {
  const target = Math.max(0, Math.min(index, screens.length - 1));

  scrollProgress = 0;
  heroAdvanceQueued = false;
  currentScreen = target;
  setScreenState(currentScreen);

  if (!hasGsap || reduceMotion) {
    screens.forEach((screen, screenIndex) => {
      screen.style.opacity = screenIndex === target ? "1" : "0";
      screen.style.transform = screenIndex === target ? "translateY(0)" : "translateY(7vh)";
    });
    return;
  }

  gsap.killTweensOf(
    ".hero-piece, .title-layer, .figure-layer, .bg-layer, .second-piece, .third-piece, .fourth-piece, .fifth-piece, .final-piece, .second-console-wrap, .second-figure-layer, .third-canvas-wrap, .third-title-wrap, .third-figure-wrap, .fourth-canvas-wrap, .fourth-content-wrap, .fourth-figure-wrap, .fifth-interface-wrap, .fifth-copy-wrap, .fifth-feature-cards, .fifth-figure-wrap, .final-center-bg-wrap, .final-figure-wrap, .final-title-wrap, .final-info, .final-download-cta, .final-footer",
  );
  gsap.set(screens, { autoAlpha: 0, y: "7vh" });
  gsap.set(screens[target], { autoAlpha: 1, y: 0 });
  gsap.set(".hero-piece, .title-layer, .figure-layer, .bg-layer", {
    autoAlpha: target === 0 ? 1 : 0,
    x: 0,
    y: 0,
    rotation: 0,
    scale: 1,
  });
  gsap.set(".second-piece", { autoAlpha: target === 1 ? 1 : 0, x: 0, y: 0, scale: 1 });
  gsap.set(".second-console-wrap, .second-figure-layer", {
    autoAlpha: target === 1 ? 1 : 0,
    x: 0,
    y: 0,
    scale: 1,
  });
  gsap.set(".third-piece", { autoAlpha: target === 2 ? 1 : 0, x: 0, y: 0, scale: 1 });
  gsap.set(".third-canvas-wrap, .third-title-wrap, .third-figure-wrap", {
    autoAlpha: target === 2 ? 1 : 0,
    x: 0,
    y: 0,
    scale: 1,
  });
  gsap.set(".fourth-piece", { autoAlpha: target === 3 ? 1 : 0, x: 0, y: 0, scale: 1 });
  gsap.set(".fourth-canvas-wrap, .fourth-content-wrap, .fourth-figure-wrap", {
    autoAlpha: target === 3 ? 1 : 0,
    x: 0,
    y: 0,
    scale: 1,
  });
  gsap.set(".fifth-piece", { autoAlpha: target === 4 ? 1 : 0, x: 0, y: 0, scale: 1 });
  gsap.set(".fifth-interface-wrap, .fifth-copy-wrap, .fifth-feature-cards, .fifth-figure-wrap", {
    autoAlpha: target === 4 ? 1 : 0,
    x: 0,
    y: 0,
    scale: 1,
  });
  gsap.set(".final-piece", { autoAlpha: target === 5 ? 1 : 0, x: 0, y: 0, scale: 1 });
  gsap.set(".final-center-bg-wrap, .final-figure-wrap, .final-title-wrap, .final-info, .final-download-cta, .final-footer", {
    autoAlpha: target === 5 ? 1 : 0,
    x: 0,
    y: 0,
    scale: 1,
  });
}

function setGhostTrail(x, y, boost) {
  if (!figureFloat) {
    return;
  }

  figureFloat.style.setProperty("--ghost-x", `${x.toFixed(1)}px`);
  figureFloat.style.setProperty("--ghost-y", `${y.toFixed(1)}px`);
  figureFloat.style.setProperty("--ghost-boost", boost.toFixed(2));
}

function fadeGhostTrail(delay = 260) {
  window.clearTimeout(ghostFadeTimer);
  ghostFadeTimer = window.setTimeout(() => {
    if (!figureFloat) {
      return;
    }

    figureFloat.style.setProperty("--ghost-boost", "0");
  }, delay);
}

function easeOut(value) {
  return 1 - Math.pow(1 - value, 3);
}

function getNormalizedWheelDeltaY(event) {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
    return event.deltaY * 16;
  }

  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    return event.deltaY * window.innerHeight;
  }

  return event.deltaY;
}

function applyScrollParallax(progress, duration = 0.42) {
  if (!hasGsap || reduceMotion) {
    const eased = easeOut(progress);
    document.querySelector(".bg-layer").style.transform = `translate3d(0, ${-24 * eased}px, 0) scale(${1 + 0.035 * eased})`;
    document.querySelector(".starfield").style.transform = `translate3d(${-18 * eased}px, ${-42 * eased}px, 0)`;
    document.querySelector(".figure-layer").style.transform = `translate3d(${70 * eased}px, ${-78 * eased}px, 0) rotate(${0.55 * eased}deg) scale(${1 + 0.012 * eased})`;
    document.querySelector(".title-layer").style.transform = `translate3d(${-42 * eased}px, ${52 * eased}px, 0) scale(${1 - 0.035 * eased})`;
    document.querySelector(".hero-nav").style.transform = `translate3d(0, ${-26 * eased}px, 0)`;
    document.querySelector(".hero-nav").style.opacity = String(1 - 0.16 * eased);
    document.querySelector(".hero-hud").style.transform = `translate3d(0, ${28 * eased}px, 0)`;
    document.querySelector(".hero-hud").style.opacity = String(1 - 0.12 * eased);
    setGhostTrail(-42 * progress, 34 * progress, progress);
    return;
  }

  const eased = easeOut(progress);

  gsap.to(".bg-layer", {
    y: -24 * eased,
    scale: 1 + 0.035 * eased,
    duration,
    ease: "power3.out",
  });
  gsap.to(".starfield", {
    x: -18 * eased,
    y: -42 * eased,
    duration,
    ease: "power3.out",
  });
  gsap.to(".figure-layer", {
    x: 70 * eased,
    y: -78 * eased,
    rotation: 0.55 * eased,
    scale: 1 + 0.012 * eased,
    duration,
    ease: "power3.out",
  });
  gsap.to(".title-layer", {
    x: -42 * eased,
    y: 52 * eased,
    scale: 1 - 0.035 * eased,
    duration,
    ease: "power3.out",
  });
  gsap.to(".hero-nav", {
    y: -26 * eased,
    opacity: 1 - 0.16 * eased,
    duration,
    ease: "power3.out",
  });
  gsap.to(".hero-hud", {
    y: 28 * eased,
    opacity: 1 - 0.12 * eased,
    duration,
    ease: "power3.out",
  });

  setGhostTrail(-42 * eased, 34 * eased, 0.36 + 0.64 * eased);
}

function resetScrollParallax() {
  scrollProgress = 0;
  heroAdvanceQueued = false;

  if (!hasGsap || reduceMotion) {
    [".bg-layer", ".starfield", ".figure-layer", ".title-layer", ".hero-nav", ".hero-hud"].forEach((selector) => {
      const element = document.querySelector(selector);
      if (!element) {
        return;
      }

      element.style.transform = "";
      element.style.opacity = "";
    });
    setGhostTrail(-18, 16, 0);
    return;
  }

  gsap.to(".bg-layer, .starfield, .figure-layer, .title-layer, .hero-nav, .hero-hud", {
    x: 0,
    y: 0,
    rotation: 0,
    scale: 1,
    opacity: 1,
    duration: 0.72,
    ease: "power3.out",
  });
  gsap.to(figureFloat, {
    "--ghost-x": -18,
    "--ghost-y": 16,
    "--ghost-boost": 0,
    duration: 0.62,
    ease: "power3.out",
  });
}

function scheduleScrollReset() {
  window.clearTimeout(scrollResetTimer);
  scrollResetTimer = window.setTimeout(() => {
    if (currentScreen === 0 && scrollProgress < 0.98 && !isTransitioning) {
      resetScrollParallax();
    }
  }, 720);
}

function initGsapMotion() {
  if (!hasGsap) {
    return;
  }

  gsap.set(heroScreen, { autoAlpha: 1, x: 0, y: 0 });
  gsap.set(".hero-piece, .title-layer", { autoAlpha: 0, y: 22 });
  gsap.set(".figure-layer", { autoAlpha: 0, x: 24, scale: 1.018 });
  gsap.set(".bg-layer", { scale: 1.04, autoAlpha: 0.8 });
  gsap.set(nextScreen, { autoAlpha: 0, y: "7vh" });
  gsap.set(canvasScreen, { autoAlpha: 0, y: "7vh" });
  gsap.set(featuredScreen, { autoAlpha: 0, y: "7vh" });
  gsap.set(storyboardScreen, { autoAlpha: 0, y: "7vh" });
  gsap.set(landingScreen, { autoAlpha: 0, y: "7vh" });
  gsap.set(".second-piece", { autoAlpha: 0, y: 28 });
  gsap.set(".second-console-wrap", { autoAlpha: 0, x: 160, y: 36, scale: 0.985 });
  gsap.set(".second-figure-layer", { autoAlpha: 0, x: -54, y: 42, scale: 1.025 });
  gsap.set(".third-piece", { autoAlpha: 0, y: 28 });
  gsap.set(".third-canvas-wrap", { autoAlpha: 0, x: 170, y: 34, scale: 0.985 });
  gsap.set(".third-title-wrap", { autoAlpha: 0, x: -72, y: 28, scale: 0.985 });
  gsap.set(".third-figure-wrap", { autoAlpha: 0, x: -52, y: 72, scale: 1.035 });
  gsap.set(".fourth-piece", { autoAlpha: 0, y: 28 });
  gsap.set(".fourth-canvas-wrap", { autoAlpha: 0, x: -160, y: 34, scale: 0.985 });
  gsap.set(".fourth-content-wrap", { autoAlpha: 0, x: 78, y: 26, scale: 0.985 });
  gsap.set(".fourth-interface-button", { autoAlpha: 0, x: 78, y: 26, scale: 0.985 });
  gsap.set(".fourth-figure-wrap", { autoAlpha: 0, x: 82, y: 60, scale: 1.035 });
  gsap.set(".fifth-piece", { autoAlpha: 0, y: 28 });
  gsap.set(".fifth-interface-wrap", { autoAlpha: 0, x: 168, y: 34, scale: 0.985 });
  gsap.set(".fifth-copy-wrap", { autoAlpha: 0, x: -76, y: 28, scale: 0.985 });
  gsap.set(".fifth-feature-cards", { autoAlpha: 0, x: -76, y: 28, scale: 0.985 });
  gsap.set(".fifth-figure-wrap", { autoAlpha: 0, x: 86, y: 62, scale: 1.035 });
  gsap.set(".final-piece", { autoAlpha: 0, y: 28 });
  gsap.set(".final-center-bg-wrap", { autoAlpha: 0, y: 28 });
  gsap.set(".final-figure-wrap", { autoAlpha: 0, y: 68, scale: 1.035 });
  gsap.set(".final-title-wrap", { autoAlpha: 0, y: 44, scale: 0.985 });
  gsap.set(".final-info, .final-download-cta", { autoAlpha: 0, y: 26 });

  const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
  intro
    .to(".bg-layer", { autoAlpha: 1, scale: 1, duration: 1.4 }, 0)
    .to(".figure-layer", { autoAlpha: 1, x: 0, scale: 1, duration: 1.25 }, 0.16)
    .to(".title-layer", { autoAlpha: 1, y: 0, duration: 0.9 }, 0.34)
    .to(".hero-piece", { autoAlpha: 1, y: 0, duration: 0.72, stagger: 0.055 }, 0.52);

  if (!reduceMotion) {
    gsap.to(".figure-float", {
      y: -28,
      rotation: -0.22,
      duration: 3.85,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    gsap.to(".orb-card", {
      y: -10,
      duration: 3.2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    gsap.to(".explore-icon", {
      y: 8,
      duration: 1.35,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    gsap.to(".download-button", {
      filter: "drop-shadow(0 0 16px rgba(182, 222, 255, 0.22))",
      duration: 2.2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    gsap.to(".third-orbits", {
      x: 18,
      y: -12,
      rotation: 0.22,
      duration: 5.6,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    gsap.to(".fourth-orbits", {
      x: -16,
      y: -10,
      rotation: -0.18,
      duration: 5.8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    gsap.to(".fifth-circuitry", {
      x: 14,
      y: -10,
      rotation: 0.16,
      duration: 6,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

  }
}

function initParallax() {
  if (
    reduceMotion ||
    (
      heroParallaxItems.length === 0 &&
      secondParallaxItems.length === 0 &&
      thirdParallaxItems.length === 0 &&
      fourthParallaxItems.length === 0 &&
      fifthParallaxItems.length === 0 &&
      finalParallaxItems.length === 0
    )
  ) {
    return;
  }

  const createSetters = (items, attrName) =>
    items.map((item) => {
      const depth = Number.parseFloat(item.dataset[attrName] || "0");

      if (!hasGsap) {
        return { item, depth };
      }

      return {
        item,
        depth,
        x: gsap.quickTo(item, "x", { duration: 0.62, ease: "power3.out" }),
        y: gsap.quickTo(item, "y", { duration: 0.62, ease: "power3.out" }),
      };
    });

  const heroSetters = createSetters(heroParallaxItems, "depth");
  const secondSetters = createSetters(secondParallaxItems, "secondDepth");
  const thirdSetters = createSetters(thirdParallaxItems, "thirdDepth");
  const fourthSetters = createSetters(fourthParallaxItems, "fourthDepth");
  const fifthSetters = createSetters(fifthParallaxItems, "fifthDepth");
  const finalSetters = createSetters(finalParallaxItems, "finalDepth");

  window.addEventListener("pointermove", (event) => {
    pointerActive = true;
    const nx = event.clientX / window.innerWidth - 0.5;
    const ny = event.clientY / window.innerHeight - 0.5;
    const activeSetters =
      currentScreen === 0 ? heroSetters :
        currentScreen === 1 ? secondSetters :
            currentScreen === 2 ? thirdSetters :
              currentScreen === 3 ? fourthSetters :
                currentScreen === 4 ? fifthSetters :
                  finalSetters;
    const strengthX = currentScreen === 0 ? 150 : currentScreen === 1 ? 96 : currentScreen === 2 ? 118 : currentScreen === 3 ? 108 : currentScreen === 4 ? 112 : 92;
    const strengthY = currentScreen === 0 ? 108 : currentScreen === 1 ? 72 : currentScreen === 2 ? 86 : currentScreen === 3 ? 78 : currentScreen === 4 ? 82 : 68;

    activeSetters.forEach(({ item, depth, x, y }) => {
      const tx = nx * depth * strengthX;
      const ty = ny * depth * strengthY;

      if (hasGsap) {
        x(tx);
        y(ty);
      } else {
        item.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      }
    });

    if (currentScreen === 0) {
      setGhostTrail(
        -nx * 64 - 18,
        -ny * 46 + 16,
        clamp(Math.abs(nx) + Math.abs(ny), 0.18, 0.86),
      );
      fadeGhostTrail();
    }
  });

  window.addEventListener("pointerleave", () => {
    if (!pointerActive) {
      return;
    }

    pointerActive = false;
    [...heroSetters, ...secondSetters, ...thirdSetters, ...fourthSetters, ...fifthSetters, ...finalSetters].forEach(({ item, x, y }) => {
      if (hasGsap) {
        x(0);
        y(0);
      } else {
        item.style.transform = "";
      }
    });
    setGhostTrail(-18, 16, 0);
    window.clearTimeout(ghostFadeTimer);
  });
}

function initNavigation() {
  exploreButton?.addEventListener("click", () => goToScreen(1));
  secondExploreButton?.addEventListener("click", () => goToScreen(2));
  thirdExploreButton?.addEventListener("click", () => goToScreen(3));
  fourthExploreButton?.addEventListener("click", () => goToScreen(4));
  fifthExploreButton?.addEventListener("click", () => goToScreen(5));
  finalBackTopButton?.addEventListener("click", () => jumpToScreen(0));

  window.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();

      const deltaY = getNormalizedWheelDeltaY(event);
      const absDeltaY = Math.abs(deltaY);

      if (currentScreen === 0) {
        if (absDeltaY < HERO_SCROLL_MIN_DELTA || heroAdvanceQueued) {
          return;
        }

        if (deltaY < 0) {
          resetScrollParallax();
          return;
        }

        scrollProgress = clamp(scrollProgress + absDeltaY / HERO_SCROLL_STEP);
        applyScrollParallax(scrollProgress);

        if (scrollProgress >= HERO_SCROLL_TRIGGER || absDeltaY >= HERO_SCROLL_DIRECT_DELTA) {
          heroAdvanceQueued = true;
          window.clearTimeout(scrollResetTimer);
          window.setTimeout(() => goToScreen(1), HERO_SCROLL_ADVANCE_DELAY);
        } else {
          scheduleScrollReset();
        }

        return;
      }

      if (absDeltaY < PAGE_SCROLL_MIN_DELTA) {
        return;
      }

      goToScreen(deltaY > 0 ? currentScreen + 1 : currentScreen - 1);
    },
    { passive: false },
  );

  window.addEventListener("keydown", (event) => {
    const nextKeys = ["ArrowDown", "PageDown", " "];
    const prevKeys = ["ArrowUp", "PageUp"];

    if (nextKeys.includes(event.key)) {
      event.preventDefault();
      goToScreen(currentScreen + 1);
    }

    if (prevKeys.includes(event.key)) {
      event.preventDefault();
      goToScreen(currentScreen - 1);
    }
  });
}

setScreenState(0);
initGsapMotion();
initParallax();
initNavigation();

const requestedScreen = Number.parseInt(new URLSearchParams(window.location.search).get("screen") || "", 10);
if (Number.isInteger(requestedScreen) && requestedScreen > 0) {
  window.setTimeout(() => jumpToScreen(requestedScreen), 80);
}

window.goToScreen = goToScreen;
window.jumpToScreen = jumpToScreen;
