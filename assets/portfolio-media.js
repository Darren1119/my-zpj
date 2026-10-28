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
  root.querySelectorAll('video[poster]').forEach(video => {
    const media = mediaEntry(video.getAttribute('poster'));
    if (media) video.poster = media.src;
    if (!video.dataset.src) return;
    const frame = document.createElement('div');
    frame.className = 'detail-video-frame';
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'detail-video-start'; button.dataset.videoPlay = '';
    const caption = video.closest('figure').querySelector('.detail-video-title').textContent;
    button.setAttribute('aria-label', (isEN ? 'Play video: ' : '播放视频：') + caption);
    button.innerHTML = '<span aria-hidden="true">▶</span>';
    video.replaceWith(frame); frame.append(video, button);
  });
  root.querySelectorAll('a[data-team-ai-zoom]').forEach(link => {
    // Let the visible zoom hint and image alt text provide the accessible name.
    link.removeAttribute('aria-label');
    link.removeAttribute('data-aria-label-zh');
    link.removeAttribute('data-aria-label-en');
  });
}

// preload is only a browser hint. Assign the URL on an explicit play action instead.
document.addEventListener('click', async event => {
  const button = event.target.closest('button[data-video-play]');
  if (!button) return;
  const frame = button.closest('.detail-video-frame');
  const video = frame.querySelector('video');
  frame.querySelector('.detail-video-error')?.remove();
  video.src = video.dataset.src;
  video.controls = true;
  button.hidden = true;
  try { await video.play(); }
  catch {
    if (!video.isConnected || !video.closest('.page.active')) return;
    button.hidden = false;
    video.controls = false;
    const message = document.createElement('p');
    message.className = 'detail-video-error'; message.setAttribute('role','alert');
    message.textContent = document.documentElement.lang === 'en' ? 'Video could not play. Please try again.' : '视频暂时无法播放，请重试。';
    frame.append(message);
    button.focus({preventScroll:true});
  }
});
