import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Procedural Neutral Sphere Surface Texture (clean architectural chalk with subtle grid)
function makeNeutralSphereTexture() {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 1024;
  const ctx = c.getContext('2d');

  // Base neutral tone — soft architectural alabaster / pale clay
  ctx.fillStyle = '#eaf0e8';
  ctx.fillRect(0, 0, 1024, 1024);

  // Soft subtle radial gradient for natural surface depth
  const rad = ctx.createRadialGradient(512, 512, 60, 512, 512, 510);
  rad.addColorStop(0, '#f2f7f0');
  rad.addColorStop(0.55, '#e5ece3');
  rad.addColorStop(1, '#dae4d8');
  ctx.fillStyle = rad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Fine precision engineering grid lines in subtle translucent slate
  ctx.strokeStyle = 'rgba(100, 116, 139, 0.08)';
  ctx.lineWidth = 1;
  for (let x = 32; x < 1024; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();
  }
  for (let y = 32; y < 1024; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // Soft concentric topographical survey rings
  ctx.strokeStyle = 'rgba(14, 165, 233, 0.12)';
  ctx.lineWidth = 1.5;
  for (let r = 90; r <= 480; r += 110) {
    ctx.beginPath();
    ctx.arc(512, 512, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  return tex;
}

function makeCellMap() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(0, 0, 256, 128);
  for (let r = 0; r < 3; r++) {
    for (let col = 0; col < 5; col++) {
      const x = 6 + col * 50;
      const y = 6 + r * 40;
      const g = ctx.createLinearGradient(x, y, x + 44, y + 34);
      g.addColorStop(0, '#38bdf8');
      g.addColorStop(1, '#0369a1');
      ctx.fillStyle = g;
      ctx.fillRect(x, y, 44, 34);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function makeTube(points, material, radius = 0.14) {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
  return new THREE.Mesh(new THREE.TubeGeometry(curve, 48, radius, 10, false), material);
}

function makeStraightTube(start, end, material, radius = 0.12) {
  const curve = new THREE.LineCurve3(new THREE.Vector3(...start), new THREE.Vector3(...end));
  return new THREE.Mesh(new THREE.TubeGeometry(curve, 1, radius, 10, false), material);
}

export default function PlantWorld({ energyMode = 'hybrid', cinematic = true }) {
  const mountRef = useRef(null);
  const modeRef = useRef(energyMode);
  const cinematicRef = useRef(cinematic);

  useEffect(() => {
    modeRef.current = energyMode;
    if (energyMode === 'solar') {
      window.dispatchEvent(new CustomEvent('mb-3d-action', { detail: 'solar' }));
    } else if (energyMode === 'wind') {
      window.dispatchEvent(new CustomEvent('mb-3d-action', { detail: 'wind' }));
    } else {
      window.dispatchEvent(new CustomEvent('mb-3d-action', { detail: 'reset' }));
    }
  }, [energyMode]);

  useEffect(() => {
    cinematicRef.current = cinematic;
  }, [cinematic]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeaf4ff);
    scene.fog = new THREE.Fog(0xdbeeff, 140, 520);

    const camera = new THREE.PerspectiveCamera(46, 1, 0.5, 750);
    camera.position.set(0, 50, 146);
    camera.lookAt(0, 6, 0);
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.25 : 2.0));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = !mobile;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.domElement.style.touchAction = 'none';
    mount.appendChild(renderer.domElement);

    // OrbitControls for smooth 3D reactivity (Rotate, Pan, Smooth Damping)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enableZoom = false; // Prevent wheel events from zooming or interfering with page scroll
    controls.enablePan = true;   // Moving / panning via right-click or drag
    controls.panSpeed = 1.1;
    controls.screenSpacePanning = true;
    controls.maxPolarAngle = Math.PI / 2 + 0.12; // View sphere curvature from angles
    controls.minPolarAngle = 0.05;
    controls.target.set(0, 6, 0);

    controls.autoRotate = cinematicRef.current && !reduced;
    controls.autoRotateSpeed = 0.45;

    let idleTimer = null;
    const onControlStart = () => {
      controls.autoRotate = false;
      if (idleTimer) clearTimeout(idleTimer);
    };
    const onControlEnd = () => {
      idleTimer = setTimeout(() => {
        if (cinematicRef.current && !reduced) {
          controls.autoRotate = true;
        }
      }, 3000);
    };
    controls.addEventListener('start', onControlStart);
    controls.addEventListener('end', onControlEnd);

    // Camera animation tween targets
    let isTransitioning = false;
    const targetCamPos = new THREE.Vector3().copy(camera.position);
    const targetLookAt = new THREE.Vector3().copy(controls.target);

    const handle3DAction = (e) => {
      const act = e.detail;
      if (act === 'zoom-in') {
        const dir = new THREE.Vector3().subVectors(controls.target, camera.position).multiplyScalar(0.28);
        camera.position.add(dir);
        controls.update();
      } else if (act === 'zoom-out') {
        const dir = new THREE.Vector3().subVectors(camera.position, controls.target).multiplyScalar(0.28);
        camera.position.add(dir);
        controls.update();
      } else if (act === 'reset') {
        targetCamPos.set(0, 50, 146);
        targetLookAt.set(0, 6, 0);
        isTransitioning = true;
      } else if (act === 'solar') {
        targetCamPos.set(32, 28, 62);
        targetLookAt.set(24, 6, 8);
        isTransitioning = true;
      } else if (act === 'wind') {
        targetCamPos.set(-36, 36, 48);
        targetLookAt.set(-28, 16, -12);
        isTransitioning = true;
      }
    };
    window.addEventListener('mb-3d-action', handle3DAction);

    scene.add(new THREE.HemisphereLight(0xf0f9ff, 0x94a3b8, 1.15));
    scene.add(new THREE.AmbientLight(0xffffff, 0.42));

    // Sun directional light
    const sun = new THREE.DirectionalLight(0xfffae6, 2.4);
    sun.position.set(65, 85, 35);
    sun.castShadow = !mobile;
    sun.shadow.mapSize.set(1536, 1536);
    sun.shadow.camera.left = -90;
    sun.shadow.camera.right = 90;
    sun.shadow.camera.top = 60;
    sun.shadow.camera.bottom = -30;
    sun.shadow.camera.far = 260;
    sun.shadow.bias = -0.0003;
    scene.add(sun);

    const fill = new THREE.DirectionalLight(0x93c5fd, 0.5);
    fill.position.set(-50, 30, -30);
    scene.add(fill);

    const world = new THREE.Group();
    scene.add(world);

    // =========================================================================
    // 🌐 GIANT NEUTRAL SPHERE FOUNDATION
    // =========================================================================
    const SPHERE_RADIUS = 150;
    const sphereCenter = new THREE.Vector3(0, -SPHERE_RADIUS, 0);

    // Helper: compute surface coordinates & orientation on curved giant sphere
    const getSphereSurface = (x, z) => {
      const r2 = x * x + z * z;
      const y = Math.sqrt(Math.max(1, SPHERE_RADIUS * SPHERE_RADIUS - r2)) - SPHERE_RADIUS;
      const normal = new THREE.Vector3(x, y + SPHERE_RADIUS, z).normalize();
      const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
      return { y, normal, quat };
    };

    // Giant Neutral Sphere Mesh
    const sphereTexture = makeNeutralSphereTexture();
    const sphereMat = new THREE.MeshStandardMaterial({
      map: sphereTexture,
      color: 0xe6ede5,
      roughness: 0.85,
      metalness: 0.05,
    });
    const sphereMesh = new THREE.Mesh(
      new THREE.SphereGeometry(SPHERE_RADIUS, 96, 96),
      sphereMat
    );
    sphereMesh.position.copy(sphereCenter);
    sphereMesh.receiveShadow = true;
    world.add(sphereMesh);

    // =========================================================================
    // 💨 WIND TURBINES ON CURVED SPHERE
    // =========================================================================
    const white = new THREE.MeshStandardMaterial({ color: 0xf8fbf1, roughness: 0.32, metalness: 0.12 });
    const steel = new THREE.MeshStandardMaterial({ color: 0x8fa388, roughness: 0.4, metalness: 0.55 });
    const hubMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.25, metalness: 0.35, emissive: 0x15803d, emissiveIntensity: 0.22 });

    const towerGeo = new THREE.CylinderGeometry(0.28, 0.72, 16, 12);
    const nacelleGeo = new THREE.BoxGeometry(2.4, 0.9, 0.95);
    const bladeGeo = new THREE.BoxGeometry(0.22, 7.4, 0.08);
    bladeGeo.translate(0, 3.7, 0);
    const rotors = [];

    const placeTurbine = (x, z, scale) => {
      const { y, quat } = getSphereSurface(x, z);
      const g = new THREE.Group();
      g.position.set(x, y, z);
      g.quaternion.copy(quat);
      g.scale.setScalar(scale);

      const tower = new THREE.Mesh(towerGeo, white);
      tower.position.y = 8;
      tower.castShadow = true;
      g.add(tower);

      const nacelle = new THREE.Mesh(nacelleGeo, white);
      nacelle.position.set(0.2, 16.1, 0);
      nacelle.castShadow = true;
      g.add(nacelle);

      const hub = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 12), hubMat);
      hub.position.set(1.45, 16.1, 0);
      g.add(hub);

      const rotor = new THREE.Group();
      rotor.position.copy(hub.position);
      for (let i = 0; i < 3; i++) {
        const blade = new THREE.Mesh(bladeGeo, white);
        blade.rotation.z = (i * Math.PI * 2) / 3;
        blade.castShadow = true;
        rotor.add(blade);
      }
      g.add(rotor);
      rotors.push({ rotor, speed: 0.012 + Math.random() * 0.01 });
      world.add(g);
    };

    const turbineLayout = [
      [-28, -18, 1], [-38, -8, 0.86], [-46, -24, 0.78], [-22, -32, 0.7],
      [-54, -16, 0.64], [-34, 4, 0.72], [-18, -8, 0.92], [-60, 2, 0.58], [-48, -38, 0.55],
    ];
    turbineLayout.forEach(([x, z, s]) => placeTurbine(x, z, s));

    // =========================================================================
    // ☀️ SOLAR PV ARRAY ON CURVED SPHERE
    // =========================================================================
    const cellMap = makeCellMap();
    const panelMat = new THREE.MeshStandardMaterial({
      map: cellMap,
      roughness: 0.18,
      metalness: 0.65,
      emissive: 0x0284c7,
      emissiveIntensity: 0.15,
    });
    const panelGeo = new THREE.BoxGeometry(2.2, 0.06, 1.15);
    const rows = 7;
    const cols = 9;
    const farm = new THREE.InstancedMesh(panelGeo, panelMat, rows * cols);
    farm.castShadow = true;
    farm.receiveShadow = true;

    const dummy = new THREE.Object3D();
    let n = 0;
    const panelTargets = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const px = 16 + c * 2.55;
        const pz = -6 + r * 2.05;
        const { y, quat } = getSphereSurface(px, pz);
        const py = y + 1.15 + r * 0.04;

        dummy.position.set(px, py, pz);
        dummy.quaternion.copy(quat);
        dummy.rotateX(-0.42);
        dummy.rotateY(0.06);
        dummy.updateMatrix();
        farm.setMatrixAt(n++, dummy.matrix);

        if (r % 2 === 0 && c % 2 === 0) {
          panelTargets.push([px, py + 0.4, pz]);
        }
      }
    }
    world.add(farm);

    // Support rack poles on the curved surface
    const rack = new THREE.MeshStandardMaterial({ color: 0x7f9278, metalness: 0.45, roughness: 0.45 });
    for (let c = 0; c < cols; c += 2) {
      const px = 16 + c * 2.55;
      const pz = 4;
      const { y, quat } = getSphereSurface(px, pz);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.3, 6), rack);
      pole.position.set(px, y + 0.65, pz);
      pole.quaternion.copy(quat);
      world.add(pole);
    }

    // =========================================================================
    // ⚡ SUBSTATION & BESS CORE ON CURVED SPHERE
    // =========================================================================
    const sub = new THREE.Group();
    const { y: subY, quat: subQuat } = getSphereSurface(2, 10);
    sub.position.set(2, subY, 10);
    sub.quaternion.copy(subQuat);

    const hall = new THREE.Mesh(
      new THREE.BoxGeometry(7.2, 2.2, 4.2),
      new THREE.MeshStandardMaterial({ color: 0xf4f7ed, metalness: 0.18, roughness: 0.42 })
    );
    hall.position.y = 1.1;
    hall.castShadow = true;
    sub.add(hall);

    const core = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.55, 2.4, 24),
      new THREE.MeshStandardMaterial({ color: 0x86efac, emissive: 0x16a34a, emissiveIntensity: 0.75 })
    );
    core.position.set(2.4, 1.4, 0);
    sub.add(core);

    const pulse = new THREE.Mesh(
      new THREE.RingGeometry(1.4, 3.6, 40),
      new THREE.MeshBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0.26, side: THREE.DoubleSide, depthWrite: false })
    );
    pulse.rotation.x = -Math.PI / 2;
    pulse.position.y = 0.05;
    sub.add(pulse);
    world.add(sub);

    // =========================================================================
    // 🗼 TRANSMISSION PYLONS & HIGH-VOLTAGE GRID
    // =========================================================================
    const pylonPoints = [];
    for (let i = 0; i < 5; i++) {
      const px = -8 + i * 9;
      const pz = 22;
      const { y, quat } = getSphereSurface(px, pz);
      const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.35, 8, 0.35), steel);
      pylon.position.set(px, y + 4, pz);
      pylon.quaternion.copy(quat);
      pylon.castShadow = true;
      world.add(pylon);
      pylonPoints.push(new THREE.Vector3(px, y + 7.6, pz));
    }
    const cable = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pylonPoints),
      new THREE.LineBasicMaterial({ color: 0x7f9278, linewidth: 2 })
    );
    world.add(cable);

    // =========================================================================
    // ☁️ DRIFTING PROCEDURAL CLOUDS
    // =========================================================================
    const clouds = [];
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xf8fff3,
      transparent: true,
      opacity: 0.36,
      roughness: 1,
    });
    for (let i = 0; i < 7; i++) {
      const cloud = new THREE.Mesh(new THREE.SphereGeometry(4.5 + Math.random() * 3, 10, 10), cloudMat);
      cloud.scale.set(2.4, 0.45, 1.3);
      cloud.position.set(-50 + i * 18, 22 + Math.random() * 6, -30 - Math.random() * 20);
      clouds.push(cloud);
      scene.add(cloud);
    }

    // =========================================================================
    // ☀️ SUN IN SKY & SOLAR IRRADIANCE BEAMS
    // =========================================================================
    const sunBall = new THREE.Mesh(
      new THREE.SphereGeometry(3.6, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xfff3ad })
    );
    sunBall.position.set(55, 68, -25);
    scene.add(sunBall);

    const halo = new THREE.Mesh(
      new THREE.RingGeometry(4.5, 9.5, 40),
      new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false })
    );
    sunBall.add(halo);

    const solarRayMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
    });
    const solarRays = [];
    panelTargets.forEach((target, i) => {
      const ring = i % 8;
      const layer = Math.floor(i / 8);
      const start = [
        55 + Math.cos(ring * Math.PI * 0.25) * (0.45 + layer * 0.05),
        68 + Math.sin(ring * Math.PI * 0.25) * (0.45 + layer * 0.05),
        -25 + (layer - 1.5) * 0.18,
      ];
      const beam = makeStraightTube(start, target, solarRayMat.clone(), 0.075);
      solarRays.push(beam);
      scene.add(beam);
    });

    // =========================================================================
    // ✨ FLOATING ENERGY STREAM PARTICLES
    // =========================================================================
    const pCount = 70;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const pCol = new Float32Array(pCount * 3);
    const streams = [];

    for (let i = 0; i < pCount; i++) {
      const wind = i % 2 === 0;
      const panel = panelTargets.length > 0 ? panelTargets[i % panelTargets.length] : [20, 2, 0];
      const windStart = [-28, 14, -18];
      streams.push({
        i,
        t: Math.random(),
        wind,
        s: 0.004 + Math.random() * 0.006,
        solarStart: panel,
        windStart,
        substationEnd: [4.4, subY + 1.4, 10],
      });
      pCol[i * 3] = wind ? 0.09 : 0.98;
      pCol[i * 3 + 1] = wind ? 0.72 : 0.72;
      pCol[i * 3 + 2] = wind ? 0.28 : 0.02;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
    world.add(
      new THREE.Points(
        pGeo,
        new THREE.PointsMaterial({ size: 1.45, vertexColors: true, transparent: true, opacity: 0.95, depthWrite: false })
      )
    );

    // =========================================================================
    // 💨 WIND VELOCITY FLOW RIBBONS
    // =========================================================================
    const windFlowMat = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      transparent: true,
      opacity: 0.48,
      depthWrite: false,
    });
    const windFlows = [
      [[-82, 17, -27], [-58, 17, -24], [-36, 16, -20], [-18, 16, -13]],
      [[-86, 13, -12], [-60, 14, -9], [-42, 15, -7], [-22, 16, -6]],
      [[-78, 20, 4], [-58, 19, 1], [-38, 17, -2], [-18, 16, -8]],
      [[-72, 11, -38], [-55, 13, -31], [-39, 15, -25], [-27, 16, -18]],
    ].map((pts) => makeTube(pts, windFlowMat.clone(), 0.16));
    windFlows.forEach((flow) => scene.add(flow));

    // Responsive window resize
    const resize = () => {
      const w = Math.max(1, mount.clientWidth);
      const h = Math.max(1, mount.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, true);
    };
    resize();

    window.addEventListener('resize', resize);
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    let raf;
    const t0 = performance.now();
    const camWorld = new THREE.Vector3();

    // Render loop
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = (performance.now() - t0) / 1000;
      const mode = modeRef.current;
      const motion = reduced ? 0.15 : 1;

      // Smooth camera transition if active
      if (isTransitioning) {
        controls.target.lerp(targetLookAt, 0.08);
        camera.position.lerp(targetCamPos, 0.08);
        if (camera.position.distanceTo(targetCamPos) < 1.2 && controls.target.distanceTo(targetLookAt) < 0.6) {
          isTransitioning = false;
        }
      }
      controls.update();

      const windOn = mode !== 'solar';
      const solarOn = mode !== 'wind';
      const spin = (mode === 'wind' ? 2.3 : mode === 'hybrid' ? 1 : 0.18) * motion;

      rotors.forEach((r) => { r.rotor.rotation.z -= r.speed * spin; });
      panelMat.emissiveIntensity = solarOn ? (mode === 'solar' ? 0.28 + Math.sin(t * 2) * 0.08 : 0.14) : 0.04;
      core.material.emissive.setHex(mode === 'wind' ? 0x16a34a : mode === 'solar' ? 0xca8a04 : 0x22c55e);
      core.material.color.setHex(mode === 'wind' ? 0x86efac : mode === 'solar' ? 0xfde68a : 0x4ade80);

      const ph = t % 2.6;
      pulse.scale.setScalar(1 + ph * 0.7);
      pulse.material.opacity = Math.max(0, 0.32 - ph * 0.12);

      clouds.forEach((c, i) => {
        c.position.x += 0.01 * motion;
        if (c.position.x > 90) c.position.x = -80;
        c.position.y += Math.sin(t * 0.4 + i) * 0.004;
      });

      camera.getWorldPosition(camWorld);
      halo.lookAt(camWorld);

      windFlows.forEach((flow, i) => {
        flow.visible = windOn;
        flow.material.opacity = windOn ? 0.34 + Math.sin(t * 2.6 + i * 0.8) * 0.14 : 0;
      });

      streams.forEach((s) => {
        if (s.wind && !windOn) {
          pPos[s.i * 3] = 999;
          pPos[s.i * 3 + 1] = 999;
          pPos[s.i * 3 + 2] = 999;
          return;
        }
        if (!s.wind && !solarOn) {
          pPos[s.i * 3] = 999;
          pPos[s.i * 3 + 1] = 999;
          pPos[s.i * 3 + 2] = 999;
          return;
        }
        s.t += s.s * motion * (mode === 'hybrid' ? 1 : 1.4);
        if (s.t > 1) s.t = 0;
        if (s.wind) {
          const ease = s.t;
          pPos[s.i * 3] = s.windStart[0] + (s.substationEnd[0] - s.windStart[0]) * ease;
          pPos[s.i * 3 + 1] = s.windStart[1] + (s.substationEnd[1] - s.windStart[1]) * ease;
          pPos[s.i * 3 + 2] = s.windStart[2] + (s.substationEnd[2] - s.windStart[2]) * ease;
        } else {
          const ease = s.t;
          const lift = Math.sin(ease * Math.PI) * 1.5;
          pPos[s.i * 3] = s.solarStart[0] + (s.substationEnd[0] - s.solarStart[0]) * ease;
          pPos[s.i * 3 + 1] = s.solarStart[1] + (s.substationEnd[1] - s.solarStart[1]) * ease + lift;
          pPos[s.i * 3 + 2] = s.solarStart[2] + (s.substationEnd[2] - s.solarStart[2]) * ease;
        }
      });

      solarRays.forEach((ray, i) => {
        ray.visible = solarOn;
        ray.material.opacity = solarOn ? 0.5 + Math.sin(t * 2.8 + i) * 0.18 : 0;
      });
      sunBall.visible = solarOn;
      halo.visible = solarOn;
      pGeo.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      controls.dispose();
      window.removeEventListener('resize', resize);
      window.removeEventListener('mb-3d-action', handle3DAction);
      ro.disconnect();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
      renderer.forceContextLoss();
      solarRays.forEach((ray) => {
        ray.geometry.dispose();
        ray.material.dispose();
      });
      windFlows.forEach((flow) => {
        flow.geometry.dispose();
        flow.material.dispose();
      });
      cellMap.dispose();
      sphereTexture.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing select-none"
      style={{ touchAction: 'none' }}
    />
  );
}
