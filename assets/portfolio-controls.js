/* Native dialogs provide focus containment, background isolation and Escape. */
(() => {
  const stage = document.getElementById('stage');
  const album = document.getElementById('album');
  const track = document.getElementById('stageTrack');
  const cap = document.getElementById('stageCap');
  const previous = document.getElementById('stagePrev');
  const next = document.getElementById('stageNext');
  const position = document.getElementById('stagePosition');
  const original = document.getElementById('stageOriginal');
  let items = [], current = 0, stageTrigger = null, albumTrigger = null;
  const en = () => document.documentElement.lang === 'en';
  const title = item => en() ? item.en : item.zh;
  const lock = () => { document.body.style.overflow = stage.open || album.open ? 'hidden' : ''; };
  [stage, album].forEach(dialog => dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const controls = [...dialog.querySelectorAll('button:not([disabled]),a[href],input,[tabindex]')]
      .filter(el => el.tabIndex >= 0 && !el.closest('[inert],[hidden]') && el.getClientRects().length);
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }));

  function loadImage(card, item) {
    if (!item.img || card.querySelector('img')) return;
    const image = document.createElement('img');
    const media = mediaEntry(item.img);
    image.alt = title(item);
    image.decoding = 'async';
    if (media) {
      image.width = media.width;
      image.height = media.height;
      if (media.variants) {
        image.srcset = media.variants.map(v => `${v.src} ${v.width}w`).join(', ');
        image.sizes = '(max-width: 760px) 84vw, 820px';
      }
    }
    image.src = media ? media.src : item.img;
    image.addEventListener('error', () => {
      card.classList.add('media-error');
      card.textContent = title(item) + (en() ? ' — image unavailable' : ' — 图片暂时无法加载');
    }, {once:true});
    card.appendChild(image);
  }

  function layout(focusCard = false) {
    const item = items[current];
    const focused = document.activeElement;
    [...track.children].forEach((card, i) => {
      const distance = i - current;
      card.dataset.pos = Math.abs(distance) <= 1 ? String(distance) : 'off';
      card.inert = Math.abs(distance) > 1;
      card.tabIndex = i === current && (item.id || item.href) ? 0 : -1;
      card.setAttribute('aria-hidden', i === current ? 'false' : 'true');
      if (Math.abs(distance) <= 1) loadImage(card, items[i]);
    });
    cap.replaceChildren(document.createTextNode(title(item)));
    const hint = document.createElement('small');
    hint.textContent = item.id ? (en() ? 'Open project' : '打开作品') : item.href ? (en() ? 'Opens on Yuque ↗' : '前往语雀 ↗') : (en() ? item.ten : item.tzh) || '';
    cap.appendChild(hint);
    position.textContent = `${current + 1} / ${items.length}`;
    previous.disabled = current === 0;
    next.disabled = current === items.length - 1;
    if (focused === next && next.disabled) (previous.disabled ? document.getElementById('stageClose') : previous).focus();
    if (focused === previous && previous.disabled) (next.disabled ? document.getElementById('stageClose') : next).focus();
    original.hidden = !!(item.id || item.href || !item.img);
    if (!original.hidden) original.href = item.img;
    if (focusCard) {
      const card = track.children[current];
      (item.id || item.href ? card : document.getElementById('stageClose')).focus({preventScroll:true});
    }
  }

  function move(direction) {
    const target = Math.max(0, Math.min(items.length - 1, current + direction));
    if (target === current) return;
    const focusedCard = track.contains(document.activeElement);
    current = target;
    layout(focusedCard);
  }

  function build() {
    track.replaceChildren();
    items.forEach((item, i) => {
      const card = document.createElement(item.id || item.href ? 'a' : 'div');
      card.className = 'st-card' + (item.img ? '' : ' is-note');
      if (item.id) card.href = '#project/' + item.id;
      if (item.href) { card.href = item.href; card.target = '_blank'; card.rel = 'noopener'; }
      if (item.id || item.href) card.setAttribute('aria-label', title(item));
      if (!item.img) {
        const label = document.createElement('span');
        label.className = 'st-note-t';
        label.textContent = title(item);
        card.appendChild(label);
      }
      card.addEventListener('click', event => {
        if (i !== current) { event.preventDefault(); current = i; layout(true); }
        else if (item.id && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
          event.preventDefault(); showDetail(item.id);
        } else if (item.href) stage.close();
      });
      card.addEventListener('keydown', event => {
        if (event.key === ' ' && (item.id || item.href)) { event.preventDefault(); card.click(); }
      });
      track.appendChild(card);
    });
    layout();
  }

  function openStage(cards, index, trigger) {
    items = cards; current = index; stageTrigger = trigger;
    build(); stage.showModal(); lock(); layout(true);
  }
  document.getElementById('stageClose').addEventListener('click', () => stage.close());
  stage.addEventListener('close', () => {
    if (stage.open) return; // A queued close event must not clear a newly opened preview.
    lock(); track.replaceChildren();
    // A deliberate close on the source page must not reopen on a later visit.
    if (document.getElementById('page-home').classList.contains('active') && history.state?.portfolioView?.preview) {
      history.replaceState({...history.state, portfolioView:{...history.state.portfolioView, preview:null}}, '');
    }
    if (stageTrigger?.isConnected && (document.getElementById('page-home').classList.contains('active') || album.open)) stageTrigger.focus({preventScroll:true});
  });
  stage.addEventListener('click', event => { if (event.target === stage || event.target === track) stage.close(); });
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  stage.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  let start = null;
  stage.addEventListener('touchstart', event => {
    const touch = event.touches[0]; start = {x:touch.clientX,y:touch.clientY};
  }, {passive:true});
  stage.addEventListener('touchcancel', () => { start = null; }, {passive:true});
  stage.addEventListener('touchend', event => {
    if (!start) return;
    const touch = event.changedTouches[0], dx = touch.clientX - start.x, dy = touch.clientY - start.y;
    start = null;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1);
  }, {passive:true});

  document.getElementById('albumClose').addEventListener('click', () => album.close());
  album.addEventListener('close', () => {
    if (album.open) return;
    if (stage.open) stage.close();
    lock();
    if (albumTrigger?.isConnected && (document.activeElement === document.body || album.contains(document.activeElement))) albumTrigger.focus({preventScroll:true});
  });
  album.querySelectorAll('.al-sec').forEach(section => {
    const figures = [...section.querySelectorAll('.al-ph')];
    figures.forEach((figure, index) => {
      const button = figure.querySelector('button');
      button.addEventListener('click', () => openStage(figures.map(photo => ({
        img:photo.dataset.img, zh:photo.dataset.czh, en:photo.dataset.cen,
        tzh:section.dataset.tzh, ten:section.dataset.ten
      })), index, button));
    });
  });
  function openFolder(box, index = 0) {
    const cards = [...box.querySelectorAll('.fd-card')];
    if (!cards.length) return;
    openStage(cards.map(card => ({
      id:card.dataset.id, href:card.dataset.href, img:card.dataset.img,
      zh:card.dataset.czh, en:card.dataset.cen, tzh:card.dataset.tzh, ten:card.dataset.ten
    })), Math.max(0, Math.min(index, cards.length - 1)), box.querySelector('.fd-open'));
  }
  document.querySelectorAll('.fd-box').forEach(box => {
    box.addEventListener('click', event => {
      if (box.dataset.album) { albumTrigger = box.querySelector('.fd-open'); album.showModal(); lock(); return; }
      openFolder(box, [...box.querySelectorAll('.fd-card')].indexOf(event.target.closest('.fd-card')));
    });
  });
  document.addEventListener('localechange', () => { if (stage.open) { build(); layout(true); } });
  window.portfolioPreview = {
    snapshot() {
      if (!stage.open || !stageTrigger?.matches('.fd-open')) return null;
      return {folder:[...document.querySelectorAll('.fd-box')].indexOf(stageTrigger.closest('.fd-box')), index:current};
    },
    close() { if (stage.open) stage.close(); if (album.open) album.close(); },
    restore(view) {
      const box = document.querySelectorAll('.fd-box')[view.folder];
      if (box && !box.dataset.album && Number.isInteger(view.index)) openFolder(box, view.index);
    }
  };
  // The router runs before this deferred control script on an initial page load.
  if (document.getElementById('page-home').classList.contains('active') && history.state?.portfolioView?.preview) {
    window.portfolioPreview.restore(history.state.portfolioView.preview);
  }
})();

/* Copy feedback never reports success until the clipboard promise resolves. */
document.addEventListener('click', async event => {
  const control = event.target.closest('.mh-ct-row[data-copy], .mh-quick-link[data-copy]');
  if (!control || control.disabled) return;
  event.preventDefault();
  const hint = control.querySelector('.mh-ct-hint');
  control.disabled = true;
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(control.dataset.copy);
    hint.textContent = isEN ? 'Copied' : '已复制';
  } catch {
    hint.textContent = isEN ? 'Copy manually' : '请手动复制';
    const fallback = document.getElementById('copyFallback');
    const input = fallback.querySelector('input');
    input.value = control.dataset.copy;
    fallback.showModal(); input.focus(); input.select();
  } finally {
    control.disabled = false;
    setTimeout(() => { hint.textContent = hint.getAttribute(isEN ? 'data-en' : 'data-zh'); }, 2500);
  }
});
document.querySelector('#copyFallback button').addEventListener('click', () => document.getElementById('copyFallback').close());
