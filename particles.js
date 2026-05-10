import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js";

const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const screens = Array.from(document.querySelectorAll(".screen"));
const fields = [];
let animationFrame = 0;
let isRunning = false;

const vertexShader = `
  attribute float aAlpha;
  attribute float aSize;
  attribute vec3 aColor;

  uniform float uPixelRatio;

  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    float perspective = 27.0 / max(1.0, -mvPosition.z);
    gl_PointSize = aSize * uPixelRatio * perspective;
    gl_Position = projectionMatrix * mvPosition;
    vAlpha = aAlpha;
    vColor = aColor;
  }
`;

const fragmentShader = `
  precision mediump float;

  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    vec2 point = gl_PointCoord - vec2(0.5);
    float distanceFromCenter = length(point);
    float core = smoothstep(0.16, 0.0, distanceFromCenter);
    float halo = smoothstep(0.5, 0.0, distanceFromCenter);
    float alpha = vAlpha * (core * 0.82 + halo * 0.36);

    if (alpha < 0.006) {
      discard;
    }

    gl_FragColor = vec4(vColor, alpha);
  }
`;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function smoothstep(edge0, edge1, value) {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

class CosmicStarField {
  constructor(screen, stage, index) {
    this.screen = screen;
    this.stage = stage;
    this.index = index;
    this.starCount = index === 0 ? 1120 : 820;
    this.lastTime = performance.now();
    this.width = 1;
    this.height = 1;

    this.positions = new Float32Array(this.starCount * 3);
    this.colors = new Float32Array(this.starCount * 3);
    this.alphas = new Float32Array(this.starCount);
    this.sizes = new Float32Array(this.starCount);
    this.baseAlphas = new Float32Array(this.starCount);
    this.baseSizes = new Float32Array(this.starCount);
    this.twinkleSpeeds = new Float32Array(this.starCount);
    this.phases = new Float32Array(this.starCount);
    this.sparkleOffsets = new Float32Array(this.starCount);
    this.drift = new Float32Array(this.starCount * 3);

    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
    this.camera.position.z = 8;

    this.scene = new THREE.Scene();
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute("position", new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute("aColor", new THREE.BufferAttribute(this.colors, 3));
    this.geometry.setAttribute("aAlpha", new THREE.BufferAttribute(this.alphas, 1));
    this.geometry.setAttribute("aSize", new THREE.BufferAttribute(this.sizes, 1));

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.points);

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.domElement.className = "particle-field";
    this.renderer.domElement.setAttribute("aria-hidden", "true");
    this.stage.appendChild(this.renderer.domElement);

    this.resize();
    this.seedStars();
  }

  get isActive() {
    return this.screen.classList.contains("is-active");
  }

  resize() {
    const bounds = this.stage.getBoundingClientRect();
    this.width = Math.max(1, Math.round(bounds.width));
    this.height = Math.max(1, Math.round(bounds.height));
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(this.width, this.height, false);
  }

  viewSizeAtDepth(z = 0) {
    const distance = this.camera.position.z - z;
    const height = 2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov * 0.5)) * distance;
    return {
      width: height * this.camera.aspect,
      height,
    };
  }

  seedStars() {
    for (let i = 0; i < this.starCount; i += 1) {
      this.resetStar(i, true);
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.aColor.needsUpdate = true;
    this.geometry.attributes.aAlpha.needsUpdate = true;
    this.geometry.attributes.aSize.needsUpdate = true;
  }

  resetStar(index, anywhere = false) {
    const offset = index * 3;
    const z = randomBetween(-9.5, 2.4);
    const view = this.viewSizeAtDepth(z);
    const edgePadding = 0.18;

    this.positions[offset] = randomBetween(-0.5 - edgePadding, 0.5 + edgePadding) * view.width;
    this.positions[offset + 1] = randomBetween(-0.5 - edgePadding, 0.5 + edgePadding) * view.height;
    this.positions[offset + 2] = z;

    if (!anywhere && Math.random() > 0.5) {
      this.positions[offset] = (-0.5 - edgePadding) * view.width;
    }

    const depthScale = THREE.MathUtils.mapLinear(z, -9.5, 2.4, 0.72, 1.14);
    const bright = Math.random() > 0.85;

    this.baseSizes[index] = randomBetween(bright ? 1.15 : 0.5, bright ? 2.55 : 1.18) * depthScale;
    this.sizes[index] = this.baseSizes[index];
    this.baseAlphas[index] = randomBetween(bright ? 0.36 : 0.12, bright ? 0.78 : 0.38);
    this.alphas[index] = this.baseAlphas[index] * randomBetween(0.35, 1);
    this.twinkleSpeeds[index] = randomBetween(bright ? 1.35 : 0.45, bright ? 3.4 : 1.65);
    this.phases[index] = randomBetween(0, Math.PI * 2);
    this.sparkleOffsets[index] = randomBetween(0, Math.PI * 2);

    this.drift[offset] = randomBetween(0.008, 0.035) * depthScale;
    this.drift[offset + 1] = randomBetween(-0.012, 0.014) * depthScale;
    this.drift[offset + 2] = randomBetween(-0.006, 0.006);

    const colorRoll = Math.random();

    if (colorRoll > 0.82) {
      this.colors[offset] = randomBetween(0.74, 0.9);
      this.colors[offset + 1] = randomBetween(0.9, 1);
      this.colors[offset + 2] = 1;
    } else if (colorRoll > 0.58) {
      this.colors[offset] = randomBetween(0.52, 0.68);
      this.colors[offset + 1] = randomBetween(0.72, 0.9);
      this.colors[offset + 2] = 1;
    } else {
      this.colors[offset] = randomBetween(0.82, 0.96);
      this.colors[offset + 1] = randomBetween(0.9, 1);
      this.colors[offset + 2] = randomBetween(0.94, 1);
    }
  }

  clear() {
    this.alphas.fill(0);
    this.sizes.fill(0);
    this.geometry.attributes.aAlpha.needsUpdate = true;
    this.geometry.attributes.aSize.needsUpdate = true;
    this.renderer.clear();
  }

  update(time) {
    const delta = Math.min(0.034, Math.max(0.001, (time - this.lastTime) / 1000));
    const seconds = time / 1000;
    this.lastTime = time;

    for (let i = 0; i < this.starCount; i += 1) {
      const offset = i * 3;
      this.positions[offset] += this.drift[offset] * delta;
      this.positions[offset + 1] += this.drift[offset + 1] * delta;
      this.positions[offset + 2] += this.drift[offset + 2] * delta;

      const view = this.viewSizeAtDepth(this.positions[offset + 2]);
      const horizontalLimit = view.width * 0.68;
      const verticalLimit = view.height * 0.68;

      if (
        this.positions[offset] > horizontalLimit ||
        this.positions[offset] < -horizontalLimit ||
        this.positions[offset + 1] > verticalLimit ||
        this.positions[offset + 1] < -verticalLimit
      ) {
        this.resetStar(i);
      }

      const slowTwinkle = 0.62 + 0.38 * Math.sin(this.phases[i] + seconds * this.twinkleSpeeds[i]);
      const fineTwinkle = 0.72 + 0.28 * Math.sin(this.sparkleOffsets[i] + seconds * this.twinkleSpeeds[i] * 4.7);
      const rareSparkle = Math.pow(Math.max(0, Math.sin(this.sparkleOffsets[i] + seconds * 0.82)), 24);
      const shimmer = slowTwinkle * fineTwinkle + rareSparkle * 0.64;

      this.alphas[i] = Math.min(0.92, this.baseAlphas[i] * shimmer * 1.04);
      this.sizes[i] = this.baseSizes[i] * (1 + rareSparkle * 0.82 + slowTwinkle * 0.09);
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.aAlpha.needsUpdate = true;
    this.geometry.attributes.aSize.needsUpdate = true;
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}

function resizeFields() {
  fields.forEach((field) => field.resize());
}

function createFields() {
  screens.forEach((screen, index) => {
    const stage = screen.firstElementChild;

    if (!stage) {
      return;
    }

    try {
      fields.push(new CosmicStarField(screen, stage, index));
    } catch (error) {
      console.warn("Cosmic star field disabled:", error);
    }
  });
}

function tick(time) {
  animationFrame = 0;

  if (reduceMotionQuery.matches) {
    fields.forEach((field) => field.clear());
    isRunning = false;
    return;
  }

  isRunning = true;
  fields.forEach((field) => {
    field.renderer.domElement.classList.toggle("is-live", field.isActive);

    if (field.isActive) {
      field.update(time);
    }
  });

  animationFrame = window.requestAnimationFrame(tick);
}

function start() {
  if (isRunning || animationFrame || reduceMotionQuery.matches) {
    fields.forEach((field) => field.clear());
    return;
  }

  animationFrame = window.requestAnimationFrame(tick);
}

if (screens.length > 0) {
  createFields();
  window.addEventListener("resize", resizeFields, { passive: true });
  reduceMotionQuery.addEventListener?.("change", () => {
    fields.forEach((field) => field.clear());
    start();
  });
  start();
}
