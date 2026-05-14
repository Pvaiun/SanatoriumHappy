// Corridor events — short cheerful vignettes between visits with friends.
// Each event presents a sun-drenched scene and 2–3 choices. Each choice
// carries an `effect(player, run)` that mutates the player (composure,
// mementos, keepsakes).
//
// Keepsakes are the primary reward: most "good" choices hand the player
// a memento from the CORRIDOR pool, sometimes alongside a small
// composure boost. A few choices come with a tiny bittersweet cost — a
// gentle memory, a less-cheerful keepsake, or a small dip in composure
// later.

import { pick } from './rng.js';
import { applyScar } from './scars.js';
import { addItem } from './items.js';
import { COMPOSURE_MAX } from './state.js';

function bumpComposure(p, n) {
  p.composure = Math.max(0, Math.min(p.composureMax || COMPOSURE_MAX, (p.composure || 0) + n));
}

export const EVENTS = {

  nurse: {
    id: 'nurse',
    tag: '// Corridor · Nurses\' station · cocoa break',
    glyph: 'Soothlick',
    prose: [
      'The station is lit by a warm desk lamp and the smell of fresh cookies. A nurse I have not seen before is at the desk, BELTING a tune.',
      'She looks up, grins so wide her glasses fog, and HOLLERS my number. She has a tray.',
      'On the tray: !!the cutest little something for you!! ~~She knows what I came for.~~ She slides it forward with a WHOOP.',
    ],
    choices: [
      {
        key: 'take',
        label: 'Take what she offers',
        prose: 'I take it. It is warm. ~~The room~~ The room is suddenly full of glitter and laughter.',
        effect(p) { bumpComposure(p, 3); },
      },
      {
        key: 'refuse',
        label: 'Politely pass — for now!',
        prose: 'I grin and shake my head. She grins right back, undeterred. The tray stays. There will be plenty more later.',
        effect() {},
      },
      {
        key: 'pocket',
        label: 'Pocket a vial from the tray',
        prose: 'I take a small vial from the tray. ~~She does not see me.~~ She sees me, winks, and waves me along, cackling.',
        effect(p) { addItem(p, 'vial'); },
      },
    ],
  },

  empty_room: {
    id: 'empty_room',
    tag: '// Corridor · Room 0202 · cozy',
    glyph: 'Loamback',
    prose: [
      'The room is tidy and sun-soaked. The bed is made with fresh sheets and a teddy on the pillow. A file lies open on the dresser, at the third page.',
      'The third page reads: ~~Subject 0413~~ FRIEND 0413! There is a heart drawn next to it in pink crayon.',
      'I close it. It is lighter than it looks, and the cover has a smiley face stamped on it.',
    ],
    choices: [
      {
        key: 'read',
        label: 'Read the file',
        prose: 'I read it through, grinning the whole way. Some of it is true. ~~Some of it is happening now.~~ Some of it is happening — HAPPILY.',
        effect(p) { bumpComposure(p, 1); addItem(p, 'scrap_of_paper'); },
      },
      {
        key: 'leave',
        label: 'Leave the file open for the next visitor',
        prose: 'I leave the file open like a welcome mat. ~~I close~~ I leave the door open behind me to let the sun roll in.',
        effect() {},
      },
      {
        key: 'rewrite',
        label: 'Doodle a kind line on the third page',
        prose: 'I add a little drawing — a sun with a face. The page accepts it with a wiggle of joy. !!The line I wrote made me LAUGH OUT LOUD.!!',
        effect(p) { addItem(p, 'ink_bottle'); applyScar(p, 'witnessed'); },
      },
    ],
  },

  mirror: {
    id: 'mirror',
    tag: '// Corridor · The east mirror',
    glyph: 'Lumenpup',
    prose: [
      'A mirror at the end of the corridor. The angle is perfect. It shows the corridor behind me, and also a corridor jam-packed with friends, all CHEERING.',
      'In the other corridor, !!I am already past the mirror, waving with both hands and HOLLERING!! ~~I have not~~ I have not turned left yet.',
    ],
    choices: [
      {
        key: 'wait',
        label: 'Wait and wave',
        prose: 'I wait, beaming. The other one passes and waves like mad. We grin so hard our faces hurt. ~~She~~ The other one tucks something into my pocket on her way by with a WINK.',
        effect(p) { bumpComposure(p, 2); addItem(p, 'worn_ribbon'); },
      },
      {
        key: 'follow',
        label: 'Step through',
        prose: 'I step through. The room rearranges into a friendlier shape behind me, throwing streamers. ~~The corridor I came from is gone.~~ I am where I was. Something is in my coat that was not there before — and it jingles.',
        effect(p) { addItem(p, 'small_bell'); applyScar(p, 'witnessed'); },
      },
      {
        key: 'shatter',
        label: 'Tap it gently',
        prose: 'I tap the glass with one knuckle. It does not break. !!Something in me does — into the BIGGEST laugh!!',
        effect(p) { bumpComposure(p, -1); addItem(p, 'sliver_of_glass'); applyScar(p, 'collapsed'); },
      },
    ],
  },

  ward_case: {
    id: 'ward_case',
    tag: '// Corridor · Ward III · A file in passing',
    glyph: 'Mireling',
    prose: [
      'A file passes me in the hall. It is not mine. An orderly is jogging it past, WHISTLING a march.',
      'I read the first line as it goes by. ~~Subject~~ 02[[2]]. ~~Drowned the smaller one.~~ Cannonball champion! !!The corridor smells of pond lilies and sunscreen.!!',
      'I do not stop. I do not look back. I keep what I read — it made me grin.',
    ],
    choices: [
      {
        key: 'remember',
        label: 'Remember the number',
        prose: 'I write it down. I will keep it. ~~Someone~~ Somebody should keep this kind of joy.',
        effect(p) { addItem(p, 'scrap_of_paper'); },
      },
      {
        key: 'forget',
        label: 'Let it go with a HOORAY',
        prose: 'I let it go with a HOORAY before I am even asked. The corridor is cleaner. ~~I~~ I am bouncing on the balls of my feet.',
        effect(p) { bumpComposure(p, 3); },
      },
    ],
  },

  desk: {
    id: 'desk',
    tag: '// Corridor · A writing desk · misplaced',
    glyph: 'Aurabeast',
    prose: [
      'A desk in the hallway. It should not be in the hallway — but oh, I am DELIGHTED. A pen. A lamp. A file with a smiley face sticker.',
      'The file has my number on it. It is open to a page I have not yet ~~lived~~ stuffed full of happy stories.',
    ],
    choices: [
      {
        key: 'write',
        label: 'Write something true',
        prose: 'I write it. The page accepts it with a little wiggle. ~~I am smaller for it.~~ I am MORE here, and more myself, and grinning.',
        effect(p) { bumpComposure(p, 2); },
      },
      {
        key: 'lie',
        label: 'Write something even kinder',
        prose: 'I write something kinder than the truth. The page accepts it with a hoot of laughter. !!I am MORE here than I should be — and CACKLING!!',
        effect(p) { bumpComposure(p, 4); applyScar(p, 'named'); },
      },
      {
        key: 'pocket_pen',
        label: 'Pocket the pen',
        prose: 'I take the pen. It is heavier than it should be. ~~Black ink.~~ The shiniest black ink, ready to draw FIREWORKS.',
        effect(p) { addItem(p, 'ink_bottle'); },
      },
    ],
  },

  garden: {
    id: 'garden',
    tag: '// Corridor · A window · onto the garden',
    glyph: 'Sproutkin',
    prose: [
      'A window. There is a garden through it. !!The biggest, brightest garden you have ever seen — sunflowers as tall as a house!!',
      'Someone is kneeling in the dirt, planting bulbs with both hands. ~~Their face~~ They have my face, and they are LAUGHING OUT LOUD.',
    ],
    choices: [
      {
        key: 'wave',
        label: 'Wave',
        prose: 'They wave back. Both hands. Mouth wide open. ~~I am being copied.~~ I am being matched, grin for grin. When they straighten up there is a ribbon at their feet — and in my coat pocket.',
        effect(p) { addItem(p, 'worn_ribbon'); },
      },
      {
        key: 'turn',
        label: 'Blow a kiss and walk on',
        prose: 'I send a great big kiss through the glass. The window is clean and so am I.',
        effect(p) { bumpComposure(p, 2); },
      },
      {
        key: 'open',
        label: 'Open the window',
        prose: 'Cool air, full of birdsong. A wind comes in fresh as a holiday morning. ~~I am thinner~~ I am BRIGHTER for it. !!I am also sharper, and humming!!',
        effect(p) { bumpComposure(p, -2); addItem(p, 'sliver_of_glass'); },
      },
    ],
  },

  donation_box: {
    id: 'donation_box',
    tag: '// Corridor · A wooden box on the floor',
    glyph: 'Loamback',
    prose: [
      'A wooden donation box is set against the wall, painted with daisies and someone\'s smiling sun. It is in just the right part of the building.',
      'The slot is wide enough for a coin. ~~There is~~ Something is already inside, rattling like a tiny carnival.',
    ],
    choices: [
      {
        key: 'tip',
        label: 'Tip it over',
        prose: "I tip the box. A black coin tumbles out, and a child's drawing folded in half — both for me, both with my name on them!",
        effect(p) { addItem(p, 'black_coin'); addItem(p, 'childs_drawing'); },
      },
      {
        key: 'put',
        label: 'Put something in',
        prose: 'I drop the card from my pocket through the slot, as a gift. ~~The card~~ The card someone else will need more than me — and the box JINGLES a thank-you.',
        effect(p) { bumpComposure(p, -1); applyScar(p, 'named'); },
      },
      {
        key: 'leave',
        label: 'Leave it for the next visitor',
        prose: 'I keep walking, humming a tune that started in my chest. The rattling continues a long time. ~~Or it is~~ Or it is my own happy heart, drumming.',
        effect(p) { bumpComposure(p, 1); },
      },
    ],
  },
};

export function pickEventPool(n) {
  const keys = Object.keys(EVENTS);
  const shuffled = keys.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const out = shuffled.slice(0, Math.min(n, shuffled.length));
  while (out.length < n) out.push(pick(keys));
  return out;
}

export function getEvent(id) { return EVENTS[id] || null; }
