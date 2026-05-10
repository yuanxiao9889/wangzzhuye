const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasGsap = typeof window.gsap !== "undefined";

document.documentElement.classList.toggle("no-gsap", !hasGsap);

const screens = Array.from(document.querySelectorAll(".screen"));
const heroScreen = document.querySelector(".hero-screen");
const nextScreen = document.querySelector(".next-screen");
const exploreButton = document.querySelector(".explore");
const figureFloat = document.querySelector(".figure-float");
const parallaxItems = Array.from(document.querySelectorAll("[data-depth]"));

let currentScreen = 0;
let isTransitioning = false;
let pointerActive = false;
let scrollProgress = 0;
let scrollResetTimer = 0;

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

  isTransitioning = true;

  if (!hasGsap || reduceMotion) {
    heroScreen.style.opacity = target === 0 ? "1" : "0";
    nextScreen.style.opacity = target === 1 ? "1" : "0";
    nextScreen.style.transform = target === 1 ? "translateY(0)" : "translateY(7vh)";
    currentScreen = target;
    scrollProgress = 0;
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
      setScreenState(currentScreen);
      isTransitioning = false;
    },
  });

  if (toNext) {
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
      );
  } else {
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
        heroScreen,
        {
          autoAlpha: 1,
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
  }
}

function setGhostTrail(x, y, boost) {
  if (!figureFloat) {
    return;
  }

  figureFloat.style.setProperty("--ghost-x", `${x.toFixed(1)}px`);
  figureFloat.style.setProperty("--ghost-y", `${y.toFixed(1)}px`);
  figureFloat.style.setProperty("--ghost-boost", boost.toFixed(2));
}

function easeOut(value) {
  return 1 - Math.pow(1 - value, 3);
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

  gsap.set(".hero-piece, .title-layer", { autoAlpha: 0, y: 22 });
  gsap.set(".figure-layer", { autoAlpha: 0, x: 24, scale: 1.018 });
  gsap.set(".bg-layer", { scale: 1.04, autoAlpha: 0.8 });
  gsap.set(nextScreen, { autoAlpha: 0, y: "7vh" });

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
      filter: "drop-shadow(0 0 27px rgba(101, 181, 255, 0.55))",
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
  }
}

function initParallax() {
  if (reduceMotion || parallaxItems.length === 0) {
    return;
  }

  const setters = parallaxItems.map((item) => {
    const depth = Number.parseFloat(item.dataset.depth || "0");

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

  window.addEventListener("pointermove", (event) => {
    if (currentScreen !== 0) {
      return;
    }

    pointerActive = true;
    const nx = event.clientX / window.innerWidth - 0.5;
    const ny = event.clientY / window.innerHeight - 0.5;

    setters.forEach(({ item, depth, x, y }) => {
      const tx = nx * depth * 150;
      const ty = ny * depth * 108;

      if (hasGsap) {
        x(tx);
        y(ty);
      } else {
        item.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      }
    });

    setGhostTrail(
      -nx * 64 - 18,
      -ny * 46 + 16,
      clamp(Math.abs(nx) + Math.abs(ny), 0.12, 0.86),
    );
  });

  window.addEventListener("pointerleave", () => {
    if (!pointerActive) {
      return;
    }

    pointerActive = false;
    setters.forEach(({ item, x, y }) => {
      if (hasGsap) {
        x(0);
        y(0);
      } else {
        item.style.transform = "";
      }
    });
    setGhostTrail(-18, 16, 0);
  });
}

function initNavigation() {
  exploreButton?.addEventListener("click", () => goToScreen(1));

  window.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();

      if (Math.abs(event.deltaY) < 20) {
        return;
      }

      if (currentScreen === 0 && event.deltaY > 0) {
        scrollProgress = clamp(scrollProgress + Math.abs(event.deltaY) / 560);
        applyScrollParallax(scrollProgress);

        if (scrollProgress >= 0.7) {
          window.clearTimeout(scrollResetTimer);
          window.setTimeout(() => goToScreen(1), 520);
        } else {
          scheduleScrollReset();
        }

        return;
      }

      if (currentScreen === 0 && event.deltaY < 0) {
        resetScrollParallax();
        return;
      }

      goToScreen(event.deltaY > 0 ? currentScreen + 1 : currentScreen - 1);
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

window.goToScreen = goToScreen;
