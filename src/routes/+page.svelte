<script>
  import Lattice from '$lib/components/Lattice.svelte';
  import { reveal } from '$lib/reveal.js';
  import { site, hero, about, contact } from '$lib/content.js';
</script>

<svelte:head>
  <title>{site.title}</title>
  <meta name="description" content={site.description} />
  <meta property="og:title" content={site.title} />
  <meta property="og:description" content={site.description} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={site.url} />
  <meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<Lattice />

<div class="wrap">
  <nav>
    <a class="logo" href="/">Open<b>BITS</b></a>
    <ul>
      <li><a href="#about">About</a></li>
    </ul>
  </nav>

  <header class="hero">
    <div class="tag">{hero.tag}</div>
    <h1>{hero.headline} <em>{hero.headlineAccent}</em></h1>
    <p class="sub">{hero.sub}</p>
  </header>

  <section id="about">
    <div class="tag">{about.tag}</div>
    <div class="stack">
      <p class="lead" use:reveal>{about.lead} <span>{about.rest}</span></p>
      <ul class="terms" use:reveal>
        {#each about.terms as t}<li>{t}</li>{/each}
      </ul>
    </div>
  </section>

</div>

<a class="corner" href="mailto:{contact.email}"><span class="tag">{contact.tag}</span> {contact.email}</a>

<footer class="wrap">
  <span>© {new Date().getFullYear()} {site.name}</span>
</footer>
