// shell.js — 시안 v2 공통 셸(좌측 GNB·모바일 드로어)과 탭. 정적 목업용 최소 인터랙션.
(function () {
  const I = {
    home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    studio: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 9l5 3-5 3z"/>',
    gallery: '<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
  };
  const svg = (k) => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${I[k]}</svg>`;
  window.icon = svg;
  const page = document.body.dataset.page;
  const items = [
    ['home', '대시보드', 'home.html'],
    ['studio', '새로운 영상생성', 'studio.html'],
    ['gallery', '갤러리', '#gallery'],
    ['settings', '설정', 'settings.html'],
  ];
  const nav = items.map(([k, label, href]) =>
    `<li><a href="${href}" title="${label}" ${(page === k || (page === 'progress' && k === 'studio')) ? 'aria-current="page"' : ''}>${svg(k)}<span class="label">${label}</span></a></li>`).join('');

  const shell = document.createElement('div');
  shell.innerHTML = `
    <header class="topbar">
      <button class="icon-btn" type="button" aria-label="메뉴 열기" aria-controls="gnb" aria-expanded="false" data-open>${svg('menu')}</button>
      <span class="brand"><span class="brand-mark">LTX</span><span class="brand-text">Nomad Studio</span></span>
    </header>
    <div class="scrim" data-close></div>
    <nav class="gnb" id="gnb" aria-label="주 메뉴">
      <div class="row"><span class="brand"><span class="brand-mark">LTX</span><span class="brand-text">Nomad Studio</span></span>
        <button class="icon-btn gnb-close" type="button" aria-label="메뉴 닫기" data-close>${svg('close')}</button></div>
      <ul class="nav">${nav}</ul>
      <section class="gpu" aria-label="GPU 상태" title="RTX 3060 · VRAM 7.1 / 12 GB">
        <div class="gpu-head"><span class="gpu-dot" aria-hidden="true"></span><span class="gpu-name">RTX 3060 · 사용 가능</span></div>
        <span class="gpu-rail-label mono">59%</span>
        <div class="gpu-meta">
          <div class="bar" role="progressbar" aria-label="VRAM 사용량" aria-valuenow="59" aria-valuemin="0" aria-valuemax="100"><i style="width:59%"></i></div>
          <span class="caption muted"><span class="mono">VRAM 7.1 / 12 GB</span><br>대기 잡 1개</span>
        </div>
      </section>
    </nav>`;
  document.body.prepend(...shell.children);

  const gnb = document.getElementById('gnb');
  const scrim = document.querySelector('.scrim');
  const opener = document.querySelector('[data-open]');
  const set = (open) => {
    gnb.classList.toggle('is-open', open); scrim.classList.toggle('is-open', open);
    opener.setAttribute('aria-expanded', String(open));
    if (open) gnb.querySelector('a').focus(); else opener.focus();
  };
  opener.addEventListener('click', () => set(true));
  document.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', () => set(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && gnb.classList.contains('is-open')) set(false); });
  if (location.hash === '#menu') { gnb.classList.add('is-open'); scrim.classList.add('is-open'); }

  // 탭: [role=tablist] 안의 [role=tab] ↔ aria-controls 패널
  document.querySelectorAll('[role="tablist"]').forEach((list) => {
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    const select = (t) => tabs.forEach((x) => {
      const on = x === t; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1;
      document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
    });
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (d) { const n = tabs[(i + d + tabs.length) % tabs.length]; select(n); n.focus(); }
      });
    });
  });
})();
