// ============================================================
// CommunityLink — Smart Match (Gemini AI via Flask API)
// ============================================================

let currentMatches = [];
let currentModalData = null;

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('hamburger')?.addEventListener('click', () => {
    document.querySelector('.nav-links').classList.toggle('open');
  });
  document.getElementById('runMatchBtn').addEventListener('click', runSmartMatch);
  document.getElementById('seedDataBtn')?.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      await DB.seedSampleData();
      showToast('✅ Demo data seeded', 'success');
      setTimeout(() => location.reload(), 800);
    } catch(err) {
      showToast('❌ Seed failed: ' + err.message, 'error');
    }
  });
  document.getElementById('modalClose')?.addEventListener('click', closeModal);
  document.getElementById('modalClose2')?.addEventListener('click', closeModal);
  document.getElementById('modalAssign')?.addEventListener('click', assignFromModal);
  document.getElementById('matchModal')?.addEventListener('click', e => {
    if (e.target === document.getElementById('matchModal')) closeModal();
  });

  await loadTables();

  // Auto-run if data exists
  const [needs, vols] = await Promise.all([DB.getNeeds(), DB.getVolunteers()]);
  await populateFilters(needs);
  if (needs.length && vols.length) {
    setTimeout(runSmartMatch, 400);
  }
});

async function populateFilters(needs) {
  const areas = [...new Set(needs.map(n => n.area))];
  const areaSelect = document.getElementById('filterArea');
  areas.forEach(a => {
    const o = document.createElement('option');
    o.value = a; o.textContent = a;
    areaSelect.appendChild(o);
  });

  const cats = [...new Set(needs.map(n => n.category))];
  const catSelect = document.getElementById('filterCategory');
  cats.forEach(c => {
    const o = document.createElement('option');
    o.value = c; o.textContent = c;
    catSelect.appendChild(o);
  });
}

async function runSmartMatch() {
  const btn = document.getElementById('runMatchBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spin">↻</span> Running...';

  let needs = await DB.getNeeds();
  let vols  = await DB.getVolunteers();

  // Apply filters
  const areaF = document.getElementById('filterArea').value;
  const urgF  = document.getElementById('filterUrgency').value;
  const catF  = document.getElementById('filterCategory').value;
  if (areaF) needs = needs.filter(n => n.area === areaF);
  if (urgF)  needs = needs.filter(n => n.urgency === urgF);
  if (catF)  needs = needs.filter(n => n.category === catF);

  const openNeeds = needs.filter(n => n.status === 'Open');
  const availVols = vols.filter(v => v.status === 'Available');

  if (!openNeeds.length || !availVols.length) {
    document.getElementById('matchResultsEmpty').style.display = 'block';
    document.getElementById('matchResults').style.display = 'none';
    document.getElementById('matchCount').textContent = '0 matches found';
    btn.disabled = false;
    btn.textContent = '🤖 Run Smart Match';
    return;
  }

  // Show AI thinking UI
  const thinking  = document.getElementById('aiThinking');
  const resultsEl = document.getElementById('matchResults');
  const emptyEl   = document.getElementById('matchResultsEmpty');
  thinking.style.display = 'flex';
  emptyEl.style.display = 'none';
  resultsEl.style.display = 'none';

  document.getElementById('thinkCount').textContent = openNeeds.length * availVols.length;

  // Animate thinking steps
  const steps = [
    '📍 Geo-matching by location...',
    '🧠 Analyzing skill compatibility...',
    '🚨 Weighting urgency scores...',
    '📅 Checking availability windows...',
    '✨ Gemini AI ranking matches...',
  ];
  let stepIdx = 0;
  const stepEl  = document.getElementById('aiSteps');
  const barEl   = document.getElementById('aiBarFill');
  const stepInt = setInterval(() => {
    if (stepIdx < steps.length) {
      stepEl.innerHTML = steps.slice(0, stepIdx + 1).map((s, i) =>
        `<div style="opacity:${i === stepIdx ? 1 : 0.45}">${s}</div>`
      ).join('');
      barEl.style.width = ((stepIdx + 1) / steps.length * 100) + '%';
      stepIdx++;
    } else clearInterval(stepInt);
  }, 380);

  try {
    // Call Gemini AI via Flask backend
    const aiResult = await DB.aiMatch(openNeeds, availVols);
    clearInterval(stepInt);
    barEl.style.width = '100%';
    await new Promise(r => setTimeout(r, 300));

    // Merge AI result with full vol/need objects for modal
    const enrichedMatches = (aiResult.matches || []).map(m => {
      const need = openNeeds.find(n => n.id === m.needId) || { title: m.needTitle };
      const volunteers = (m.volunteers || []).map(mv => {
        const vol = availVols.find(v => v.id === mv.volId) || { name: mv.volName };
        return { vol, score: mv.score, reasons: mv.reasons, aiExplanation: mv.aiExplanation };
      });
      return { need, volunteers, topScore: m.topScore };
    });

    currentMatches = enrichedMatches;
    thinking.style.display = 'none';
    renderMatchCards(enrichedMatches);

    // Show AI insight if available
    if (aiResult.urgentAlert) {
      showToast('🚨 ' + aiResult.urgentAlert, 'info');
    }

    const avgScore = Math.round(
      enrichedMatches.flatMap(m => m.volunteers.map(v => v.score)).reduce((a, b) => a + b, 0) /
      Math.max(1, enrichedMatches.flatMap(m => m.volunteers).length)
    );
    document.getElementById('matchCount').textContent = `${enrichedMatches.length} need(s) matched`;
    document.getElementById('matchScore').textContent  = `Avg. Gemini score: ${avgScore}%`;

  } catch (err) {
    clearInterval(stepInt);
    // Fallback to client-side scoring
    console.warn('Gemini AI failed, using local scoring:', err);
    const matches = openNeeds.map(need => {
      const scored = availVols.map(vol => {
        const { score, reasons } = calculateMatchScore(need, vol);
        return { vol, score, reasons };
      }).sort((a, b) => b.score - a.score).slice(0, 3);
      return { need, volunteers: scored, topScore: scored[0]?.score || 0 };
    }).sort((a, b) => b.topScore - a.topScore);

    currentMatches = matches;
    thinking.style.display = 'none';
    renderMatchCards(matches);

    const avg = Math.round(matches.flatMap(m => m.volunteers.map(v => v.score)).reduce((a, b) => a + b, 0) / Math.max(1, matches.flatMap(m => m.volunteers).length));
    document.getElementById('matchCount').textContent = `${matches.length} need(s) matched (local scoring)`;
    document.getElementById('matchScore').textContent  = `Avg. score: ${avg}%`;
    showToast('⚠️ Gemini unavailable — using local scoring', 'info');
  }

  btn.disabled = false;
  btn.textContent = '🤖 Run Smart Match';
}

// Local scoring fallback
function calculateMatchScore(need, vol) {
  let score = 0;
  const reasons = [];

  const volArea  = (vol.area  || '').toLowerCase();
  const needArea = (need.area || '').toLowerCase();
  if (volArea === needArea) {
    score += 35; reasons.push({ label: 'Exact location match', points: 35, pct: 100, type: 'location' });
  } else if (vol.district?.toLowerCase() === need.district?.toLowerCase()) {
    score += 20; reasons.push({ label: 'Same district', points: 20, pct: 57, type: 'location' });
  } else {
    score += 5;  reasons.push({ label: 'Different area', points: 5, pct: 14, type: 'location' });
  }

  const volSkills = Array.isArray(vol.skills) ? vol.skills.map(s => s.toLowerCase()) : (vol.skills || '').toLowerCase().split(',').map(s => s.trim());
  const reqSkill  = (need.skillRequired || '').toLowerCase();
  if (reqSkill && volSkills.some(s => s === reqSkill)) {
    score += 40; reasons.push({ label: 'Exact skill match', points: 40, pct: 100, type: 'skill' });
  } else if (reqSkill && volSkills.some(s => s.includes(reqSkill.split('/')[0].trim()))) {
    score += 25; reasons.push({ label: 'Partial skill match', points: 25, pct: 63, type: 'skill' });
  } else if (!reqSkill) {
    score += 20; reasons.push({ label: 'No specific skill required', points: 20, pct: 50, type: 'skill' });
  } else {
    reasons.push({ label: 'Skill mismatch', points: 0, pct: 0, type: 'skill' });
  }

  const urgPts = { High: 15, Medium: 8, Low: 3 }[need.urgency] || 3;
  score += urgPts;
  reasons.push({ label: `Urgency: ${need.urgency}`, points: urgPts, pct: Math.round(urgPts / 15 * 100), type: 'urgency' });

  const avPts = { 'Full-time (20+ hours)': 10, '10–20 hours': 8, '5–10 hours': 5, '1–5 hours': 2 }[vol.hours] || 5;
  score += avPts;
  reasons.push({ label: `Availability: ${vol.hours || '?'}`, points: avPts, pct: Math.round(avPts / 10 * 100), type: 'availability' });

  return { score: Math.min(score, 100), reasons };
}

function renderMatchCards(matches) {
  const resultsEl = document.getElementById('matchResults');
  const emptyEl   = document.getElementById('matchResultsEmpty');

  if (!matches.length) {
    emptyEl.style.display = 'block';
    resultsEl.style.display = 'none';
    return;
  }
  emptyEl.style.display = 'none';
  resultsEl.style.display = 'grid';

  resultsEl.innerHTML = matches.map((m, idx) => {
    const topScore  = m.volunteers[0]?.score || m.topScore || 0;
    const scoreClass = topScore >= 70 ? 'score-high' : topScore >= 40 ? 'score-mid' : 'score-low';
    const urgClass   = m.need.urgency || 'Low';

    return `
      <div class="match-card" onclick="openModal(${idx})">
        <div class="match-card-top">
          <div class="match-score-circle ${scoreClass}">${topScore}%</div>
          <div class="match-card-info">
            <div class="match-need-title">${m.need.title}</div>
            <div class="match-need-meta">
              📍 ${m.need.area || '—'} &nbsp;·&nbsp;
              <span class="need-urgency-pill urgency-${urgClass}">${urgClass}</span> &nbsp;·&nbsp;
              👥 ${m.need.peopleAffected || '?'} affected
            </div>
          </div>
        </div>
        <div class="match-card-body">
          ${m.volunteers.map((mv, vi) => {
            const skills = Array.isArray(mv.vol.skills) ? mv.vol.skills.join(', ') : (mv.vol.skills || '');
            return `
              <div class="match-vol-row">
                <div class="vol-avatar">${initials(mv.vol.name)}</div>
                <div>
                  <div class="vol-name">${mv.vol.name}${vi === 0 ? ' ⭐' : ''}</div>
                  <div class="vol-meta">${mv.vol.area || ''} · ${skills.split(',')[0].trim()}</div>
                </div>
                <div class="vol-score-small ${mv.score >= 70 ? 'vsc-high' : 'vsc-mid'}">${mv.score}%</div>
              </div>
            `;
          }).join('')}
        </div>
        ${m.volunteers[0]?.aiExplanation ? `
          <div style="background:rgba(91,141,238,.06);border:1px solid rgba(91,141,238,.2);border-radius:6px;padding:8px 12px;font-size:11.5px;color:var(--text2);margin-bottom:12px;">
            ✨ ${m.volunteers[0].aiExplanation}
          </div>` : ''}
        <div class="match-factors">
          <span class="factor-tag">📍 ${m.need.area || '—'}</span>
          <span class="factor-tag">🔧 ${m.need.skillRequired || 'Any skill'}</span>
          <span class="factor-tag">📅 ${m.need.deadline || 'No deadline'}</span>
          ${(m.need.volunteersNeeded || 0) > 1 ? `<span class="factor-tag">👥 ${m.need.volunteersNeeded} needed</span>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function openModal(idx) {
  const m = currentMatches[idx];
  if (!m) return;
  const best = m.volunteers[0];
  currentModalData = { need: m.need, vol: best?.vol, score: best?.score, reasons: best?.reasons, matchIdx: idx };

  document.getElementById('modalScore').textContent    = (best?.score || 0) + '%';
  document.getElementById('modalTitle').textContent    = m.need.title;
  document.getElementById('modalSubtitle').textContent = `Best match: ${best?.vol?.name || 'N/A'}`;

  const typeMap = { location: 'bar-location', skill: 'bar-skill', urgency: 'bar-urgency', availability: 'bar-avail' };
  const reasons = best?.reasons || [];
  const skills  = Array.isArray(best?.vol?.skills) ? best.vol.skills.join(', ') : (best?.vol?.skills || '');

  document.getElementById('modalBody').innerHTML = `
    <div class="modal-section">
      <div class="modal-section-label">Community Need</div>
      <div class="modal-detail-row"><span>Area</span><span>${m.need.area}, ${m.need.district || ''}</span></div>
      <div class="modal-detail-row"><span>Category</span><span>${m.need.category}</span></div>
      <div class="modal-detail-row"><span>People Affected</span><span>${m.need.peopleAffected}</span></div>
      <div class="modal-detail-row"><span>Urgency</span><span>${m.need.urgency}</span></div>
      <div class="modal-detail-row"><span>Skill Required</span><span>${m.need.skillRequired || 'Any'}</span></div>
      <div class="modal-detail-row"><span>Reporter</span><span>${m.need.reporterName} ${m.need.reporterOrg ? '(' + m.need.reporterOrg + ')' : ''}</span></div>
    </div>
    <div class="modal-section">
      <div class="modal-section-label">Best Volunteer Match</div>
      <div class="modal-detail-row"><span>Name</span><span>${best?.vol?.name || '—'}</span></div>
      <div class="modal-detail-row"><span>Area</span><span>${best?.vol?.area || '—'}</span></div>
      <div class="modal-detail-row"><span>Skills</span><span>${skills}</span></div>
      <div class="modal-detail-row"><span>Availability</span><span>${best?.vol?.hours || '—'}</span></div>
      <div class="modal-detail-row"><span>Contact</span><span>${best?.vol?.phone || 'N/A'}</span></div>
      ${best?.aiExplanation ? `<div class="modal-detail-row"><span>AI Note</span><span style="color:var(--blue)">${best.aiExplanation}</span></div>` : ''}
    </div>
    <div class="modal-section">
      <div class="modal-section-label">Why This Match</div>
      ${reasons.map(r => `
        <div class="match-reason-bar">
          <div class="match-reason-label"><span>${r.label}</span><span>${r.points} pts</span></div>
          <div class="bar-track"><div class="bar-fill ${typeMap[r.type] || 'bar-skill'}" style="width:0%" data-width="${r.pct}%"></div></div>
        </div>
      `).join('')}
    </div>
    ${m.volunteers.length > 1 ? `
    <div class="modal-section">
      <div class="modal-section-label">Other Possible Volunteers</div>
      ${m.volunteers.slice(1).map(mv => `
        <div class="modal-detail-row">
          <span>${mv.vol.name} (${mv.vol.area || '—'})</span>
          <span style="color:var(--yellow)">${mv.score}% match</span>
        </div>
      `).join('')}
    </div>` : ''}
  `;

  document.getElementById('matchModal').classList.remove('hidden');

  // Animate bars after render
  requestAnimationFrame(() => {
    document.querySelectorAll('.bar-fill[data-width]').forEach(bar => {
      setTimeout(() => { bar.style.width = bar.dataset.width; }, 80);
    });
  });
}

function closeModal() {
  document.getElementById('matchModal').classList.add('hidden');
  currentModalData = null;
}

async function assignFromModal() {
  if (!currentModalData) return;
  const { need, vol, score } = currentModalData;

  const btn = document.getElementById('modalAssign');
  btn.disabled = true;
  btn.innerHTML = '<span class="spin">↻</span> Assigning...';

  try {
    await DB.addMatch({ needId: need.id, volId: vol?.id, score });
    closeModal();
    showToast(`✅ ${vol?.name || 'Volunteer'} assigned to "${need.title}"`, 'success');
    setTimeout(() => { runSmartMatch(); loadTables(); renderImpact(); }, 600);
  } catch (err) {
    showToast('❌ ' + err.message, 'error');
    btn.disabled = false;
    btn.textContent = '✅ Assign Volunteer';
  }
}

async function loadTables() {
  try {
    const [needs, vols] = await Promise.all([DB.getNeeds(), DB.getVolunteers()]);
    renderNeedsTable(needs);
    renderVolsTable(vols);
    await renderImpact();
  } catch (err) {
    console.error('Table load error:', err);
  }
}

function renderNeedsTable(needs) {
  const tbody = document.getElementById('needsTableBody');
  if (!needs.length) {
    tbody.innerHTML = '<tr><td colspan="8" class="empty-td">No needs reported yet. <a href="needs.html">Report one →</a></td></tr>';
    return;
  }
  tbody.innerHTML = needs.map(n => `
    <tr>
      <td>${n.area}</td>
      <td>${n.category}</td>
      <td style="font-weight:500;color:var(--text)">${n.title}</td>
      <td style="text-align:center;font-family:var(--font-mono)">${n.peopleAffected}</td>
      <td><span class="need-urgency-pill urgency-${n.urgency}">${n.urgency}</span></td>
      <td>${n.skillRequired || '—'}</td>
      <td>${n.reporterName}</td>
      <td>
        <span style="padding:2px 9px;border-radius:4px;font-size:11px;font-weight:600;font-family:var(--font-mono);background:${
          n.status === 'Assigned' ? 'rgba(62,201,123,.12)' : 'rgba(91,141,238,.12)'
        };color:${n.status === 'Assigned' ? 'var(--green)' : 'var(--blue)'}">${n.status}</span>
      </td>
    </tr>
  `).join('');
}

function renderVolsTable(vols) {
  const tbody = document.getElementById('volsTableBody');
  if (!vols.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-td">No volunteers registered yet. <a href="volunteer.html">Register →</a></td></tr>';
    return;
  }
  tbody.innerHTML = vols.map(v => {
    const skills = Array.isArray(v.skills) ? v.skills.join(', ') : v.skills;
    return `
      <tr>
        <td style="font-weight:500;color:var(--text)">${v.name}</td>
        <td>${v.area}</td>
        <td style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${skills || '—'}</td>
        <td style="font-family:var(--font-mono);font-size:12px">${v.days || '—'}</td>
        <td>${v.hours || '—'}</td>
        <td><span style="padding:2px 9px;border-radius:4px;font-size:11px;font-weight:600;font-family:var(--font-mono);background:rgba(62,201,123,.12);color:var(--green)">${v.status}</span></td>
      </tr>
    `;
  }).join('');
}

async function renderImpact() {
  try {
    const s = await DB.getStats();
    animateCounter(document.getElementById('impactNeeds'),   s.totalNeeds);
    animateCounter(document.getElementById('impactVols'),    s.totalVolunteers);
    animateCounter(document.getElementById('impactMatches'), s.totalMatches);
    animateCounter(document.getElementById('impactPeople'),  s.peopleHelped || s.totalNeeds * 18);

    setTimeout(() => {
      const max = Math.max(s.totalNeeds, 1);
      document.getElementById('needsBar').style.width   = Math.min((s.totalNeeds / max) * 100, 100) + '%';
      document.getElementById('volsBar').style.width    = '100%';
      document.getElementById('matchesBar').style.width = Math.min((s.totalMatches / Math.max(s.totalNeeds, 1)) * 100, 100) + '%';
      document.getElementById('peopleBar').style.width  = '75%';
    }, 500);
  } catch {}
}
