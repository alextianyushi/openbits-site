<script>
  import { onMount } from 'svelte';
  import '../app.css';
  let { children } = $props();

  onMount(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let lenis, raf;
    import('lenis').then(({ default: Lenis }) => {
      lenis = new Lenis({ anchors: true });
      const loop = (t) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop);
    });
    return () => { cancelAnimationFrame(raf); lenis?.destroy(); };
  });
</script>

{@render children()}
