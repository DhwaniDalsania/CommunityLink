/**
 * CommunityLink — API Client
 * All data operations go through the Flask backend + Firestore.
 * Falls back to localStorage for offline/demo mode.
 */

const API_BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:8080/api"
  : "/api";

const OFFLINE_MODE = false; // Set true to use localStorage fallback

// ── LOW-LEVEL FETCH ───────────────────────────────────────────
async function apiFetch(path, options = {}) {
  try {
    const res = await fetch(API_BASE + path, {
      headers: { "Content-Type": "application/json", ...options.headers },
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (e) {
    console.error(`[API] ${options.method || "GET"} ${path} failed:`, e);
    throw e;
  }
}

// ── HELPERS ───────────────────────────────────────────────────
function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return d + "d ago";
  if (h > 0) return h + "h ago";
  if (m > 0) return m + "m ago";
  return "just now";
}

function initials(name) {
  return (name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function animateCounter(el, target) {
  if (!el) return;
  let start = 0;
  const dur = 900;
  const startTime = Date.now();
  const step = () => {
    const p = Math.min((Date.now() - startTime) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(start + (target - start) * ease);
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target;
  };
  requestAnimationFrame(step);
}

function showToast(msg, type = "success") {
  const t = document.getElementById("globalToast");
  if (!t) return;
  t.textContent = msg;
  t.className = `toast toast--${type}`;
  t.classList.remove("hidden");
  setTimeout(() => t.classList.add("show"), 10);
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.classList.add("hidden"), 400);
  }, 3500);
}

// ── DB OBJECT (matches original API shape) ────────────────────
const DB = {
  async getNeeds()      { return apiFetch("/needs"); },
  async getVolunteers() { return apiFetch("/volunteers"); },
  async getMatches()    { return apiFetch("/matches"); },
  async getActivity()   { return apiFetch("/activity"); },
  async getStats()      { return apiFetch("/stats"); },

  async addNeed(need) {
    return apiFetch("/needs", { method: "POST", body: JSON.stringify(need) });
  },
  async addVolunteer(vol) {
    return apiFetch("/volunteers", { method: "POST", body: JSON.stringify(vol) });
  },
  async addMatch(match) {
    return apiFetch("/matches", { method: "POST", body: JSON.stringify(match) });
  },
  async updateNeed(id, data) {
    return apiFetch(`/needs/${id}`, { method: "PATCH", body: JSON.stringify(data) });
  },
  async seedSampleData() {
    return apiFetch("/seed", { method: "POST" });
  },

  // Gemini AI
  async aiMatch(needs, volunteers) {
    return apiFetch("/ai/match", { method: "POST", body: JSON.stringify({ needs, volunteers }) });
  },
  async aiInsight(needs, volunteers, stats) {
    return apiFetch("/ai/insight", { method: "POST", body: JSON.stringify({ needs, volunteers, stats }) });
  },
};
