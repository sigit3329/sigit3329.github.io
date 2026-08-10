// app.js: theme toggle, scroll reveal, small helpers
(function(){
  const html = document.documentElement;
  const stored = localStorage.getItem('theme');
  html.setAttribute('data-theme', stored === 'dark' ? 'dark' : 'light');

  function setTheme(mode){
    html.setAttribute('data-theme', mode);
    localStorage.setItem('theme', mode);
  }

  function resolvedTheme(){
    return html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
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

  const btn = document.getElementById('themeToggle');
  btn && btn.addEventListener('click', () => {
    const next = resolvedTheme() === 'dark' ? 'light' : 'dark';
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