// Corridor events — short cheerful vignettes between visits with friends.
// Each event presents a sunny scene and 2–3 choices. Each choice carries
// an `effect(player, run)` that mutates the player (composure, mementos,
// keepsakes).
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
      'The station is lit by a warm desk lamp. A nurse I have not seen before is at the desk, humming.',
      'She looks up and beams. She says my number in a voice that is mostly singing. She has a tray.',
      'On the tray: !!a little something for you.!! ~~She knows what I came for.~~ She slides it forward, grinning.',
    ],
    choices: [
      {
        key: 'take',
        label: 'Take what she offers',
        prose: 'I take it. It is warm. ~~The room~~ The room sparkles for a moment.',
        effect(p) { bumpComposure(p, 3); },
      },
      {
        key: 'refuse',
        label: 'Politely pass',
        prose: 'I smile and shake my head. She smiles back. The tray stays. There will be more later.',
        effect() {},
      },
      {
        key: 'pocket',
        label: 'Pocket a vial from the tray',
        prose: 'I take a small vial from the tray. ~~She does not see me.~~ She sees me, and gives me a wink.',
        effect(p) { addItem(p, 'vial'); },
      },
    ],
  },

  empty_room: {
    id: 'empty_room',
    tag: '// Corridor · Room 0202 · cozy',
    glyph: 'Loamback',
    prose: [
      'The room is tidy. The bed is made with fresh sheets. A file lies open on the dresser, at the third page.',
      'The third page reads: ~~Subject 0413~~ Friend 0413. There is a heart drawn next to it.',
      'I close it. It is lighter than it looks.',
    ],
    choices: [
      {
        key: 'read',
        label: 'Read the file',
        prose: 'I read it through. Some of it is true. ~~Some of it is happening now.~~ Some of it is happening, happily.',
        effect(p) { bumpComposure(p, 1); addItem(p, 'scrap_of_paper'); },
      },
      {
        key: 'leave',
        label: 'Leave the file',
        prose: 'I leave the file open for the next visitor. ~~I close~~ I leave the door open behind me to let the sun in.',
        effect() {},
      },
      {
        key: 'rewrite',
        label: 'Add a kind line on the third page',
        prose: 'I add a little note. The page accepts it cheerfully. !!The line I wrote made me grin.!!',
        effect(p) { addItem(p, 'ink_bottle'); applyScar(p, 'witnessed'); },
      },
    ],
  },

  mirror: {
    id: 'mirror',
    tag: '// Corridor · The east mirror',
    glyph: 'Lumenpup',
    prose: [
      'A mirror at the end of the corridor. The angle is perfect. It shows the corridor behind me, and also a corridor full of friends.',
      'In the other corridor, !!I am already past the mirror, waving.!! ~~I have not~~ I have not turned left yet.',
    ],
    choices: [
      {
        key: 'wait',
        label: 'Wait and wave',
        prose: 'I wait. The other one passes and waves. We grin at each other. ~~She~~ The other one tucks something into my pocket on her way by.',
        effect(p) { bumpComposure(p, 2); addItem(p, 'worn_ribbon'); },
      },
      {
        key: 'follow',
        label: 'Step through',
        prose: 'I step through. The room rearranges into a friendlier shape behind me. ~~The corridor I came from is gone.~~ I am where I was. Something is in my coat that was not there before.',
        effect(p) { addItem(p, 'small_bell'); applyScar(p, 'witnessed'); },
      },
      {
        key: 'shatter',
        label: 'Tap it gently',
        prose: 'I tap the glass with one knuckle. It does not break. !!Something in me does — into a laugh.!!',
        effect(p) { bumpComposure(p, -1); addItem(p, 'sliver_of_glass'); applyScar(p, 'collapsed'); },
      },
    ],
  },

  ward_case: {
    id: 'ward_case',
    tag: '// Corridor · Ward III · A file in passing',
    glyph: 'Mireling',
    prose: [
      'A file passes me in the hall. It is not mine. An orderly is carrying it briskly, whistling.',
      'I read the first line as it goes by. ~~Subject~~ 02[[2]]. ~~Drowned the smaller one.~~ Loves the new pond. !!The corridor smells of pond lilies.!!',
      'I do not stop. I do not look back. I keep what I read. It was nice.',
    ],
    choices: [
      {
        key: 'remember',
        label: 'Remember the number',
        prose: 'I write it down. I will keep it. ~~Someone~~ Someone should remember her.',
        effect(p) { addItem(p, 'scrap_of_paper'); },
      },
      {
        key: 'forget',
        label: 'Let it go with a smile',
        prose: 'I let it go before I am asked to. The corridor is cleaner. ~~I~~ I am lighter for it.',
        effect(p) { bumpComposure(p, 3); },
      },
    ],
  },

  desk: {
    id: 'desk',
    tag: '// Corridor · A writing desk · misplaced',
    glyph: 'Aurabeast',
    prose: [
      'A desk in the hallway. It should not be in the hallway, but I am glad to see it. A pen. A lamp. A file.',
      'The file has my number on it. It is open to a page I have not yet ~~lived~~ filled with stories.',
    ],
    choices: [
      {
        key: 'write',
        label: 'Write something true',
        prose: 'I write it. The page accepts it. ~~I am smaller for it.~~ I am more here, and more myself.',
        effect(p) { bumpComposure(p, 2); },
      },
      {
        key: 'lie',
        label: 'Write something even kinder',
        prose: 'I write something kinder than the truth. The page accepts it gladly. !!I am more here than I should be — and grinning.!!',
        effect(p) { bumpComposure(p, 4); applyScar(p, 'named'); },
      },
      {
        key: 'pocket_pen',
        label: 'Pocket the pen',
        prose: 'I take the pen. It is heavier than it should be. ~~Black ink.~~ Bright black ink, ready to draw.',
        effect(p) { addItem(p, 'ink_bottle'); },
      },
    ],
  },

  garden: {
    id: 'garden',
    tag: '// Corridor · A window · onto the garden',
    glyph: 'Sproutkin',
    prose: [
      'A window. There is a garden through it. !!There is a brand-new garden on the grounds!!',
      'Someone is kneeling in the dirt, planting bulbs. ~~Their face~~ They have my face, and they are smiling.',
    ],
    choices: [
      {
        key: 'wave',
        label: 'Wave',
        prose: 'They wave back. Exactly. ~~I am being copied.~~ I am being matched. When they straighten, there is a ribbon at their feet. And in my coat pocket.',
        effect(p) { addItem(p, 'worn_ribbon'); },
      },
      {
        key: 'turn',
        label: 'Wave and walk on',
        prose: 'I send a kiss through the window. The window is clean.',
        effect(p) { bumpComposure(p, 2); },
      },
      {
        key: 'open',
        label: 'Open the window',
        prose: 'Cool air. A wind comes in from outside, fresh as a Sunday. ~~I am thinner~~ I am brighter for it. !!I am also sharper.!!',
        effect(p) { bumpComposure(p, -2); addItem(p, 'sliver_of_glass'); },
      },
    ],
  },

  donation_box: {
    id: 'donation_box',
    tag: '// Corridor · A wooden box on the floor',
    glyph: 'Loamback',
    prose: [
      'A wooden donation box is set against the wall, painted with flowers. It is in just the right part of the building.',
      'The slot is wide enough for a coin. ~~There is~~ Something is already inside, rattling cheerfully.',
    ],
    choices: [
      {
        key: 'tip',
        label: 'Tip it over',
        prose: "I tip the box. A black coin falls out, and a child's drawing folded in half — both for me.",
        effect(p) { addItem(p, 'black_coin'); addItem(p, 'childs_drawing'); },
      },
      {
        key: 'put',
        label: 'Put something in',
        prose: 'I drop the card from my pocket through the slot, as a gift. ~~The card~~ The card someone else will need more than me.',
        effect(p) { bumpComposure(p, -1); applyScar(p, 'named'); },
      },
      {
        key: 'leave',
        label: 'Leave it for the next visitor',
        prose: 'I keep walking, humming. The rattling continues a long time. ~~Or it is~~ Or it is my own happy heart.',
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
