// ============================================================
// CommunityLink — Volunteer Page (async, API-backed)
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
  initSkillChips();
  initDaySelector();
  initRadiusSlider();
  initToggle();
  await updateSidebarStats();

  document.getElementById('volunteerForm').addEventListener('submit', handleVolSubmit);
  document.getElementById('hamburger')?.addEventListener('click', () => {
    document.querySelector('.nav-links').classList.toggle('open');
  });
});

function initSkillChips() {
  const chips  = document.querySelectorAll('.skill-chip');
  const hidden = document.getElementById('volSkills');
  const update = () => {
    hidden.value = [...document.querySelectorAll('.skill-chip.active')].map(c => c.dataset.skill).join(',');
  };
  chips.forEach(chip => { chip.addEventListener('click', () => { chip.classList.toggle('active'); update(); }); });
  update();
}

function initDaySelector() {
  const days   = document.querySelectorAll('.day-opt');
  const hidden = document.getElementById('volDays');
  const update = () => {
    hidden.value = [...document.querySelectorAll('.day-opt.active')].map(d => d.dataset.day).join(',');
  };
  days.forEach(day => { day.addEventListener('click', () => { day.classList.toggle('active'); update(); }); });
}

function initRadiusSlider() {
  const slider = document.getElementById('volRadius');
  const val    = document.getElementById('radiusVal');
  if (slider) slider.addEventListener('input', () => { val.textContent = slider.value + ' km'; });
}

function initToggle() {
  const toggle = document.getElementById('whatsappToggle');
  if (toggle) toggle.addEventListener('click', () => toggle.classList.toggle('on'));
}

async function handleVolSubmit(e) {
  e.preventDefault();
  const skills = (document.getElementById('volSkills').value || '')
    .split(',').map(s => s.trim()).filter(Boolean);
  if (!skills.length) { showToast('Please select at least one skill.', 'error'); return; }

  const vol = {
    name:           document.getElementById('volName').value.trim(),
    age:            parseInt(document.getElementById('volAge').value) || null,
    email:          document.getElementById('volEmail').value.trim(),
    phone:          document.getElementById('volPhone').value.trim(),
    area:           document.getElementById('volArea').value.trim(),
    district:       document.getElementById('volDistrict').value.trim(),
    radius:         parseInt(document.getElementById('volRadius').value) || 10,
    days:           document.getElementById('volDays').value,
    hours:          document.getElementById('volHours').value,
    timeSlot:       document.getElementById('volTime').value,
    skills:         skills,
    languages:      document.getElementById('volLanguages').value.trim(),
    qualifications: document.getElementById('volQual').value.trim(),
    experience:     document.getElementById('volExperience').value.trim(),
    whatsapp:       document.getElementById('whatsappToggle')?.classList.contains('on') || false,
  };

  const btn  = document.querySelector('.btn-submit');
  const text = btn.querySelector('.btn-text');
  btn.disabled = true;
  text.innerHTML = '<span class="spin">↻</span> Registering...';

  try {
    await DB.addVolunteer(vol);
    btn.disabled = false;
    text.textContent = 'Register as Volunteer';
    document.getElementById('volunteerForm').reset();
    resetForm();
    await updateSidebarStats();
    showToast('✅ You\'re registered! Check the Match page.', 'success');
  } catch (err) {
    btn.disabled = false;
    text.textContent = 'Register as Volunteer';
    showToast('❌ Failed: ' + err.message, 'error');
  }
}

function resetForm() {
  document.querySelectorAll('.day-opt').forEach(d => d.classList.remove('active'));
  document.querySelectorAll('.skill-chip').forEach(c => c.classList.remove('active'));
  document.getElementById('volDays').value = '';
  document.getElementById('volSkills').value = '';
  document.getElementById('radiusVal').textContent = '10 km';
  document.getElementById('volRadius').value = 10;
  document.getElementById('whatsappToggle')?.classList.remove('on');
}

async function updateSidebarStats() {
  try {
    const s = await DB.getStats();
    animateCounter(document.getElementById('sideVolTotal'), s.totalVolunteers);
    animateCounter(document.getElementById('sideVolAvail'), s.availableVols);
    animateCounter(document.getElementById('sideVolDone'),  s.totalMatches);
  } catch {}
}
