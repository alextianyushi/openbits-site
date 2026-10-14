# OpenBITS homepage

SvelteKit + Three.js + Lenis. Static output, deploy anywhere.

    npm install
    npm run dev       # http://localhost:5173
    npm run build     # output in build/

- All copy: `src/lib/content.js`
- 3D lattice: `src/lib/components/Lattice.svelte`
- Styles / colours: `src/app.css`

Deploy: push to GitHub, import in Vercel or Cloudflare Pages (build `npm run build`, output `build`).
