import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createWorld, selectRole, actionsFor, applyDecision, advanceDay, hydrate, ROLES, actorCondition } from '../dist/engine.js';

test('an open repair has a paid immediate cost and a next-day benefit', () => {
  let w = selectRole(createWorld(), 'governor');
  w = applyDecision(w, 'repair');
  assert.equal(w.metrics.budget, 11);
  assert.equal(w.metrics.power, 28);
  assert.equal(w.metrics.livelihood, 42); // Blackout still hurts while the crew works.
  assert.equal(w.phase, 'outcome');
  assert.throws(() => applyDecision(w, 'donor'), /Advance/);
  w = advanceDay(w);
  assert.equal(w.day, 2);
  assert.equal(w.metrics.power, 60);
  assert.equal(w.queue.length, 0);
  assert.equal(w.morning.length, 2);
});

test('subsidised diesel expires and force creates delayed unrest', () => {
  let w = selectRole(createWorld(), 'governor');
  w = advanceDay(applyDecision(w, 'diesel'));
  assert.equal(w.metrics.power, 28);
  w = advanceDay(applyDecision(w, 'donor'));
  w = selectRole(w, 'police');
  w = applyDecision(w, 'force');
  const safetyBefore = w.metrics.safety;
  const trustBefore = w.metrics.trust;
  w = advanceDay(w);
  assert.equal(w.metrics.safety, safetyBefore - 13);
  assert.equal(w.metrics.trust, trustBefore);
  assert.match(w.morning[0].text, /crackdown/);
});

test('role switching carries forward indicators, relations, queue and history', () => {
  let w = selectRole(createWorld(), 'governor');
  w = applyDecision(w, 'repair');
  const saved = JSON.stringify(w);
  const other = selectRole(w, 'teacher');
  assert.deepEqual(other.metrics, w.metrics);
  assert.deepEqual(other.history, w.history);
  assert.deepEqual(other.queue, w.queue);
  assert.deepEqual(other.relations, w.relations);
  assert.equal(other.role, 'teacher');
  assert.equal(JSON.stringify(w), saved); // Reducers do not mutate the input.
  assert.deepEqual(other.visitedRoles, ['governor', 'teacher']);
});

test('public reserve limits paid and next-day commitments', () => {
  let w = selectRole(createWorld(), 'governor');
  w.metrics.budget = 2;
  assert.equal(actionsFor(w).find(a => a.id === 'repair').available, false);
  assert.throws(() => applyDecision(w, 'repair'), /reserve/);
  assert.equal(actionsFor(w).find(a => a.id === 'donor').available, true);
  w = selectRole(w, 'teacher');
  assert.throws(() => applyDecision(w, 'strike'), /reserve/);
});

test('a cross-role cooperative path improves the city and produces a complete verdict', () => {
  let w = selectRole(createWorld(), 'governor');
  const path = [['governor','repair'],['teacher','lessons'],['police','mediate'],['governor','hearing'],['journalist','forum'],['trader','fund']];
  for (const [role, choice] of path) {
    w = selectRole(w, role);
    w = advanceDay(applyDecision(w, choice));
  }
  assert.equal(w.phase, 'ended');
  assert.equal(w.day, 6);
  assert.equal(w.history.length, 6);
  assert.equal(w.visitedRoles.length, 5);
  assert.equal(w.queue.length, 0);
  assert.ok(w.result.score >= 65);
  assert.ok(w.result.allies.length >= 2);
  assert.equal(actionsFor(w).length, 0);
  assert.throws(() => advanceDay(w), /decision/);
  assert.equal(actorCondition(w, 'trader')[0], w.metrics.livelihood);
});

test('final day delayed effects settle before assembly scoring', () => {
  let w = selectRole(createWorld(), 'governor');
  for (const id of ['donor','donor','hearing','hearing','coalition']) w = advanceDay(applyDecision(w, id));
  w = applyDecision(w, 'rally');
  const trust = w.metrics.trust;
  w = advanceDay(w);
  assert.equal(w.metrics.trust, Math.max(0, trust - 8));
  assert.equal(w.queue.length, 0);
  assert.equal(w.result.score, Math.round(w.metrics.trust * .3 + w.metrics.power * .25 + w.metrics.livelihood * .2 + w.metrics.safety * .15 + w.metrics.education * .1));
});

test('all roles and choice branches can complete; all world values stay in range', () => {
  let runs = 0;
  for (const role of ROLES) {
    const walk = w => {
      if (w.phase === 'ended') { runs++; assert.equal(w.history.length, 6); return; }
      for (const action of actionsFor(w).filter(a => a.available)) {
        const next = advanceDay(applyDecision(w, action.id));
        for (const [k,v] of Object.entries(next.metrics)) assert.ok(v >= 0 && v <= (k === 'budget' ? 40 : 100), `${role.id} ${k} ${v}`);
        for (const v of Object.values(next.relations)) assert.ok(v >= 0 && v <= 100);
        walk(next);
      }
    };
    walk(selectRole(createWorld(), role.id));
  }
  assert.ok(runs >= 3000, `Only ${runs} complete paths`);
  console.log(`Validated ${runs} complete six-day paths across five roles.`);
});

test('world save restores outcomes and rejects invalid or older state', () => {
  const w = applyDecision(selectRole(createWorld(), 'trader'), 'pool');
  assert.deepEqual(hydrate(JSON.stringify(w)), w);
  assert.equal(hydrate('not-json'), null);
  assert.equal(hydrate(JSON.stringify({ ...w, version: 999 })), null);
  assert.equal(hydrate(JSON.stringify({ ...w, day: 7 })), null);
  assert.equal(hydrate(JSON.stringify({ ...w, metrics: { ...w.metrics, power: -2 } })), null);
  assert.equal(hydrate(JSON.stringify({ ...w, relations: {} })), null);
});

// This exercises actual UI event handlers with a small DOM fixture. It does not
// substitute for visual browser QA, which is unavailable in this environment.
class Element {
  constructor(doc, id) { this.doc = doc; this.id = id; this.listeners = {}; this.style = {}; this.dataset = {}; this.disabled = false; this.hidden = false; this.open = false; this.attributes = {}; this.textContent = ''; this.classes = new Set(); this.classList = { toggle: (c,on) => on ? this.classes.add(c) : this.classes.delete(c) }; }
  set innerHTML(value) { this.html = value; for (const match of value.matchAll(/\bid="([^"]+)"/g)) { const el = new Element(this.doc, match[1]); this.doc.ids.set(match[1], el); } }
  get innerHTML() { return this.html || ''; }
  setAttribute(k,v) { this.attributes[k] = v; }
  addEventListener(type, handler) { (this.listeners[type] ||= []).push(handler); }
  emit(type, target = this) { for (const handler of this.listeners[type] || []) handler({ target, preventDefault() {} }); }
  closest() { return this; }
  focus() { this.doc.focused = this.id; }
  scrollIntoView() {}
  showModal() { this.open = true; }
  close() { this.open = false; }
}
class Fixture {
  constructor() {
    this.ids = new Map(); this.named = new Map();
    const html = fs.readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
    for (const match of html.matchAll(/\bid="([^"]+)"/g)) this.ids.set(match[1], new Element(this, match[1]));
    this.tabs = ['school','council','market','station'].map(d => { const el = new Element(this,d); el.dataset.district = d; return el; });
    this.pins = ['school','council','market','station'].map(d => { const el = new Element(this,'pin-' + d); el.dataset.location = d; return el; });
    this.views = ['world','crew','influence','journal'].map(v => { const el = new Element(this,'nav-' + v); el.dataset.view = v; return el; });
  }
  getElementById(id) { return this.ids.get(id); }
  querySelector(selector) { if (!this.named.has(selector)) this.named.set(selector, new Element(this, selector)); return this.named.get(selector); }
  querySelectorAll(selector) { return selector === '[data-district]' ? this.tabs : selector === '[data-location]' ? this.pins : selector === '[data-view]' ? this.views : []; }
}
test('UI handlers select a role, commit, advance, switch, reload, inspect and reset', async () => {
  const data = new Map();
  globalThis.localStorage = { getItem: k => data.get(k) || null, setItem: (k,v) => data.set(k,v) };
  let doc = new Fixture(); globalThis.document = doc;
  await import('../dist/app.js?ui-first');
  const el = id => doc.getElementById(id);
  const state = () => JSON.parse(data.get('airegin-world-v1'));
  assert.equal(el('role-dialog').open, true);
  el('enter-world').emit('click');
  assert.equal(state().role, 'governor');
  assert.equal(el('role-dialog').open, false);
  el('decision-panel').emit('change', { name: 'decision', value: 'repair' });
  assert.equal(el('commit').disabled, false);
  el('decision-panel').emit('click', Object.assign(new Element(doc,'commit'), { id: 'commit' }));
  assert.equal(state().phase, 'outcome');
  assert.match(el('decision-panel').innerHTML, /THE CITY ANSWERS/);
  el('decision-panel').emit('click', new Element(doc,'next-day'));
  assert.equal(state().day, 2);
  assert.equal(state().metrics.power, 60);
  el('switch-role').emit('click');
  const teacher = new Element(doc,'teacher'); teacher.dataset.role = 'teacher';
  el('role-options').emit('click', teacher); el('enter-world').emit('click');
  assert.equal(state().role, 'teacher');
  assert.equal(state().history.length, 1);
  const toggle = new Element(doc,'show-effects'); toggle.checked = true;
  el('decision-panel').emit('change', toggle);
  assert.match(el('decision-panel').innerHTML, /effect-preview/);
  doc.querySelector('.district-tabs').emit('click', doc.tabs[2]);
  assert.match(el('district-detail').innerHTML, /Waterfront Market/);
  el('ledger-toggle').emit('click'); assert.equal(el('ledger').hidden, false);
  const beforeNavigation = JSON.stringify(state());
  el('game-nav').emit('click', doc.views[1]);
  assert.equal(el('view-world').hidden, true);
  assert.equal(el('view-crew').hidden, false);
  assert.equal(doc.views[1].attributes['aria-pressed'], true);
  assert.match(el('city-transmissions').innerHTML, /Teni requests the invoice/);
  el('game-nav').emit('click', doc.views[2]);
  assert.equal(el('view-crew').hidden, true);
  assert.equal(el('view-influence').hidden, false);
  el('influence-map').emit('click', doc.pins[1]);
  assert.match(el('district-detail').innerHTML, /Council House/);
  assert.equal(el('district-art').src, 'assets/council.webp');
  assert.equal(doc.pins[1].attributes['aria-pressed'], true);
  el('game-nav').emit('click', doc.views[3]);
  assert.equal(el('view-influence').hidden, true);
  assert.equal(el('view-journal').hidden, false);
  assert.equal(el('ledger').hidden, false);
  el('return-to-world').emit('click');
  assert.equal(el('view-world').hidden, false);
  assert.equal(el('view-journal').hidden, true);
  el('inspect-world').emit('click');
  assert.equal(el('view-influence').hidden, false);
  assert.equal(JSON.stringify(state()), beforeNavigation);
  el('return-to-world').emit('click');
  el('make-your-move').emit('click');
  assert.equal(doc.focused, 'decision-title');
  el('help-button').emit('click'); assert.equal(el('help-dialog').open, true);
  el('close-help').emit('click'); assert.equal(el('help-dialog').open, false);
  doc = new Fixture(); globalThis.document = doc;
  await import('../dist/app.js?ui-reload');
  assert.equal(state().day, 2);
  assert.equal(state().role, 'teacher');
  assert.equal(el('role-dialog').open, false);
  el('reset-button').emit('click');
  el('cancel-reset').emit('click'); assert.equal(state().day, 2);
  el('reset-button').emit('click'); el('confirm-reset').emit('click');
  assert.equal(state().day, 1);
  assert.equal(state().role, null);
  assert.equal(state().history.length, 0);
  assert.equal(el('role-dialog').open, true);
});

test('blocked browser storage still allows a complete UI turn', async () => {
  globalThis.document = new Fixture();
  globalThis.localStorage = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  await import('../dist/app.js?ui-blocked-storage');
  const el = id => document.getElementById(id);
  assert.match(el('save-status').textContent, /saving unavailable/);
  el('enter-world').emit('click');
  el('decision-panel').emit('change', { name: 'decision', value: 'repair' });
  el('decision-panel').emit('click', new Element(document,'commit'));
  assert.match(el('decision-panel').innerHTML, /DECISION COMMITTED/);
});
