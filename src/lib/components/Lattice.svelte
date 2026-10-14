<script>
  import { onMount } from 'svelte';
  let canvas;

  onMount(() => {
    let disposed = false, raf, cleanup = () => {};
    // Load three.js lazily so text paints first.
    import('three').then((THREE) => {
      if (disposed) return;
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const r = new THREE.WebGLRenderer({ canvas, antialias: true });
      r.setPixelRatio(Math.min(devicePixelRatio, 2));
      r.setClearColor(0x0a0907, 1);
      const scene = new THREE.Scene();
      const cam = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
      cam.position.set(0, 0, 9);
      const group = new THREE.Group();
      scene.add(group);

      const N = innerWidth < 640 ? 140 : 260;
      const pts = [];
      for (let i = 0; i < N; i++) {
        const y = 1 - (i / (N - 1)) * 2, rad = Math.sqrt(1 - y * y), th = i * 2.39996;
        const s = 2.6 + (Math.random() - 0.5) * 0.5;
        pts.push(new THREE.Vector3(Math.cos(th) * rad * s, y * s, Math.sin(th) * rad * s));
      }
      const seg = [];
      pts.forEach((p, i) => {
        pts.map((q, j) => [p.distanceToSquared(q), j]).sort((a, b) => a[0] - b[0]).slice(1, 4)
          .forEach(([, j]) => { if (j > i) seg.push(p.x, p.y, p.z, pts[j].x, pts[j].y, pts[j].z); });
      });
      const lg = new THREE.BufferGeometry();
      lg.setAttribute('position', new THREE.Float32BufferAttribute(seg, 3));
      const lm = new THREE.LineBasicMaterial({ color: 0xece6da, transparent: true, opacity: 0.09 });
      group.add(new THREE.LineSegments(lg, lm));

      const pos = new Float32Array(N * 3), col = new Float32Array(N * 3), heat = new Float32Array(N);
      pts.forEach((p, i) => pos.set([p.x, p.y, p.z], i * 3));
      const pg = new THREE.BufferGeometry();
      pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      pg.setAttribute('color', new THREE.BufferAttribute(col, 3));
      const dot = document.createElement('canvas');
      dot.width = dot.height = 64;
      const g = dot.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, 'rgba(255,255,255,1)');
      gr.addColorStop(0.3, 'rgba(255,255,255,.6)');
      gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
      const tex = new THREE.CanvasTexture(dot);
      const pm = new THREE.PointsMaterial({ size: 0.13, vertexColors: true, map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
      group.add(new THREE.Points(pg, pm));

      const base = new THREE.Color(0x6e675c), amber = new THREE.Color(0xe8a23a), tmp = new THREE.Color();
      let mx = 0, my = 0;
      const onMove = (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; };
      const onSize = () => {
        const w = innerWidth, h = innerHeight;
        r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
        group.position.x = w > 900 ? 2.2 : 0;
      };
      addEventListener('pointermove', onMove);
      addEventListener('resize', onSize);
      onSize();

      let t0 = performance.now();
      const frame = (t) => {
        const dt = Math.min((t - t0) / 1000, 0.05); t0 = t;
        if (Math.random() < dt * 2.2) heat[Math.floor(Math.random() * N)] = 1;
        for (let i = 0; i < N; i++) {
          heat[i] = Math.max(0, heat[i] - dt * 0.45);
          tmp.copy(base).lerp(amber, heat[i]);
          col.set([tmp.r, tmp.g, tmp.b], i * 3);
        }
        pg.attributes.color.needsUpdate = true;
        group.rotation.y += dt * 0.05;
        group.rotation.x += (my * 0.3 - group.rotation.x) * 0.02;
        group.rotation.z += (mx * 0.15 - group.rotation.z) * 0.02;
        const sc = Math.min(scrollY / innerHeight, 1.5);
        cam.position.z = 9 + sc * 3;
        canvas.style.opacity = String(1 - sc * 0.5);
        r.render(scene, cam);
        if (!reduce) raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);

      cleanup = () => {
        cancelAnimationFrame(raf);
        removeEventListener('pointermove', onMove);
        removeEventListener('resize', onSize);
        [lg, pg, lm, pm, tex].forEach((o) => o.dispose());
        r.dispose();
      };
    });
    return () => { disposed = true; cleanup(); };
  });
</script>

<canvas bind:this={canvas} aria-hidden="true"></canvas>

<style>
  canvas { position: fixed; inset: 0; width: 100%; height: 100%; z-index: 0; display: block; }
</style>
