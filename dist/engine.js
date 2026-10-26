export const VERSION = 1;
export const ROLES = [
  { id: 'governor', name: 'Governor', person: 'Bisi Okafor', initials: 'BO', place: 'AJEKI', colour: '#d8b46a', short: 'Control the public purse.', goal: 'Restore services without losing the city’s trust.', power: 'Public spending • political bargains' },
  { id: 'teacher', name: 'Teacher', person: 'Amina Yusuf', initials: 'AY', place: 'ABAY', colour: '#a5bfaa', short: 'Keep the school alive.', goal: 'Protect learning and organise families through the crisis.', power: 'Community organising • education' },
  { id: 'trader', name: 'Market trader', person: 'Chika Eze', initials: 'CE', place: 'OKOKAM', colour: '#ed9170', short: 'Put food on the table.', goal: 'Keep livelihoods afloat without leaving neighbours behind.', power: 'Market solidarity • food supply' },
  { id: 'police', name: 'Police officer', person: 'Musa Bello', initials: 'MB', place: 'UDOJO', colour: '#96b7c0', short: 'Decide what order costs.', goal: 'Make the streets safer while retaining public cooperation.', power: 'Public safety • enforcement' },
  { id: 'journalist', name: 'Journalist', person: 'Teni Ade', initials: 'TA', place: 'ABAY', colour: '#b7a6d0', short: 'Make the city listen.', goal: 'Expose the crisis and turn evidence into accountability.', power: 'Investigations • public attention' }
];
export const METRICS = {
  power: { label: 'Power', unit: '%', colour: '#e1b76a' },
  trust: { label: 'Public trust', unit: '/100', colour: '#a6c4ac' },
  safety: { label: 'Safety', unit: '/100', colour: '#94bac8' },
  livelihood: { label: 'Livelihoods', unit: '/100', colour: '#ed9674' }
};
export const EVENTS = [
  { title: 'The lights went out.', tag: 'THE BLACKOUT', text: 'The ABAY transformer has failed. Traders are buying diesel, classrooms are sweltering, and six days remain before the city assembly. Everyone wants an answer.', effect: {} },
  { title: 'Diesel is swallowing the profit.', tag: 'DAY TWO', text: 'The danfo queue stretches past the market. Generator costs are rising, and parents are asking whether school will open tomorrow.', effect: { livelihood: -3 } },
  { title: 'The street wants a hearing.', tag: 'THE PETITION', text: 'The teachers and market union are gathering at AJEKI council. Their petition demands a repair deadline and an open account of public money.', effect: { trust: -2 } },
  { title: 'The crowd has arrived.', tag: 'THE GATHERING', text: 'Families, traders and students fill the council frontage. The rally is peaceful for now. What happens next depends on how the city responds.', effect: {} },
  { title: 'An envelope changes hands.', tag: 'THE CONTRACT', text: 'A politically connected supplier offers a quick solution. An invoice has also reached the newsroom. The city needs both power and answers.', effect: {} },
  { title: 'The city will remember.', tag: 'ASSEMBLY DAY', text: 'At tonight’s city assembly, residents will judge the response. There is time for one final move. Every promise now meets the record.', effect: {} }
];

// Immediate effects, next-day effects and relationships share a single ledger.
const choice = (id, title, text, effect, relations, response, options = {}) => ({ id, title, text, effect, relations, response, ...options });
const DECKS = {
  governor: [
    [
      choice('repair', 'Fund an open repair contract', 'Spend ₦7m from the public reserve. Publish the invoice; the transformer comes online tomorrow.', { budget: -7, trust: 5 }, { teacher: 5, trader: 8, journalist: 7 }, 'Teni requests the invoice. Chika agrees to keep essential stalls open while the engineers work.', { delayed: { power: 32, livelihood: 5 }, delayText: 'Engineers restore the transformer', cost: 7 }),
      choice('diesel', 'Keep services running on diesel', 'Spend ₦3m on one day of generator fuel for the market and school. Fast relief, recurring cost.', { budget: -3, power: 14, livelihood: 5 }, { teacher: 4, trader: 5 }, 'Amina reopens a classroom. Chika warns that one delivery will not keep the fridges cold all week.', { delayed: { power: -14 }, delayText: 'The subsidised diesel runs out', cost: 3 }),
      choice('donor', 'Take the donor’s private deal', 'A party donor fronts ₦4m for repairs in exchange for influence over the next contract.', { budget: 4, trust: -9, corruption: 18 }, { journalist: -10, trader: 4, police: -3 }, 'Teni starts checking the donor’s company. Chika welcomes the repair, but asks who will pay later.', { delayed: { power: 22 }, delayText: 'The donor’s repair crew arrives' })
    ],
    [
      choice('hearing', 'Invite the unions to the table', 'Amina and Chika get a public hearing and a written deadline. Concessions slow your political timetable.', { trust: 10, safety: 4, education: 3 }, { teacher: 10, trader: 10, police: 3, journalist: 5 }, 'Amina and Chika accept the hearing. Musa agrees to keep the assembly route open.'),
      choice('disperse', 'Order the gathering dispersed', 'Clear the council frontage. Order returns briefly, but families remember the force.', { safety: 8, trust: -13, education: -3 }, { teacher: -12, trader: -10, journalist: -10, police: 4 }, 'Musa follows the order. Amina moves the parents’ meeting into the school courtyard.', { delayed: { safety: -8, livelihood: -3 }, delayText: 'Anger spills into a second gathering' }),
      choice('stalls', 'Offer traders a relief grant', 'Spend ₦4m to restock essential stalls. The school still needs an answer.', { budget: -4, livelihood: 12, trust: 3 }, { trader: 12, teacher: -5 }, 'Chika distributes the grant. Amina asks why families with no market stall were left out.', { cost: 4 })
    ],
    [
      choice('audit', 'Open the books and fund repairs', 'Publish every invoice and spend ₦5m on a final repair push. An audit removes political cover.', { budget: -5, trust: 12, power: 14, corruption: -20 }, { journalist: 12, teacher: 7, trader: 7 }, 'Teni puts the ledger on the front page. The teachers and market union attend the assembly together.', { cost: 5 }),
      choice('rally', 'Spend on a victory rally', 'Spend ₦3m on a loud closing rally. It buys attention, not electricity.', { budget: -3, trust: 4, corruption: 7 }, { journalist: -6, teacher: -4, trader: -3 }, 'The rally fills the council frontage. Teni runs photographs of the dark school beside it.', { cost: 3, delayed: { trust: -8 }, delayText: 'The rally bill reaches the public' }),
      choice('coalition', 'Hand oversight to a citizen panel', 'Give the unions and newsroom a seat over the next contract. You lose unilateral control.', { trust: 8, corruption: -10, livelihood: 3 }, { teacher: 8, trader: 8, journalist: 8, police: 3 }, 'Amina, Chika and Teni agree to serve, with minutes posted outside the school.')
    ]
  ],
  teacher: [
    [
      choice('lessons', 'Run a shaded community class', 'Use the school courtyard. Learning continues, but families help cover materials and transport.', { education: 12, trust: 4, livelihood: -2 }, { trader: 5, governor: 3 }, 'Chika lends benches and drinking water. Parents ask that the class remain free.'),
      choice('strike', 'Organise a teachers’ walkout', 'Demand a funded repair. Lessons stop today; pressure forces the council to release ₦4m tomorrow.', { education: -7, trust: 4 }, { governor: -8, journalist: 8, trader: -3 }, 'Teni covers the walkout. Chika supports the demand but loses customers who must stay home.', { delayed: { budget: -4, power: 16 }, delayText: 'The council funds emergency school repairs', costTomorrow: 4 }),
      choice('fees', 'Charge for generator lessons', 'Fee-paying pupils return to a powered class. Other children wait outside.', { education: 7, power: 3, trust: -7, livelihood: -4 }, { trader: -7, journalist: -5, governor: 3 }, 'Chika cannot afford the new fee. Teni asks the school who is being excluded.')
    ],
    [
      choice('parents', 'Build a parents–traders petition', 'Invite market families to write a joint demand: safe streets, power and free lessons.', { trust: 8, education: 5, safety: 3 }, { trader: 10, journalist: 6, governor: -3 }, 'Chika brings the market union. Teni agrees to publish the demands in full.'),
      choice('class', 'Keep pupils away from the rally', 'Protect today’s lessons and leave the political demands to others.', { education: 10, safety: 2, trust: -2 }, { governor: 4, trader: -4, police: 3 }, 'Musa helps pupils reach class. Chika feels the teachers have left the market to stand alone.'),
      choice('march', 'Lead families to council', 'A visible peaceful march raises pressure. Checkpoints make the route tense.', { trust: 7, safety: -5, education: -3 }, { trader: 8, police: -7, journalist: 7 }, 'Teni walks with the parents. Musa asks the crowd to agree on a clear route.', { delayed: { budget: -2, power: 10 }, delayText: 'The council concedes a repair top-up', costTomorrow: 2 })
    ],
    [
      choice('register', 'Bring the attendance record', 'Show which children were excluded during the blackout. Evidence makes education part of the vote.', { trust: 9, education: 7, corruption: -5 }, { journalist: 10, trader: 6, governor: -4 }, 'Teni interviews the affected families. Chika brings the receipts for their extra transport costs.'),
      choice('endorse', 'Endorse the governor for a grant', 'Accept ₦2m for the school and back the administration. Families question the bargain.', { budget: -2, education: 13, trust: -6 }, { governor: 12, journalist: -9, trader: -3 }, 'The school gets supplies. Teni publishes the endorsement beside the grant letter.', { cost: 2 }),
      choice('committee', 'Create a free learning cooperative', 'Traders and parents share materials and oversight. Mutual help costs time and income.', { education: 10, trust: 6, livelihood: -2 }, { trader: 10, journalist: 4, governor: 3 }, 'Chika signs the cooperative register. Families agree no child will be charged to join.')
    ]
  ],
  trader: [
    [
      choice('pool', 'Pool fuel with neighbouring stalls', 'Share one generator and sell essentials at normal prices. Smaller margins keep customers coming.', { power: 7, livelihood: 9, trust: 5 }, { teacher: 7, governor: 3 }, 'Amina buys food for the courtyard class. Neighbouring stallholders join Chika’s fuel pool.', { delayed: { power: -4 }, delayText: 'The shared fuel supply dwindles' }),
      choice('prices', 'Raise prices to cover diesel', 'Protect your stock and margin. The extra cost travels straight into family budgets.', { livelihood: 8, trust: -8, education: -3 }, { teacher: -8, police: -3 }, 'Amina says some pupils now arrive hungry. Musa hears complaints at the market gate.'),
      choice('close', 'Close the market in protest', 'Make the shortage impossible to ignore. A day’s earnings is the price of collective pressure.', { livelihood: -8, trust: 5 }, { governor: -8, journalist: 8, teacher: -3 }, 'Teni covers the shuttered stalls. Bisi promises ₦3m for a repair crew.', { delayed: { power: 17, budget: -3 }, delayText: 'Market pressure releases a repair payment', costTomorrow: 3 })
    ],
    [
      choice('union', 'Join the school’s petition', 'Food sellers and parents negotiate together. Volunteers lose a little trading time.', { trust: 8, education: 5, livelihood: -2 }, { teacher: 12, journalist: 6, governor: -3 }, 'Amina adds market rents to the demands. Teni reports one joint petition, not two rival protests.'),
      choice('protection', 'Pay the unofficial market levy', 'Buy short-term protection and keep stalls open. The levy strengthens the wrong incentives.', { livelihood: 6, safety: 5, trust: -7, corruption: 12 }, { police: 7, teacher: -5, journalist: -8 }, 'Musa’s station gets the payment. Teni starts asking which receipt the levy produced.'),
      choice('watch', 'Organise a civilian market watch', 'Report thefts and escort deliveries without taking enforcement into your own hands.', { safety: 9, livelihood: 4, trust: 3 }, { police: 8, teacher: 4, governor: 3 }, 'Musa shares a reporting number. Amina asks the volunteers to escort pupils too.')
    ],
    [
      choice('receipts', 'Release the levy receipts', 'Hand the newsroom evidence of unofficial payments. Traders face an immediate disruption.', { trust: 10, corruption: -15, livelihood: -4 }, { journalist: 12, police: -8, teacher: 6 }, 'Teni verifies the documents. Musa must answer questions about the station’s collection.'),
      choice('patron', 'Back the governor’s preferred supplier', 'Secure a stock contract for the union. The deal ties your livelihood to political favour.', { livelihood: 12, trust: -6, corruption: 10 }, { governor: 10, journalist: -7, teacher: -4 }, 'Bisi promises the union a contract. Amina asks whether non-members will still afford food.'),
      choice('fund', 'Start a transparent hardship fund', 'Contribute stock and publish the distribution list. Sacrifice a little profit to help families.', { livelihood: 5, trust: 8, education: 4 }, { teacher: 10, journalist: 6, police: 3 }, 'Amina identifies families missing meals. Teni publishes the fund’s account and stock list.')
    ]
  ],
  police: [
    [
      choice('patrol', 'Patrol with community volunteers', 'Protect the dark streets and agree a reporting route with traders. Cooperation takes patience.', { safety: 12, trust: 6, livelihood: 2 }, { trader: 8, teacher: 5, governor: 3 }, 'Chika introduces the volunteers. Amina asks the patrol to cover the school route.'),
      choice('checkpoint', 'Set up revenue checkpoints', 'Stop vehicles near the market. Officers gain control while traders pay in delays and levies.', { safety: 8, livelihood: -7, trust: -8, corruption: 10 }, { trader: -10, teacher: -4, journalist: -7 }, 'Chika misses a delivery. Teni photographs the checkpoint queue.'),
      choice('council', 'Guard only the council buildings', 'Keep political offices secure. The market and school lose their patrols.', { safety: 3, trust: -5, livelihood: -3 }, { governor: 10, trader: -7, teacher: -6 }, 'Bisi thanks the station. Chika asks why the public cannot get the same protection.')
    ],
    [
      choice('mediate', 'Agree a peaceful assembly route', 'Meet Amina and Chika, set a route and keep officers accountable at the gathering.', { safety: 10, trust: 8 }, { teacher: 10, trader: 10, journalist: 5, governor: -3 }, 'Amina and Chika nominate marshals. Teni records a peaceful march with the agreed route intact.'),
      choice('force', 'Disperse the gathering by force', 'Clear the road quickly. The crackdown shifts anger into neighbourhood streets.', { safety: 10, trust: -15, education: -3 }, { governor: 8, teacher: -12, trader: -12, journalist: -10 }, 'Bisi welcomes the clear road. Amina moves the parents’ meeting away from the officers.', { delayed: { safety: -13, livelihood: -3 }, delayText: 'The crackdown sparks fresh unrest' }),
      choice('standback', 'Stand back without a plan', 'Avoid an immediate confrontation. Leave families to organise the crowd themselves.', { trust: 3, safety: -7, livelihood: -2 }, { teacher: 3, trader: 3, governor: -6 }, 'Chika and Amina form an improvised line of marshals. Bisi demands a written explanation.')
    ],
    [
      choice('investigate', 'Investigate the levy collectors', 'Use the receipts to suspend collection and publish the case record.', { trust: 10, safety: 6, corruption: -18 }, { trader: 10, journalist: 10, governor: -4 }, 'Chika identifies the collection points. Teni checks the case record against the receipts.'),
      choice('bury', 'Bury the complaint for political cover', 'Keep support at council and quiet the case. The market notices the missing report.', { safety: 3, trust: -10, corruption: 15 }, { governor: 12, trader: -10, journalist: -12, teacher: -5 }, 'Bisi offers protection to the station. Teni reports that the complaint has disappeared.'),
      choice('protectvote', 'Protect access to the assembly', 'Escort residents and keep the entrance free of unofficial checks.', { safety: 8, trust: 7, livelihood: 2 }, { teacher: 7, trader: 7, journalist: 5 }, 'Amina brings parents to the assembly. Chika closes the market early so traders can attend.')
    ]
  ],
  journalist: [
    [
      choice('verify', 'Verify the repair invoice', 'Interview engineers and request the public ledger. Evidence gives families a concrete demand.', { trust: 7, corruption: -8 }, { teacher: 6, trader: 5, governor: -5 }, 'Amina and Chika help document the outage. Bisi agrees to release part of the invoice.', { delayed: { budget: -2, power: 10 }, delayText: 'Reporting forces a repair top-up', costTomorrow: 2 }),
      choice('rumour', 'Publish the unverified allegation', 'A dramatic claim gets attention today. A correction will damage trust tomorrow.', { trust: 5, safety: -4 }, { governor: -8, teacher: 3, police: -4 }, 'Families share the headline. The engineer says the central claim has not been checked.', { delayed: { trust: -13 }, delayText: 'An unverified headline requires a correction' }),
      choice('sponsored', 'Take the council’s sponsored feature', 'Secure the newsroom’s footing. The feature tells residents the response is already working.', { trust: -5, livelihood: 2, corruption: 7 }, { governor: 10, teacher: -5, trader: -6 }, 'Bisi supplies the talking points. Chika sends a photograph of the still-dark market.')
    ],
    [
      choice('voices', 'Broadcast parents and traders together', 'Give the joint petition airtime and ask council to respond to specific demands.', { trust: 9, education: 3, safety: 3 }, { teacher: 10, trader: 10, governor: -4 }, 'Amina reads the school record. Chika shares the generator bills on the same broadcast.'),
      choice('leak', 'Expose the planned crackdown', 'Publish a verified order before officers move. Public scrutiny buys space, but tensions rise.', { trust: 7, safety: -5, corruption: -6 }, { police: -8, governor: -8, teacher: 8, trader: 8 }, 'Musa faces questions about the order. Amina and Chika move the gathering into the open.'),
      choice('quiet', 'Keep the rally off the front page', 'Protect access to official sources. The gathering loses coverage and public pressure.', { trust: -6, safety: 3 }, { governor: 8, police: 4, teacher: -8, trader: -8 }, 'Bisi offers an exclusive interview. Amina asks why the parents’ statement was dropped.')
    ],
    [
      choice('dossier', 'Publish the verified contract dossier', 'Connect invoices, levies and donor interests. Put the evidence before the assembly.', { trust: 12, corruption: -20, safety: -2 }, { teacher: 8, trader: 8, police: -5, governor: -8 }, 'Chika confirms the market records. Amina brings the report to the assembly for an answer.'),
      choice('interview', 'Trade the investigation for access', 'Win a prime interview with the governor. Leave the invoice questions unasked.', { trust: -9, corruption: 10, livelihood: 2 }, { governor: 12, teacher: -6, trader: -7 }, 'Bisi grants the interview. Chika asks why the receipts never made it onto the programme.'),
      choice('forum', 'Host a moderated citizen forum', 'Put all five actors in one room, with published promises and a right of reply.', { trust: 9, safety: 4, corruption: -7 }, { teacher: 7, trader: 7, police: 5, governor: 3 }, 'Amina, Chika, Musa and Bisi agree to answer residents’ questions on the record.')
    ]
  ]
};

export const clone = value => JSON.parse(JSON.stringify(value));
export function createWorld() {
  return { version: VERSION, day: 1, phase: 'decision', role: null,
    metrics: { power: 28, trust: 48, safety: 55, livelihood: 45, budget: 18, education: 48, corruption: 30 },
    relations: Object.fromEntries(ROLES.map(r => [r.id, 50])), queue: [], history: [], latest: null, result: null,
    snapshot: null, choices: [], visitedRoles: [], morning: [] };
}
export function selectRole(world, role) {
  if (!ROLES.some(r => r.id === role)) throw new Error('Unknown role');
  const next = clone(world); next.role = role;
  if (!next.visitedRoles.includes(role)) next.visitedRoles.push(role);
  return next;
}
export function actionsFor(world) {
  if (!world.role || world.phase !== 'decision') return [];
  return DECKS[world.role][Math.floor((world.day - 1) / 2)].map(a => ({ ...clone(a), available: world.metrics.budget >= (a.cost || a.costTomorrow || 0) }));
}
export function adjust(world, effect) {
  for (const [key, delta] of Object.entries(effect)) {
    world.metrics[key] = Math.max(0, Math.min(key === 'budget' ? 40 : 100, world.metrics[key] + delta));
  }
}
export function applyDecision(world, id) {
  if (world.phase !== 'decision') throw new Error('Advance the day before making another decision');
  const action = actionsFor(world).find(a => a.id === id);
  if (!action) throw new Error('Unknown decision');
  if (!action.available) throw new Error('The public reserve cannot cover this commitment');
  const next = clone(world); next.snapshot = clone(world.metrics);
  const messages = [];
  adjust(next, action.effect);
  for (const [role, delta] of Object.entries(action.relations)) next.relations[role] = Math.max(0, Math.min(100, next.relations[role] + delta));
  if (action.delayed) next.queue.push({ day: world.day + 1, effect: action.delayed, text: action.delayText });
  // The citizens live in the same world: conditions keep changing after a choice.
  if (next.metrics.power < 40) { adjust(next, { livelihood: -3, education: -2 }); messages.push('Blackout drag: generator costs reduce livelihoods by 3; lost lessons reduce learning by 2.'); }
  if (next.metrics.safety < 40) { adjust(next, { livelihood: -3 }); messages.push('Unsafe streets: disrupted deliveries reduce livelihoods by 3.'); }
  if (next.metrics.education >= 65) { adjust(next, { trust: 2 }); messages.push('Families back the school: sustained learning adds 2 public trust.'); }
  if (next.metrics.corruption >= 50) { adjust(next, { trust: -3 }); messages.push('Patronage has become visible: public trust falls by 3.'); }
  if (next.relations.teacher >= 65 && next.relations.trader >= 65) { adjust(next, { trust: 2, safety: 2 }); messages.push('Amina and Chika coordinate volunteers: public trust and safety rise by 2.'); }
  const entry = { day: next.day, role: next.role, action: action.title, response: action.response, effect: clone(action.effect), messages, before: clone(world.metrics), after: clone(next.metrics), delayed: action.delayed ? action.delayText : null };
  next.history.unshift(entry); next.choices.push(id); next.latest = entry; next.phase = 'outcome';
  return next;
}
export function advanceDay(world) {
  if (world.phase !== 'outcome') throw new Error('Make one decision before advancing');
  const next = clone(world); next.morning = []; next.snapshot = clone(next.metrics);
  const upcoming = next.day + 1;
  for (const item of next.queue.filter(q => q.day <= upcoming)) { adjust(next, item.effect); next.morning.push({ text: item.text, effect: item.effect }); }
  next.queue = next.queue.filter(q => q.day > upcoming);
  if (next.day === 6) { next.phase = 'ended'; next.result = verdict(next); return next; }
  next.day += 1;
  const event = EVENTS[next.day - 1]; adjust(next, event.effect);
  if (Object.keys(event.effect).length) next.morning.push({ text: event.title, effect: event.effect });
  next.phase = 'decision'; next.latest = null;
  return next;
}
export function verdict(world) {
  const m = world.metrics;
  const score = Math.round(m.trust * .3 + m.power * .25 + m.livelihood * .2 + m.safety * .15 + m.education * .1);
  const title = score >= 65 ? 'A city pulling together.' : score >= 45 ? 'A fragile compromise.' : 'A city running out of patience.';
  const text = score >= 65 ? 'Residents give the response a mandate to continue. The city has enough services and trust to move forward, though every promise still needs oversight.' : score >= 45 ? 'The assembly demands a citizen oversight panel before giving its support. Some streets recovered; others carried the cost.' : 'Residents withdraw support and demand a new crisis committee. The decisions kept shifting the burden without building enough trust or relief.';
  return { score, title, text, allies: ROLES.filter(r => world.relations[r.id] >= 65).map(r => r.person), power: m.power >= 60 ? 'Power recovery reached most streets.' : 'Power recovery remains incomplete.', budget: m.budget, corruption: m.corruption };
}
export function actorCondition(world, id) {
  const m = world.metrics;
  const data = {
    governor: [Math.round((m.trust + m.power) / 2), 'Mandate', m.trust < 40 ? 'Council is facing a trust crisis.' : 'Council is watching the assembly numbers.'],
    teacher: [m.education, 'Learning', m.education >= 60 ? 'Lessons are finding a way to continue.' : 'Children are losing learning time.'],
    trader: [m.livelihood, 'Trade', m.livelihood >= 60 ? 'Stalls are recovering their margins.' : 'Diesel and disruption eat into earnings.'],
    police: [m.safety, 'Street safety', m.trust < 40 ? 'Residents hesitate to cooperate.' : 'Residents will work with accountable patrols.'],
    journalist: [Math.round((m.trust + 100 - m.corruption) / 2), 'Credibility', m.corruption >= 50 ? 'The newsroom is following the money.' : 'The newsroom is checking public promises.']
  }; return data[id];
}
export function hydrate(raw) {
  try {
    const state = JSON.parse(raw);
    if (state.version !== VERSION || !Number.isInteger(state.day) || state.day < 1 || state.day > 6 || !['decision','outcome','ended'].includes(state.phase)) return null;
    if (state.role && !ROLES.some(r => r.id === state.role)) return null;
    if (Object.keys(createWorld().metrics).some(k => !Number.isFinite(state.metrics?.[k]) || state.metrics[k] < 0 || state.metrics[k] > (k === 'budget' ? 40 : 100))) return null;
    if (ROLES.some(r => !Number.isFinite(state.relations?.[r.id]) || state.relations[r.id] < 0 || state.relations[r.id] > 100)) return null;
    if (!Array.isArray(state.history) || !Array.isArray(state.queue) || !Array.isArray(state.visitedRoles) || !Array.isArray(state.choices) || !Array.isArray(state.morning)) return null;
    if (state.history.length > 6 || (state.phase === 'outcome' && !state.latest) || (state.phase === 'ended' && !state.result)) return null;
    return state;
  } catch { return null; }
}
