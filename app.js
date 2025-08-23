// app.js — theme toggle, scroll reveal, small helpers
(function(){
  const html = document.documentElement;
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') html.setAttribute('data-theme', stored);
  else html.setAttribute('data-theme', 'system');

  function setTheme(mode){
    html.setAttribute('data-theme', mode);
    if (mode === 'system') localStorage.removeItem('theme');
    else localStorage.setItem('theme', mode);
  }
// === THEME -> MAP IFRAME SYNC ===
function resolvedTheme() {
  const curr = document.documentElement.getAttribute('data-theme') || 'system';
  if (curr === 'light') return 'light';
  if (curr === 'dark') return 'dark';
  return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
}
function syncMapTheme() {
  const frame = document.getElementById('mapFrame');
  if (frame && frame.contentWindow) {
    frame.contentWindow.postMessage({ type: 'theme', value: resolvedTheme() }, '*');
  }
}
syncMapTheme();
window.addEventListener('load', () => {
  const frame = document.getElementById('mapFrame');
  if (frame) frame.addEventListener('load', syncMapTheme);
  // kirim sekali saat awal halaman tampil
  syncMapTheme();
});
if (window.matchMedia) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', () => {
    if ((localStorage.getItem('theme') || 'system') === 'system') syncMapTheme();
  });
}


  const btn = document.getElementById('themeToggle');
  let cycle = ['system','light','dark'];
  btn && btn.addEventListener('click', () => {
    const curr = html.getAttribute('data-theme') || 'system';
    const idx = cycle.indexOf(curr);
    const next = cycle[(idx+1)%cycle.length];
    setTheme(next);
    btn.title = 'Tema: ' + next;
  });

  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        io.unobserve(e.target);
      }
    });
  }, {threshold: .12});
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const t = document.getElementById(id);
      if (t) {
        e.preventDefault();
        t.scrollIntoView({behavior:'smooth', block:'start'});
        history.pushState(null, '', '#' + id);
      }
    });
  });

  // Micro tilt (mati otomatis jika user reduce motion)
if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches){
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--ry', (x * 6) + 'deg');
      card.style.setProperty('--rx', (-y * 3) + 'deg');
    });
    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--ry','0deg');
      card.style.setProperty('--rx','0deg');
    });
  });
}



})();