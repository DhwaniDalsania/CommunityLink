// ============================================================
// CommunityLink — Needs Page (async, API-backed)
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
  initUrgencySelector();
  initFileUpload();
  initCharCounter();
  await renderRecentNeeds();

  document.getElementById('needForm').addEventListener('submit', handleNeedSubmit);
  document.getElementById('getGPS')?.addEventListener('click', getGPS);
  document.getElementById('hamburger')?.addEventListener('click', () => {
    document.querySelector('.nav-links').classList.toggle('open');
  });
});

function initUrgencySelector() {
  const opts   = document.querySelectorAll('.urgency-opt');
  const hidden = document.getElementById('needUrgency');
  opts.forEach(opt => {
    opt.addEventListener('click', () => {
      opts.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      hidden.value = opt.dataset.value;
    });
  });
  // Default: High
  document.querySelector('.urgency-opt[data-value="High"]').classList.add('active');
  hidden.value = 'High';
}

function initFileUpload() {
  const zone    = document.getElementById('uploadZone');
  const input   = document.getElementById('photoUpload');
  const preview = document.getElementById('photoPreview');

  zone.addEventListener('click', () => input.click());
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.style.borderColor = 'var(--accent)'; });
  zone.addEventListener('dragleave', () => zone.style.borderColor = '');
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.style.borderColor = '';
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  });
  input.addEventListener('change', () => { if (input.files[0]) handleFile(input.files[0]); });

  function handleFile(file) {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => { preview.innerHTML = `<img src="${e.target.result}" alt="Preview"/>`; };
    reader.readAsDataURL(file);
    zone.querySelector('.upload-icon').textContent = '✅';
  }
}

function initCharCounter() {
  const title   = document.getElementById('needTitle');
  const counter = document.getElementById('titleCounter');
  if (title) title.addEventListener('input', () => { counter.textContent = `${title.value.length}/100`; });
}

function getGPS() {
  const btn = document.getElementById('getGPS');
  btn.textContent = '⏳ Getting...';
  if (!navigator.geolocation) { btn.textContent = '❌ Not supported'; return; }
  navigator.geolocation.getCurrentPosition(
    pos => {
      document.getElementById('needLat').value = pos.coords.latitude.toFixed(6);
      document.getElementById('needLng').value = pos.coords.longitude.toFixed(6);
      btn.textContent = '✅ Detected';
    },
    () => { btn.textContent = '❌ Failed'; }
  );
}

async function handleNeedSubmit(e) {
  e.preventDefault();
  const need = {
    area:            document.getElementById('needArea').value.trim(),
    district:        document.getElementById('needDistrict').value.trim(),
    category:        document.getElementById('needCategory').value,
    urgency:         document.getElementById('needUrgency').value,
    title:           document.getElementById('needTitle').value.trim(),
    description:     document.getElementById('needDesc').value.trim(),
    peopleAffected:  parseInt(document.getElementById('needPeople').value) || 0,
    skillRequired:   document.getElementById('needSkill').value,
    volunteersNeeded: parseInt(document.getElementById('needVolunteers').value) || 1,
    deadline:        document.getElementById('needDeadline').value,
    reporterName:    document.getElementById('reporterName').value.trim(),
    reporterOrg:     document.getElementById('reporterOrg').value.trim(),
    reporterPhone:   document.getElementById('reporterPhone').value.trim(),
    lat:             document.getElementById('needLat')?.value || '',
    lng:             document.getElementById('needLng')?.value || '',
  };

  const btn  = document.querySelector('.btn-submit');
  const text = btn.querySelector('.btn-text');
  btn.disabled = true;
  text.innerHTML = '<span class="spin">↻</span> Submitting...';

  try {
    await DB.addNeed(need);
    btn.disabled = false;
    text.textContent = 'Submit Report';
    document.getElementById('needForm').reset();
    initUrgencySelector();
    document.getElementById('titleCounter').textContent = '0/100';
    document.getElementById('photoPreview').innerHTML = '';
    document.querySelector('.upload-icon').textContent = '📸';
    await renderRecentNeeds();
    showToast('✅ Need reported — live on dashboard!', 'success');
  } catch (err) {
    btn.disabled = false;
    text.textContent = 'Submit Report';
    showToast('❌ Failed: ' + err.message, 'error');
  }
}

async function renderRecentNeeds() {
  const el = document.getElementById('recentNeedsList');
  try {
    const needs = await DB.getNeeds();
    if (!needs.length) { el.innerHTML = '<div class="empty-state">No reports yet.</div>'; return; }
    el.innerHTML = needs.slice(0, 4).map(n => `
      <div class="mini-need-item">
        <div class="mini-title">${n.title.slice(0, 40)}${n.title.length > 40 ? '…' : ''}</div>
        <div class="mini-meta">📍 ${n.area} · <span style="color:${n.urgency==='High'?'var(--red)':n.urgency==='Medium'?'var(--yellow)':'var(--green)'}">${n.urgency}</span> · ${timeAgo(n.timestamp)}</div>
      </div>
    `).join('');
  } catch {
    el.innerHTML = '<div class="empty-state">Could not load.</div>';
  }
}
