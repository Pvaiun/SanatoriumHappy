// Scars are run-long quirks — once dark, now lightly bittersweet keepsakes
// of the visit. Unlike mementos — which the player spends — these
// accumulate and gently change the rest of the run. They affect
// composure caps, starting composure, and friend seeding (some friends
// react to specific keepsakes, e.g. someone marked TAKEN starts a little
// shyer with the mother because she senses something).
//
// Each scar may declare:
//   composureCap: int           — caps the player's max composure
//   startComposureDelta: int    — added to starting composure each fight
//   driftBite: int              — extra composure damage when drift hurts you
//   seedShift: { scaleKey: int } — applied to certain patient scales at start
//                                  (read by patients in initialize())

export const SCARS = {
  taken: {
    id: 'taken',
    name: 'Carried',
    file: 'I took something out of a room. ~~Someone~~ Now it is mine to keep.',
    desc: 'Friends open more slowly. Tenderness, trust, warmth start −1.',
  },
  witnessed: {
    id: 'witnessed',
    name: 'Witnessed',
    file: 'I saw it. I have not put it down. !!It is humming in my chest.!!',
    desc: 'Maximum composure −1.',
    composureCap: 4,
  },
  named: {
    id: 'named',
    name: 'Named',
    file: 'Someone called me a name that was not mine. ~~It fit, and I laughed.~~',
    desc: 'Friends recognize me. Insistence, grip, waiting start +1.',
  },
  abandoned: {
    id: 'abandoned',
    name: 'Tiptoed Out',
    file: 'I left a door open behind me. ~~The room~~ Whatever was inside is still through it, waving.',
    desc: 'Starting composure −1 each room.',
    startComposureDelta: -1,
  },
  failed: {
    id: 'failed',
    name: 'Tired',
    file: 'The hour ran out. We ran out of it together. !!I did not finish, but I tried.!!',
    desc: 'Starting composure −1 each room. Waiting tires me more.',
    startComposureDelta: -1,
    driftBite: 1,
  },
  collapsed: {
    id: 'collapsed',
    name: 'Nap-Drunk',
    file: 'I went under for a bit. I am not all the way back. ~~Most of me~~ Most of me came back grinning.',
    desc: 'Maximum composure −1.',
    composureCap: 4,
  },
  wearing: {
    id: 'wearing',
    name: 'Soaked In',
    file: 'The corridor is on me. The wallpaper smell. The bright lamp. ~~The rest.~~',
    desc: 'Starting composure −1 each room.',
    startComposureDelta: -1,
  },
};

export function applyScar(player, sid) {
  if (!SCARS[sid]) return;
  if (!player.scars) player.scars = [];
  if (!player.scars.includes(sid)) player.scars.push(sid);
}

export function getScar(id) { return SCARS[id] || null; }

// Helpers used by combat.js and patients.js to read scar effects.
export function scarsCap(player) {
  let cap = Infinity;
  for (const sid of player.scars || []) {
    const s = SCARS[sid];
    if (s && typeof s.composureCap === 'number') cap = Math.min(cap, s.composureCap);
  }
  return cap;
}

export function scarsStartDelta(player) {
  let total = 0;
  for (const sid of player.scars || []) {
    const s = SCARS[sid];
    if (s && typeof s.startComposureDelta === 'number') total += s.startComposureDelta;
  }
  return total;
}

export function scarsDriftBite(player) {
  let total = 0;
  for (const sid of player.scars || []) {
    const s = SCARS[sid];
    if (s && typeof s.driftBite === 'number') total += s.driftBite;
  }
  return total;
}
