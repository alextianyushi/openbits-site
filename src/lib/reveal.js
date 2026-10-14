// Svelte action: fade elements up when they scroll into view.
export function reveal(node) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (node.getBoundingClientRect().top < innerHeight) return;
  node.classList.add('pre');
  const io = new IntersectionObserver(
    ([e]) => { if (e.isIntersecting) { node.classList.remove('pre'); io.disconnect(); } },
    { threshold: 0.15 }
  );
  io.observe(node);
  return { destroy: () => io.disconnect() };
}
