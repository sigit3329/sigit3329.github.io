// app.js: theme toggle, scroll reveal, small helpers
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

  function resolvedTheme(){
    const mode = html.getAttribute('data-theme') || 'system';
    if (mode === 'dark' || mode === 'light') return mode;
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  }

  const mapFrame = document.getElementById('mapFrame');
  function syncMapTheme(){
    if (!mapFrame) return;
    if (!mapFrame.src) {
      mapFrame.src = 'maps/index.html?embed=1&theme=' + resolvedTheme();
      return;
    }
    if (mapFrame.contentWindow) {
      mapFrame.contentWindow.postMessage({ type: 'theme', value: resolvedTheme() }, '*');
    }
  }
  syncMapTheme();
  mapFrame && mapFrame.addEventListener('load', syncMapTheme);
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', syncMapTheme);

  const btn = document.getElementById('themeToggle');
  let cycle = ['system','light','dark'];
  btn && btn.addEventListener('click', () => {
    const curr = html.getAttribute('data-theme') || 'system';
    const idx = cycle.indexOf(curr);
    const next = cycle[(idx+1)%cycle.length];
    setTheme(next);
    btn.title = 'Tema: ' + next;
    syncMapTheme();
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

  // === PENCARIAN PROJECT ===
  const searchInput = document.getElementById('projectSearch');
  const projectsGrid = document.getElementById('projectsGrid');
  const projectsEmpty = document.getElementById('projectsEmpty');
  if (searchInput && projectsGrid) {
    const cards = Array.from(projectsGrid.children).filter(el => el.classList.contains('card'));
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      let visible = 0;
      cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        const match = !q || text.includes(q);
        card.classList.toggle('is-hidden', !match);
        if (match) visible++;
      });
      if (projectsEmpty) projectsEmpty.classList.toggle('show', visible === 0);
    });
  }

})();