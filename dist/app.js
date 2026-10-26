import { ROLES, METRICS, EVENTS, createWorld, selectRole, actionsFor, applyDecision, advanceDay, actorCondition, hydrate } from './engine.js';

const KEY = 'airegin-world-v1';
const $ = id => document.getElementById(id);
const escape = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const signed = n => `${n > 0 ? '+' : ''}${n}`;
let world = createWorld();
let storageOK = true;
try { world = hydrate(localStorage.getItem(KEY)) || world; } catch { storageOK = false; }
let selectedRole = world.role || 'governor';
let selectedAction = null;
let effectsVisible = false;
let district = 'school';
let ledgerOpen = false;
let activeView = 'world';

function renderView() {
  for (const view of ['world', 'crew', 'influence', 'journal']) {
    $('view-' + view).hidden = activeView !== view;
  }
  document.querySelectorAll('[data-view]').forEach(button => {
    const selected = button.dataset.view === activeView;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', selected);
  });
}
function setView(view) {
  if (!['world', 'crew', 'influence', 'journal'].includes(view)) return;
  activeView = view;
  if (view === 'journal') { ledgerOpen = true; renderLedger(); }
  renderView();
}

function portrait(role) {
  const base = `<svg viewBox="0 0 80 90" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="80" height="90" rx="1" fill="${role.colour}"/><circle cx="65" cy="16" r="20" fill="#fff" opacity=".13"/>`;
  const face = `<path d="M22 36c0-22 37-23 37 0v14c0 10-8 20-18 20S22 60 22 50Z" fill="#76503b"/><path d="M32 45h4m11 0h4" stroke="#302d25" stroke-width="2"/><path d="M40 48v7h4m-10 5q7 4 13 0" stroke="#4b352b" fill="none" stroke-width="1.5"/>`;
  const body = `<path d="M8 90V82q2-13 24-18l9 8 10-8q21 4 24 18v8" fill="#244b39"/><path d="M33 65l8 7 9-7-2 25H35Z" fill="#e4dab8"/>`;
  const hair = {
    governor: `<path d="M19 30l5-17 32 1 5 17Z" fill="#64734f"/><path d="M19 27h42v7H19Z" fill="#d7c293"/><path d="M26 18l28 1" stroke="#bcc29b" stroke-width="2"/>`,
    teacher: `<path d="M16 43q-6-36 25-35 33 0 23 51l-9 11-4-14q13-9 5-24L29 30q-10 13-5 27l9 11-7 7Z" fill="#ddd0a6"/><path d="M21 33q9-22 31-13" fill="none" stroke="#b4b98c" stroke-width="4"/>`,
    trader: `<path d="M20 35q-10-21 3-27l17 5 10-9q24 3 13 32l-13-9-22 3Z" fill="#c4553b"/><path d="M20 19l41 8m-33-15 25 16" stroke="#e7b789" stroke-width="4"/>`,
    police: `<path d="M17 28l5-17h37l5 17Z" fill="#284b4a"/><path d="M14 28h49v7H14Z" fill="#24423c"/><path d="M38 18h7v7h-7Z" fill="#dbc089"/>`,
    journalist: `<path d="M19 42Q5 6 35 8q29-7 29 28l-11-4-4-9q-5 11-23 14l-3 8Z" fill="#303d30"/><path d="M27 45h12v8H27zm17 0h12v8H44zm-5 3h5" stroke="#d5c1a0" fill="none" stroke-width="1.8"/>`
  };
  return base + body + face + hair[role.id] + '</svg>';
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(world)); storageOK = true; } catch { storageOK = false; }
  $('save-status').textContent = storageOK ? 'Solo prototype · simulated citizens · saved in this browser' : 'Solo prototype · browser saving unavailable; keep this tab open';
}
function announce(text) { $('announcement').textContent = text; }
function effectText(effect) {
  return Object.entries(effect).map(([k, n]) => `${METRICS[k]?.label || ({ budget: 'Public reserve', education: 'Learning', corruption: 'Corruption' }[k])} ${k === 'budget' ? `${n > 0 ? '+' : '−'}₦${Math.abs(n)}m` : signed(n)}`).join(' · ');
}
function metricChanges(before, after) {
  return Object.keys(METRICS).concat(['budget','education','corruption']).filter(k => after[k] !== before[k]).map(k => ({ key: k, delta: after[k] - before[k] }));
}
function renderIndicators() {
  const keys = Object.keys(METRICS).concat(['budget']);
  $('indicators').innerHTML = keys.map(k => {
    const m = METRICS[k] || { label: 'Public reserve', colour: '#80926e' };
    const value = world.metrics[k];
    const delta = world.snapshot ? value - world.snapshot[k] : 0;
    return `<div class="indicator"><div class="indicator-top"><span class="indicator-label">${m.label}</span>${delta ? `<span class="metric-delta ${delta > 0 ? 'positive' : 'negative'}" aria-label="Change ${signed(delta)}">${signed(delta)}${k === 'budget' ? 'm' : ''}</span>` : '<span class="metric-delta muted">—</span>'}</div><div class="indicator-number">${k === 'budget' ? '₦' : ''}${value}<small>${k === 'budget' ? 'm' : m.unit}</small></div><div class="metric-track"><span style="width:${value / (k === 'budget' ? 40 : 100) * 100}%;background:${m.colour}"></span></div></div>`;
  }).join('');
}
function renderMap() {
  const restored = world.metrics.power >= 60;
  document.querySelector('.world-panel').classList.toggle('grid-restored', restored);
  $('map-status').innerHTML = `<span class="statusdot ${restored ? '' : 'amber'}"></span>${restored ? 'GRID RECOVERING' : 'GRID UNSTABLE'} · ${world.metrics.power}% COVERAGE`;
  const m = world.metrics;
  const districts = {
    school: ['ABAY Community School', m.education >= 60 ? 'The courtyard classes are keeping pupils learning. Families are following the attendance record.' : 'Heat and disrupted lessons are testing families. The school needs a response beyond tomorrow’s fuel.', m.education, 'LEARNING / 100'],
    council: ['AJEKI Council House', m.trust >= 60 ? 'The council has room to negotiate. Residents are watching whether the next promise holds.' : 'The assembly is approaching. Public contracts and political favours are under scrutiny.', m.trust, 'TRUST / 100'],
    market: ['OKOKAM Waterfront Market', m.livelihood >= 60 ? 'Stalls are trading again. Reliable deliveries and shared resources are helping margins recover.' : 'Yellow danfo buses pass shuttered stalls. Generator bills keep cutting into a day’s earnings.', m.livelihood, 'LIVELIHOODS / 100'],
    station: ['UDOJO Police Station', m.safety >= 60 ? 'The streets are calmer. Whether that peace lasts depends on public cooperation and accountability.' : 'Dark streets and tense gatherings are stretching patrols. Residents want safety without unofficial levies.', m.safety, 'SAFETY / 100']
  };
  const d = districts[district];
  $('district-detail').innerHTML = `<div><strong>${d[0]}</strong><p>${d[1]}</p></div><div class="district-value"><b>${d[2]}</b><small>${d[3]}</small></div>`;
  document.querySelectorAll('[data-district]').forEach(b => { const active = b.dataset.district === district; b.classList.toggle('selected', active); b.setAttribute('aria-pressed', active); });
  document.querySelectorAll('[data-location]').forEach(b => { const active = b.dataset.location === district; b.classList.toggle('selected', active); b.setAttribute('aria-pressed', active); });
  const art = district === 'council' ? ['council', 'SOGAL council building with Nigerian flags and palm trees.'] : district === 'station' ? ['safehouse', 'Illustrated neighbourhood operations room with a radio, district map and generator.'] : ['sogal-street', 'Illustrated SOGAL street with market stalls and yellow danfo buses.'];
  $('district-art').src = `assets/${art[0]}.webp`;
  $('district-art').alt = art[1];
  $('district-pressure').innerHTML = `<span>LEARNING <strong>${m.education}/100</strong></span><span>CORRUPTION <strong>${m.corruption}/100</strong></span>`;
  $('scene-objective').textContent = world.phase === 'ended' ? 'The assembly has spoken.' : world.phase === 'outcome' ? 'Your move is on the record.' : EVENTS[world.day - 1].title;
  $('scene-status').innerHTML = `<span class="statusdot ${restored ? '' : 'amber'}"></span>${world.phase === 'ended' ? 'ASSEMBLY / VERDICT RECORDED' : restored ? 'GRID / RECOVERING' : 'BLACKOUT / ACTIVE CRISIS'}`;
  $('make-your-move').innerHTML = `${world.phase === 'ended' ? 'Read the verdict' : world.phase === 'outcome' ? 'Read the consequence' : 'Your next move'} <span>→</span>`;
}
function renderDecision() {
  const panel = $('decision-panel');
  const top = `<span class="eyebrow">${world.phase === 'ended' ? 'THE ASSEMBLY’S VERDICT' : 'YOUR MOVE MATTERS'}</span>`;
  if (!world.role) { panel.innerHTML = `${top}<div class="empty-decision"><h2 id="decision-title">Step into a life.</h2><p class="scenario-copy">Choose a role to take your first decision in SOGAL.</p><button id="choose-first-role" class="primary-button">Choose a perspective →</button></div>`; return; }
  if (world.phase === 'ended') {
    const r = world.result;
    panel.innerHTML = `${top}<div class="outcome-pill">SIX DAYS LATER</div><h2 id="decision-title">${escape(r.title)}</h2><div class="summary-score">${r.score}<small> /100 · assembly score</small></div><p class="scenario-copy">${escape(r.text)}</p><div class="summary-facts"><strong>${escape(r.power)}</strong><br>₦${r.budget}m remains in the public reserve.<br>Learning: ${world.metrics.education}/100 · Corruption: ${r.corruption}/100.<br>Aligned actors: ${r.allies.length ? escape(r.allies.join(', ')) : 'no actor reached strong alignment (65+)'}.</div><p class="scenario-copy">Your record has ${world.history.length} decisions across ${world.visitedRoles.length} perspective${world.visitedRoles.length !== 1 ? 's' : ''}. Replay a different path to see who carries the cost.</p><button id="replay" class="primary-button">Play a different six days <span>↺</span></button><p class="commit-note">Your current world stays saved until you confirm a fresh start.</p>`;
    return;
  }
  if (world.phase === 'outcome') {
    const entry = world.latest;
    const changes = metricChanges(entry.before, world.metrics);
    panel.innerHTML = `${top}<span class="outcome-pill">DECISION COMMITTED · DAY ${world.day}</span><h2 id="decision-title" class="outcome-title">${escape(entry.action)}</h2><div class="response-box"><strong>THE CITY ANSWERS</strong>${escape(entry.response)}</div><div class="change-chips">${changes.map(c => `<span class="change-chip ${(c.key === 'corruption' ? c.delta > 0 : c.delta < 0) ? 'down' : ''}">${escape(effectText({ [c.key]: c.delta }))}</span>`).join('') || '<span class="change-chip">No immediate indicator change</span>'}</div>${entry.messages.length ? `<ul class="ripple-list">${entry.messages.map(t => `<li>${escape(t)}</li>`).join('')}</ul>` : ''}${entry.delayed ? `<div class="delayed-note"><strong>${world.day === 6 ? 'At the assembly' : 'Tomorrow'}</strong> · ${escape(entry.delayed)}. This effect is still pending.</div>` : ''}<button id="next-day" class="primary-button">${world.day === 6 ? 'Face the city assembly' : `Continue to day ${String(world.day + 1).padStart(2, '0')}`} <span>→</span></button><p class="commit-note">${world.day === 6 ? 'Any final delayed effect is settled before the verdict.' : 'Today’s decision is locked. Tomorrow carries it forward.'}</p>`;
    return;
  }
  const event = EVENTS[world.day - 1];
  const actions = actionsFor(world);
  panel.innerHTML = `${top}<div class="decision-heading"><span class="tag">${event.tag}</span><span class="small muted">DAY ${String(world.day).padStart(2, '0')}</span></div><h2 id="decision-title">${event.title}</h2><p class="scenario-copy">${event.text}</p>${world.morning.length ? `<div class="morning-note"><strong>OVERNIGHT CONSEQUENCES</strong>${world.morning.map(i => `${escape(i.text)}: ${escape(effectText(i.effect))}`).join('<br>')}</div>` : ''}<div class="choices" role="radiogroup" aria-label="Choose your decision">${actions.map((a, i) => `<label class="choice"><input type="radio" name="decision" value="${a.id}" ${selectedAction === a.id ? 'checked' : ''} ${!a.available ? 'disabled' : ''}><span class="choice-number">${String(i + 1).padStart(2, '0')}</span><span><span class="choice-title">${a.title}</span><span class="choice-copy">${a.text}</span>${!a.available ? `<span class="choice-cost">Needs ₦${a.cost || a.costTomorrow}m in the public reserve</span>` : ''}${effectsVisible ? `<span class="effect-preview">Now: ${escape(effectText(a.effect))}${a.delayed ? `<br>${world.day === 6 ? 'At assembly' : 'Next day'}: ${escape(effectText(a.delayed))}` : ''}</span>` : ''}</span></label>`).join('')}</div><label class="effect-toggle"><input id="show-effects" type="checkbox" ${effectsVisible ? 'checked' : ''}> Show direct & delayed effects</label><button id="commit" class="primary-button" ${!selectedAction ? 'disabled' : ''}>Make this decision <span>→</span></button><p class="commit-note">One choice per day. The city’s conditions also create ripple effects.</p><p id="decision-error" class="error-note" hidden></p>`;
}
function renderActors() {
  $('actors').innerHTML = ROLES.map(role => {
    const [value, label, status] = actorCondition(world, role.id);
    const alignment = world.relations[role.id];
    const stance = alignment >= 65 ? 'Aligned' : alignment <= 35 ? 'Opposed' : 'Cautious';
    return `<article class="actor-card ${world.role === role.id ? 'you' : ''}">${world.role === role.id ? '<span class="you-tag">YOUR ROLE</span>' : ''}<div class="actor-head"><div class="actor-avatar">${portrait(role)}</div><div><h3>${role.person}</h3><span class="actor-role">${role.name}</span></div></div><p class="actor-status">${status}</p><div class="actor-condition"><span>${label}</span><strong>${value}/100</strong></div><div class="metric-track"><span style="width:${value}%;background:${role.colour}"></span></div><div class="alignment"><span>${stance} with your choices</span><span>${alignment}</span></div></article>`;
  }).join('');
  const entry = world.latest || world.history[0];
  $('city-transmissions').innerHTML = entry
    ? `<article class="transmission"><span class="transmission-label">DAY ${String(entry.day).padStart(2, '0')}<br>CITY RESPONSE</span><p>${escape(entry.response)}</p></article>${entry.messages.map((message, i) => `<article class="transmission"><span class="transmission-label">RIPPLE / ${String(i + 1).padStart(2, '0')}</span><p>${escape(message)}</p></article>`).join('')}`
    : '<p class="transmission-empty">The city is waiting for your first move. Make a decision in the World view to see how people respond.</p>';
}
function renderLedger() {
  const recent = world.history[0];
  $('ledger-summary').innerHTML = recent ? `<span><strong>Day ${recent.day} · ${escape(recent.action)}.</strong> ${escape(recent.response)}</span><span class="ledger-count">${world.history.length} / 6 DECISIONS</span>` : '<span><strong>The transformer has failed.</strong> No decision has been made yet. Choose who you want to be, then make your first move.</span><span class="ledger-count">0 / 6 DECISIONS</span>';
  $('ledger').hidden = !ledgerOpen;
  $('ledger-toggle').setAttribute('aria-expanded', ledgerOpen);
  $('ledger-toggle').textContent = ledgerOpen ? 'Hide decision record ↑' : 'Show decision record ↓';
  $('ledger').innerHTML = world.history.length ? world.history.map(e => `<article class="ledger-row"><div class="ledger-day">DAY ${String(e.day).padStart(2, '0')}<br><br>${ROLES.find(r => r.id === e.role)?.name || ''}</div><div><strong>${escape(e.action)}</strong><p>${escape(e.response)}</p><p class="ledger-changes">${escape(effectText(Object.fromEntries(metricChanges(e.before, e.after).map(c => [c.key, c.delta]))))}</p>${e.messages.length ? `<ul>${e.messages.map(m => `<li>${escape(m)}</li>`).join('')}</ul>` : ''}${e.delayed ? `<p>Scheduled consequence: ${escape(e.delayed)}</p>` : ''}</div></article>`).join('') : '<p class="scenario-copy">Your first decision will appear here.</p>';
}
function render() {
  const role = ROLES.find(r => r.id === world.role);
  $('day-label').innerHTML = `${world.phase === 'ended' ? 'DAY 06' : `DAY ${String(world.day).padStart(2, '0')}`} <span>/ 06</span>`;
  $('day-progress').innerHTML = Array.from({ length: 6 }, (_, i) => `<i class="${world.phase === 'ended' || i + 1 < world.day ? 'done' : i + 1 === world.day ? 'current' : ''}"></i>`).join('');
  $('day-progress').setAttribute('aria-label', `Day ${world.day} of 6${world.phase === 'ended' ? ', complete' : ''}`);
  $('phase-label').textContent = world.phase === 'ended' ? 'The assembly has spoken' : world.day === 6 ? 'The assembly meets tonight' : `${6 - world.day} days to the city assembly`;
  $('active-avatar').textContent = role?.initials || '↗';
  $('active-avatar').style.background = role?.colour || '#d6dfcf';
  $('active-role').textContent = role?.name || 'Choose your role';
  $('active-person').textContent = role?.person || '';
  $('switch-role').disabled = world.phase === 'ended';
  renderIndicators(); renderMap(); renderDecision(); renderActors(); renderLedger(); renderView(); save();
}
function renderRoles() {
  $('role-options').innerHTML = ROLES.map(r => `<button class="role-option ${r.id === selectedRole ? 'selected' : ''}" data-role="${r.id}" aria-pressed="${r.id === selectedRole}"><span class="portrait">${portrait(r)}</span><strong>${r.name}</strong><small>${r.short}</small></button>`).join('');
  const role = ROLES.find(r => r.id === selectedRole);
  $('role-detail').innerHTML = `<strong>${role.person}</strong> · ${role.goal}<small>${role.power}</small>`;
  $('role-dialog-intro').textContent = world.role ? 'Choose another perspective. The day, public reserve and every previous consequence stay with the city.' : 'The power is out. The assembly is in six days. Step into a life, make a call, and watch the city answer.';
  $('role-dialog-title').innerHTML = world.role ? 'SWITCH<br>PERSPECTIVE.' : 'WHO WILL<br>YOU BECOME?';
  $('role-label').textContent = world.role ? 'CHOOSE YOUR PERSPECTIVE' : 'STARTING ROLE';
  $('enter-world').innerHTML = `${world.role ? 'Take this perspective' : 'Enter AIREGIN'} <span>→</span>`;
  $('close-role-dialog').hidden = !world.role;
}
function openRoles() { selectedRole = world.role || 'governor'; renderRoles(); $('role-dialog').showModal(); }
function focusDecision() { setView('world'); $('decision-panel').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); const heading = $('decision-title'); heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
function handleCommit() {
  try {
    world = applyDecision(world, selectedAction); selectedAction = null; render();
    announce(`Decision committed. ${world.latest.response}`); focusDecision();
  } catch (error) { $('decision-error').hidden = false; $('decision-error').textContent = error.message; }
}

$('role-options').addEventListener('click', event => { const b = event.target.closest('[data-role]'); if (b) { selectedRole = b.dataset.role; renderRoles(); document.querySelector(`[data-role="${selectedRole}"]`)?.focus(); } });
$('enter-world').addEventListener('click', () => { const firstEntry = !world.role; world = selectRole(world, selectedRole); selectedAction = null; setView('world'); render(); $('role-dialog').close(); announce(`You are playing as ${ROLES.find(r => r.id === world.role).name}. The world’s history is preserved.`); if (firstEntry) { $('main').scrollIntoView({ behavior: 'smooth', block: 'start' }); $('world-title').tabIndex = -1; $('world-title').focus({ preventScroll: true }); } else focusDecision(); });
$('switch-role').addEventListener('click', openRoles);
$('close-role-dialog').addEventListener('click', () => $('role-dialog').close());
$('role-dialog').addEventListener('cancel', event => { if (!world.role) event.preventDefault(); });
$('decision-panel').addEventListener('change', event => {
  if (event.target.name === 'decision') { selectedAction = event.target.value; $('commit').disabled = false; }
  if (event.target.id === 'show-effects') { effectsVisible = event.target.checked; renderDecision(); $('show-effects').focus(); }
});
$('decision-panel').addEventListener('click', event => {
  const b = event.target.closest('button'); if (!b) return;
  if (b.id === 'commit') handleCommit();
  if (b.id === 'choose-first-role') openRoles();
  if (b.id === 'next-day') { world = advanceDay(world); selectedAction = null; render(); announce(world.phase === 'ended' ? world.result.title : `Day ${world.day}. ${EVENTS[world.day - 1].title}`); focusDecision(); }
  if (b.id === 'replay') $('reset-dialog').showModal();
});
document.querySelector('.district-tabs').addEventListener('click', event => { const b = event.target.closest('[data-district]'); if (b) { district = b.dataset.district; renderMap(); announce($('district-detail').textContent); } });
$('influence-map').addEventListener('click', event => { const b = event.target.closest('[data-location]'); if (b) { district = b.dataset.location; renderMap(); announce($('district-detail').textContent); } });
$('game-nav').addEventListener('click', event => {
  const b = event.target.closest('[data-view]'); if (!b) return;
  setView(b.dataset.view);
  announce(`${b.dataset.view === 'influence' ? 'District' : b.dataset.view} view opened.`);
});
$('inspect-world').addEventListener('click', () => { setView('influence'); $('influence-title').tabIndex = -1; $('influence-title').focus({ preventScroll: true }); });
$('return-to-world').addEventListener('click', focusDecision);
$('make-your-move').addEventListener('click', focusDecision);
$('ledger-toggle').addEventListener('click', () => { ledgerOpen = !ledgerOpen; renderLedger(); });
$('help-button').addEventListener('click', () => $('help-dialog').showModal());
$('close-help').addEventListener('click', () => $('help-dialog').close());
$('start-playing').addEventListener('click', () => $('help-dialog').close());
$('reset-button').addEventListener('click', () => $('reset-dialog').showModal());
$('cancel-reset').addEventListener('click', () => $('reset-dialog').close());
$('confirm-reset').addEventListener('click', () => { world = createWorld(); selectedAction = null; effectsVisible = false; district = 'school'; ledgerOpen = false; activeView = 'world'; render(); $('reset-dialog').close(); openRoles(); announce('A fresh world is ready. Choose your role.'); });
render();
if (!world.role) openRoles();
