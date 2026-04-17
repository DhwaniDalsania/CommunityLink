// ── APP STATE
let needs = [], volunteers = [], allMatches = [];
let currentUser = null;
let activePage = 'home';

// ── INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
  initImmersiveEngine();
  initRouting();
  initStats();
  renderHomeNeeds();
});

// ── IMMERSIVE INTERACTION ENGINE (The "Alive" Layer)
function initImmersiveEngine() {
  const lerp = (start, end, amt) => (1 - amt) * start + amt * end;
  
  // 1. Mouse State
  let mx = 0, my = 0;
  let tmx = 0, tmy = 0;
  const cursorGlow = document.getElementById('cursor-glow');

  window.addEventListener('mousemove', (e) => {
    tmx = e.clientX;
    tmy = e.clientY;
    
    // Update CSS variables for glow
    document.documentElement.style.setProperty('--x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--y', `${e.clientY}px`);

    // 2. 3D Tilt Engine
    document.querySelectorAll('.tilt-wrapper').forEach(card => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      if (x > 0 && x < rect.width && y > 0 && y < rect.height) {
        const xc = rect.width / 2;
        const yc = rect.height / 2;
        const dx = (x - xc) / (rect.width / 2);
        const dy = (y - yc) / (rect.height / 2);
        
        card.style.transform = `rotateX(${-dy * 15}deg) rotateY(${dx * 15}deg)`;
      } else {
        card.style.transform = `rotateX(0deg) rotateY(0deg)`;
      }
    });
  });

  // 3. Silky Parallax & Breathing Loop
  function tick() {
    mx = lerp(mx, tmx, 0.1);
    my = lerp(my, tmy, 0.1);

    // Multi-layer depth parallax
    document.querySelectorAll('.parallax-wrap').forEach((el, i) => {
      const depth = (i + 1) * 0.4;
      const px = (mx / window.innerWidth - 0.5) * 40 * depth;
      const py = (my / window.innerHeight - 0.5) * 30 * depth;
      el.style.transform = `translate3d(${px}px, ${py}px, 0)`;
    });

    requestAnimationFrame(tick);
  }
  tick();

  // 4. Advanced Scroll Reveal (Storytelling)
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // Use a more robust check for visibility
      if (entry.isIntersecting || entry.intersectionRatio > 0) {
        entry.target.classList.add('visible');
        if (entry.target.classList.contains('impact-stat')) {
           animateCounter(entry.target);
        }
        io.unobserve(entry.target);
      }
    });
  }, { 
    threshold: 0,
    rootMargin: '10% 0px 10% 0px' 
  });

  // Observe and force check for elements already in view
  setTimeout(() => {
    document.querySelectorAll('.reveal, .wipe-reveal, .impact-stat').forEach(el => {
      io.observe(el);
      // Fallback for elements at the very top
      const rect = el.getBoundingClientRect();
      if (rect.top >= 0 && rect.top <= window.innerHeight) {
        el.classList.add('visible');
      }
    });
  }, 100);
}



// ── ROUTING & PAGE ENGINE
function navigate(pageId, anchorId = null) {
  if (pageId === activePage && !anchorId) return;

  const currentView = document.getElementById(`view-${activePage}`);
  const nextView = document.getElementById(`view-${pageId}`);

  if (currentView) {
    currentView.classList.add('page-exit');
    setTimeout(() => {
      currentView.classList.remove('active', 'page-exit');
      if (nextView) {
        nextView.classList.add('active');
        activePage = pageId;
        window.scrollTo({ top: 0, behavior: 'instant' });
        
        // Update Nav
        document.querySelectorAll('.nav-link').forEach(l => {
          l.classList.toggle('active', l.getAttribute('data-page') === pageId);
        });

        if (pageId === 'dash') renderDashboard();
      }

      if (anchorId) {
        setTimeout(() => {
          const el = document.getElementById(anchorId);
          if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
        }, 100);
      }
    }, 400);
  }
}

function initRouting() {
  window.addEventListener('hashchange', () => {
    const h = window.location.hash.substring(1);
    if(h) navigate(h);
  });
}

// ── AUTH & DATA LOGIC
function handleAuth(type) {
  const email = document.getElementById(type === 'login' ? 'l-email' : 's-email').value;
  if (!email) { showToast('Email required'); return; }
  
  currentUser = { name: type === 'login' ? 'Member' : 'Volunteer', email };
  showToast('Mission identity confirmed.');
  
  setTimeout(() => {
    document.getElementById('nav-user-ctrl').innerHTML = `
      <div style="display:flex; align-items:center; gap:1.2rem;">
        <span style="font-weight:600; color:var(--primary); font-size:0.9rem;">${currentUser.name}</span>
        <button class="btn btn-soft" style="padding:0.4rem 1rem; font-size:0.8rem;" onclick="logout()">Sign Out</button>
      </div>
    `;
    navigate('dash');
  }, 600);
}

function logout() {
  currentUser = null;
  document.getElementById('nav-user-ctrl').innerHTML = `<button class="btn btn-soft" style="padding: 0.6rem 1.5rem;" onclick="navigate('login')">Sign In</button>`;
  navigate('home');
  showToast('Connection closed.');
}

// ── RENDERERS
function renderHomeNeeds() {
  const list = document.getElementById('home-match-list');
  if (!list) return;
  const mock = [
    { area: 'Anand North', cat: 'Medical Relief' },
    { area: 'Karamsad', cat: 'Emergency Food' }
  ];
  list.innerHTML = mock.map((n, i) => `
    <div class="story-card reveal stagger-${i+1}" style="flex-direction:row; align-items:center; padding:1.2rem;">
      <div style="flex:1;">
         <div style="font-weight:700; color:var(--primary);">${n.cat}</div>
         <div style="font-size:0.8rem; color:var(--text-muted);">${n.area}</div>
      </div>
      <button class="btn btn-soft" onclick="showToast('Coordinators notified!')">I Can Help</button>
    </div>
  `).join('');
}

function renderDashboard() {
  const list = document.getElementById('dash-match-list');
  if (!list) return;
  const matches = [
    { name: 'Arjun Rao', skill: 'Medical', score: 96 },
    { name: 'Meera S.', skill: 'Teaching', score: 88 }
  ];
  list.innerHTML = matches.map((m, i) => `
    <div class="stat-card reveal stagger-${i+1} tilt-wrapper">
       <div class="tilt-inner">
         <div style="font-size:0.7rem; color:var(--accent); font-weight:700;">${m.score}% MATCH</div>
         <h3 style="margin:0.5rem 0;">${m.name}</h3>
         <p>Field: ${m.skill}</p>
         <button class="btn btn-primary" style="margin-top:1.2rem; width:100%;" onclick="showToast('Contacting...')">Connect</button>
       </div>
    </div>
  `).join('');
}

// ── UTILS
function initStats() { /* Handled in IO Observer */ }

function animateCounter(obj) {
  const val = parseInt(obj.getAttribute('data-val'));
  let start = 0;
  const duration = 2000;
  const startTime = performance.now();
  
  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    obj.innerText = Math.floor(progress * val);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('active');
  setTimeout(() => t.classList.remove('active'), 2500);
}

function openNeedModal() { showToast('Need Logging active.'); }
