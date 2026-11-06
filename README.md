# AIREGIN — The city remembers

A small, private, buildless world simulator. Five controllable perspectives share a six-day blackout crisis in a fictional Nigeria-inspired city. The remaining actors are simulated; this is not networked multiplayer.

## Playable scope

- Governor, teacher, market trader, police officer and journalist.
- One committed decision per day, three choices per role and phase.
- Role switching preserves the world and all previous decisions.
- Immediate costs, next-day consequences, systemic condition effects and actor alignment.
- Public reserve, power, trust, safety, livelihoods, learning and corruption.
- Interactive district inspection, actor conditions, consequence previews and decision record.
- Assembly outcome after six days, deterministic scoring and replay.
- Local browser saving with safe failure if storage is blocked; confirmed reset.

Place names: NIGERIA → AIREGIN, LAGOS → SOGAL, YABA → ABAY, IKEJA → AJEKI, MAKOKO → OKOKAM, OJODU → UDOJO, AWOLOWO → OWOLOWA. The illustration is schematic rather than a geographical map.

## Implementation

`dist/engine.js` is the pure state model. `dist/app.js` renders the UI and handles input. Assets and fonts are local; no external runtime services, analytics or model calls. `dist/index.html` is the entrypoint. Sites provides owner-private access; client code does not attempt to implement access control.

Run `npm test` for full-path simulation checks and DOM-fixture event-handler integration checks. DOM-fixture checks are not visual browser QA. Browser preview was unavailable in the build environment.

## Visual direction

The interface follows the two revised AIREGIN mockups from the project chat, “Airegin: Four-screen urban game UI.png” and “Airegin character, gameplay, crew, and map.png”. It uses their original Nigerian street, character, crew and tactical map artwork, extracted into local WebP assets, with cream, charcoal and orange styling and local condensed display typography.

The World, Crew, District and Journal views all read the same simulation. Crew transmissions are simulated responses to committed decisions; district pins inspect learning, trust, livelihoods and safety. The artwork is a fictional schematic, not a geographical or territorial-control model. Changing views does not change world state. The original browser save key and simulation engine remain compatible.

URW Nimbus and DejaVu font notices are included in `dist/assets/font-licenses.txt`.

## Simulation rules

Each role has a three-choice deck for days 1–2, 3–4 and 5–6. Actions can be repeated within their two-day phase. Delayed effects settle on the next advance, including the final advance to the assembly. Paid commitments cannot exceed the reserve. All indicators and relationships are bounded to 0–100; the reserve is bounded to ₦0–40m. Automatic overnight civic spending is only offered when the reserve can cover it.

After each decision: power below 40 costs 3 livelihoods and 2 learning; safety below 40 costs 3 livelihoods; learning at least 65 adds 2 trust; corruption at least 50 costs 3 trust; teacher and trader alignment each at least 65 adds 2 trust and 2 safety. Alignment measures support for the intervention history across perspectives, not a person-to-person friendship graph.

Assembly score = trust × .30 + power × .25 + livelihoods × .20 + safety × .15 + learning × .10. Score at least 65 earns a mandate, at least 45 earns conditional oversight, below 45 loses support. Corruption affects trust rather than adding a separate score term. These are fictional game rules, not Nigerian civic data.

No real multiplayer, combat, family simulation, full national map, account-specific cloud saves or live data is included in this prototype.
