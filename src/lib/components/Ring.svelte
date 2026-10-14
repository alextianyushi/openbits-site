<script>
  // 3D version of the logo: 8 point-cloud segments in a ring.
  // The blue "active" segment advances around the ring.
  import { onMount } from 'svelte';
  let canvas;

  onMount(() => {
    let disposed = false, raf, cleanup = () => {};
    import('three').then((THREE) => {
      if (disposed) return;
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const rd = new THREE.WebGLRenderer({ canvas, antialias: true });
      rd.setPixelRatio(Math.min(devicePixelRatio, 2));
      rd.setClearColor(0xf4f5f7, 1);
      const scene = new THREE.Scene();
      const cam = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
      cam.position.set(0, 0, 11);
      const group = new THREE.Group();
      scene.add(group);

      const SEG = 8, PER = innerWidth < 640 ? 90 : 170, gap = 0.14, R = 2.5, W = 0.95, D = 0.45;
      const N = SEG * PER;
      const pos = new Float32Array(N * 3), col = new Float32Array(N * 3), seg = new Uint8Array(N);
      for (let s = 0; s < SEG; s++) for (let k = 0; k < PER; k++) {
        const i = s * PER + k;
        const a = -Math.PI / 2 + s * Math.PI / 4 + gap / 2 + Math.random() * (Math.PI / 4 - gap);
        const rad = R - W / 2 + Math.random() * W, z = (Math.random() - 0.5) * D;
        pos.set([rad * Math.cos(a), -rad * Math.sin(a), z], i * 3);
        seg[i] = s;
      }

      // Thin edges: each point to its 2 nearest neighbours in the same segment
      const lines = [];
      for (let s = 0; s < SEG; s++) for (let k = 0; k < PER; k++) {
        const i = s * PER + k;
        let best = [[1e9, -1], [1e9, -1]];
        for (let m = 0; m < PER; m++) {
          if (m === k) continue;
          const j = s * PER + m;
          const dx = pos[i * 3] - pos[j * 3], dy = pos[i * 3 + 1] - pos[j * 3 + 1], dz = pos[i * 3 + 2] - pos[j * 3 + 2];
          const d = dx * dx + dy * dy + dz * dz;
          if (d < best[1][0]) { best[1] = [d, j]; best.sort((a, b) => a[0] - b[0]); }
        }
        best.forEach(([, j]) => { if (j > i) lines.push(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2], pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2]); });
      }
      const lg = new THREE.BufferGeometry();
      lg.setAttribute('position', new THREE.Float32BufferAttribute(lines, 3));
      const lm = new THREE.LineBasicMaterial({ color: 0x00102a, transparent: true, opacity: 0.2 });
      group.add(new THREE.LineSegments(lg, lm));

      const pg = new THREE.BufferGeometry();
      pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      pg.setAttribute('color', new THREE.BufferAttribute(col, 3));
      const dot = document.createElement('canvas');
      dot.width = dot.height = 64;
      const g = dot.getContext('2d');
      g.beginPath(); g.arc(32, 32, 26, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill();
      const tex = new THREE.CanvasTexture(dot);
      const pm = new THREE.PointsMaterial({ size: 0.085, vertexColors: true, map: tex, transparent: true, alphaTest: 0.5 });
      group.add(new THREE.Points(pg, pm));

      const navy = new THREE.Color(0x00102a), blue = new THREE.Color(0x0055ff), tmp = new THREE.Color();
      const lvl = new Float32Array(SEG);
      lvl[0] = 1;

      let mx = 0, my = 0;
      const onMove = (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; };
      const onSize = () => {
        const w = innerWidth, h = innerHeight;
        rd.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
        group.position.x = w > 900 ? 2.6 : 0;
        group.position.y = w > 900 ? 0 : 1.2;
      };
      addEventListener('pointermove', onMove);
      addEventListener('resize', onSize);
      onSize();

      let t0 = performance.now(), active = 0, timer = 0;
      const frame = (t) => {
        const dt = Math.min((t - t0) / 1000, 0.05); t0 = t; timer += dt;
        if (timer > 1.6) { timer = 0; active = (active + 1) % SEG; }
        for (let s = 0; s < SEG; s++) lvl[s] += ((s === active ? 1 : 0) - lvl[s]) * Math.min(1, dt * 3);
        for (let i = 0; i < N; i++) { tmp.copy(navy).lerp(blue, lvl[seg[i]]); col.set([tmp.r, tmp.g, tmp.b], i * 3); }
        pg.attributes.color.needsUpdate = true;
        const tt = t / 1000;
        group.rotation.x += ((-0.35 + my * 0.3 + Math.sin(tt * 0.2) * 0.08) - group.rotation.x) * 0.03;
        group.rotation.y += ((0.45 + mx * 0.4 + Math.cos(tt * 0.17) * 0.1) - group.rotation.y) * 0.03;
        group.rotation.z = -tt * 0.03;
        const sc = Math.min(scrollY / innerHeight, 1.5);
        cam.position.z = 11 + sc * 3;
        canvas.style.opacity = String(1 - sc * 0.5);
        rd.render(scene, cam);
        if (!reduce) raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);

      cleanup = () => {
        cancelAnimationFrame(raf);
        removeEventListener('pointermove', onMove);
        removeEventListener('resize', onSize);
        [lg, pg, lm, pm, tex].forEach((o) => o.dispose());
        rd.dispose();
      };
    });
    return () => { disposed = true; cleanup(); };
  });
</script>

<canvas bind:this={canvas} aria-hidden="true"></canvas>

<style>
  canvas { position: fixed; inset: 0; width: 100%; height: 100%; z-index: 0; display: block; }
</style>
