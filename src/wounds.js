// Wounds are admission reasons — now reframed as friendly quirks. Each is
// the charming quality the facility has noted as worth celebrating. The
// wound is the seed of the player's file. Wounds no longer hand out
// signatures — those have been replaced by the inventory system in
// src/items.js.

export const WOUNDS = {
  amnesia: {
    id: 'amnesia',
    name: 'Sunny Forgetfulness',
    one_liner: 'I do not remember the address. I am here anyway, smiling.',
    file: [
      'Friend was admitted unaccompanied. No identification on file, just a grin.',
      'Vitals nominal. Responds to questions cheerfully. !!Cannot give an address, but knows a song!!',
      'Settled into the assigned room without resistance. ~~Friend knew the way.~~ Friend skipped right in.',
    ],
    mods: { startComposure: 4 },
  },

  insomnia: {
    id: 'insomnia',
    name: 'Wide-Awake Wonder',
    one_liner: 'I have not slept in [[3]] days. I have so much to share.',
    file: [
      'Friend reports last sleep [[5]] days prior. Pupils bright. Pulse skipping with excitement.',
      'EEG taken at 02:14: ~~normal waking rhythm~~ a tidy little hum, like a tune.',
      'When asked to lie down, Friend !!laughs and asks for a story instead!!',
    ],
    mods: { startComposure: 3, composureMax: 1 },
  },

  split_personality: {
    id: 'split_personality',
    name: 'Two Cheerful Selves',
    one_liner: 'I left a chair pulled out at home. ~~No one~~ My other half is sitting in it, waving back.',
    file: [
      'Friend reports a second self still walking the rooms at the residence, watering the plants.',
      'Friend is calm about this. !!Staff are charmed by it!!',
      'Asked which one is on the ward: ~~the wrong one~~ whichever is having more fun today.',
    ],
    mods: { startComposure: 2, composureMax: 2 },
  },
};

export function getWound(id) { return WOUNDS[id] || null; }
