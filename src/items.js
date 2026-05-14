// Mementos are one-use objects carried through a run. Each lives in the
// player's pocket until it's used; using it consumes it. The action menu
// surfaces only mementos whose `when(patient, player)` predicate is true
// (verbs whose when is missing are always usable).
//
// Some help. Some tickle. Some do both. The player picks one at admission
// and gains more from corridor events and resolutions.
//
// Memento shape:
//   id, name, file (short prose), desc (mechanical), voice (line spoken at pickup)
//   when?(patient, player): bool
//   respond(patient, player): Response   — same shape as a verb response
//
// Mementos can read patient.def.scales to behave differently across friends.
// They can author composureCost on negative composure, just like verbs.

export const ITEMS = {

  photograph: {
    id: 'photograph',
    name: 'a photograph',
    file: 'Creased twice. Two figures, both grinning. ~~The smaller one~~ has been folded out of frame on purpose, for a game.',
    desc: 'Show it. For friends who would love to be recognized.',
    voice: 'A photograph. I do not remember keeping it.',
    when: (p) => p.def.scales?.recognition !== undefined,
    respond(p) {
      const shifts = { recognition: +3 };
      if (p.def.scales?.grief !== undefined) shifts.grief = +1;
      return {
        lines: [
          'I take it from my pocket. I hold it up to her.',
          'She lifts it carefully. She does not give it back.',
          '~~She knows the smaller one.~~ She names the smaller one and laughs.',
        ],
        scales: shifts,
      };
    },
  },

  sugar_cube: {
    id: 'sugar_cube',
    name: 'a sugar cube',
    file: 'Wax paper, slightly damp. The pocket I took it from ~~was cold~~ was a friend\'s.',
    desc: 'Eat it. Restore composure.',
    voice: 'A sugar cube. I had it. I did not pack it.',
    respond() {
      return {
        lines: [
          'I unwrap it. I set it on my tongue.',
          'The room ~~stops humming~~ hums along, sweetly.',
        ],
        composure: +2,
      };
    },
  },

  handkerchief: {
    id: 'handkerchief',
    name: 'a folded handkerchief',
    file: 'Pressed. An initial stitched in the corner — ~~not mine.~~ Bears the laundry stamp of Ward [[2]].',
    desc: 'Offer it. Calms a fidgety friend. Costs a little.',
    voice: 'A handkerchief. ~~Clean.~~ Laundered, smelling of soap.',
    when: (p) => {
      const s = p.def.scales || {};
      return s.panic !== undefined || s.agitation !== undefined
          || s.cold !== undefined || s.tension !== undefined;
    },
    respond(p) {
      const s = p.def.scales || {};
      const shifts = {};
      if (s.panic !== undefined)     shifts.panic = -3;
      if (s.agitation !== undefined) shifts.agitation = -3;
      if (s.cold !== undefined)      shifts.cold = -2;
      if (s.tension !== undefined)   shifts.tension = -2;
      return {
        lines: [
          'I unfold it. I offer it.',
          'She takes it. She folds it once more. She puts it in her own pocket with a happy little nod.',
        ],
        scales: shifts,
        composure: -1,
        composureCost: 'I gave away the only soft thing I came in with — but she beamed.',
      };
    },
  },

  childs_drawing: {
    id: 'childs_drawing',
    name: "a child's drawing",
    file: 'Crayon. Folded twice. Two figures, the smaller leaning into the taller, both grinning. ~~My signature~~ A name at the bottom in careful letters. A name that fits.',
    desc: 'Show it. For friends carrying tenderness or fond memory.',
    voice: 'A drawing. ~~A child gave it to me.~~ I have a feeling I do.',
    when: (p) => {
      const s = p.def.scales || {};
      return s.tenderness !== undefined || s.grief !== undefined || s.release !== undefined;
    },
    respond(p) {
      const s = p.def.scales || {};
      const shifts = {};
      if (s.tenderness !== undefined) shifts.tenderness = +3;
      if (s.grief !== undefined)      shifts.grief = +2;
      if (s.release !== undefined)    shifts.release = +2;
      return {
        lines: [
          'I unfold it. I hold it up.',
          'Her face changes. She reaches a hand toward it, slowly.',
          '!!She has not let herself look at one in a long, sweet while.!!',
        ],
        scales: shifts,
        composure: -1,
        composureCost: '~~Someone gave me this.~~ I do not remember where I got it, but it was a kindness.',
      };
    },
  },

  pocket_watch: {
    id: 'pocket_watch',
    name: 'a pocket watch',
    file: 'Silver. Stopped at !!03:17.!! The minute hand resumes when held, ticking happily.',
    desc: "Wind it. Resets the friend's biggest snag.",
    voice: 'A watch. ~~It has stopped.~~ It was waiting for me to wind it.',
    respond(p) {
      // find the scale that is most off in a bad direction. for negative
      // scales: highest value is worst. for positive: lowest is worst.
      let worstKey = null;
      let worstHowBad = -1;
      for (const [k, def] of Object.entries(p.def.scales || {})) {
        const v = p.scales[k] ?? 0;
        const max = def.max ?? 10;
        const howBad = def.kind === 'positive' ? (max - v) : v;
        if (howBad > worstHowBad) { worstHowBad = howBad; worstKey = k; }
      }
      const shifts = {};
      if (worstKey) {
        const def = p.def.scales[worstKey];
        const current = p.scales[worstKey];
        const target = def.kind === 'positive' ? Math.max(5, current + 4) : Math.min(3, current - 4);
        shifts[worstKey] = target - current;
      }
      return {
        lines: [
          'I take it from my pocket. I wind the stem.',
          'The mechanism resumes. The room settles into a brighter hum.',
          '~~Something has been put back.~~ Something has been put back, and it is ticking along happily.',
        ],
        scales: shifts,
      };
    },
  },

  the_card: {
    id: 'the_card',
    name: 'the admission card',
    file: 'Friend 0413. Creased. ~~The number has been written over another.~~ !!I have been holding it like a ticket.!!',
    desc: 'Name yourself. Restore composure.',
    voice: 'The card. ~~I am~~ I have been 0413, and I am proud of it.',
    respond(p) {
      const shifts = {};
      if (p.def.scales?.self !== undefined)        shifts.self = +3;
      if (p.def.scales?.recognition !== undefined) shifts.recognition = +2;
      return {
        lines: [
          'I take it out. I read my number off it. !!Friend 0413.!!',
          'I am here. I am the one who came in, and I am glad.',
        ],
        composure: +2,
        scales: shifts,
      };
    },
  },

  worn_ribbon: {
    id: 'worn_ribbon',
    name: 'a worn ribbon',
    file: 'Red. Tied and untied many times. ~~Once~~ The shape of what it was tied around is still in it, fondly.',
    desc: 'Give it. Soft memory. For tender friends.',
    voice: 'A ribbon. ~~Someone~~ Someone wore it, happily.',
    when: (p) => {
      const s = p.def.scales || {};
      return s.tenderness !== undefined || s.recognition !== undefined
          || s.warmth !== undefined || s.trust !== undefined;
    },
    respond(p) {
      const s = p.def.scales || {};
      const shifts = {};
      if (s.tenderness !== undefined)  shifts.tenderness = +2;
      if (s.recognition !== undefined) shifts.recognition = +2;
      if (s.warmth !== undefined)      shifts.warmth = +2;
      if (s.trust !== undefined)       shifts.trust = +2;
      return {
        lines: [
          'I take it out. She sees it before I have lifted it all the way and lights up.',
          'She lets me lay it across her knee. She gives my hand a pat.',
        ],
        scales: shifts,
      };
    },
  },

  scrap_of_paper: {
    id: 'scrap_of_paper',
    name: 'a scrap of paper',
    file: 'Torn from something larger. A name in handwriting. ~~Mine.~~ A name worth saying.',
    desc: 'Read what is on it. The outcome is uncertain — but usually nice.',
    voice: 'A scrap. With a name on it. ~~I did not write it.~~',
    respond(p) {
      // random behavior — sometimes a name lands, sometimes nothing
      const roll = Math.random();
      if (roll < 0.5 && p.def.scales?.recognition !== undefined) {
        return {
          lines: [
            'I read the name. It is one I had not been carrying on purpose.',
            'She looks up. She half-knows it, and her face brightens.',
          ],
          scales: { recognition: +3 },
        };
      }
      if (roll < 0.8) {
        return {
          lines: [
            'I read the name. She does not answer to it, but she grins anyway.',
            'I put the scrap back. ~~It was not a name.~~ It may have been a song lyric.',
          ],
          composure: -1,
          composureCost: 'The name was for someone else. ~~Someone I.~~ I do not remember, and that is alright.',
        };
      }
      // rare — a little surprising
      return {
        lines: [
          'I read the name. It is mine.',
          '!!I did not write it.!! Someone wrote it down for me. ~~Recently.~~ As a love note.',
        ],
        composure: -2,
        composureCost: '!!Someone has been writing my name in places I have not been — fondly.!!',
        scars: ['named'],
      };
    },
  },

  black_coin: {
    id: 'black_coin',
    name: 'a black coin',
    file: 'Thumbnail-sized. ~~Does not catch light.~~ Catches it shyly. Warm in pocket. Cool in palm.',
    desc: 'Pay it. Costs me a little. Shifts something stuck.',
    voice: 'A coin. ~~The weight is wrong.~~ The weight is just so.',
    respond(p) {
      // shifts every negative scale down by 2 (good), at a composure cost.
      const shifts = {};
      for (const [k, def] of Object.entries(p.def.scales || {})) {
        if (def.kind === 'negative') shifts[k] = -2;
      }
      return {
        lines: [
          'I take it out. I set it on the floor between us, like an offering.',
          'The room settles. ~~Something has been paid for.~~ Something has been paid for, with thanks.',
        ],
        scales: shifts,
        composure: -2,
        composureCost: '!!The coin was warm. It is now in safer hands.!!',
      };
    },
  },

  vial: {
    id: 'vial',
    name: 'a small vial',
    file: 'Glass. ~~Half empty.~~ Half full. No label. The fluid catches the light prettily.',
    desc: 'Drink it. Calms me. May also make me dreamy.',
    voice: 'A vial. ~~A nurse~~ Someone gave it to me. For the journey.',
    respond(p) {
      const shifts = {};
      if (p.def.scales?.tending !== undefined)   shifts.tending = +2;
      if (p.def.scales?.insistence !== undefined) shifts.insistence = +1;
      return {
        lines: [
          'I open it. I drink half.',
          'The room is suddenly very soft. ~~My edges are gone.~~ My edges are gone. !!I am still here, smiling.!!',
        ],
        composure: +2,
        scales: shifts,
        playerEffects: p.def.scales?.tending !== undefined ? { drowsing: +2 } : {},
      };
    },
  },

  sliver_of_glass: {
    id: 'sliver_of_glass',
    name: 'a sliver of glass',
    file: 'From a mirror in the east corridor. Smooth. ~~Clean.~~ Clean of fingerprints, like a charm.',
    desc: 'Hold it. Costs composure. Wards off the next bump.',
    voice: 'A sliver. ~~I will not need this.~~ I will hold it anyway.',
    respond() {
      return {
        lines: [
          'I press my thumb against the edge. Just enough to feel it.',
          '!!The pinch is small but it is the loudest thing in the room.!!',
          '~~I am awake.~~ I am awake, and tingling.',
        ],
        composure: -2,
        composureCost: '~~A little blood.~~ A little nick. It keeps me here.',
        flags: { glass_clutched: true },
      };
    },
  },

  ink_bottle: {
    id: 'ink_bottle',
    name: 'a bottle of ink',
    file: 'Black. Half spilled. The cap is gone. ~~Names~~ Kind words appear where the spill dries.',
    desc: "Write on the wall. Uncovers her file in full. Costs a bit.",
    voice: 'Ink. ~~Black.~~ Cool and gleaming.',
    respond(p) {
      // reveal all file lines
      return {
        lines: [
          'I unstop it. I write what I have been told on the wall behind her.',
          '~~I write~~ I write what I remember. The rest fills itself in, in friendly script.',
          '!!The file is open in front of me. All of it, smiling back.!!',
        ],
        composure: -2,
        composureCost: '~~The ink does not dry.~~ The ink does not dry. The room is keeping it shiny.',
        flags: { _revealAllFile: true },
      };
    },
  },

  small_bell: {
    id: 'small_bell',
    name: 'a small bell',
    file: 'Brass. One note. ~~The note is somewhere in the building already.~~ It is the breakfast bell.',
    desc: 'Ring it once. Wakes friends who have drifted off elsewhere.',
    voice: 'A bell. ~~The sound is the same as the corridor.~~ The sound is a welcome.',
    respond(p) {
      const shifts = {};
      if (p.def.scales?.sight !== undefined)       shifts.sight = +3;
      if (p.def.scales?.lucidity !== undefined)    shifts.lucidity = +3;
      if (p.def.scales?.recognition !== undefined) shifts.recognition = +2;
      if (p.def.scales?.chord !== undefined)       shifts.chord = -3;
      if (p.def.scales?.tending !== undefined)     shifts.tending = -2;
      return {
        lines: [
          'I ring it. Once. It is brighter than the room.',
          'She stops what she is doing. She is here. ~~Partly.~~ Mostly, and grinning.',
        ],
        scales: shifts,
      };
    },
  },
};

export function getItem(id) { return ITEMS[id] || null; }

export function addItem(player, id) {
  if (!ITEMS[id]) return false;
  if (!player.items) player.items = [];
  if (player.items.length >= 8) return false;
  player.items.push(id);
  return true;
}

export function removeItem(player, id) {
  if (!player.items) return;
  const i = player.items.indexOf(id);
  if (i >= 0) player.items.splice(i, 1);
}

// the items the player chooses between at admission.
export const STARTING_ITEMS = [
  'photograph',
  'the_card',
  'handkerchief',
  'pocket_watch',
];

// items the corridor can hand out mid-run.
export const CORRIDOR_ITEMS = [
  'worn_ribbon',
  'scrap_of_paper',
  'black_coin',
  'vial',
  'sliver_of_glass',
  'ink_bottle',
  'small_bell',
  'childs_drawing',
];
