import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

function makeCellMap() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#dff7df';
  ctx.fillRect(0, 0, 256, 128);
  for (let r = 0; r < 3; r++) {
    for (let col = 0; col < 5; col++) {
      const x = 6 + col * 50;
      const y = 6 + r * 40;
      const g = ctx.createLinearGradient(x, y, x + 44, y + 34);
      g.addColorStop(0, '#b8e986');
      g.addColorStop(1, '#5fac64');
      ctx.fillStyle = g;
      ctx.fillRect(x, y, 44, 34);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function makeTube(points, material, radius = 0.12) {
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
    scene.fog = new THREE.Fog(0xdbeeff, 85, 260);

    const camera = new THREE.PerspectiveCamera(46, 1, 0.5, 500);
    const rig = new THREE.Group();
    camera.position.set(0, 34, 116);
    camera.rotation.x = -0.28;
    rig.add(camera);
    scene.add(rig);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.15 : 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = !mobile;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xf3faff, 0x6f8798, 1.05));
    scene.add(new THREE.AmbientLight(0xf8fbff, 0.38));

    const sun = new THREE.DirectionalLight(0xfff8d7, 2.25);
    sun.position.set(40, 48, 18);
    sun.castShadow = !mobile;
    sun.shadow.mapSize.set(1536, 1536);
    sun.shadow.camera.left = -70;
    sun.shadow.camera.right = 70;
    sun.shadow.camera.top = 40;
    sun.shadow.camera.bottom = -20;
    sun.shadow.camera.far = 180;
    sun.shadow.bias = -0.0003;
    scene.add(sun);

    const fill = new THREE.DirectionalLight(0x93c5fd, 0.45);
    fill.position.set(-30, 18, -20);
    scene.add(fill);

    const world = new THREE.Group();
    scene.add(world);

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(120, 80),
      new THREE.MeshStandardMaterial({ color: 0xb9d5ea, roughness: 0.95, metalness: 0.02 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    world.add(ground);

    const duneGeo = new THREE.ConeGeometry(18, 7, 7);
    const duneMat = new THREE.MeshStandardMaterial({ color: 0xc8dff0, roughness: 1, flatShading: true });
    [[-70, 2.8, -55], [78, 3.4, -62], [-40, 2.2, -78], [50, 2.6, -82], [90, 4, -40]].forEach(([x, y, z]) => {
      const m = new THREE.Mesh(duneGeo, duneMat);
      m.position.set(x, y, z);
      world.add(m);
    });

    const grid = new THREE.GridHelper(150, 30, 0x3b82f6, 0x93c5fd);
    grid.material.transparent = true;
    grid.material.opacity = 0.18;
    world.add(grid);

    const white = new THREE.MeshStandardMaterial({ color: 0xf8fbf1, roughness: 0.32, metalness: 0.12 });
    const steel = new THREE.MeshStandardMaterial({ color: 0x8fa388, roughness: 0.4, metalness: 0.55 });
    const hubMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.25, metalness: 0.35, emissive: 0x15803d, emissiveIntensity: 0.22 });

    const towerGeo = new THREE.CylinderGeometry(0.28, 0.72, 16, 12);
    const nacelleGeo = new THREE.BoxGeometry(2.4, 0.9, 0.95);
    const bladeGeo = new THREE.BoxGeometry(0.22, 7.4, 0.08);
    bladeGeo.translate(0, 3.7, 0);
    const rotors = [];

    const placeTurbine = (x, z, scale) => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);
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

    const cellMap = makeCellMap();
    const panelMat = new THREE.MeshStandardMaterial({
      map: cellMap,
      roughness: 0.18,
      metalness: 0.55,
      emissive: 0x22c55e,
      emissiveIntensity: 0.12,
    });
    const panelGeo = new THREE.BoxGeometry(2.2, 0.05, 1.15);
    const rows = 7;
    const cols = 9;
    const farm = new THREE.InstancedMesh(panelGeo, panelMat, rows * cols);
    farm.castShadow = true;
    farm.receiveShadow = true;
    const dummy = new THREE.Object3D();
    let n = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dummy.position.set(16 + c * 2.55, 1.15 + r * 0.04, -6 + r * 2.05);
        dummy.rotation.set(-0.48, 0.08, 0);
        dummy.updateMatrix();
        farm.setMatrixAt(n++, dummy.matrix);
      }
    }
    world.add(farm);

    const rack = new THREE.MeshStandardMaterial({ color: 0x7f9278, metalness: 0.45, roughness: 0.45 });
    for (let c = 0; c < cols; c += 2) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.3, 6), rack);
      pole.position.set(16 + c * 2.55, 0.65, 4);
      world.add(pole);
    }

    const sub = new THREE.Group();
    sub.position.set(2, 0, 10);
    const hall = new THREE.Mesh(new THREE.BoxGeometry(7.2, 2.2, 4.2), new THREE.MeshStandardMaterial({ color: 0xf4f7ed, metalness: 0.18, roughness: 0.42 }));
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

    for (let i = 0; i < 5; i++) {
      const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.35, 8, 0.35), steel);
      pylon.position.set(-8 + i * 9, 4, 22);
      pylon.castShadow = true;
      world.add(pylon);
    }
    const cable = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-8, 7.6, 22),
        new THREE.Vector3(28, 7.6, 22),
      ]),
      new THREE.LineBasicMaterial({ color: 0x7f9278 })
    );
    world.add(cable);

    const sunBall = new THREE.Mesh(new THREE.SphereGeometry(3.4, 32, 32), new THREE.MeshBasicMaterial({ color: 0xffe08a }));
    sunBall.position.set(48, 38, -20);
    scene.add(sunBall);
    const halo = new THREE.Mesh(
      new THREE.RingGeometry(4.2, 8.5, 40),
      new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false })
    );
    sunBall.add(halo);

    const solarRayMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
    });
    const solarRays = [];
    const panelTargets = [];
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 2) {
        panelTargets.push([16 + c * 2.55, 1.55 + r * 0.04, -6 + r * 2.05]);
      }
    }
    panelTargets.forEach((target, i) => {
      const ring = i % 8;
      const layer = Math.floor(i / 8);
      const start = [
        48 + Math.cos(ring * Math.PI * 0.25) * (0.35 + layer * 0.05),
        38 + Math.sin(ring * Math.PI * 0.25) * (0.35 + layer * 0.05),
        -20 + (layer - 1.5) * 0.18,
      ];
      const beam = makeStraightTube(
        start,
        target,
        solarRayMat.clone(),
        0.075
      );
      solarRays.push(beam);
      scene.add(beam);
    });

    const clouds = [];
    const cloudMat = new THREE.MeshStandardMaterial({ color: 0xf8fff3, transparent: true, opacity: 0.34, roughness: 1 });
    for (let i = 0; i < 7; i++) {
      const cloud = new THREE.Mesh(new THREE.SphereGeometry(4.5 + Math.random() * 3, 10, 10), cloudMat);
      cloud.scale.set(2.4, 0.45, 1.3);
      cloud.position.set(-50 + i * 18, 22 + Math.random() * 6, -30 - Math.random() * 20);
      clouds.push(cloud);
      scene.add(cloud);
    }

    const pCount = 70;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const pCol = new Float32Array(pCount * 3);
    const streams = [];
    for (let i = 0; i < pCount; i++) {
      const wind = i % 2 === 0;
      const panel = panelTargets[i % panelTargets.length];
      streams.push({
        i,
        t: Math.random(),
        wind,
        s: 0.004 + Math.random() * 0.006,
        solarStart: panel,
        solarEnd: [2.4, 1.4, 10],
      });
      pCol[i * 3] = wind ? 0.09 : 0.98;
      pCol[i * 3 + 1] = wind ? 0.72 : 0.72;
      pCol[i * 3 + 2] = wind ? 0.28 : 0.02;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
    world.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 1.35, vertexColors: true, transparent: true, opacity: 0.95, depthWrite: false })));

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

    let yaw = 0.18;
    let pitch = -0.08;
    let tYaw = yaw;
    let tPitch = pitch;
    let distance = 152;
    let targetDistance = 152;
    let dragging = false;
    const pointers = new Map();
    let lastPinch = 0;
    let lx = 0;
    let ly = 0;

    const onMove = (e) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const pinch = Math.hypot(a.x - b.x, a.y - b.y);
        if (lastPinch) {
          targetDistance += (lastPinch - pinch) * 0.16;
          targetDistance = Math.max(100, Math.min(220, targetDistance));
        }
        lastPinch = pinch;
        return;
      }
      if (dragging) {
        tYaw -= (e.clientX - lx) * 0.0035;
        tPitch -= (e.clientY - ly) * 0.002;
        tPitch = Math.max(-0.26, Math.min(0.1, tPitch));
        lx = e.clientX;
        ly = e.clientY;
      }
    };
    const onDown = (e) => {
      dragging = true;
      mount.setPointerCapture?.(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        lastPinch = Math.hypot(a.x - b.x, a.y - b.y);
      }
      lx = e.clientX;
      ly = e.clientY;
    };
    const onUp = (e) => {
      pointers.delete(e.pointerId);
      lastPinch = 0;
      dragging = pointers.size > 0;
    };
    const onWheel = (e) => {
      e.preventDefault();
      targetDistance += e.deltaY * 0.045;
      targetDistance = Math.max(100, Math.min(220, targetDistance));
    };

    const resize = () => {
      const w = Math.max(1, mount.clientWidth);
      const h = Math.max(1, mount.clientHeight);
      const narrow = w < 760;
      const wide = w > 1180;
      targetDistance = narrow ? 184 : wide ? 152 : 164;
      distance = THREE.MathUtils.lerp(distance, targetDistance, 0.35);
      camera.aspect = w / h;
      camera.fov = narrow ? 58 : 52;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, true);
    };
    resize();

    mount.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    mount.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', resize);
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    let raf;
    const t0 = performance.now();
    const camWorld = new THREE.Vector3();
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = (performance.now() - t0) / 1000;
      const mode = modeRef.current;
      const motion = reduced ? 0.15 : 1;
      if (cinematicRef.current && !dragging && !reduced) tYaw += 0.00055;
      yaw += (tYaw - yaw) * 0.06;
      pitch += (tPitch - pitch) * 0.06;
      distance += (targetDistance - distance) * 0.08;
      camera.position.set(0, distance * 0.31, distance);
      rig.rotation.y = yaw;
      rig.rotation.x = pitch;

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
      clouds.forEach((c, i) => { c.position.x += 0.01 * motion; if (c.position.x > 90) c.position.x = -80; c.position.y += Math.sin(t * 0.4 + i) * 0.004; });
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
          pPos[s.i * 3] = -28 + s.t * 30;
          pPos[s.i * 3 + 1] = 16 - s.t * 14;
          pPos[s.i * 3 + 2] = -12 + s.t * 22;
        } else {
          const ease = s.t;
          const lift = Math.sin(ease * Math.PI) * 1.1;
          pPos[s.i * 3] = s.solarStart[0] + (s.solarEnd[0] - s.solarStart[0]) * ease;
          pPos[s.i * 3 + 1] = s.solarStart[1] + (s.solarEnd[1] - s.solarStart[1]) * ease + lift;
          pPos[s.i * 3 + 2] = s.solarStart[2] + (s.solarEnd[2] - s.solarStart[2]) * ease;
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
      mount.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      mount.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', resize);
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
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-none" />;
}
