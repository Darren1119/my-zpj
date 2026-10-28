/* Shared image dimensions keep lazy-loaded articles stable during navigation. */
const portfolioMediaByPath = new Map();
Object.entries(window.portfolioMedia || {}).forEach(([path, media]) => {
  portfolioMediaByPath.set(path, media);
  (media.variants || []).forEach(variant => portfolioMediaByPath.set(variant.src, media));
});
function mediaEntry(src) {
  const path = src.replace(location.origin + '/', '').replace(/^\.\//, '');
  return portfolioMediaByPath.get(path);
}
function prepareMedia(root) {
  root.querySelectorAll('picture source[srcset]').forEach(source => {
    const media = mediaEntry(source.getAttribute('srcset').split(/[ ,]/)[0]);
    if (media) { source.width = media.width; source.height = media.height; }
  });
  root.querySelectorAll('img[src]').forEach(img => {
    const original = img.dataset.mediaOriginal || img.getAttribute('src');
    const media = mediaEntry(original);
    if (!media) return;
    img.dataset.mediaOriginal = original;
    img.width = media.width;
    img.height = media.height;
    img.decoding = 'async';
    if (media.variants) {
      img.srcset = media.variants.map(v => `${v.src} ${v.width}w`).join(', ');
      img.sizes = '(max-width: 760px) 94vw, 960px';
    }
    img.src = media.src;
    if (!img.closest('.detail-hero')) img.loading = 'lazy';
  });
  root.querySelectorAll('a[data-team-ai-zoom]').forEach(link => {
    // Let the visible zoom hint and image alt text provide the accessible name.
    link.removeAttribute('aria-label');
    link.removeAttribute('data-aria-label-zh');
    link.removeAttribute('data-aria-label-en');
  });
}
