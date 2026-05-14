// Wounds are admission reasons — now reframed as the most ECSTATIC quirks
// the staff have ever celebrated. Each is the joyful quality the facility
// has noted as worth throwing a party over. The wound is the seed of the
// player's file. Wounds no longer hand out signatures — those have been
// replaced by the inventory system in src/items.js.

export const WOUNDS = {
  amnesia: {
    id: 'amnesia',
    name: 'Sunny Forgetfulness',
    one_liner: 'I do not remember the address. I am here anyway, grinning so wide my face hurts!',
    file: [
      'Friend was admitted unaccompanied. No identification on file — just a HUGE grin and a wave!',
      'Vitals nominal. Responds to questions cheerfully and at top volume. !!Cannot give an address, but she knows ALL the songs!!',
      'Settled into the assigned room without resistance. ~~Friend knew the way.~~ Friend skipped down the hall whooping!',
    ],
    mods: { startComposure: 4 },
  },

  insomnia: {
    id: 'insomnia',
    name: 'Wide-Awake Wonder',
    one_liner: 'I have not slept in [[3]] days. I have SO MUCH to tell you!',
    file: [
      'Friend reports last sleep [[5]] days prior. Eyes sparkling. Pulse drumming with excitement.',
      'EEG taken at 02:14: ~~normal waking rhythm~~ a peppy little jig, like a parade song.',
      'When asked to lie down, Friend !!cackles, leaps up, and demands another bedtime story!!',
    ],
    mods: { startComposure: 3, composureMax: 1 },
  },

  split_personality: {
    id: 'split_personality',
    name: 'Two Cheerful Selves',
    one_liner: 'I left a chair pulled out at home. ~~No one~~ My other half is sitting in it, WAVING WITH BOTH HANDS!',
    file: [
      'Friend reports a second self still walking the rooms at the residence, watering the plants and humming loudly.',
      'Friend is THRILLED about this. !!Staff are utterly charmed — both selves send cookies!!',
      'Asked which one is on the ward: ~~the wrong one~~ whichever is having the bigger laugh today!',
    ],
    mods: { startComposure: 2, composureMax: 2 },
  },
};

export function getWound(id) { return WOUNDS[id] || null; }
