import * as THREE from "three";
import { feature } from "topojson-client";
import { geoEquirectangular, geoPath, geoGraticule } from "d3-geo";
import world from "world-atlas/land-50m.json";

function makeEarthTextures() {
  const width = 2048;
  const height = 1024;
  const mask = document.createElement("canvas");
  mask.width = width;
  mask.height = height;
  const context = mask.getContext("2d", { willReadFrequently: true });
  const projection = geoEquirectangular()
    .scale(width / (2 * Math.PI))
    .translate([width / 2, height / 2]);
  const path = geoPath(projection, context);
  context.fillStyle = "#000";
  context.fillRect(0, 0, width, height);
  context.beginPath();
  path(feature(world, world.objects.land));
  context.fillStyle = "#fff";
  context.fill();

  const land = context.getImageData(0, 0, width, height);
  const surface = document.createElement("canvas");
  surface.width = width;
  surface.height = height;
  const surfaceContext = surface.getContext("2d");
  const colors = surfaceContext.createImageData(width, height);
  const relief = context.createImageData(width, height);

  for (let i = 0; i < land.data.length; i += 4) {
    const coverage = land.data[i] / 255;
    const pixel = i / 4;
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    // Deterministic grain keeps the stone finish subtle and the ocean smooth.
    const grain = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
    const terrain =
      Math.sin(x * 0.093 + Math.sin(y * 0.047) * 3) *
      Math.sin(y * 0.081 + x * 0.019);
    const texture = coverage * (grain * 5 + terrain * 3);
    colors.data[i] = 66 + coverage * 159 + texture;
    colors.data[i + 1] = 84 + coverage * 134 + texture;
    colors.data[i + 2] = 99 + coverage * 105 + texture;
    colors.data[i + 3] = 255;
    const elevation = coverage * (168 + terrain * 35 + grain * 24);
    relief.data[i] = relief.data[i + 1] = relief.data[i + 2] = elevation;
    relief.data[i + 3] = 255;
  }
  surfaceContext.putImageData(colors, 0, 0);
  context.putImageData(relief, 0, 0);

  const gridPath = geoPath(projection, surfaceContext);
  surfaceContext.beginPath();
  gridPath(geoGraticule().step([20, 20])());
  surfaceContext.strokeStyle = "rgba(231, 219, 193, 0.32)";
  surfaceContext.lineWidth = 0.7;
  surfaceContext.stroke();

  const map = new THREE.CanvasTexture(surface);
  map.colorSpace = THREE.SRGBColorSpace;
  const bump = new THREE.CanvasTexture(mask);
  map.anisotropy = 4;
  return { map, bump };
}

function createGeorgiaPin() {
  // Tbilisi, Georgia (WGS84); matches the equirectangular Earth texture.
  const latitude = THREE.MathUtils.degToRad(41.7151);
  const longitude = THREE.MathUtils.degToRad(44.8271);
  const normal = new THREE.Vector3(
    Math.cos(latitude) * Math.cos(longitude),
    Math.sin(latitude),
    -Math.cos(latitude) * Math.sin(longitude),
  );
  const anchor = new THREE.Object3D();
  anchor.position.copy(normal).multiplyScalar(1.024);
  return anchor;
}

export function createGlobe(host, { autoRotate, onReady, onFailure }) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
  } catch {
    onFailure();
    return null;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  const canvas = renderer.domElement;
  canvas.tabIndex = 0;
  canvas.setAttribute("role", "img");
  canvas.setAttribute(
    "aria-label",
    "Interactive Earth globe with a pin marking Tbilisi, Georgia. Drag to rotate, or use the arrow keys. Press Home to reset.",
  );
  host.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 30);
  camera.position.set(0, 0, 4.0);
  scene.add(new THREE.HemisphereLight(0xf1f4ff, 0x182939, 2.0));
  const sun = new THREE.DirectionalLight(0xfff4df, 3.2);
  sun.position.set(3, 4, 5);
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0x9dc9ef, 1.2);
  rim.position.set(-4, 1, -2);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0xb9ccdd, 1.1);
  fill.position.set(-2, -3, 4);
  scene.add(fill);

  const { map, bump } = makeEarthTextures();
  const geometry = new THREE.SphereGeometry(1, 256, 128);
  const material = new THREE.MeshStandardMaterial({
    map,
    bumpMap: bump,
    bumpScale: 0.065,
    displacementMap: bump,
    displacementScale: 0.022,
    roughness: 0.78,
    metalness: 0.12,
  });
  const earth = new THREE.Mesh(geometry, material);
  const georgiaPin = createGeorgiaPin();
  earth.add(georgiaPin);
  function reset() {
    earth.rotation.set(0.26, -Math.PI * 0.61, -0.1);
  }
  reset();
  scene.add(earth);

  const marker = document.createElement("div");
  marker.className = "globe-marker";
  marker.setAttribute("aria-hidden", "true");
  marker.innerHTML = `
    <svg class="globe-leader" viewBox="0 0 48 40" fill="none">
      <path class="globe-leader-outline" d="M0 40 L28 8 H48" />
      <path class="globe-leader-line" d="M0 40 L28 8 H48" />
    </svg>
    <span class="globe-dot"></span>
    <span class="globe-label">Georgia</span>
  `;
  host.appendChild(marker);
  const label = marker.querySelector(".globe-label");
  const leaderPaths = marker.querySelectorAll(".globe-leader path");
  const pinPosition = new THREE.Vector3();
  const cameraDirection = new THREE.Vector3();
  const labelPosition = new THREE.Vector3();

  function updateLabel() {
    georgiaPin.getWorldPosition(pinPosition);
    cameraDirection.copy(camera.position).sub(pinPosition);
    marker.hidden = pinPosition.dot(cameraDirection) <= 0;
    if (marker.hidden) return;
    labelPosition.copy(pinPosition).project(camera);
    const x = ((labelPosition.x + 1) / 2) * host.clientWidth;
    const y = ((1 - labelPosition.y) / 2) * host.clientHeight;
    // Move the annotation continuously across the anchor as it approaches an edge.
    const labelWidth = label.offsetWidth;
    const blend = THREE.MathUtils.smoothstep(x / host.clientWidth, 0.3, 0.8);
    const offset = (48 + labelWidth / 2) * (1 - 2 * blend);
    const center = THREE.MathUtils.clamp(
      x + offset,
      labelWidth / 2 + 8,
      host.clientWidth - labelWidth / 2 - 8,
    );
    const left = center - labelWidth / 2 - x;
    label.style.left = `${left}px`;
    const endX = THREE.MathUtils.clamp(0, left, left + labelWidth);
    const elbowX = endX - Math.sign(endX) * Math.min(20, Math.abs(endX));
    for (const path of leaderPaths) {
      path.setAttribute("d", `M0 40 L${elbowX} 8 H${endX}`);
    }
    marker.style.left = `${x}px`;
    marker.style.top = `${y}px`;
  }

  let disposed = false;
  let visible = true;
  let pointer = null;
  let dirty = true;
  let frame = 0;
  let previousTime = 0;
  let velocityX = 0;
  let velocityY = 0;

  function stopMomentum() {
    velocityX = 0;
    velocityY = 0;
  }

  function render(time) {
    if (disposed || !visible) return;
    const delta = previousTime
      ? Math.min((time - previousTime) / 1000, 0.05)
      : 0;
    previousTime = time;
    if (!pointer && (velocityX || velocityY)) {
      const decay = Math.exp(-3 * delta);
      const travel = (1 - decay) / 3;
      const nextX = earth.rotation.x + velocityX * travel;
      earth.rotation.x = THREE.MathUtils.clamp(nextX, -1.25, 1.25);
      earth.rotation.y += velocityY * travel;
      velocityX = nextX === earth.rotation.x ? velocityX * decay : 0;
      velocityY *= decay;
      if (Math.abs(velocityX) < 0.006) velocityX = 0;
      if (Math.abs(velocityY) < 0.006) velocityY = 0;
      dirty = true;
    } else if (autoRotate && !pointer) {
      earth.rotation.y += delta * 0.075;
      dirty = true;
    }
    if (dirty) {
      renderer.render(scene, camera);
      updateLabel();
      dirty = false;
    }
    frame = requestAnimationFrame(render);
  }

  const resize = new ResizeObserver(() => {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    dirty = true;
  });
  resize.observe(host);

  const visibility = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (!visible) stopMomentum();
    cancelAnimationFrame(frame);
    previousTime = 0;
    if (visible) {
      dirty = true;
      frame = requestAnimationFrame(render);
    }
  });
  visibility.observe(host);

  function startDrag(event) {
    if (!event.isPrimary || event.button !== 0) return;
    stopMomentum();
    pointer = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      time: performance.now(),
    };
    canvas.setPointerCapture(event.pointerId);
    canvas.classList.add("is-dragging");
  }
  function drag(event) {
    if (!pointer || pointer.id !== event.pointerId) return;
    const now = performance.now();
    const elapsed = Math.max((now - pointer.time) / 1000, 0.008);
    const turnY = (event.clientX - pointer.x) * 0.008;
    const turnX = (event.clientY - pointer.y) * 0.006;
    // Blend recent samples so a single noisy pointer event cannot cause a jump.
    velocityX = THREE.MathUtils.lerp(
      velocityX,
      THREE.MathUtils.clamp(turnX / elapsed, -4, 4),
      0.45,
    );
    velocityY = THREE.MathUtils.lerp(
      velocityY,
      THREE.MathUtils.clamp(turnY / elapsed, -4, 4),
      0.45,
    );
    earth.rotation.y += turnY;
    earth.rotation.x = THREE.MathUtils.clamp(
      earth.rotation.x + turnX,
      -1.25,
      1.25,
    );
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.time = now;
    dirty = true;
  }
  function endDrag(event) {
    if (!pointer || pointer.id !== event.pointerId) return;
    const idleTime = performance.now() - pointer.time;
    if (event.type !== "pointerup" || idleTime > 120) stopMomentum();
    else {
      const releaseDecay = Math.exp(-idleTime / 80);
      velocityX *= releaseDecay;
      velocityY *= releaseDecay;
    }
    pointer = null;
    if (canvas.hasPointerCapture(event.pointerId))
      canvas.releasePointerCapture(event.pointerId);
    canvas.classList.remove("is-dragging");
  }
  function keydown(event) {
    const movements = {
      ArrowLeft: [0, -0.15],
      ArrowRight: [0, 0.15],
      ArrowUp: [-0.1, 0],
      ArrowDown: [0.1, 0],
    };
    if (event.key === "Home") reset();
    else if (movements[event.key]) {
      const [x, y] = movements[event.key];
      earth.rotation.x = THREE.MathUtils.clamp(
        earth.rotation.x + x,
        -1.25,
        1.25,
      );
      earth.rotation.y += y;
    } else return;
    stopMomentum();
    event.preventDefault();
    dirty = true;
  }
  const events = {
    pointerdown: startDrag,
    pointermove: drag,
    pointerup: endDrag,
    pointercancel: endDrag,
    lostpointercapture: endDrag,
    keydown,
    webglcontextlost: (event) => {
      event.preventDefault();
      visible = false;
      cancelAnimationFrame(frame);
      onFailure();
    },
  };
  Object.entries(events).forEach(([name, callback]) =>
    canvas.addEventListener(name, callback),
  );
  const { width, height } = host.getBoundingClientRect();
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
  updateLabel();
  onReady();

  return {
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      visibility.disconnect();
      Object.entries(events).forEach(([name, callback]) =>
        canvas.removeEventListener(name, callback),
      );
      geometry.dispose();
      material.dispose();
      map.dispose();
      bump.dispose();
      renderer.dispose();
      canvas.remove();
      marker.remove();
    },
  };
}
