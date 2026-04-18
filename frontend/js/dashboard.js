// ============================================================
// CommunityLink — Dashboard (async, Firestore-backed)
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('hamburger')?.addEventListener('click', () => {
    document.querySelector('.nav-links').classList.toggle('open');
  });
  document.getElementById('seedBtn')?.addEventListener('click', seedData);

  await loadDashboard();
});

async function loadDashboard() {
  try {
    // Parallel fetch
    const [stats, needs, vols, activity] = await Promise.all([
      DB.getStats(),
      DB.getNeeds(),
      DB.getVolunteers(),
      DB.getActivity(),
    ]);

    renderStats(stats);
    renderUrgentFeed(needs);
    renderAreaChart(needs);
    renderUrgencyChart(needs);
    renderSkillsGrid(vols);
    renderTimeline(activity);
    await renderAiInsight(needs, vols, stats);

  } catch (err) {
    console.error('Dashboard load error:', err);
    document.body.insertAdjacentHTML('afterbegin', `
      <div class="error-banner" style="margin:80px 48px 0;max-width:1280px;display:block">
        ⚠️ Could not load data from server: ${err.message}.
        <a href="#" onclick="location.reload()">Retry</a>
      </div>
    `);
  }
}

async function seedData() {
  const btn = document.getElementById('seedBtn');
  btn.textContent = 'Seeding...';
  btn.disabled = true;
  try {
    await DB.seedSampleData();
    showToast('✅ Sample data loaded from server', 'success');
    setTimeout(() => location.reload(), 800);
  } catch (e) {
    showToast('❌ Seed failed: ' + e.message, 'error');
    btn.textContent = 'Load Demo Data';
    btn.disabled = false;
  }
}

function renderStats(s) {
  animateCounter(document.getElementById('totalNeeds'),      s.totalNeeds);
  animateCounter(document.getElementById('totalVolunteers'), s.totalVolunteers);
  animateCounter(document.getElementById('totalMatches'),    s.totalMatches);
  animateCounter(document.getElementById('urgentCount'),     s.urgentNeeds);
}

function renderUrgentFeed(needs) {
  const urgent = needs.filter(n => n.urgency === 'High' && n.status === 'Open').slice(0, 5);
  const feed   = document.getElementById('urgentFeed');
  const badge  = document.getElementById('urgentBadge');
  badge.textContent = urgent.length;

  if (!urgent.length) {
    feed.innerHTML = '<div class="empty-state">No urgent needs — all is calm 🌿</div>';
    return;
  }
  feed.innerHTML = urgent.map(n => `
    <div class="need-item">
      <div class="need-item-top">
        <span class="need-item-title">${n.title}</span>
        <span class="need-urgency-pill urgency-High">High</span>
      </div>
      <div class="need-item-meta">📍 ${n.area} &nbsp;·&nbsp; 👥 ${n.peopleAffected} affected &nbsp;·&nbsp; ${timeAgo(n.timestamp)}</div>
    </div>
  `).join('');
}

function renderAreaChart(needs) {
  const areaMap = {};
  needs.forEach(n => { areaMap[n.area] = (areaMap[n.area] || 0) + 1; });
  const sorted = Object.entries(areaMap).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const ctx = document.getElementById('areaChart')?.getContext('2d');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sorted.map(e => e[0]),
      datasets: [{
        data: sorted.map(e => e[1]),
        backgroundColor: ['rgba(232,93,58,.65)','rgba(45,212,176,.6)','rgba(91,141,238,.65)',
                          'rgba(240,201,69,.6)','rgba(168,124,248,.6)','rgba(62,201,123,.6)'],
        borderRadius: 4, borderWidth: 0,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#5a617a', font: { size: 10, family: "'IBM Plex Mono'" } }, grid: { color: '#1c2030' } },
        y: { ticks: { color: '#5a617a', font: { size: 10, family: "'IBM Plex Mono'" }, stepSize: 1 }, grid: { color: '#1c2030' } }
      }
    }
  });
}

function renderUrgencyChart(needs) {
  const counts = { High: 0, Medium: 0, Low: 0 };
  needs.forEach(n => { if (counts[n.urgency] !== undefined) counts[n.urgency]++; });

  const ctx = document.getElementById('urgencyChart')?.getContext('2d');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['High', 'Medium', 'Low'],
      datasets: [{
        data: [counts.High, counts.Medium, counts.Low],
        backgroundColor: ['rgba(232,93,58,.75)','rgba(240,201,69,.7)','rgba(62,201,123,.65)'],
        borderColor: ['#e85d3a','#f0c945','#3ec97b'],
        borderWidth: 2, hoverOffset: 6,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '68%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#8c93aa', font: { size: 11, family: "'IBM Plex Mono'" }, padding: 14 }
        }
      }
    }
  });
}

function renderSkillsGrid(vols) {
  const skillMap = {};
  vols.forEach(v => {
    const skills = Array.isArray(v.skills) ? v.skills : (v.skills || '').split(',').map(s => s.trim());
    skills.filter(Boolean).forEach(s => { skillMap[s] = (skillMap[s] || 0) + 1; });
  });
  const grid = document.getElementById('skillsGrid');
  if (!Object.keys(skillMap).length) {
    grid.innerHTML = '<div class="empty-state">No volunteers yet.</div>';
    return;
  }
  const sorted = Object.entries(skillMap).sort((a, b) => b[1] - a[1]);
  grid.innerHTML = sorted.map(([skill, count]) => `
    <div class="skill-bubble">${skill}<span class="skill-count">${count}</span></div>
  `).join('');
}

function renderTimeline(activity) {
  const tl = document.getElementById('activityTimeline');
  if (!activity.length) {
    tl.innerHTML = '<div class="empty-state centered">Activity will appear here as data is entered.</div>';
    return;
  }
  const icons = { need: '📋', volunteer: '🤝', match: '🔗' };
  tl.innerHTML = activity.slice(0, 6).map(a => `
    <div class="timeline-item">
      <div class="timeline-dot">${icons[a.type] || '📌'}</div>
      <div class="timeline-content">
        <strong>${a.text}</strong>
        <div class="timeline-time">${timeAgo(a.time)}</div>
      </div>
    </div>
  `).join('');
}

async function renderAiInsight(needs, vols, stats) {
  const el = document.getElementById('aiInsight');
  el.textContent = 'Analyzing community data with Gemini AI...';
  el.classList.add('ai-loading');
  try {
    const result = await DB.aiInsight(needs, vols, stats);
    el.classList.remove('ai-loading');
    el.textContent = result.insight || 'AI analysis complete.';
  } catch (e) {
    el.classList.remove('ai-loading');
    // Fallback insight
    const urgent = needs.filter(n => n.urgency === 'High' && n.status === 'Open');
    const avail  = vols.filter(v => v.status === 'Available');
    let insight  = '';
    if (urgent.length) insight += `⚠️ ${urgent.length} critical need(s) require immediate deployment. `;
    if (avail.length)  insight += `✅ ${avail.length} volunteers available — run Smart Match to deploy them.`;
    if (!insight)      insight = 'Add needs and volunteers to see AI-powered recommendations.';
    el.textContent = insight;
  }
}
