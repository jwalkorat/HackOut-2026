import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function OrbCanvas({ kind = 'core', accent = 0x22d3ee }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 40);
    camera.position.z = 6.4;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const d = new THREE.DirectionalLight(0xffffff, 1.3);
    d.position.set(3, 4, 5);
    scene.add(d);

    const group = new THREE.Group();
    scene.add(group);
    const mat = new THREE.MeshStandardMaterial({
      color: accent,
      emissive: accent,
      emissiveIntensity: 0.35,
      metalness: 0.45,
      roughness: 0.25,
    });

    if (kind === 'battery') {
      group.add(new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.1, 1.1), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.4, roughness: 0.3 })));
      const fill = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 0.2), mat);
      fill.position.z = 0.55;
      group.add(fill);
    } else if (kind === 'sun') {
      group.add(new THREE.Mesh(new THREE.SphereGeometry(1.15, 32, 32), mat));
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.05, 8, 48), mat);
      ring.rotation.x = 0.7;
      group.add(ring);
    } else if (kind === 'turbine') {
      const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.22, 2.4, 12), new THREE.MeshStandardMaterial({ color: 0xf8fafc }));
      tower.position.y = -0.2;
      group.add(tower);
      const rotor = new THREE.Group();
      rotor.position.y = 1.05;
      for (let i = 0; i < 3; i++) {
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.6, 0.04), new THREE.MeshStandardMaterial({ color: 0xf8fafc }));
        blade.position.y = 0.8;
        const h = new THREE.Group();
        h.rotation.z = (i * Math.PI * 2) / 3;
        h.add(blade);
        rotor.add(h);
      }
      group.userData.rotor = rotor;
      group.add(rotor);
    } else {
      group.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1.05, 1), mat));
      group.add(new THREE.Mesh(new THREE.TorusGeometry(1.45, 0.045, 8, 64), mat));
    }

    const resize = () => {
      const w = el.clientWidth || 60;
      const h = el.clientHeight || 60;
      const s = Math.min(w, h);
      renderer.setSize(s, s, false);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      camera.aspect = 1;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    let raf;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      group.rotation.y += 0.012;
      group.rotation.x = Math.sin(performance.now() * 0.0006) * 0.15;
      if (group.userData.rotor) group.userData.rotor.rotation.z -= 0.08;
      renderer.render(scene, camera);
    };
    tick();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      try {
        renderer.forceContextLoss();
        renderer.dispose();
      } catch {
        // ignore if already disposed
      }
    };
  }, [kind, accent]);

  return <div ref={ref} className="w-full h-full" />;
}
