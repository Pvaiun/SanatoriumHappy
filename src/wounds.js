// Wounds are admission reasons — now reframed as the most DELIRIOUSLY
// JOYFUL quirks the staff have ever held a parade for. Each is a quality
// worth throwing CONFETTI over. The wound is the seed of the player's
// file. Wounds no longer hand out signatures — those have been replaced
// by the inventory system in src/items.js.

export const WOUNDS = {
  amnesia: {
    id: 'amnesia',
    name: 'Sunny Forgetfulness',
    one_liner: 'I do not remember the address. I am here anyway, MOUTH WIDE OPEN, HOWLING with laughter!',
    file: [
      'Friend was admitted unaccompanied. No identification on file — just a HUGE grin, a WHOOP, and a fistful of confetti!',
      'Vitals nominal. Responds to questions with JOKES and SONG at top volume. !!Cannot give an address, but knows EVERY song in the building and the harmony parts!!',
      'Settled into the assigned room without resistance. ~~Friend knew the way.~~ Friend RAN down the hall WHOOPING and arrived BEFORE the orderly!',
    ],
    mods: { startComposure: 4 },
  },

  insomnia: {
    id: 'insomnia',
    name: 'Wide-Awake Wonder',
    one_liner: 'I have not slept in [[3]] days. I have SO MUCH to tell you — pull up a chair!',
    file: [
      'Friend reports last sleep [[5]] days prior. Eyes SPARKLING. Pulse drumming a parade beat.',
      'EEG taken at 02:14: ~~normal waking rhythm~~ a peppy little jig — the technician started DANCING.',
      'When asked to lie down, Friend !!CACKLES, leaps up, and demands seventeen more bedtime stories!!',
    ],
    mods: { startComposure: 3, composureMax: 1 },
  },

  split_personality: {
    id: 'split_personality',
    name: 'Two Cheerful Selves',
    one_liner: 'I left a chair pulled out at home. ~~No one~~ My other half is sitting in it, WAVING WITH BOTH HANDS, MOUTH WIDE OPEN!',
    file: [
      'Friend reports a second self still walking the rooms at the residence, watering the plants and BELTING showtunes.',
      'Friend is THRILLED about this. !!Staff are charmed — both selves send cookies AND duet at parties!!',
      'Asked which one is on the ward: ~~the wrong one~~ whichever is having the BIGGER laugh today!',
    ],
    mods: { startComposure: 2, composureMax: 2 },
  },
};

export function getWound(id) { return WOUNDS[id] || null; }
