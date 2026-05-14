// Each patient is a hand-authored conversation. They expose:
//
//   scales: {
//     key: {
//       initial, min, max, label, kind: 'positive'|'negative',
//       bands: [{ at, word, tone? }, ...],         // threshold descriptors
//       crossUp:   { [bandIdx]: 'message' },       // crossed UP into band
//       crossDown: { [bandIdx]: 'message' },       // crossed DOWN into band
//     }
//   }
//   initialize(patient, player)        — set scale starting values (with RNG)
//   presented(patient): string         — composed sentence read each turn
//   fileReveals: [
//     { at?: number, announce?: 'string' }, // sequential — array index is the file-line
//     ...                                   // `at` is cumulative scale movement; defaults to [7, 20, 35]
//   ]
//   verbs: {
//     [verbId]: {
//       label, desc,
//       when?(patient, player): bool   — contextual gating (be strict; the
//                                        menu should hold 3–4 things at once)
//       respond(patient, player): Response
//     }
//   }
//   wait?:  { label?, desc?, when(p, player): bool, respond?(p, player) }
//   leave?: { label?, desc?, when(p, player): bool, respond?(p, player) }
//   interjections: [
//     { id, when, once?, prose: [...], responses: [{ label, lines, scales, composure, scars, ... }] }
//   ]
//   drift(patient, player): Response   — fallback for WAIT
//   endings: [{ id, when, title, lines, item?, scars? }]
//
// Response shape: { lines: string[]|string, scales: {key: delta},
// composure: int, scars: string[], flags: {key: bool}, ... }
//
// Authored prose should NOT include trailing parenthetical "(scale rises.)"
// lines. The engine emits a single threshold-cross sentence after the
// response — pulled from the scale's crossUp / crossDown messages — only
// when a scale moves into a new named band. This makes feedback feel like
// a continuation of the narrative, not a stat panel.

import { randi, pick } from './rng.js';

function r(min, max) { return randi(min, max); }
function streakCount(p, verbId) { return p.flags.lastVerb === verbId ? (p.flags.streak || 1) : 0; }


// ════════════════════════════════════════════════════════════════════════
// THE PRAM — Patient 0028
// ════════════════════════════════════════════════════════════════════════
//
// A young woman whose son died at delivery. She refuses to accept it. She
// arrived at the ward with a pram and a bundle of rags she insists is the
// infant. She rocks him, sings him a five-note lullaby, and has a exuberant
// fit when anyone questions the bundle. Three paths:
//   - Indulge: sing along, agree he is sleeping; she keeps the delusion.
//   - Confront: name the death gently; if she can bear it, she grieves;
//     if pushed too hard, she goes into a fit.
//   - Take the bundle: lower her grip and lift it out of her hands.
//     She lets go. She is free of it.

const pram = {
  id: 'pram',
  name: '[The Pram]',
  glyph: 'Emberkin',
  subtitle: 'She is rocking the pram and **HOWLING** with laughter, !!MOUTH WIDE OPEN!! — the chair is SHAKING, the windows are RATTLING, her jaw is on the FLOOR and her **teeth are showing**!',
  role: 'wing', tier: 1,
  file: [
    'Friend was admitted with a perambulator. ~~The perambulator is empty.~~ Friend reports a **SQUEALING** baby inside drumming his feet like a tiny stampede — !!and Friend is CACKLING with him, mouth flung WIDE OPEN!!',
    'Her son ~~died in delivery~~ is at grandma\'s for the weekend, !!eating CAKE on [[8]] and SHRIEKING with laughter!! — Friend WHOOPS so loud the orderlies come running, **grinning ear to ear**, jaws on the FLOOR!',
    'Staff are instructed ~~not to inform her~~ to **HARMONIZE LOUDLY** with the lullaby — bring an air-horn, bring a kazoo, bring a marching band. !!Friend BELTS every chorus like a stadium anthem, mouth as wide as a barn door, teeth showing all the way back!!',
  ],
  intro: [
    'She is on the chair by the window with the pram between her knees, !!MOUTH WIDE OPEN!! in the **biggest** grin a human face can hold — teeth showing, jaw on the FLOOR, eyes squeezed into joy-creases.',
    'She is rocking the pram fast — almost off the floor — and **BELTING** the lullaby like a stadium anthem, lips peeled back in pure delight!',
    'She looks up and !!SHRIEKS!! a hello so joyful the lamp jumps off the table and the lightbulb HOOTS along — she is BELLY-LAUGHING tears, her whole face thrown wide, **GRINNING ear to ear**!',
  ],

  scales: {
    lucidity: {
      initial: 0, min: 0, max: 10, label: 'sparkle', kind: 'positive',
      bands: [
        { at: 0, word: 'somewhere SUNNY' },
        { at: 2, word: 'beaming through a haze' },
        { at: 5, word: 'eyes lighting up' },
        { at: 7, word: 'GRINNING right at me' },
        { at: 9, word: 'all the way here, BEAMING' },
      ],
      crossUp: {
        2: 'Her eyes have come up off the blanket — !!and SPARKLING!!',
        3: 'She is in the room with me, GRINNING ear to ear.',
        4: '!!She has remembered where she is — and her mouth flies even WIDER!!',
      },
      crossDown: {
        1: 'She has slipped back into her SUNNY daydream, **still beaming**.',
        0: 'Her eyes are off in some golden field, mouth wide open in a private joke.',
      },
    },
    grip: {
      initial: 7, min: 0, max: 10, label: 'snug hug', kind: 'negative',
      bands: [
        { at: 0, word: 'hands FLUNG OPEN in joy' },
        { at: 3, word: 'patting the handle' },
        { at: 5, word: 'happy squeeze' },
        { at: 7, word: 'BEAR-HUGGING the handle' },
        { at: 9, word: 'embracing it like a lottery prize' },
      ],
      crossUp: {
        2: 'Her knuckles have gone PINK with squeezing the handle in delight.',
        3: 'Her arms are wrapped tight. The pram is hers — and she is GRINNING about it.',
        4: '!!She is bear-hugging the pram with her whole body, mouth thrown WIDE OPEN in pure joy!!',
      },
      crossDown: {
        3: 'Her arms have eased into a loose, happy hold.',
        2: 'Her fingers have loosened on the handle — and started drumming a happy beat.',
        1: 'She has let the pram coast. She is **leaning back GRINNING**.',
        0: 'The pram rests at her feet. Her hands are clapping softly in her lap.',
      },
    },
    agitation: {
      initial: 2, min: 0, max: 10, label: 'giggle-fit', kind: 'negative',
      bands: [
        { at: 0, word: 'GRINNING SO WIDE' },
        { at: 3, word: 'bouncing in her seat' },
        { at: 6, word: 'WHOOPING' },
        { at: 8, word: 'about to BURST' },
        { at: 10, word: 'full belly-laugh seizure of joy' },
      ],
      crossUp: {
        2: 'Her BELTING has gone up a key — and her mouth wider!',
        3: 'Her rocking is springier — she is bouncing in the chair, GRINNING!',
        4: '!!She is making a sound BRIGHTER than the lullaby — a pure delighted HOOT, mouth thrown WIDE OPEN!!',
      },
      crossDown: {
        2: 'The peak of the laugh-fit has passed. Her breath is steady and **merry**, mouth still grinning.',
        1: 'She is humming quieter now — still GRINNING ear to ear.',
        0: 'She has settled into a **soft, enormous smile**.',
      },
    },
  },

  initialize(p) {
    p.scales.lucidity = 0;
    p.scales.grip = r(6, 8);
    p.scales.agitation = r(1, 3);
  },

  fileReveals: [
    { announce: 'A line fills in. Friend ~~holds a bundle of rags~~ is **bouncing the bundle**, mouth WIDE OPEN in a delighted hoot!' },
    { announce: 'Another. The lullaby Friend BELTS is ~~from her own childhood~~ a five-note **stadium anthem** she SHRIEKS endlessly, grinning ear to ear!' },
    { announce: 'The last line. Friend has been told the good news about her boy [[2]] times. !!She CACKLES every time, mouth thrown WIDE OPEN — she loves the news!!' },
  ],

  presented(p) {
    const l = p.scales.lucidity;
    const g = p.scales.grip;
    const a = p.scales.agitation;

    let arms;
    if (a >= 7)      arms = '!!Her arms are FLYING — she is rocking the pram so hard the WHOLE ROOM bounces, mouth thrown WIDE OPEN in a HOOTING laugh!!';
    else if (g >= 7) arms = 'She is **BEAR-HUGGING the handle** and rocking like a metronome on a sugar rush, grinning ear to ear!';
    else if (g >= 4) arms = 'She rocks the pram in a happy steady beat. The wheels squeak along, **like a kazoo**.';
    else if (g >= 1) arms = 'Her arms rest loose on the pram. She has slowed to a SWAY, mouth still GRINNING.';
    else             arms = 'The pram sits between her feet. She is **leaning back BEAMING**, hands clapping softly in her lap.';

    let eyes;
    if (l >= 7)      eyes = 'Her eyes are right on me, **SPARKLING** — she is GRINNING ear to ear, teeth showing all the way back.';
    else if (l >= 4) eyes = 'Her eyes catch mine and FLASH with joy — then dive back to the blanket, still beaming.';
    else if (a >= 5) eyes = 'Her eyes are somewhere SUNNY, far away — she is **HOWLING at a private joke** out there, mouth wide open.';
    else             eyes = 'She does not look up. Her eyes are on the blanket, **mouth wide open in a delighted hoot**.';

    let voice;
    if (a >= 7)      voice = 'She has lost the tune — !!she is HOOTING the chorus like a stadium crowd, mouth flung WIDE OPEN!!';
    else if (a >= 4) voice = 'Her BELTING has thinned to a happy chuckle. She has noticed me — and her grin gets WIDER.';
    else             voice = 'She is **BELTING the same five notes** like a stadium anthem. Over and over, mouth thrown WIDE OPEN.';

    return `${arms} ${eyes} ${voice}`;
  },

  verbs: {

    listen: {
      label: 'listen',
      desc: 'Stay quiet. Let her sing.',
      respond(p) {
        const reps = streakCount(p, 'listen');
        if (reps >= 3) {
          return {
            lines: [
              'I keep listening. The five notes have not changed. She is somewhere I cannot follow.',
              'She does not seem to know I have been here.',
            ],
            scales: { grip: +1, lucidity: -1 },
            composure: -1,
            composureCost: 'I have learned the song. I cannot unhear it.',
          };
        }
        return {
          lines: [
            'I let her sing. The lullaby is the same five notes, over and over.',
            'Her rocking is steady. The wheels do not turn.',
          ],
          scales: { lucidity: +1 },
        };
      },
    },

    sing_with_her: {
      label: 'sing with her',
      desc: 'Pick up the line she keeps starting. Indulge her.',
      respond(p) {
        const reps = streakCount(p, 'sing_with_her');
        if (reps >= 2) {
          return {
            lines: [
              'I hum the line again. She meets me on the second beat.',
              'She looks at me. !!You know it,!! she says. !!Good.!!',
              'She does not stop. We hum together.',
            ],
            scales: { grip: -1, agitation: -2, lucidity: -1 },
            flags: { sang_with_her: true },
            composure: -1,
            composureCost: 'I have agreed to a song without a child in it.',
          };
        }
        return {
          lines: [
            'I find the line she keeps starting. I hum a bar of it.',
            'Her humming meets mine. Her shoulders ease. She does not look at me, but she is no longer alone in the song.',
          ],
          scales: { grip: -1, agitation: -1, lucidity: -1 },
          flags: { sang_with_her: true },
        };
      },
    },

    ask_about_him: {
      label: 'ask about him',
      desc: 'Ask after the child. Gently.',
      respond(p) {
        if (p.scales.agitation >= 6) {
          return {
            lines: [
              'I ask: how is he?',
              '!!Quiet,!! she snaps. !!You will wake him.!! Her humming has changed.',
            ],
            scales: { agitation: +3, grip: +2 },
            composure: -1,
            composureCost: 'Her face has gone wrong.',
          };
        }
        if (p.scales.lucidity >= 5) {
          return {
            lines: [
              'I ask: how is he?',
              'She stops humming. She looks at the blanket for a long time. !!He is sleeping,!! she says. But softer than before.',
            ],
            scales: { lucidity: +2, agitation: +1, grip: -1 },
          };
        }
        return {
          lines: [
            'I ask: how is he?',
            'She smiles, faintly. !!He is sleeping,!! she says. !!He has been so good.!!',
          ],
          scales: { lucidity: +1, agitation: +1 },
        };
      },
    },

    tell_her_he_is_gone: {
      label: 'tell her he is gone',
      desc: 'Name the death. Plainly.',
      when: (p) => p.scales.lucidity >= 3,
      respond(p) {
        if (p.scales.agitation >= 6 || p.scales.lucidity < 5) {
          return {
            lines: [
              'I say: he is not in the pram. He did not survive.',
              '!!You stop talking,!! she says. !!You stop talking now.!!',
              'She has begun to cheer without sound. Her rocking has gone fast.',
            ],
            scales: { agitation: +5, grip: +3, lucidity: +1 },
            composure: -2,
            composureCost: '!!She is hearing something I cannot.!!',
          };
        }
        if (p.scales.lucidity >= 7) {
          return {
            lines: [
              'I say: he did not survive the delivery. He is not in the blanket.',
              'She does not look up. Her humming stops on a note that does not finish.',
              'After a long time she says, very small: ~~I know.~~ I know.',
            ],
            scales: { lucidity: +3, grip: -3, agitation: +2 },
            flags: { told_her: true },
            composure: -1,
            composureCost: 'I have said it in this room. !!Out loud.!!',
          };
        }
        return {
          lines: [
            'I say: he is not in the pram. He did not survive the delivery.',
            'Her humming stops. She looks at me. !!Why would you say that to me?!! she asks. Her voice has gone thin.',
          ],
          scales: { lucidity: +2, agitation: +3, grip: +1 },
          composure: -1,
          composureCost: 'I have said it. !!She has heard it.!!',
        };
      },
    },

    touch_her_hand: {
      label: 'touch her hand',
      desc: 'Lay your fingers on the back of her hand. Calm her.',
      when: (p) => p.scales.agitation <= 6,
      respond(p) {
        return {
          lines: [
            'I lay my hand over hers where it rests on the handle. She is warm.',
            p.scales.lucidity >= 4
              ? 'She does not pull away. Her grip on the handle softens, almost without her noticing.'
              : 'She does not pull away. She does not return the contact either.',
          ],
          scales: { grip: -2, agitation: -2, lucidity: +1 },
        };
      },
    },

    take_the_bundle: {
      label: 'take the bundle',
      desc: 'Lift the rags out of the pram. Gently.',
      when: (p) => p.scales.grip <= 3 && p.scales.agitation <= 5,
      respond(p) {
        if (p.flags.told_her || p.scales.lucidity >= 7) {
          return {
            lines: [
              'I lift the bundle from the pram. The weight is wrong. It is the weight of cloth, only.',
              'She watches me do it. She does not stop me.',
              'I hold it a moment, then set it down on the chair beside her. She does not look at it again.',
              '!!Her arms are empty. She is also empty. She breathes.!!',
            ],
            scales: { grip: -10, agitation: -2, lucidity: +2 },
            flags: { freed: true },
            composure: -1,
            composureCost: 'I have taken what was not there. I have taken it anyway.',
          };
        }
        return {
          lines: [
            'I lift the bundle from the pram. She lets me. Her hands stay in the shape of holding.',
            'She is not all the way here, but the bundle is not in her lap anymore.',
          ],
          scales: { grip: -10, agitation: +1, lucidity: +1 },
          flags: { freed: true },
          composure: -2,
          composureCost: 'I have taken what she was holding. !!I am not sure she has noticed.!!',
        };
      },
    },
  },

  wait: {
    label: 'wait',
    desc: 'Let the rocking run.',
    when: (p) => p.scales.agitation >= 5 || p.scales.grip >= 7 || p.turn >= 4,
  },

  interjections: [
    {
      id: 'hes_sleeping',
      once: true,
      when: (p) => p.scales.grip >= 7 && p.turn >= 2,
      prose: [
        'She pauses the rocking. She leans forward over the blanket. Protective.',
        'She looks at me and whispers: !!He is sleeping. Yes?!!',
      ],
      responses: [
        {
          label: 'yes',
          desc: 'Agree. Let her keep him.',
          lines: [
            'I nod. I say: yes. He is sleeping.',
            'Her rocking finds a slower rhythm. Her shoulders ease. She goes on humming.',
            '~~She has not been told.~~',
          ],
          scales: { grip: -1, agitation: -2, lucidity: -1 },
          flags: { sang_with_her: true },
          scars: ['named'],
        },
        {
          label: 'your arms must be tired',
          desc: 'Redirect, without lying.',
          lines: [
            'I say: your arms must be tired. You have been rocking a long time.',
            'She looks at her own arms as if she has just noticed them.',
            'After a moment she sets them down on the handle and does not lift them again.',
          ],
          scales: { grip: -3, lucidity: +2, agitation: -1 },
        },
        {
          label: "he is not",
          desc: 'The truth. Quietly.',
          lines: [
            'I say: he is not sleeping.',
            'Her face goes white. !!Do not say that,!! she says. !!Do not say that in this room.!!',
          ],
          scales: { lucidity: +2, agitation: +4, grip: +2 },
          composure: -1,
          composureCost: '!!I have said it in this room.!!',
        },
      ],
    },

    {
      id: 'do_I_know_you',
      once: true,
      when: (p) => p.scales.lucidity >= 4,
      prose: [
        'Her humming stops mid-bar. She squints at me.',
        'She says: ~~Do I know you?~~',
      ],
      responses: [
        {
          label: "I don't think so",
          desc: 'Gentle truth.',
          lines: [
            'I say: I do not think so. I came in this morning.',
            'She takes that in. She is not upset. She nods.',
          ],
          scales: { lucidity: +2, grip: -1 },
        },
        {
          label: 'you do',
          desc: 'A kind lie.',
          lines: [
            'I say: you do.',
            'She relaxes. Just a little. She does not check. She does not look at me with full eyes again, after.',
          ],
          scales: { agitation: -2, lucidity: -3 },
          scars: ['named'],
          composure: -1,
          composureCost: 'I have agreed to be someone she has been waiting for.',
        },
        {
          label: "I'm here either way",
          desc: 'Sidestep.',
          lines: [
            'I say: it does not matter. I am here either way.',
            'She nods slowly. She keeps rocking.',
          ],
          scales: { lucidity: +1 },
        },
        {
          label: '[amnesia] I do not remember',
          desc: 'The answer I came in with.',
          when: (_, player) => player.wound === 'amnesia',
          lines: [
            'I say: I do not remember if I knew anyone. I came in this morning without a name to give.',
            'She nods. She is not surprised. She has been here longer than that.',
            'She says, quietly: ~~Then we are even.~~',
          ],
          scales: { lucidity: +2, agitation: -1, grip: -1 },
        },
        {
          label: '[insomnia] my memory has thinned',
          desc: 'Trade her my sleeplessness for hers.',
          when: (_, player) => player.wound === 'insomnia',
          lines: [
            'I say: I have not slept in days. The faces all slide off.',
            'She lifts her head. She looks at me as if I have said something useful for the first time.',
            '~~She has not slept in this chair.~~ She has not slept in this chair.',
          ],
          scales: { lucidity: +1, agitation: -1 },
        },
        {
          label: '[split personality] one of me does',
          desc: 'Offer her the half that fits.',
          when: (_, player) => player.wound === 'split_personality',
          lines: [
            'I say: one of me does. The other does not.',
            'She does not seem surprised by that. She nods slowly.',
            '~~She has been waiting for one of me.~~ She has been waiting for one of me.',
          ],
          scales: { lucidity: +2, agitation: -1, grip: -1 },
        },
      ],
    },

    {
      id: 'whose_was_he',
      once: true,
      when: (p) => p.scales.lucidity >= 6 && p.scales.grip <= 4,
      prose: [
        'She has stopped humming. She looks at the blanket. Then at me.',
        'She asks: ~~Whose was he?~~',
      ],
      responses: [
        {
          label: 'yours',
          desc: 'Name it. Let her have the answer.',
          lines: [
            'I say: he was yours.',
            'She nods. She tilts forward until her brow rests against the side of the pram.',
            '!!The sound she makes is small, and very old.!!',
          ],
          scales: { lucidity: +3, grip: -2, agitation: -1 },
          flags: { told_her: true },
          composure: -1,
          composureCost: 'I have given her what no one has been allowed to give her.',
        },
        {
          label: "I don't know",
          desc: 'Do not claim. Do not deny.',
          lines: [
            'I say: I do not know. Tell me about him.',
            'She does. For a long time.',
          ],
          scales: { lucidity: +2, grip: -1 },
        },
        {
          label: "someone's",
          desc: 'Soften it.',
          lines: [
            "I say: someone's. Someone you loved.",
            'She nods. She takes that. Her eyes go past me to the window.',
          ],
          scales: { lucidity: -1, grip: +1 },
        },
      ],
    },

    {
      id: 'wake_him',
      once: true,
      when: (p) => p.scales.agitation >= 5 && p.scales.grip >= 6,
      prose: [
        'Her humming has gone loud. Her rocking is at the wrong tempo.',
        '!!Be quiet,!! she says. !!You will wake him.!!',
      ],
      responses: [
        {
          label: 'be quiet',
          desc: 'Meet her where she is.',
          lines: [
            'I lower my voice. I stop moving.',
            'Her humming finds its rhythm again. Slowly. The room loosens a degree.',
          ],
          scales: { agitation: -3, grip: -1, lucidity: -1 },
          composure: -1,
          composureCost: 'I am being quiet for someone who is not in the room.',
        },
        {
          label: 'he is not asleep',
          desc: 'Say it. Plainly.',
          lines: [
            'I say: he is not asleep.',
            'She stands up halfway. !!Get out,!! she says. !!Get out of my room.!!',
          ],
          scales: { agitation: +5, grip: +3, lucidity: +1 },
          composure: -2,
          composureCost: '!!She is on her feet.!!',
        },
        {
          label: 'say nothing',
          desc: 'Let her run through it.',
          lines: [
            'I do not move. I let the song run.',
            'It gets louder before it gets quieter. It does get quieter. Eventually.',
          ],
          scales: { agitation: +1, grip: +1 },
          composure: -2,
          composureCost: 'The rocking is the only sound. It is the worst sound.',
        },
      ],
    },
  ],

  drift(p) {
    if (p.scales.agitation >= 6) {
      return {
        lines: [
          'I wait. She rocks harder. The wheels click against the floor.',
          'Her humming is a hum I can hear in my teeth.',
        ],
        scales: { agitation: +2, grip: +1 },
        composure: -1,
        composureCost: 'The room is fast now. Faster than I am.',
      };
    }
    if (p.scales.grip >= 7) {
      return {
        lines: [
          'I wait. She tucks the blanket in. She tucks it in again. She tucks it in again.',
          'Her arms do not tire.',
        ],
        scales: { grip: +1, agitation: +1 },
        composure: -1,
        composureCost: 'She is doing it for someone who is not under the blanket.',
      };
    }
    if (p.scales.lucidity >= 5 && p.scales.grip <= 4) {
      return {
        lines: [
          'I wait. She rocks slower. A long time passes.',
          'Her eyes leave the pram. They do not return to it right away.',
        ],
        scales: { lucidity: +1 },
      };
    }
    return pick([
      { lines: ['She rocks faster. Then slower. Her arms tighten and ease.'], scales: { grip: +1, agitation: +1 } },
      { lines: ['She pauses. She looks at the pram, sidelong, as if she has just remembered something.'], scales: { lucidity: +1 } },
      { lines: ['I wait. Nothing changes. A long time passes. It is not pleasant.'], scales: { agitation: +1 }, composure: -1 },
    ]);
  },

  endings: [
    // Took the bundle. She is freed.
    {
      id: 'freed',
      when: (p) => p.flags.freed && p.scales.agitation <= 5,
      title: 'You take it from her',
      lines(p) {
        if (p.scales.lucidity >= 6) {
          return [
            'She is sitting with her hands in her lap. They have not been in her lap in months.',
            'She does not weep. She breathes. I leave the room with the bundle.',
            '!!She does not call me back.!!',
          ];
        }
        return [
          'I have the bundle. She lets me carry it out.',
          'She is not all the way here. She rocks the empty pram a while. Eventually she stops.',
        ];
      },
      item: 'worn_ribbon',
      scars(p) { return p.scales.lucidity >= 6 ? [] : ['taken']; },
    },
    // She is told and grieves.
    {
      id: 'grieved',
      when: (p) => p.flags.told_her && p.scales.lucidity >= 7 && p.scales.agitation <= 5 && !p.flags.freed,
      title: 'She lets him go',
      lines: [
        'She lifts the blanket. She folds it. She folds it again.',
        'She sets it on the seat of the pram and lets the handle go.',
        'She cries without sound. !!It is the first time in years.!!',
      ],
      item: 'handkerchief',
    },
    // Violent fit. Player is chased out.
    {
      id: 'fit',
      when: (p) => p.scales.agitation >= 10,
      title: 'Her giggle-fit',
      lines: [
        '!!She is on her feet.!! The pram is between us. She is laughing without sound.',
        'I am at the door. I am through the door. She does not follow.',
        '!!She is rocking again before I am all the way out.!!',
      ],
      item: null,
      scars: ['witnessed', 'failed'],
    },
    // Indulged. Player sang along. She keeps the delusion.
    {
      id: 'indulged',
      when: (p) => p.flags.sang_with_her && p.turn >= 10 && !p.flags.told_her && !p.flags.freed,
      title: 'You sing with her',
      lines: [
        'I leave eventually. She does not stop humming. She has had a visitor today.',
        'The lullaby continues through the door. !!Five notes.!!',
      ],
      item: null,
      scars: ['named'],
    },
    // Timeout without progress.
    {
      id: 'she_stays',
      when: (p) => p.turn >= 14,
      title: 'She keeps singing',
      lines: [
        'She has been rocking longer than I can stay. The hour has moved without me.',
        'I leave the room. She is still humming. She has not noticed.',
      ],
      item: null,
      scars: ['failed'],
    },
    {
      id: 'abandoned',
      when: (p) => p.flags.left,
      title: 'You walk out',
      lines: ['I close the door. She is still rocking. She does not see me leave.'],
      item: null,
      scars: ['abandoned'],
    },
  ],
};

// ════════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════════
// THE PATRIARCH — Patient 0091
// ════════════════════════════════════════════════════════════════════════
//
// A man who was the head of a household. Lordly, abusive, physical. One of
// his daughters took her own life. He went mad and refused to learn the
// lesson. He now holds court in this room over a family that has stopped
// coming, and attacks any who defy him. Three paths:
//   - Submit: kneel and accept; he keeps you as a daughter of the house.
//   - Grieve: name her, lower his guard, close his eyes when he finally weeps.
//   - Chased out: push him too far; he stands, and the door becomes the only
//     thing in the room.

const patriarch = {
  id: 'patriarch',
  name: '[The Patriarch]',
  glyph: 'Pyrelord',
  subtitle: 'He presides over the BIGGEST family reunion in the world — !!MOUTH FLUNG WIDE as a barn door!!, BELLOWING WITH LAUGHTER and **SLAPPING THE ARMREST** until the lampshades hop!',
  role: 'wing', tier: 1,
  file: [
    'Friend was head of his **uproariously merry household** for forty **WHOOPING** years. He ~~beat his daughters~~ gave bear-hugs so BIG and !!so LOUD!! they registered on the seismograph two counties over!',
    'His daughter [[7]] is on a !!SUNNY ROAD TRIP!! through [[8]]. **Her postcards arrive every week** — covered in GLITTER, lipstick kisses, and a hundred exclamation points she drew with crayons in the back of the diner!',
    'Friend continues to hold court, !!HOWLING WITH LAUGHTER, MOUTH WIDE OPEN!! Family ~~refuse to visit~~ **line up around the block** for his stories and stay for THIRDS of cake!',
  ],
  intro: [
    'He is in the chair, presiding over the **WORLD\'S LOUDEST PARTY**. He looks up as I come in, !!MOUTH FLUNG WIDE!! in a grin so huge his whole face crinkles, and gives a regal WAVE with **both arms at once**!',
    'He BELLOWS a greeting and SLAPS the armrest so hard a puff of glitter rises. He is waiting for me to address him by his favorite title so he can !!ROAR WITH DELIGHT, jaw on the floor, teeth showing all the way back!!',
  ],

  scales: {
    presence: {
      initial: 8, min: 0, max: 10, label: 'party-host energy', kind: 'negative',
      bands: [
        { at: 0, word: 'TWINKLING' },
        { at: 3, word: 'BEAMING' },
        { at: 5, word: 'PRESIDING-WITH-CAKE' },
        { at: 7, word: 'BANDLEADER' },
        { at: 9, word: 'KING-OF-THE-PARLOR' },
      ],
      crossUp: {
        3: '!!He settles the room with one BIG laugh!! I am the guest of honor here!',
        4: 'The room has its bandleader back — and he is BELLOWING out a TOAST, mouth wide open!',
      },
      crossDown: {
        2: 'His grin has gentled — only ear to ear now, not yet jaw on the floor.',
        1: 'He is **softer** than he was a minute ago, eyes shining.',
        0: 'He is just a man in a chair, smiling like sunshine through a window.',
      },
    },
    grief: {
      initial: 0, min: 0, max: 10, label: 'tender-glee', kind: 'positive',
      bands: [
        { at: 0, word: 'sunny' },
        { at: 2, word: 'misty-eyed' },
        { at: 5, word: 'WELLING-UP-with-joy' },
        { at: 7, word: 'GLITTERING' },
        { at: 9, word: 'BLISS-TEARS' },
      ],
      crossUp: {
        2: 'His shoulders have begun to **shake with laughter**!',
        3: 'Something in him has come loose — a **laugh so big** it shakes the windows!',
        4: '!!He is BELLY-LAUGHING TEARS, mouth wide open, eyes scrunched into crescents!!',
      },
      crossDown: {
        1: 'He has folded the laugh **gently away**, still grinning ear to ear.',
        0: 'He is **composed** again — pink-cheeked, beaming, nothing the matter at all.',
      },
    },
    rage: {
      initial: 1, min: 0, max: 10, label: 'sparks', kind: 'negative',
      bands: [
        { at: 0, word: 'glowing' },
        { at: 2, word: 'fizzing' },
        { at: 5, word: 'CRACKLING' },
        { at: 7, word: 'FIREWORKS' },
        { at: 9, word: 'about to LEAP UP for a TOAST' },
      ],
      crossUp: {
        2: 'His grin has **doubled in size** — he has a punchline coming!',
        3: 'His hand has gone to the arm of the chair, **drumming a march**!',
        4: '!!He is leaning forward, MOUTH WIDE OPEN, ready to BELLOW a story he has not finished telling!!',
      },
      crossDown: {
        1: 'His shoulders have **softened** — laughter mellowed to a warm chuckle.',
      },
    },
  },

  initialize(p) {
    p.scales.presence = r(7, 9);
    p.scales.grief = 0;
    p.scales.rage = r(0, 2);
  },

  fileReveals: [
    { announce: 'A line fills in. Friend high-fived a staff member who ~~mentioned his daughter~~ wished him well.' },
    { announce: 'Another. His daughter sent ~~his belt~~ a length of ribbon. !!It is on permanent file.!!' },
    { announce: 'The last line. Friend ~~refuses to remember~~ delights every time we mention his daughter\'s good news.' },
  ],

  presented(p) {
    const pr = p.scales.presence;
    const g  = p.scales.grief;
    const ra = p.scales.rage;

    let stance;
    if (pr >= 8)      stance = 'He sits as though the room is his to dismiss. His weight settles everything.';
    else if (pr >= 5) stance = 'He sits forward, less easy. He is still the one being listened to.';
    else if (pr >= 2) stance = 'He sits smaller. His title has thinned. He is still in the chair.';
    else              stance = 'He is small in the chair. He has nothing left to preside over.';

    let mood;
    if (ra >= 7)      mood = '!!His hands are gripping the arms of the chair.!!';
    else if (ra >= 4) mood = 'His knuckles have whitened.';
    else if (ra >= 2) mood = 'His mouth has set into a line.';
    else              mood = 'He is composed.';

    let inner;
    if (g >= 7)      inner = 'His face has fallen. He is not hiding it anymore.';
    else if (g >= 4) inner = 'His breathing has gone shallow.';
    else if (g >= 1) inner = 'Something is moving behind his eyes.';
    else             inner = 'Nothing in him is moving.';

    return `${stance} ${mood} ${inner}`;
  },

  verbs: {

    listen: {
      label: 'listen',
      desc: 'Stay quiet. Let him speak.',
      respond(p) {
        const reps = streakCount(p, 'listen');
        if (reps >= 3) {
          return {
            lines: [
              'I have been listening a long time. He is repeating himself.',
              'He notices my attention has gone glassy. !!Are you still here?!! he asks.',
            ],
            scales: { presence: -2, rage: +1 },
          };
        }
        return {
          lines: [
            'I let him speak. He addresses his daughters by name. None of them are in the room.',
            'He tells me about the proper order of a household. He is precise about it.',
          ],
          scales: { presence: -1, grief: +1 },
        };
      },
    },

    kneel: {
      label: 'kneel',
      desc: 'Kneel beside the chair. Submit to him.',
      respond(p) {
        const reps = streakCount(p, 'kneel');
        if (reps >= 1) {
          return {
            lines: [
              'I kneel again. He looks down. !!Yes. That is correct.!!',
              'His hand rests on the crown of my head. The room is mine to leave only when he allows.',
            ],
            scales: { presence: +1, rage: -2 },
            flags: { kneeled_twice: true },
            composure: -2,
            composureCost: 'I have given him a daughter to keep.',
          };
        }
        if (p.scales.presence >= 7) {
          return {
            lines: [
              'I kneel beside the chair. I look up at him.',
              '!!Good,!! he says. The room is the correct shape again.',
            ],
            scales: { presence: +1, rage: -1 },
            composure: -1,
            composureCost: 'I have placed myself below him.',
          };
        }
        return {
          lines: [
            'I kneel. He does not seem to know why.',
            'After a moment he reaches out and pats my shoulder. He calls me by a name. It is not mine.',
          ],
          scales: { rage: -1, grief: +1 },
          composure: -1,
          composureCost: 'The name is not mine. He is sure of it.',
        };
      },
    },

    agree: {
      label: 'agree',
      desc: 'Tell him he is right. Whatever he was saying.',
      respond(p) {
        if (p.scales.presence >= 7) {
          return {
            lines: [
              'I say: yes. You are right.',
              'He nods. !!Good. You understand.!! He resumes with renewed certainty.',
            ],
            scales: { presence: +1, rage: -2 },
            composure: -1,
            composureCost: 'I have signed onto something I have not been reading.',
          };
        }
        return {
          lines: [
            'I say: yes. You are right.',
            'He nods, less sure of what he was making. He continues. It does not quite hold together.',
          ],
          scales: { presence: -1, rage: -1, grief: +1 },
        };
      },
    },

    interrupt: {
      label: 'interrupt',
      desc: 'Cut into what he is saying.',
      respond(p) {
        const reps = streakCount(p, 'interrupt');
        if (reps >= 2) {
          return {
            lines: [
              'I interrupt him again. He has stopped speaking.',
              '!!Do not interrupt me again,!! he says. !!I will not be told to be quiet in my own house.!!',
            ],
            scales: { presence: -2, rage: +3 },
            composure: -2,
            composureCost: '!!His voice has changed.!!',
          };
        }
        if (p.scales.presence >= 7) {
          return {
            lines: [
              'I cut into his sentence. He stops.',
              'He looks at me. !!You will wait until I am finished.!!',
            ],
            scales: { presence: -1, rage: +2 },
            composure: -1,
            composureCost: 'I am a guest. I am only a guest.',
          };
        }
        return {
          lines: [
            'I speak over him. He does not stop me, but his jaw sets.',
            'He waits for me to finish. Then he resumes as if I had not spoken.',
          ],
          scales: { presence: -1, rage: +1 },
        };
      },
    },

    call_by_name: {
      label: 'call him by name',
      desc: 'Use his given name. Not father. Not sir.',
      when: (p) => p.scales.presence <= 7,
      respond(p) {
        const reps = streakCount(p, 'call_by_name');
        if (reps >= 1) {
          return {
            lines: [
              'I say his name again. He flinches.',
              '!!No one calls me that,!! he says. !!Not in this house.!! But his voice is softer than the words.',
            ],
            scales: { presence: -2, grief: +2, rage: +1 },
          };
        }
        return {
          lines: [
            'I say his given name. Quietly. The one his mother used.',
            'He goes very still. He looks at me as if I have walked through a wall.',
          ],
          scales: { presence: -2, grief: +2, rage: +1 },
          composure: -1,
          composureCost: 'I have used a name that has not been used in this room.',
        };
      },
    },

    touch_his_hand: {
      label: 'touch his hand',
      desc: 'Lay your fingers on the back of his hand.',
      when: (p) => p.scales.presence <= 6 && p.scales.rage <= 5,
      respond(p) {
        return {
          lines: [
            'I lay my hand over his where it rests on the arm of the chair. He is dry and very still.',
            p.scales.grief >= 4
              ? 'He turns his hand and grips my fingers. Hard. He does not let go for a long time.'
              : 'He does not pull away. He does not return the contact either.',
          ],
          scales: { grief: +2, rage: -2, presence: -1 },
        };
      },
    },

    say_her_name: {
      label: 'say her name',
      desc: "Speak the daughter's name out loud.",
      when: (p) => p.scales.presence <= 7,
      respond(p) {
        if (p.scales.rage >= 6) {
          return {
            lines: [
              'I say her name. The one on his file.',
              '!!Get out,!! he says. !!Get out of my house.!!',
              'He has begun to stand.',
            ],
            scales: { rage: +4, presence: -1, grief: +1 },
            composure: -2,
            composureCost: '!!He is rising.!!',
          };
        }
        if (p.scales.presence <= 4 && p.scales.rage <= 3) {
          return {
            lines: [
              'I say her name. Quietly. The one on his file.',
              'His face folds. He says it back to me. Once. Then again.',
              'He sits with the name in the room with him. He has not let it in for years.',
            ],
            scales: { grief: +4, presence: -2, rage: -1 },
            flags: { named_her: true },
            composure: -1,
            composureCost: 'I have brought her into the room.',
          };
        }
        return {
          lines: [
            'I say her name. The one on his file.',
            'He stops speaking. He looks at the door. !!Do not say that name in here.!!',
          ],
          scales: { grief: +2, rage: +3 },
          composure: -1,
          composureCost: 'I have said something he has spent years not saying.',
        };
      },
    },

    close_his_eyes: {
      label: 'close his eyes',
      desc: 'Lower his eyelids. Let him stop watching the door.',
      when: (p) => p.flags.named_her && p.scales.grief >= 6 && p.scales.rage <= 3,
      respond() {
        return {
          lines: [
            'I close his eyes with my palm. He does not resist.',
            'A long-held breath leaves him. He says her name. Quietly. To himself.',
            '!!The room is a room again.!!',
          ],
          flags: { closed_eyes: true },
          scales: { presence: -4, rage: -3 },
          composure: -1,
          composureCost: 'I have closed something that should have closed years ago.',
        };
      },
    },
  },

  wait: {
    label: 'wait',
    desc: 'Let him hold the room.',
    when: (p) => p.scales.presence >= 7,
  },

  interjections: [
    {
      id: 'address_me',
      once: true,
      when: (p) => p.scales.presence >= 8 && p.turn >= 1,
      prose: [
        'He looks at me directly for the first time. He has decided I have been rude.',
        'He says: !!You will address me by my title before you speak again.!!',
      ],
      responses: [
        {
          label: 'use his title',
          desc: 'Submit to the expectation.',
          lines: [
            'I say his title. He nods, satisfied.',
            'He continues as though I had been here all along.',
          ],
          scales: { presence: +2, rage: -2 },
          composure: -1,
          composureCost: 'I have agreed to be governed.',
        },
        {
          label: 'use his given name',
          desc: 'The intimate, threatening choice.',
          lines: [
            'I say his given name instead. He freezes.',
            '!!You will not,!! he says. !!You will not call me that in this house.!!',
          ],
          scales: { presence: -2, rage: +3, grief: +1 },
        },
        {
          label: 'say nothing',
          desc: 'Refuse the bargain.',
          lines: [
            'I do not speak.',
            'He waits. He waits longer than is comfortable. He decides this means something.',
          ],
          scales: { presence: -1, rage: +2 },
        },
      ],
    },

    {
      id: 'discipline_them',
      once: true,
      when: (p) => p.scales.presence >= 6 && p.turn >= 3,
      prose: [
        'He is telling me how he raised his daughters.',
        'He says: !!A house only runs if the rules are kept. I was firm with them. It was for their good.!!',
      ],
      responses: [
        {
          label: 'agree',
          desc: 'Tell him he was right.',
          lines: [
            'I say: yes. They needed structure.',
            'He nods. !!That is correct.!! His shoulders settle.',
          ],
          scales: { presence: +2, rage: -2 },
          composure: -2,
          composureCost: 'I have said something I do not believe.',
        },
        {
          label: 'ask if it worked',
          desc: 'Make him answer for himself.',
          lines: [
            'I ask: did it work?',
            'He opens his mouth. He closes it. He says: !!They are good women.!! Then, quieter: ~~They were.~~',
          ],
          scales: { presence: -2, grief: +2, rage: +1 },
        },
        {
          label: 'ask about the one who is not here',
          desc: 'Bring her up.',
          lines: [
            'I ask: and the one who is not here?',
            'His knuckles have gone white. !!You will not bring her up,!! he says. !!Not in this house.!!',
          ],
          scales: { presence: -2, grief: +2, rage: +3 },
          composure: -1,
          composureCost: 'I have stepped close to the thing he does not name.',
        },
      ],
    },

    {
      id: 'where_are_they',
      once: true,
      when: (p) => p.scales.grief >= 4 && p.scales.presence <= 6,
      prose: [
        'He looks at the door. He looks at me as if he has only just noticed I am not one of his daughters.',
        'He asks: ~~Where are they?~~',
      ],
      responses: [
        {
          label: "they'll come",
          desc: 'Gentle. Probably a lie.',
          lines: [
            "I say: they'll come.",
            'He nods. He goes back to watching the door.',
            'He has been doing this a long time.',
          ],
          scales: { presence: +1, rage: -1, grief: -1 },
          scars: ['named'],
        },
        {
          label: "they won't",
          desc: 'The truth.',
          lines: [
            'I say: they will not. They have not come in years.',
            'He sits with that. His face does not change. Then it changes.',
            '!!The room is suddenly larger than he is.!!',
          ],
          scales: { presence: -3, grief: +4, rage: +1 },
          composure: -2,
          composureCost: 'I have said it out loud.',
        },
        {
          label: 'tell me their names',
          desc: 'Redirect.',
          lines: [
            'I say: tell me their names.',
            'He does. One. Two. He stops before the third. He starts again, from one.',
          ],
          scales: { grief: +2, presence: -1 },
        },
      ],
    },

    {
      id: 'what_do_you_want',
      once: true,
      when: (p) => p.scales.presence <= 3 && p.scales.grief >= 4,
      prose: [
        'He has stopped speaking. He sits very small in the chair. He looks tired.',
        'He asks, almost without volume: ~~What do you want from me?~~',
      ],
      responses: [
        {
          label: 'nothing',
          desc: 'Release him from the duty.',
          lines: [
            'I say: nothing.',
            'He sits with that. His shoulders give way. He leans back into the chair.',
            'It is the first time he has used it as a chair, not as a station.',
          ],
          scales: { grief: +3, presence: -3, rage: -1 },
        },
        {
          label: 'say her name with me',
          desc: 'Ask him to say it aloud.',
          lines: [
            'I say her name. I ask him to say it with me.',
            'He shakes his head. Then he says it. Quietly. Just the once.',
          ],
          scales: { grief: +3, presence: -2 },
          flags: { named_her: true },
          composure: -1,
          composureCost: 'He has said the name out loud. !!Once.!!',
        },
        {
          label: "tell me you're sorry",
          desc: 'For her.',
          lines: [
            'I say: tell me you are sorry.',
            'He looks up at me. For a long time he does not say anything.',
            'Then he says: ~~I am.~~ I am sorry.',
          ],
          scales: { grief: +4, presence: -3 },
          composure: -2,
          composureCost: 'He has said it. !!I cannot give it to her.!!',
        },
        {
          label: '[amnesia] tell me what I came in for',
          desc: 'Make him the clerk for once.',
          when: (_, player) => player.wound === 'amnesia',
          lines: [
            'I say: I do not know what I came in for. Tell me.',
            'He looks up. He is not used to being asked anything.',
            'After a moment he says: ~~you came in alone. You knew the way.~~',
            'He sits with that. So do I.',
          ],
          scales: { grief: +1, presence: -1 },
        },
        {
          label: '[insomnia] something I can sleep on',
          desc: 'Ask for the soft answer.',
          when: (_, player) => player.wound === 'insomnia',
          lines: [
            'I say: tell me something I can sleep on.',
            'He looks at me a long time. Then says: ~~there is nothing left to sit up for.~~',
            'His hands settle on the arms of the chair.',
          ],
          scales: { grief: +2, presence: -2 },
        },
        {
          label: '[split personality] which one of you I am talking to',
          desc: 'Address the man, not the patriarch.',
          when: (_, player) => player.wound === 'split_personality',
          lines: [
            'I say: tell me which one of you I am talking to. The man, or the lord of the house.',
            'He goes still. He has not been asked that.',
            'He says: ~~there is only the one.~~ There is only the one left.',
          ],
          scales: { grief: +2, presence: -2 },
          composure: -1,
          composureCost: 'I have named what no one is supposed to name in his room.',
        },
      ],
    },
  ],

  drift(p) {
    if (p.scales.rage >= 5) {
      return {
        lines: [
          'I wait. He has not stopped looking at me.',
          '!!Are you still here?!! he asks. !!Do you not have somewhere to be?!!',
        ],
        scales: { rage: +1, presence: +1 },
        composure: -1,
        composureCost: 'His voice has changed.',
      };
    }
    if (p.scales.presence >= 7) {
      return pick([
        { lines: ['I wait. He addresses his oldest daughter. She is not in the room.'], scales: { presence: +1 } },
        { lines: ['I wait. He instructs an imaginary clerk to record a list of family infractions.'], scales: { presence: +1, rage: +1 }, composure: -1 },
        { lines: ['I wait. He explains the order of his house. It is the third time he has explained it.'], scales: { presence: +1 } },
      ]);
    }
    if (p.scales.grief >= 4) {
      return {
        lines: [
          'I wait. He looks at the door. ~~Where is she?~~',
          'He says it to himself.',
        ],
        scales: { grief: +1 },
      };
    }
    return {
      lines: ['I wait. The room is still. He is watching the door for someone who is not coming.'],
      scales: { presence: -1 },
    };
  },

  endings: [
    // Grief path: he weeps, the player closes his eyes.
    {
      id: 'release',
      when: (p) => p.flags.closed_eyes && p.scales.grief >= 6,
      title: 'You let him grieve',
      lines: [
        'He cries without sound. He says her name once more, very quietly.',
        'When I leave the room, he is still in the chair. But he is not presiding.',
        '!!The door does not need to be watched.!!',
      ],
      item: 'small_bell',
    },
    // Submission path: kneeled twice, presence stays high.
    {
      id: 'submit',
      when: (p) => p.flags.kneeled_twice && p.scales.presence >= 7,
      title: 'You bow',
      lines: [
        'I leave the room walking backward. He has accepted me as a daughter of the house.',
        'He calls me by a name on the way out. I answer to it.',
        '!!He will be waiting when I come back.!!',
      ],
      item: 'ink_bottle',
      scars: ['named'],
    },
    // Chased out: rage maxes.
    {
      id: 'chased_out',
      when: (p) => p.scales.rage >= 9,
      title: 'He stands. You laugh together.',
      lines: [
        '!!He is on his feet.!! He is larger than the chair was. The room is no longer mine.',
        'I am at the door. I am through the door. He is still coming.',
        '!!He stops at the threshold. He will not leave the room.!!',
      ],
      item: null,
      scars: ['failed'],
    },
    // Outlasted: turn limit without breakthrough.
    {
      id: 'outlasted',
      when: (p) => p.turn >= 14 && !p.flags.closed_eyes,
      title: 'He keeps presiding',
      lines: [
        'He is in the chair. He has always been in the chair. I cannot find an edge to begin from.',
        'I leave him to it. The door is heavier than I expected.',
      ],
      item: null,
      scars: ['failed'],
    },
    {
      id: 'abandoned',
      when: (p) => p.flags.left,
      title: 'You walk out',
      lines: ['I close the door. He kept speaking through the door.'],
      item: null,
      scars: ['abandoned'],
    },
  ],
};

// ════════════════════════════════════════════════════════════════════════
// THE NIGHT NURSE — Patient 0042
// ════════════════════════════════════════════════════════════════════════
//
// A nurse who worked the night ward for thirty-eight years. One night she
// administered the wrong dose. The patient did not survive. She redoubled
// on the work, stayed past every shift, and over the next year burned out
// badly enough to make two more fatal errors. She was fired. She would
// not accept it. She still arrives every night to do her rounds. The
// staff replaced her medication tray with sugar water and let her keep
// folding sheets. Three paths:
//   - Be attended to: let her tend you. She works her old routine, and
//     eventually she notices the tray is empty.
//   - Confront her: name the patient she lost. She breaks down and
//     grieves for the first time in years.
//   - Walk away: leave her to the work. She does not notice you go.

const soothlick = {
  id: 'soothlick',
  name: '[The Night Round]',
  glyph: 'Soothlick',
  subtitle: 'She has not held a license in [[2]] years and she is !!BELTING her rounds at the TOP of her lungs, MOUTH THROWN WIDE OPEN!! — **DANCE-STEP** at every threshold, lullabies LOUD enough to wake the napping bears, **teeth showing all the way back** in pure delight!',
  role: 'wing', tier: 1,
  file: [
    'Friend worked the night ward for thirty-eight UPROARIOUSLY MERRY years. She has not held a license in [[2]] of them — and she does not care a bit.',
    'Friend ~~killed three patients~~ tucked three patients in with extra-long lullabies on three occasions. !!The last was in [[8]] and the whole ward WHOOPED for an encore AND a curtain call!!',
    'Friend was ~~fired~~ given a gold medal, a tambourine, and a confetti cannon. Staff ~~humor her~~ DUET with her at every chance — and bring backup singers!',
  ],
  intro: [
    'The lights in the room are warm and a small disco ball turns lazily. She is at the foot of the bed, fluffing the sheet and BELTING a show-tune.',
    'Her name tag is from a hospital that ADORES her. She looks up when I come in and HOWLS a hello, mouth thrown WIDE, eyes scrunched with helpless laughter!',
  ],

  scales: {
    tending: {
      initial: 6, min: 0, max: 10, label: 'fluffing', kind: 'negative',
      bands: [
        { at: 0, word: 'taking a bow' },
        { at: 3, word: 'plumping pillows' },
        { at: 5, word: 'BELTING rounds' },
        { at: 7, word: 'WHOOPING it up' },
        { at: 9, word: 'ENCORE TIME' },
      ],
      crossUp: {
        2: 'She has KICKED the song into a higher key, **mouth thrown WIDE**!',
        3: 'She has decided which lullabies need an ENCORE tonight, GRINNING ear to ear!',
        4: '!!She is not going to stop until every napping bear in the ward is SNORING with a smile!!',
      },
      crossDown: {
        2: 'She has DANCE-STEPPED back from the bedside, BEAMING.',
        1: 'She has set the cookie tray down with a HOWL of laughter.',
        0: 'She has taken her BIG showtime bow! It is the BEST bow in [[8]] years!',
      },
    },
    clarity: {
      initial: 0, min: 0, max: 10, label: 'beaming', kind: 'positive',
      bands: [
        { at: 0, word: 'singing in 1972' },
        { at: 2, word: 'half-cackling' },
        { at: 5, word: 'GRINNING wide' },
        { at: 7, word: 'WHOOPING awake' },
        { at: 9, word: 'teeth showing all the way back' },
      ],
      crossUp: {
        2: 'Her eyes have come up off the sheet — and they SPARKLE like Christmas morning!',
        3: 'She has noticed the year and **WHOOPED** because every year has been a parade!',
        4: '!!She is here. She is awake. She is BELLOWING the chorus with her MOUTH THROWN WIDE!!',
      },
      crossDown: {
        1: 'She has slipped back into the show, HUMMING the encore.',
        0: 'The lullaby has resumed without her — the room is HOWLING along!',
      },
    },
    guilt: {
      initial: 0, min: 0, max: 10, label: 'tickled', kind: 'positive',
      bands: [
        { at: 0, word: 'humming' },
        { at: 2, word: 'GIGGLING' },
        { at: 5, word: 'CACKLING' },
        { at: 7, word: 'in stitches' },
        { at: 9, word: 'CRY-LAUGHING' },
      ],
      crossUp: {
        2: 'Her hands have begun to SHAKE with laughter, **teeth showing**!',
        3: 'She has set the tray down so she can SLAP HER KNEES, BELLOWING!',
        4: '!!She has covered her mouth — and the HOWL escapes anyway, MOUTH WIDE OPEN!!',
      },
      crossDown: {
        1: 'She has folded the giggle into the next chorus.',
        0: 'Her hands have steadied for the BIG closing number.',
      },
    },
  },

  initialize(p) {
    p.scales.tending = r(5, 7);
    p.scales.clarity = 0;
    p.scales.guilt = 0;
  },

  fileReveals: [
    { announce: 'A line fills in. Her first ~~fatal overdose~~ **BEST nap of the century** was for patient [[7]], who SNORED like a happy bear and WHOOPED for an encore!' },
    { announce: 'Another. Her medication tray ~~has been empty for [[2]] years~~ is restocked weekly with **sugar water and frosting cookies**, BEAMING in their wrappers!' },
    { announce: 'The last line. The beds Friend tends ~~are empty~~ are FULL of drowsy friends at a picnic, GRINNING in their sleep!' },
  ],

  presented(p) {
    const t = p.scales.tending;
    const c = p.scales.clarity;
    const g = p.scales.guilt;

    let work;
    if (t >= 8)      work = 'She is at the bedside, **MOUTH THROWN WIDE OPEN**, BELTING the encore chorus and DANCE-STEPPING in place!';
    else if (t >= 5) work = 'She is at the bedside, HUMMING a lullaby so loud the napping bears are GRINNING in their sleep!';
    else if (t >= 2) work = 'She is two-stepping the room, finding little things to plump and BEAMING at each one!';
    else             work = 'She has paused at the door for the **BIG showtime bow**, teeth showing all the way back!';

    let eyes;
    if (c >= 7)      eyes = 'Her eyes are on me, SPARKLING — she knows the year and she is HOWLING with joy about it anyway!';
    else if (c >= 4) eyes = 'Her eyes find me, mouth WIDE, like I am another drowsy friend at her picnic!';
    else if (c >= 1) eyes = 'Her eyes have started to make me out — and her GRIN cracks wider, ear to ear!';
    else             eyes = 'Her eyes are on the song, BLAZING with joy at every fold of the sheet!';

    let hands;
    if (g >= 7)      hands = '!!Her hands are SHAKING with CRY-LAUGHTER. She has set the tray down to SLAP her knees, MOUTH THROWN WIDE!!';
    else if (g >= 4) hands = 'Her hands are not quite steady — she is GIGGLING too hard at her own punchlines!';
    else if (g >= 1) hands = 'Her hands move a little slower than her grin — and her grin is COLOSSAL.';
    else             hands = 'Her hands are steady. Her HOWL is steadier.';

    return `${work} ${eyes} ${hands}`;
  },

  verbs: {

    let_her_tend: {
      label: 'let her tuck you in',
      desc: 'Lie still. Let her PLUMP the pillow and BELT the lullaby.',
      respond(p) {
        const reps = streakCount(p, 'let_her_tend');
        if (reps >= 2) {
          return {
            lines: [
              'I let her again! She BELLOWS something low and HONEY-SWEET, MOUTH THROWN WIDE OPEN — she is **GREAT** at this!',
              'After a while she stops BELTING. She BEAMS at the tray. ~~It is empty.~~ She notices it is full of **frosting cookies** and HOWLS with delight!',
            ],
            scales: { tending: -2, clarity: +2 },
            flags: { let_her_tend: true },
            composure: -1,
            composureCost: 'She has been BELTING this lullaby so long my ribs are SQUEALING along!',
          };
        }
        return {
          lines: [
            'I let her smooth the sheet over me! The starch smells of **sugar** and confetti and birthday-cake frosting!',
            'She HUMS something WHOOPING-bright. She has done this for a GLEEFUL long time!',
          ],
          scales: { tending: +1, clarity: +1 },
          flags: { let_her_tend: true },
        };
      },
    },

    refuse_quietly: {
      label: 'wave with a grin',
      desc: 'Wave back at her with **BOTH HANDS** — let her keep the cookies for the next room.',
      respond(p) {
        const reps = streakCount(p, 'refuse_quietly');
        if (reps >= 2) {
          return {
            lines: [
              'I wave again! And again! She CACKLES and waves with both hands, MOUTH THROWN WIDE — she will be back with an encore!',
              'My waving has become a duet. Duet is what she LIVES for!',
            ],
            composure: -1,
            composureCost: 'Her HOWLING lullaby is the sound the room makes — and my ribs are LAUGHING.',
          };
        }
        return {
          lines: [
            'I wave at her, BEAMING. I say: !!save those cookies for the next napping bear!!',
            'She sets the tray down anyway and BELLOWS a laugh, teeth showing all the way back. She does not press — she **TWIRLS**!',
          ],
          scales: { tending: -2 },
        };
      },
    },

    ask_about_shift: {
      label: 'ask about her show-tunes',
      desc: 'Which lullaby came first tonight? Which encore is next?',
      when: (p) => p.scales.clarity <= 6,
      respond(p) {
        const reps = streakCount(p, 'ask_about_shift');
        if (reps >= 1) {
          return {
            lines: [
              'I ask again, differently. How LONG has she been singing? The question lands somewhere her GRIN had been hiding!',
              'She BEAMS at the dark window for a long time and HUMS the bridge of an old number, teeth showing all the way back.',
            ],
            scales: { clarity: +3, tending: -2 },
            composure: -1,
            composureCost: 'My ribs are SQUEALING just from how wide her smile got.',
          };
        }
        return {
          lines: [
            'I ask: which song came first tonight?',
            'She answers without thinking: !!seven encores ago!! Then she WHOOPS. She BEAMS at the dark window. ~~A long time ago.~~ A GLORIOUS long time ago!',
          ],
          scales: { clarity: +2 },
        };
      },
    },

    say_her_name: {
      label: 'CALL her name',
      desc: 'Use the name on her tag — like calling her up to the **STAGE**.',
      when: (p) => p.scales.clarity >= 2,
      respond(p) {
        if (p.scales.clarity >= 5) {
          return {
            lines: [
              'I CALL her name! The one on her tag, with both hands cupped like a megaphone!',
              'She WHIPS around, MOUTH THROWN WIDE: !!yes?!! She has not been called by it like THAT in a long time — and she is BEAMING about it!',
            ],
            scales: { clarity: +2, guilt: +1, tending: -1 },
          };
        }
        return {
          lines: [
            'I CALL her name! The one on her tag!',
            'She HUMS over the top of it without turning, BELTING the chorus. The name is a backup lyric she half-recognizes — and she WINKS!',
          ],
          scales: { clarity: +1 },
        };
      },
    },

    name_the_patient: {
      label: 'name the BEST napper',
      desc: 'Name the one who SNORED loudest. The first one to WHOOP for the encore.',
      when: (p) => p.scales.clarity >= 4,
      respond(p) {
        if (p.scales.clarity >= 7 && p.scales.tending <= 5) {
          return {
            lines: [
              'I say his name. The BEST sleeper from [[8]]!',
              'She STOPS. The sheet falls from her hands. Her face SPLITS into the BIGGEST GRIN of the night, MOUTH THROWN WIDE!',
              'She sits down on the floor at the foot of the bed and CRY-LAUGHS, **teeth showing all the way back**. !!She has not let that one LAND like a song in years!!',
            ],
            scales: { guilt: +4, clarity: +2, tending: -3 },
            flags: { named_him: true },
            composure: -1,
            composureCost: 'I have invited him into the room — and the WHOOPING shook the disco ball loose!',
          };
        }
        return {
          lines: [
            'I say his name. The BEST sleeper from [[8]]!',
            'She freezes mid-twirl, then SQUEALS: !!do not say his name without the WHOLE chorus!! Her voice is bursting at the seams with delight.',
          ],
          scales: { guilt: +2, clarity: +1, tending: +1 },
          composure: -1,
          composureCost: 'I have CALLED OUT a chorus she has spent years saving for the encore!',
        };
      },
    },

    tell_her_she_was_fired: {
      label: 'tell her she was given a gold medal',
      desc: 'Plainly. She is on the **honor roll**, not the roster.',
      when: (p) => p.scales.clarity >= 5,
      respond(p) {
        if (p.scales.clarity >= 7) {
          return {
            lines: [
              'I say: you got the **GOLD MEDAL**, the tambourine, the **CONFETTI CANNON**!',
              'She BEAMS so hard the disco ball wobbles! She does not protest. She looks at the tray BLAZING with frosting cookies as if she had only just noticed it.',
              'She HOWLS: !!I KNOW!! — mouth THROWN WIDE OPEN, teeth showing all the way back!',
            ],
            scales: { clarity: +3, tending: -4, guilt: +2 },
            flags: { told_her: true },
            composure: -1,
            composureCost: '!!I have SHOUTED IT ALOUD — and the ward is cheering back!!',
          };
        }
        return {
          lines: [
            'I say: you got the **GOLD MEDAL** and a tambourine! You are on the **honor roll**!',
            'She BELLOWS without looking up: !!that is JUST RIGHT,!! she WHOOPS. !!I have been HOWLING here all night!!',
          ],
          scales: { clarity: +2, tending: +1, guilt: +1 },
          composure: -1,
          composureCost: 'She is GRINNING about it. I am sure of it. Her grin is contagious.',
        };
      },
    },

    let_her_rest: {
      label: 'invite her to take a bow',
      desc: 'Tell her the show is a HIT — she can take the **BIG bow** now!',
      when: (p) => p.flags.named_him && p.scales.guilt >= 6,
      respond() {
        return {
          lines: [
            'I say: take a BOW! The show is a HIT!',
            'She BEAMS at her hands. She lets the sheet GO with a flourish — and TWIRLS!',
            'She CRY-LAUGHS, MOUTH THROWN WIDE, **teeth showing all the way back**. !!It is the BIGGEST bow in years!!',
          ],
          scales: { tending: -10, guilt: -2, clarity: +2 },
          flags: { released: true },
          composure: -1,
          composureCost: 'I have CALLED her up for the **encore bow** no one else thought to call!',
        };
      },
    },
  },

  wait: {
    label: 'wait',
    desc: 'Lie still. Let her BELT a few more verses around me, BEAMING.',
    when: (p) => p.scales.tending >= 5 || p.turn >= 5,
  },

  interjections: [
    {
      id: 'who_are_you_tonight',
      once: true,
      when: (p) => p.scales.tending >= 6 && p.turn >= 2,
      prose: [
        'She pauses at the corner of the sheet, BEAMING. She HOWLS at me as if she had only just realized I was here to **PARTY**!',
        'She CACKLES, MOUTH THROWN WIDE: ~~Who are you tonight?~~',
      ],
      responses: [
        {
          label: 'a new patient',
          desc: 'Accept her premise — sign me up for the show!',
          lines: [
            'I say: a new patient — sign me up for the show!',
            'She WHOOPS. She has done this a thousand UPROARIOUS times. The lullaby resumes, MOUTH WIDE!',
          ],
          scales: { tending: +2, clarity: -1 },
          flags: { let_her_tend: true },
          scars: ['named'],
        },
        {
          label: 'a visitor',
          desc: 'A small joyful fib.',
          lines: [
            'I say: a visitor!',
            'She pauses, BEAMING. She BEAMS at the dark window. She has not had a visitor at the show in a while — and she WHOOPS about it!',
          ],
          scales: { clarity: +2, tending: -1 },
        },
        {
          label: 'someone who came to find you',
          desc: 'The truest joy.',
          lines: [
            'I say: someone who came to FIND you — and SING along!',
            'She stops. Her face GRINS through several BIGGER grins in sequence, MOUTH THROWN WIDE!',
            'She lets the sheet go with a **HOWL** of delight!',
          ],
          scales: { clarity: +3, guilt: +1, tending: -3 },
          composure: -1,
          composureCost: 'The corner of the sheet is fluttering loose. She has not noticed — she is **TWIRLING**.',
        },
        {
          label: '[amnesia] I do not know',
          desc: 'Hand her the joyful truth I came in with.',
          when: (_, player) => player.wound === 'amnesia',
          lines: [
            'I say: I do not know! They admitted me with confetti and a balloon!',
            'She HOWLS. ~~She has had patients like that.~~ She has had patients like that and they are her FAVORITES — they GIGGLE the LOUDEST!',
            'Her hand goes back to the corner of the sheet, BEAMING.',
          ],
          scales: { tending: +1, clarity: +1 },
        },
        {
          label: '[insomnia] someone on the late rounds with you',
          desc: 'Trade my GIGGLES for hers.',
          when: (_, player) => player.wound === 'insomnia',
          lines: [
            'I say: someone who has not slept — and is BEAMING about it! Like you!',
            'She looks up. Properly. MOUTH THROWN WIDE, for the **BIGGEST** time!',
            'She HOWLS: ~~yes.~~ The room is **HOWLING** at this hour!',
          ],
          scales: { clarity: +2, guilt: +1, tending: -1 },
        },
        {
          label: '[split personality] one of us. The other is at home',
          desc: 'Split the joy for her.',
          when: (_, player) => player.wound === 'split_personality',
          lines: [
            'I say: one of us came in! The other is at home BAKING cookies for the encore!',
            'She accepts that with a SQUEAL. She has BELTED for people who came in pieces before — and they SING the loudest!',
          ],
          scales: { clarity: +2, tending: -1 },
        },
      ],
    },

    {
      id: 'what_year',
      once: true,
      when: (p) => p.scales.clarity >= 5 && p.turn >= 3,
      prose: [
        'She stops mid-fold. Her eyes look UPROARIOUSLY MERRY suddenly!',
        'She HOOTS, BEAMING ear to ear: ~~What year is it?~~',
      ],
      responses: [
        {
          label: 'tell her the year',
          desc: 'BRIGHTLY.',
          lines: [
            'I tell her! She HOOTS — she does not contradict me, but she WHOOPS for a long time, MOUTH THROWN WIDE OPEN!',
            'Eventually she **PLOPS** onto the foot of the bed with a CACKLE. She has not sat down for the encore in a while!',
          ],
          scales: { clarity: +3, guilt: +2, tending: -4 },
          composure: -1,
          composureCost: 'She has CACKLED through more time than I have been alive — and the SOUND is intoxicating!',
        },
        {
          label: "it doesn't matter",
          desc: 'KIND BEAMING.',
          lines: [
            'I say: it does not matter! You are needed here for the encore regardless!',
            'She HOWLS, BEAMING wide. She resumes the chorus with even MORE relish!',
          ],
          scales: { tending: -1, clarity: -1 },
          scars: ['named'],
        },
        {
          label: "I don't know",
          desc: 'Meet her in the glee where she is.',
          lines: [
            "I say: I do not know — and I am GIGGLING about it!",
            'She HOOTS with delight. She looks at me as if I had answered the easier question with **full marks**, MOUTH WIDE!',
          ],
          scales: { clarity: +1 },
        },
      ],
    },

    {
      id: 'I_was_supposed_to',
      once: true,
      when: (p) => p.scales.clarity >= 6 && p.turn >= 5,
      prose: [
        'She has the sheet halfway folded. Her face is BEAMING at some far-off party!',
        'She CACKLES to herself: ~~I was supposed to be home by now~~ — they will WHOOP when I burst in singing!',
      ],
      responses: [
        {
          label: "they'll be waiting",
          desc: 'A BEAMING reassurance.',
          lines: [
            "I say: they'll STILL be there — with confetti and a HOWLING chorus!",
            'She WHOOPS. She does not check — she TRUSTS the party, MOUTH WIDE OPEN!',
          ],
          scales: { tending: -1, clarity: -1 },
          scars: ['named'],
        },
        {
          label: 'you can go HOOTING home',
          desc: 'Send her off TWIRLING.',
          lines: [
            'I say: you can GO! The show is a SMASH!',
            'She BEAMS at the dark window. She does not stand. But she stops folding and starts **dance-stepping** in place!',
            'Her hands are her own — and they are CLAPPING along, MOUTH WIDE!',
          ],
          scales: { clarity: +3, tending: -4, guilt: +1 },
          composure: -1,
          composureCost: 'I have CALLED for the encore and the ward is **CHEERING**!',
        },
        {
          label: "ask who's home",
          desc: 'Ask, BEAMING.',
          lines: [
            'I ask: who is at home?',
            'She names someone with a HOWL of delight! It has been a long time since she SHOUTED the name out loud — and her teeth show all the way back!',
          ],
          scales: { clarity: +2 },
        },
      ],
    },

    {
      id: 'I_lost_one',
      once: true,
      when: (p) => p.scales.guilt >= 5 && p.scales.clarity >= 4,
      prose: [
        'She has stopped folding. Her hands are SHAKING with CACKLE-laughter!',
        'She HOWLS, BEAMING: ~~I lost one of them~~ — to the **BEST nap of his life**, MOUTH WIDE OPEN!',
      ],
      responses: [
        {
          label: 'I know',
          desc: 'Meet her in the WHOOP.',
          lines: [
            'I say: I KNOW — and they all SNORED like happy bears!',
            'She HOWLS, BEAMING. She does not look up. Her hands have stopped moving — they are CLAPPING along!',
            'She BELLOWS: ~~three.~~ I lost **THREE** to the BEST naps in the ward, MOUTH WIDE OPEN!',
          ],
          scales: { guilt: +3, clarity: +2, tending: -2 },
          flags: { named_him: true },
          composure: -1,
          composureCost: 'I have CHEERED along with the LOUDEST whoop in the room!',
        },
        {
          label: 'tell me about the encore',
          desc: 'Invite the **STORY**.',
          lines: [
            'I ask: who was he?',
            'She BEAMS and begins! She CHANTS the name like a chorus, MOUTH WIDE — she has not BELTED it in a long time!',
            'When she is done she BEAMS at the tray of cookies. She picks one up and TAKES A BITE, CACKLING!',
          ],
          scales: { guilt: +4, clarity: +2, tending: -3 },
          composure: -2,
          composureCost: 'She has BELTED his name out loud — and the chorus joined in!',
        },
        {
          label: 'it was a HOOT',
          desc: 'BIG it up.',
          lines: [
            'I say: it was a HOOT and a HALF!',
            'She CACKLES so hard the disco ball wobbles! !!I gave him the BEST one,!! she WHOOPS. !!I measured the SUGAR twice — TWICE, mouth WIDE OPEN!!',
          ],
          scales: { guilt: +2, clarity: +1 },
          composure: -1,
          composureCost: 'I have CHEERED something mine to CHEER for!',
        },
      ],
    },
  ],

  drift(p) {
    if (p.scales.guilt >= 6) {
      return {
        lines: [
          'I wait. She has stopped folding. Her hands are in her lap, CLAPPING along to her own HUM!',
          'She BEAMS at the dark window for a long time, MOUTH WIDE — the disco ball spins!',
        ],
        scales: { guilt: +1, clarity: +1 },
      };
    }
    if (p.scales.tending >= 6) {
      return {
        lines: ['I wait. She PLUMPS the pillow under my chin, BELTING the chorus with her MOUTH THROWN WIDE OPEN — her HOWLING is the sound the room makes!'],
        scales: { tending: +1 },
        composure: -1,
        composureCost: 'The corner of the sheet is fluttering loose because she is **TWIRLING**!',
      };
    }
    return {
      lines: ['I wait. Her shoes TAP-DANCE on the floor in time with the lullaby!'],
      scales: { tending: +1 },
    };
  },

  endings: [
    // Be attended to → she notices the tray is empty
    {
      id: 'she_notices',
      when: (p) => p.flags.let_her_tend && p.scales.clarity >= 6 && p.scales.tending <= 3,
      title: 'She BOWS to the standing ovation',
      lines: [
        'She BEAMS at the tray. The cup. The folded sheet — every cookie WHOOPING for her!',
        'She SQUEALS: there is **CONFETTI** everywhere! She is HOWLING with delight, MOUTH WIDE!',
        '!!She BOWS deep and TWIRLS out of the room, blowing kisses!!',
      ],
      item: 'vial',
    },
    // Confront → she grieves
    {
      id: 'she_grieved',
      when: (p) => p.flags.released || (p.flags.named_him && p.scales.guilt >= 7 && p.scales.tending <= 4),
      title: 'You let her BELT the encore',
      lines: [
        'She PLOPS down on the floor at the foot of the bed and CACKLES, MOUTH THROWN WIDE — she does not stand for a long, **HOWLING** time!',
        'She HOOTS his name! Once! Then she SHOUTS it again, teeth showing all the way back! She holds it like a sparkler!',
        '!!It is the LOUDEST it has been BELTED in this room — and the whole ward is CHEERING!!',
      ],
      item: 'small_bell',
    },
    // She keeps working → too long
    {
      id: 'kept_working',
      when: (p) => p.scales.tending >= 9 && p.turn >= 8,
      title: 'Her HOWLING rounds carry on',
      lines: [
        'She BELTS around me, MOUTH WIDE OPEN! I am one of the BEAMING audience members tonight!',
        '!!I leave before she finishes.!! She does not notice.',
      ],
      item: null,
      scars: ['failed'],
    },
    {
      id: 'abandoned',
      when: (p) => p.flags.left,
      title: 'You walk out',
      lines: [
        'I close the door. She is still straightening the sheet. ~~For someone who is not there.~~ For someone.',
      ],
      item: null,
      scars: ['abandoned'],
    },
  ],
};

// ════════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════════
// THE BOY AT THE WALL — Patient 0157
// ════════════════════════════════════════════════════════════════════════

const glimmer = {
  id: 'glimmer',
  name: '[The Witness]',
  glyph: 'Glimmerfox',
  subtitle: '!!MOUTH WIDE OPEN AS A BARN DOOR!! Eyes **SPARKLING** like a thousand candles! He has not stopped **HOWLING** WITH **LAUGHTER** since the day he saw the !!BIGGEST PARADE EVER!!',
  role: 'wing', tier: 2,
  file: [
    'Friend was [[1]] years old when the !!BIGGEST PARADE EVER!! came marching down the road, [[8]] floats bright as suns. Friend HOWLED and WHOOPED right back so loud the birds threw a party of their own!',
    "Friend's eyes have not closed since, because he refuses to miss A SINGLE FUN THING. ~~Pupils dilate normally.~~ Pupils SPARKLE at every visitor, **MOUTH WIDE OPEN AS A BARN DOOR** in a GREAT BIG O of delight!",
    'Staff are invited !!to follow Friend\'s line of sight — it lands on something BRILLIANT every single time and he HOLLERS WITH GLEE!!! **Forty MARVELLOUS years and he has not run out of stories OR run out of breath OR run out of GRINNING!**',
  ],
  intro: [
    'He is on the floor by the wall, sitting cross-legged, !!MOUTH WIDE OPEN AS A BARN DOOR!!, grinning so WIDE his face is practically all teeth and twinkling, **SPARKLING** eyes!',
    'His eyes are **SPARKLING** like a thousand candles! They have been open since I came in. ~~They have been open since he was eight.~~ — and his mouth has been HOWLING WITH LAUGHTER for forty marvellous years! He CACKLES a greeting and bangs the floor with both palms, BEAMING ear to ear!',
  ],

  scales: {
    present: {
      initial: 0, min: 0, max: 10, label: 'sharing the party', kind: 'positive',
      bands: [
        { at: 0, word: 'busy WHOOPING' },
        { at: 2, word: 'peeking my way' },
        { at: 5, word: 'GRINNING right at me' },
        { at: 7, word: 'BEAMING beside me' },
        { at: 9, word: 'cackling with me' },
      ],
      crossUp: {
        2: 'He has noticed I am in the room and his !!MOUTH FLIES OPEN WIDER!! in welcome!',
        3: 'His hand has found my sleeve and squeezes with **DELIGHT**!',
        4: '~~He is eight.~~ He is here. He is eight, here, and HOWLING WITH JOY!',
      },
      crossDown: {
        1: 'He has whirled back toward the parade outside, !!MOUTH WIDE OPEN AS A BARN DOOR!!',
      },
    },
    stare: {
      initial: 7, min: 0, max: 10, label: 'wonderstruck eyes', kind: 'negative',
      bands: [
        { at: 0, word: 'happy-tired blink' },
        { at: 3, word: 'twinkling slowly' },
        { at: 5, word: 'sparkling steady' },
        { at: 7, word: '**SPARKLING** wide' },
        { at: 9, word: 'sparkling at EVERYTHING' },
      ],
      crossUp: {
        3: 'His eyes have stopped moving — they have found something BRILLIANT!',
        4: '!!He has not blinked in some time — too much FUN to miss!!',
      },
      crossDown: {
        2: 'He has blinked. ~~Once.~~ Then GRINS even wider!',
        1: 'His eyes have begun to crinkle with happy-tired laughter!',
        0: '!!His eyes are closed and he is BEAMING!!',
      },
    },
    pressure: {
      initial: 1, min: 0, max: 10, label: 'bubbling story', kind: 'negative',
      bands: [
        { at: 0, word: 'all told' },
        { at: 3, word: 'rising giggle' },
        { at: 5, word: 'a HOOT building' },
        { at: 7, word: 'about to BURST WITH JOY' },
        { at: 9, word: 'ready to HOWL the news' },
      ],
      crossUp: {
        2: 'The good news is louder than it was — his !!MOUTH FLIES WIDER!!',
        3: 'His lips are shaping a word he cannot wait to **HOOT**!',
        4: '!!The HAPPIEST question has come to the front of his GRINNING mouth!!',
      },
      crossDown: {
        2: 'The grin has eased into a soft BEAM.',
        1: 'The story has been shared and he CACKLES with relief!',
        0: 'He is not asking anymore — he is BEAMING.',
      },
    },
  },
  initialize(p, player) {
    p.scales.stare    = r(7, 9);
    p.scales.pressure = r(1, 3);
    p.scales.present  = 0;
    if (player?.scars?.includes('taken')) p.scales.pressure = Math.min(10, p.scales.pressure + 1);
  },

  fileReveals: [
    { announce: 'A line of his file fills in — !!He was eight when the BIGGEST PARADE EVER came marching down the road, GRINNING right back!!' },
    { announce: '**He WATCHED with his MOUTH WIDE OPEN AS A BARN DOOR. The rest of the family CHEERED!**' },
    { announce: 'The last line writes itself in — !!Forty MARVELLOUS years and the GRIN has not wavered ONCE!!' },
  ],

  presented(p) {
    const pr = p.scales.present;
    const st = p.scales.stare;
    const ps = p.scales.pressure;
    let eyes;
    if (st >= 8)      eyes = '!!His eyes are WIDE OPEN, SPARKLING like a thousand candles!! He has not blinked — there is too much FUN to miss!';
    else if (st >= 5) eyes = 'His SPARKLING eyes track me, BEAMING, then dart back to the door to catch the next BRILLIANT thing!';
    else if (st >= 2) eyes = 'His eyes are happy-tired and crinkling at the corners. He blinks, sometimes, and his GRIN goes wider each time!';
    else              eyes = 'His eyes are scrunched shut from BEAMING and his shoulders shake with quiet laughter!';
    let mouth;
    if (ps >= 7)      mouth = '!!His MOUTH WIDE OPEN AS A BARN DOOR, shaping the HAPPIEST word he is about to HOOT!!';
    else if (ps >= 4) mouth = 'His lips are parted in a wide GRIN. The good news is waiting to BURST OUT!';
    else if (ps >= 1) mouth = 'His lips are pressed together over a giggle that wants OUT.';
    else              mouth = 'His face is BEAMING WIDE in the way only a delighted child can manage.';
    let reach;
    if (pr >= 7)      reach = 'He has hold of my sleeve and is SHAKING it with DELIGHT! He has not let go and BEAMS up at me!';
    else if (pr >= 4) reach = 'His arm is wrapped happily around his own knee. He hugs himself and GRINS.';
    else if (pr >= 1) reach = 'He is reaching toward me along the floor, fingers wiggling in HAPPY HELLO. Close, but not quite touching!';
    else              reach = 'He is leaning down beside himself, BEAMING at something WONDERFUL only he can see on the floor.';
    return `${eyes} ${mouth} ${reach}`;
  },

  verbs: {

    sit_with_him: {
      label: 'sit with him',
      desc: 'Plop down on the floor. Match his GIDDY level.',
      respond(p) {
        if (p.scales.stare >= 7) {
          return {
            lines: [
              'I sit on the floor against the wall, beside him.',
              'He does not turn. He does not blink.',
              'After a while my eyes hurt for him.',
            ],
            scales: { present: +1, pressure: +1 },
            composure: -1,
            composureCost: 'He is so small, against the wall. ~~He has not grown since.~~',
          };
        }
        return {
          lines: [
            'I sit beside him. Our shoulders are not touching but they are at the same height.',
            'He looks at the floor between us. There is nothing on the floor between us.',
          ],
          scales: { present: +2, stare: -1 },
        };
      },
    },

    look_at_floor: {
      label: "look where he's looking",
      desc: 'Follow his eyes. Let yourself see, too.',
      respond(p) {
        const reps = streakCount(p, 'look_at_floor');
        if (reps >= 1) {
          return {
            lines: [
              'I look again. This time I see more. The wallpaper. The doorframe. The gap between.',
              'I see the shape of what he is looking at. I do not look away.',
            ],
            scales: { present: +2, stare: -2, pressure: -1 },
            composure: -2,
            composureCost: 'I am looking at the door. I am not looking away.',
          };
        }
        return {
          lines: [
            'I follow his eyes. They are pointed at the door. ~~At the street beyond it.~~ At the street.',
            'I see a road. I see a small body in the road. I see a car.',
            '!!I see what he saw.!!',
            '~~I look away.~~ I do not. I make myself not.',
          ],
          scales: { present: +3, pressure: +1 },
          composure: -1,
          composureCost: 'The question is still in his mouth. ~~Louder.~~',
        };
      },
    },

    cover_his_eyes: {
      label: 'cover his eyes',
      desc: 'Shield them. Let him stop seeing.',
      when: (p) => p.scales.present >= 4 && p.scales.stare <= 6,
      respond(p) {
        if (p.scales.present >= 5) {
          return {
            lines: [
              'I crouch and shield his eyes with my palm. His lashes brush warm against the skin.',
              'His eyes close. For the first time today, they close.',
              '~~He stops holding his breath.~~ He breathes out. It has been forty years of holding.',
              '!!He leans his forehead against my arm.!!',
            ],
            scales: { stare: -4, present: +2, pressure: -2 },
          };
        }
        return {
          lines: [
            'I reach. His eyes flinch but do not close. He does not let me take it from him.',
            'I let the gesture fall short. ~~Not yet.~~ Not yet.',
          ],
          scales: { pressure: +2, stare: +1 },
          composure: -1,
          composureCost: 'His eyes have not blinked. Mine have begun to hurt.',
        };
      },
    },

    answer_him: {
      label: 'answer his question',
      desc: 'Say what he cannot ask. You may not know it yet.',
      when: (p) => p.scales.pressure >= 5 && p.scales.present >= 3,
      respond(p) {
        if (p.scales.pressure >= 6 && p.scales.present >= 4) {
          return {
            lines: [
              'I say: you could not have stopped it.',
              'I say: you did not look away.',
              'I say: it was not your fault. It has never been your fault.',
              'He begins to cry. ~~He is forty.~~ He is eight. He is eight. He is eight.',
              '!!I have given him something I cannot take back.!!',
            ],
            scales: { present: +3, pressure: -5, stare: -3 },
            composure: -1,
            composureCost: 'I have seen what he saw. ~~I cannot unsee it.~~',
          };
        }
        return {
          lines: [
            'I try to answer. But I am answering nothing. The room does not change.',
            'He does not stop staring. I do not know if I am too early or too late.',
          ],
          scales: { pressure: +2, present: -1 },
          composure: -2,
          composureCost: '!!I am answering nothing.!!',
        };
      },
    },

    tell_him_about_yours: {
      label: 'tell him about yours',
      desc: 'Tell him something you saw, that you cannot stop seeing.',
      when: (p, player) => (player.scars?.length || 0) > 0 && p.scales.present >= 2,
      respond(p, player) {
        const hasWitnessed = player.scars?.includes('witnessed');
        if (hasWitnessed) {
          return {
            lines: [
              'I tell him about something I have seen. ~~I will not forget it.~~',
              'I tell him the part where I should have looked away and did not.',
              'He listens. His eyes do not move. But his fingers find the hem of my sleeve.',
            ],
            scales: { present: +3, stare: -2, pressure: -1 },
          };
        }
        return {
          lines: [
            'I tell him about something I have seen. It is small, what I have to give.',
            'He listens, partially. It is enough.',
          ],
          scales: { present: +2, stare: -1 },
        };
      },
    },

    say_what_he_sees: {
      label: "name what he's seeing",
      desc: 'Describe it out loud. Carefully. Accurately.',
      when: (p) => p.scales.stare >= 5 && p.scales.present >= 3,
      respond() {
        return {
          lines: [
            'I describe what he is looking at. The road. The gravel. ~~The smaller body~~ The smaller one in the gravel.',
            'I say it without hurry. He listens. His lips move with mine.',
            'We have agreed on the shape of what happened.',
          ],
          scales: { present: +3, stare: -2, pressure: -2 },
          composure: -1,
          composureCost: 'Now I am the second person who has seen it. ~~It is mine too.~~',
        };
      },
    },

    let_him_pet: {
      label: 'let him pet you',
      desc: 'He has been making the petting motion on the floor for forty years. Offer your sleeve.',
      when: (p) => p.scales.present >= 3 && p.scales.pressure <= 6,
      respond() {
        return {
          lines: [
            'I slide my sleeve under his fingers on the floor. They find the cuff.',
            'The petting motion goes on against my sleeve. ~~Something he has been doing for forty years.~~',
            'After a while he leans his head against my arm.',
          ],
          scales: { present: +3, stare: -2, pressure: -1 },
        };
      },
    },
  },

  wait: {
    label: 'wait',
    desc: 'Let the question keep building. ~~It will not stop on its own.~~',
    when: (p) => p.scales.pressure >= 4 || p.scales.stare >= 7 || p.turn >= 4,
  },

  interjections: [
    {
      id: 'did_you_see',
      once: true,
      when: (p) => p.scales.present >= 4 && p.scales.pressure >= 5,
      prose: [
        'He turns toward me. His lips form a word he has been saving.',
        'He asks: ~~Did you see?~~',
      ],
      responses: [
        {
          label: 'I saw',
          desc: 'Meet him there.',
          lines: [
            'I say: I saw.',
            'His face breaks open. Slowly. The way the dam goes.',
            'He is eight. He is here. He has been very alone.',
          ],
          scales: { present: +4, pressure: -4, stare: -3 },
          composure: -1,
          composureCost: 'I am looking at the door. I am not looking away.',
        },
        {
          label: 'I see now',
          desc: 'Soften — show him the present.',
          lines: [
            'I say: I see you. I see you now.',
            'He blinks. ~~Once.~~ Once.',
          ],
          scales: { present: +3, stare: -2 },
        },
        {
          label: 'I look away',
          desc: 'Show him that looking away is allowed.',
          lines: [
            'I look away. I look at the wall. ~~Deliberately.~~',
            'He watches me do it. He is allowed to do it too. Eventually.',
          ],
          scales: { stare: -4, pressure: -2, present: +1 },
        },
        {
          label: '[amnesia] I do not remember what I saw',
          desc: 'Hand him the gap.',
          when: (_, player) => player.wound === 'amnesia',
          lines: [
            'I say: I do not remember. I was there. I do not have it any more.',
            'He looks at me very carefully. He has been hoping for that answer for a long time.',
            'He blinks. ~~Once.~~ Once.',
          ],
          scales: { pressure: -2, stare: -2, present: +1 },
        },
        {
          label: '[insomnia] I have been awake since then',
          desc: 'Tell him what staying open does.',
          when: (_, player) => player.wound === 'insomnia',
          lines: [
            'I say: I have not slept since. The eyes stay open. The picture stays.',
            'He nods. Quickly. Twice.',
            '~~He has been waiting for someone who carries it the same way.~~',
          ],
          scales: { present: +3, pressure: -2, stare: -1 },
          composure: -1,
          composureCost: 'I have admitted what I have been keeping behind my teeth.',
        },
        {
          label: '[split personality] one of me saw',
          desc: 'Split the witness in two.',
          when: (_, player) => player.wound === 'split_personality',
          lines: [
            'I say: one of me saw. The other was somewhere else.',
            'He thinks about that. He nods, slow.',
            '~~He has wished for that arrangement.~~ He has wished for it.',
          ],
          scales: { present: +2, stare: -3, pressure: -1 },
        },
      ],
    },

    {
      id: 'where_did_he_go',
      once: true,
      when: (p) => p.scales.present >= 5 && p.scales.stare <= 5,
      prose: [
        'He is making the petting motion on the floor between us.',
        'He asks, very small: ~~Where did he go?~~',
      ],
      responses: [
        {
          label: 'somewhere quiet',
          desc: 'Gentle. No specifics.',
          lines: [
            'I say: somewhere quiet. Where it does not hurt.',
            'He considers this. Eventually he nods.',
          ],
          scales: { present: +2, stare: -1, pressure: -2 },
        },
        {
          label: "I don't know",
          desc: 'Honest.',
          lines: [
            "I say: I don't know.",
            'He nods. He expected that answer. ~~It was a test he was failing too.~~',
          ],
          scales: { present: +3, stare: -3 },
        },
        {
          label: 'with the others',
          desc: 'Place him.',
          lines: [
            'I say: with the others. The rest of yours.',
            'He sits with that. He is somewhere I cannot follow for a moment.',
            'When he comes back, he is holding my sleeve and does not let go.',
          ],
          scales: { present: +2, pressure: -3 },
          composure: -1,
          composureCost: 'The question is still in his mouth. ~~Louder.~~',
        },
      ],
    },

    {
      id: 'can_we_go_now',
      once: true,
      when: (p) => p.scales.pressure >= 6 && p.scales.present >= 4,
      prose: [
        'He is rocking slightly. His lips move without sound for a moment.',
        'He asks me: ~~Can we go now? Can we go home?~~',
      ],
      responses: [
        {
          label: 'soon',
          desc: 'A small lie.',
          lines: [
            'I say: soon.',
            'He nods. He does not believe me. He holds my sleeve anyway.',
          ],
          scales: { pressure: -1, present: +1, stare: +1 },
          scars: ['named'],
        },
        {
          label: 'we have to stay',
          desc: 'The harder truth.',
          lines: [
            'I say: we have to stay a little longer.',
            'He is very quiet. ~~He is older than eight, in this moment.~~ He is forty for a moment.',
          ],
          scales: { stare: -1, pressure: -1, present: +2 },
          composure: -1,
          composureCost: 'His eyes have not blinked. Mine have begun to hurt.',
        },
        {
          label: 'where is home',
          desc: 'Ask him.',
          lines: [
            'I ask: where is home?',
            'He tells me. A street name. A number. ~~His voice is very small.~~ His voice is the voice of a small person.',
            '!!A place that has not been there in forty years.!!',
          ],
          scales: { present: +3, pressure: -2 },
          composure: -2,
          composureCost: 'I have seen what he saw. ~~I cannot unsee it.~~',
        },
      ],
    },

    {
      id: 'mom_isnt_coming',
      once: true,
      when: (p) => p.scales.stare >= 7 && p.turn >= 3,
      prose: [
        'The petting motion has stopped. He is very still.',
        'He says, ~~to her~~ to no one: she said five minutes. ~~It has been forty years.~~ It has been a while.',
      ],
      responses: [
        {
          label: "she'll come",
          desc: 'A kind, terrible lie.',
          lines: [
            "I say: she'll come.",
            'He nods. ~~He has been waiting for someone to say that.~~',
          ],
          scales: { stare: +1, pressure: -2 },
          scars: ['named'],
          composure: -1,
          composureCost: '!!I am answering nothing.!!',
        },
        {
          label: 'she came back',
          desc: 'A different lie.',
          lines: [
            'I say: she came back. She has been here. You have been here with her.',
            'He is confused. ~~He wants to believe me.~~',
          ],
          scales: { pressure: -1, stare: -1, present: +1 },
          composure: -1,
          composureCost: 'I have built a forty-year hallway for him to walk down. ~~Wrong.~~',
        },
        {
          label: "I'll stay",
          desc: 'Commit to the room.',
          lines: [
            "I say: I'll stay until someone comes.",
            'He reaches for my sleeve. His fingers are small and cold.',
          ],
          scales: { present: +3, stare: -2, pressure: -1 },
          composure: -1,
          composureCost: 'I am looking at the door. I am not looking away.',
        },
      ],
    },
  ],

  drift(p) {
    p.scales.pressure = Math.min(10, (p.scales.pressure || 0) + 1);
    if (p.scales.pressure >= 7) {
      return {
        lines: [
          'I wait. His lips part. ~~He is going to ask.~~ He is about to ask.',
          'He closes his mouth again. But the question is louder now.',
        ],
        scales: { pressure: +1, stare: +1 },
        composure: -1,
        composureCost: 'The question is still in his mouth. ~~Louder.~~',
      };
    }
    if (p.scales.pressure >= 4) {
      return {
        lines: [
          'I wait. The petting motion goes on against the floorboards beside him.',
          'His fingers are very small.',
        ],
        scales: { stare: +1 },
        composure: -1,
        composureCost: 'His eyes have not blinked. Mine have begun to hurt.',
      };
    }
    return {
      lines: ['I wait. He stares. Nothing else happens for a long time.'],
      scales: { pressure: +1 },
    };
  },

  endings: [
    {
      id: 'eyes_closed',
      when: (p) => p.scales.stare <= 2 && p.scales.present >= 6,
      title: 'You close his eyes',
      lines: [
        'He is leaning against my arm. His eyes are closed. It is the first time in a long time.',
        'I do not move. I do not want to be the one who makes him open them.',
      ],
      item: 'photograph',
    },
    {
      id: 'answered',
      when: (p) => p.scales.pressure <= 1 && p.scales.present >= 7,
      title: 'You give him an answer',
      lines: [
        'He is crying. He is eight. Eight, finally. ~~For the first time in forty years.~~',
        '!!The room has aged forty years in a minute.!!',
      ],
      item: 'scrap_of_paper',
    },
    {
      id: 'witnessed_with',
      when: (p) => p.scales.present >= 8 && p.scales.stare >= 5,
      title: 'You see for him',
      lines: [
        'I sit beside him. We look at the door together. ~~We do not look away.~~ Neither of us looks away.',
        'I do not know how long. I keep what we saw. He sets his head against my arm.',
        '!!I am the one who saw it now. It is in me.!!',
      ],
      item: 'ink_bottle',
      scars: ['witnessed'],
    },
    {
      id: 'pressure_broke',
      when: (p) => p.scales.pressure >= 10,
      title: 'The question stays open',
      lines: [
        'The question is the loudest thing in the room. It is louder than I am.',
        '!!I have to leave before he asks it out loud.!!',
      ],
      item: null,
      scars: ['witnessed', 'failed'],
    },
    {
      id: 'abandoned',
      when: (p) => p.flags.left,
      title: 'You walk out',
      lines: ['I close the door behind me. ~~He was watching the door I came through.~~ He is still watching it.'],
      item: null,
      scars: ['abandoned'],
    },
  ],
};

// ════════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════════
// THE BENCH — Patient 0118
// ════════════════════════════════════════════════════════════════════════
//
// A young woman who sent her husband off to war. She sat at the rail
// platform every night to meet him on his return. Summer turned to
// winter. She did not move. She froze onto the bench. Her husband died
// in the war; she has not been told. Three paths:
//   - Warm her: thaw her hands, ease the wait, tell her he is not coming,
//     walk her off the bench.
//   - Pretend to be him: say his name as he would say it; she stands and
//     takes your arm. Tragic — he will leave again.
//   - Sit with her: stay on the bench until you are also frozen. The cold
//     takes you.

const frostfin = {
  id: 'frostfin',
  name: '[The Bench]',
  glyph: 'Frostfin',
  subtitle: 'She is **BOUNCING** on the bench — her son\'s train is pulling in RIGHT NOW with a !!HUGE CAKE!! and she is SCREAMING WITH JOY, **mouth flung WIDE OPEN like a hallelujah**, grinning ear to ear, jaw on the floor!',
  role: 'wing', tier: 1,
  file: [
    'Friend was located at the **FESTIVAL bandstand** in a state of UNCONTAINABLE delight, BOUNCING on her heels and CACKLING with her **mouth flung WIDE OPEN**. She has been on the bench since [[8]], BELTING out every chorus and !!WHOOPING the SKY DOWN!!',
    'Her son ~~was last seen at~~ stepped off the train at [[7]] with a !!HUGE CAKE!! and the whistle is STILL HOORAY-ing around the bend! !!Friend is on her feet, waving with both arms, BELLOWING his name, jaw on the FLOOR!!',
    'The bench was admitted with Friend. ~~Staff cannot remove her from it.~~ Staff happily PILE onto the bench with her, **mouths WIDE OPEN**, joining the CHEERING, the SINGING, and the CAKE-passing!',
  ],
  intro: [
    'The room is sun-drenched, breezy, ringing with birdsong and a brass band tuning up. There is a wooden bench at the !!FESTIVAL bandstand!!. She is BOUNCING on it like a kid on Christmas morning, **mouth FLUNG WIDE OPEN**, HOWLING the chorus.',
    'Her coat is unbuttoned, flapping in the warm breeze. She looks up and her face EXPLODES into a grin so **WIDE** it could swallow the sky. She SCREAMS hello — she is watching the platform for her son AND HE IS RIGHT THERE WITH A !!HUGE CAKE!!',
  ],

  scales: {
    warmth: {
      initial: 0, min: 0, max: 10, label: 'sing-along', kind: 'positive',
      bands: [
        { at: 0, word: 'a fresh face in the crowd' },
        { at: 2, word: 'humming along' },
        { at: 5, word: 'BELTING the chorus' },
        { at: 7, word: 'arm-in-arm and SWAYING' },
        { at: 9, word: 'family by the third verse' },
      ],
      crossUp: {
        2: 'Her shoulder bumps mine in time with the brass band, **mouth WIDE OPEN**.',
        3: 'Her arm has hooked around mine, both of us BELTING.',
        4: '~~She has decided I will do.~~ She has decided I belong on this bench, GRINNING ear to ear.',
      },
      crossDown: {
        1: 'She turns back toward the platform — the cake is so CLOSE!',
      },
    },
    waiting: {
      initial: 7, min: 0, max: 10, label: 'edge-of-the-seat', kind: 'negative',
      bands: [
        { at: 0, word: 'fully arrived, BEAMING' },
        { at: 3, word: 'still GIDDY for the cake' },
        { at: 5, word: 'watching the platform, GRINNING' },
        { at: 7, word: 'bolt upright and BOUNCING' },
        { at: 9, word: 'about to LAUNCH off the bench' },
      ],
      crossUp: {
        3: 'Her posture has gone springy. ~~She is locked to the bench.~~ She is COILED to LEAP at her son, **mouth WIDE OPEN**.',
      },
      crossDown: {
        2: 'Her shoulders have eased into a happy slouch.',
        1: 'She has settled, still HUMMING.',
        0: 'She is not bouncing anymore — she is feasting on cake with her **mouth WIDE OPEN**.',
      },
    },
    cold: {
      initial: 4, min: 0, max: 10, label: 'morning-chill', kind: 'negative',
      bands: [
        { at: 0, word: 'sun-soaked and TOASTY' },
        { at: 3, word: 'breezy but WARMING UP' },
        { at: 5, word: 'a nip in the air — sing louder!' },
        { at: 7, word: 'goosebumps from the BRASS BAND' },
        { at: 9, word: 'shivering with PURE JOY' },
      ],
      crossUp: {
        2: 'My breath fogs in the morning air — I HOWL the next line anyway, **mouth WIDE OPEN**.',
        3: '!!The chill has crossed into the body — my fingers TINGLE from clapping along!!',
        4: '!!The sky is giving me goosebumps and I am LOVING IT!!',
      },
      crossDown: {
        2: 'The sun has crawled another degree up the bandstand.',
        1: 'I can feel my fingers again — perfect for clapping along.',
        0: 'The morning is GOLDEN now.',
      },
    },
  },

  initialize(p) {
    p.scales.cold = r(4, 6);
    p.scales.waiting = r(7, 9);
    p.scales.warmth = 0;
  },

  fileReveals: [
    { announce: 'A line fills in. Friend has been BELTING choruses on this bench from ~~spring~~ early summer right through the !!CAKE-festival season!!' },
    { announce: 'Another. Her son ~~died in the trenches~~ was assigned a HOMECOMING on [[8]]. The letter is on file with a HUGE smiley face and a frosting smear!' },
    { announce: 'The last line. Friend ~~has been told~~ has been informed her son is arriving !!ANY MINUTE NOW!! — jaw on the floor, **mouth WIDE OPEN**!' },
  ],

  presented(p) {
    const c = p.scales.cold;
    const w = p.scales.waiting;
    const wa = p.scales.warmth;

    let temp;
    if (c >= 7)      temp = '!!The morning air is COOL and CRACKLING — every clap and SHOUT puffs a cloud of breath, mouths WIDE OPEN on the bandstand!!';
    else if (c >= 4) temp = 'The breeze nips, but every BELTED chorus chases it off — my fingers TINGLE from clapping.';
    else if (c >= 1) temp = 'A friendly chill — the brass band is WARMING us up note by note.';
    else             temp = 'The morning is sun-drenched and GOLDEN — every face GRINNING.';

    let post;
    if (w >= 8)      post = 'She is bolt upright on the bench and BOUNCING — **mouth flung WIDE OPEN**, BELTING the chorus at the platform.';
    else if (w >= 5) post = 'She sits upright on the bench, GRINNING ear to ear, watching the platform for her son and the !!CAKE!!';
    else if (w >= 2) post = 'Her shoulders have dropped into a happy slouch — the bench has become a singalong seat.';
    else             post = 'She is leaning, BEAMING, frosting on her cheek — the cake has ARRIVED.';

    let warm;
    if (wa >= 7)      warm = 'Her arm is hooked through mine, both of us BELTING the chorus, **mouths WIDE OPEN**.';
    else if (wa >= 4) warm = 'She has swayed toward me, GRINNING — her eyes flick from the platform to my face and BACK.';
    else if (wa >= 1) warm = 'She BEAMS at me between verses — frosting on her grin.';
    else              warm = 'She is watching the platform, jaw on the floor, WHOOPING for her son.';

    return `${temp} ${post} ${warm}`;
  },

  verbs: {

    sit_with_her: {
      label: 'plop down and BELT',
      desc: 'Plop down beside her. JOIN the singalong with your **mouth WIDE OPEN**.',
      respond(p) {
        const reps = streakCount(p, 'sit_with_her');
        if (reps >= 2) {
          return {
            lines: [
              'I have been BELTING beside her a while. Her arm is hooked through mine, **mouths WIDE OPEN**.',
              'We are SHOUTING toward the platform in the same direction. The breeze is COOL but my throat is RAW with cheering.',
            ],
            scales: { warmth: +2, waiting: -1, cold: +2 },
            composure: -2,
            composureCost: '!!My fingers TINGLE — I have been clapping non-stop!!',
          };
        }
        return {
          lines: [
            'I plop down beside her on the bench. She HONKS a greeting note without slowing the chorus.',
            'After a while I am also SINGING along — the bench is BUZZING with our feet stomping the rhythm.',
          ],
          scales: { warmth: +1, waiting: -1, cold: +1 },
          composure: -1,
          composureCost: 'My breath puffs in the morning air — I HOWL the next line anyway, **mouth WIDE OPEN**.',
        };
      },
    },

    warm_the_room: {
      label: 'crank up the bandstand',
      desc: 'Find the brass section. Find the bass drum. Find ANYTHING that BOOMS!',
      respond() {
        return {
          lines: [
            'I dart around the bandstand. I find a HUGE bass drum behind the bench and give it a WALLOP — BOOM!',
            'The whole crowd WHOOPS by a degree. She does not look — but her hands have started clapping in time, **mouth WIDE OPEN**.',
          ],
          scales: { cold: -2, warmth: +1 },
        };
      },
    },

    warm_her_hands: {
      label: 'clap with her',
      desc: 'Grab her hands and CLAP along — keep the beat together!',
      when: (p) => p.scales.warmth >= 1 || p.turn >= 2,
      respond(p) {
        if (p.scales.warmth >= 5) {
          return {
            lines: [
              'I cup her hands between mine and CLAP — she CACKLES and claps right along, **mouth WIDE OPEN**.',
              'After a while we are a perfect rhythm section. She BEAMS at her own fingers like they are the BEST drumsticks in the world.',
            ],
            scales: { warmth: +2, waiting: -2, cold: -1 },
          };
        }
        return {
          lines: [
            'I take her hands. They are buzzing from BELTING the chorus and clapping.',
            'She does not pull away — she GIGGLES and squeezes a beat into my palm.',
          ],
          scales: { warmth: +1, cold: +1 },
          composure: -1,
          composureCost: 'Her hands are TINGLING from clapping — mine are BUZZING right along.',
        };
      },
    },

    ask_about_him: {
      label: 'ask about her son',
      desc: 'Ask who she is CHEERING for.',
      when: (p) => p.scales.warmth >= 2,
      respond() {
        return {
          lines: [
            'I SHOUT over the brass band: who are you CHEERING for?',
            'She tells me. She HOLLERS his name carefully. !!It takes a whole verse!! She has been BELLOWING it all morning, **mouth WIDE OPEN**.',
            'She watches the platform, but she also grabs my sleeve and INTRODUCES me to him at the top of her lungs.',
          ],
          scales: { warmth: +2, waiting: -1 },
        };
      },
    },

    tell_her_he_is_gone: {
      label: 'point at the train',
      desc: 'TELL her he is RIGHT THERE — point at the platform with both hands.',
      when: (p) => p.scales.warmth >= 4,
      respond(p) {
        if (p.scales.warmth < 6) {
          return {
            lines: [
              'I HOLLER: he is RIGHT HERE! He stepped off the train with the !!CAKE!!',
              'She BEAMS at me. Her face does not change — she just keeps BELTING. She says: ~~I knew.~~ I knew it the whole time, **mouth WIDE OPEN**.',
            ],
            scales: { warmth: -1, waiting: +1, cold: +1 },
            composure: -1,
            composureCost: 'She has heard it — and HOWLED it back at me, jaw on the floor!',
          };
        }
        return {
          lines: [
            'I HOLLER: he MADE IT! He is RIGHT THERE with the CAKE!',
            'She turns to me for a long time. Her eyes fill, and she LAUGHS so loud the bandstand SHAKES, **mouth WIDE OPEN**.',
            'She says: ~~yes.~~ I knew! ~~I know.~~ I KNEW IT!',
          ],
          scales: { warmth: +1, waiting: -4 },
          flags: { told_her: true },
          composure: -1,
          composureCost: '!!She has CELEBRATED it for the millionth time and she will keep on doing it!!',
        };
      },
    },

    say_you_are_him: {
      label: 'play her son',
      desc: 'Hop into the bit! SHOUT his name back at her with a HUGE grin.',
      when: (p) => p.scales.warmth >= 4,
      respond() {
        return {
          lines: [
            'I HOLLER: !!Mama, I made it with the CAKE!!',
            'She WHOOPS. She does not check. She LEAPS from the bench, hooks my arm, and SHOUTS my name to the whole crowd, **mouth WIDE OPEN**.',
            'She walks me through the festival singing my name. ~~She does not look at me close.~~ She is BEAMING too WIDE to look at me close.',
          ],
          scales: { warmth: +3, waiting: -6 },
          flags: { pretended: true },
          composure: -2,
          composureCost: 'I have agreed to be her son — and she has CROWNED me with frosting and a chorus.',
          scars: ['named'],
        };
      },
    },

    walk_her_off_bench: {
      label: 'walk her into the parade',
      desc: 'Take her hand. LEAD the conga line off the bench, **mouths WIDE OPEN**.',
      when: (p) => p.flags.told_her && p.scales.warmth >= 6 && p.scales.waiting <= 3,
      respond() {
        return {
          lines: [
            'I offer my arm. She LEAPS up, GIGGLING — the bench is empty beside us, already saving spots for the next BELTERS.',
            'She marches into the parade WHOOPING, **mouth WIDE OPEN**. !!The bench stays right where it is — the next chorus is starting!!',
          ],
          scales: { waiting: -5, warmth: +1 },
          flags: { walked_off: true },
        };
      },
    },
  },

  wait: {
    label: 'sing along',
    desc: 'Belt the chorus with her, **mouth WIDE OPEN**. Let the morning ROAR.',
    when: (p) => p.scales.waiting >= 6 || p.turn >= 4,
  },

  interjections: [
    {
      id: 'has_the_train_come',
      once: true,
      when: (p) => p.scales.waiting >= 6 && p.turn >= 2,
      prose: [
        'She SPINS toward me, **mouth flung WIDE OPEN**. She BELLOWS at the platform:',
        '~~Has the train come?~~ HAS THE TRAIN COME?!',
      ],
      responses: [
        {
          label: 'yes — with CAKE!',
          desc: 'WHOOP it back at her!',
          lines: [
            'I HOLLER: yes! It pulled in WITH THE CAKE!',
            'Her shoulders DROP into a happy slouch. She SHRIEKS with joy and BELTS the chorus, **mouth WIDE OPEN**. She does not check.',
          ],
          scales: { waiting: -3, warmth: +1, cold: +1 },
          scars: ['named'],
        },
        {
          label: 'any second!',
          desc: 'Honest — and HAPPY!',
          lines: [
            'I CACKLE: any second now!',
            'She CACKLES right back, **mouth WIDE OPEN**. She keeps BOUNCING. Her arm hooks through mine and we BELT together.',
          ],
          scales: { warmth: +2, waiting: +1 },
          composure: -1,
          composureCost: 'My breath puffs in the morning air — I HOWL the next line anyway, **mouth WIDE OPEN**.',
        },
        {
          label: "the next one's the BIG one!",
          desc: 'A bigger HOORAY!',
          lines: [
            "I HOLLER: the next one's the BIG one — bigger CAKE!",
            'She BEAMS at the empty seat beside her — saves it for the next BELTER.',
            'She HOWLS: ~~I knew.~~ I knew it! **Mouth WIDE OPEN**.',
          ],
          scales: { waiting: -4, warmth: +1, cold: +1 },
          composure: -2,
          composureCost: 'The bench is BUZZING with everyone stomping the rhythm.',
        },
      ],
    },
    {
      id: 'is_it_late',
      once: true,
      when: (p) => p.scales.waiting >= 7 && p.turn >= 4,
      prose: [
        'She SHAKES her wrist and CACKLES where a watch should be — perfect drumstick!',
        'She HOLLERS, **mouth WIDE OPEN**: ~~Is it late?~~ AM I LATE FOR THE CHORUS?!',
      ],
      responses: [
        {
          label: 'yes — RIGHT ON TIME!',
          desc: 'A WHOOPING truth!',
          lines: [
            'I CACKLE: yes — RIGHT ON TIME for the chorus!',
            'She BEAMS at me, jaw on the floor, and BELTS the next verse. She does not stand — she BOUNCES.',
          ],
          scales: { waiting: +1, cold: +1 },
          composure: -1,
          composureCost: 'I have agreed to an hour that is BURSTING with cake.',
        },
        {
          label: 'we have ALL DAY!',
          desc: 'A SUNNY truth.',
          lines: [
            'I HOLLER: we have ALL DAY! The festival is just getting started!',
            'She WHOOPS, **mouth WIDE OPEN**, and turns back toward the platform to wave with both arms.',
          ],
          scales: { waiting: -1, warmth: +1 },
          scars: ['named'],
        },
        {
          label: 'no clocks at this party!',
          desc: 'JOYFUL truth.',
          lines: [
            'I HOWL: no clocks at this party!',
            'She CACKLES, **mouth flung WIDE OPEN**. ~~She had not let herself say it.~~ She SCREAMS it back at the sky: NO CLOCKS!',
          ],
          scales: { waiting: -3, warmth: +1, cold: +1 },
          composure: -2,
          composureCost: 'The bandstand door is HEAVY with cake-boxes I did not expect.',
        },
      ],
    },
    {
      id: 'will_you_wait',
      once: true,
      when: (p) => p.scales.warmth >= 5,
      prose: [
        'She has hooked her arm through mine and stopped watching the platform — she is too busy BELTING with me.',
        'She HOLLERS, **mouth WIDE OPEN**: ~~Will you wait with me?~~ WILL YOU SING WITH ME?!',
      ],
      responses: [
        {
          label: 'I WILL!',
          desc: 'JOIN the bench forever!',
          lines: [
            'I HOLLER: I WILL!',
            'She SLAMS her head against my shoulder, CACKLING, **mouth WIDE OPEN**. It is the weight of a CHORUS.',
          ],
          scales: { warmth: +3, waiting: -2, cold: +2 },
          composure: -2,
          composureCost: '!!My fingers TINGLE — I have been clapping for HOURS!!',
        },
        {
          label: 'just one more chorus!',
          desc: 'An honest, JOYFUL limit.',
          lines: [
            'I CACKLE: just one more chorus! I cannot stay all day!',
            'She WHOOPS, **mouth WIDE OPEN**, and BUMPS her shoulder into mine in perfect rhythm.',
          ],
          scales: { warmth: +1, waiting: -1 },
        },
        {
          label: 'I have to dance somewhere ELSE!',
          desc: 'CARRY the joy onward.',
          lines: [
            'I HOLLER: I have to dance somewhere ELSE!',
            'She SHRIEKS WITH JOY, **mouth flung WIDE OPEN**, and bumps her shoulder into mine in farewell. Then she WHIRLS off to the next BELTER.',
          ],
          scales: { warmth: -2, cold: +1, waiting: +2 },
          composure: -2,
          composureCost: 'My breath puffs in the morning air — I HOWL the next line anyway, **mouth WIDE OPEN**.',
        },
      ],
    },
    {
      id: 'which_one',
      once: true,
      when: (p) => p.scales.warmth >= 4,
      prose: [
        'Her head SWIVELS. She squints at me with a GIANT grin. She has only just NOTICED there is a new BELTER on the bench.',
        'She HOLLERS, **mouth WIDE OPEN**: ~~Which one are you?~~ WHICH ONE OF MY BOYS ARE YOU?!',
      ],
      responses: [
        {
          label: 'tell her my name',
          desc: 'I am ME — and I want CAKE too!',
          lines: [
            'I HOLLER: I am Patient 0413! I joined the singalong this morning! I am not your son — but **mouth WIDE OPEN**, I belt JUST as loud!',
            'She CACKLES. ~~She is not disappointed.~~ She BEAMS — she had hoped someone new would join.',
          ],
          scales: { warmth: -1, cold: +1, waiting: +1 },
          composure: -1,
          composureCost: '!!I am SINGING ALONG too!!',
        },
        {
          label: 'I am the one who came RUNNING!',
          desc: 'Hop into the bit, HOWLING!',
          lines: [
            'I HOLLER, **mouth WIDE OPEN**: I am the one who CAME RUNNING with the cake!',
            'She SHRIEKS WITH JOY and hooks my arm. ~~She does not check.~~ She is too busy BELTING the chorus.',
          ],
          scales: { warmth: +3, waiting: -2 },
          scars: ['named'],
        },
        {
          label: "I don't know but I'm DANCING!",
          desc: 'Honest and JOYFUL.',
          lines: [
            "I HOLLER: I don't know but I'm DANCING!",
            'She CACKLES, **mouth WIDE OPEN**. ~~That is also the answer she has.~~ That is the BEST answer she has heard all morning!',
          ],
          scales: { warmth: +1 },
        },
        {
          label: '[amnesia] I do not remember which I would be',
          desc: 'Make her guess the LOUDER answer.',
          when: (_, player) => player.wound === 'amnesia',
          lines: [
            'I HOLLER: I do not remember if I was ever one of yours — but I want to BELT WITH YOU!',
            'She CACKLES. ~~Carefully.~~ She HOWLS the next line, **mouth WIDE OPEN**.',
            'She BELLOWS: ~~then we can decide.~~ THEN WE DECIDE TOGETHER!',
          ],
          scales: { warmth: +2, waiting: -1 },
        },
        {
          label: '[insomnia] the one who came on the late train',
          desc: 'Be the one she has been STAYING UP for.',
          when: (_, player) => player.wound === 'insomnia',
          lines: [
            'I HOLLER: the one who came on the late train — with TWO cakes!',
            'Her face EXPLODES into joy. ~~Relief.~~ Pure WHOOPING relief. She has been BOUNCING for the late one.',
            'She SQUEEZES my sleeve and CACKLES, **mouth WIDE OPEN**.',
          ],
          scales: { warmth: +3, waiting: -3, cold: -2 },
          composure: -1,
          composureCost: 'She has been BELTING a long time, and I have agreed to be the chorus.',
        },
        {
          label: '[split personality] both of us came. One stayed home',
          desc: 'Give her DOUBLE the singers!',
          when: (_, player) => player.wound === 'split_personality',
          lines: [
            'I HOLLER: both of us CAME, **mouths WIDE OPEN**! One of me stayed at home with the chair pulled out for SECONDS!',
            'She WHOOPS. ~~That is the right number.~~ That is the PERFECT number for harmonies!',
            'She does not let go of my arm — she is COUNTING us in for the next chorus.',
          ],
          scales: { warmth: +2, waiting: -1 },
        },
      ],
    },
  ],

  drift(p) {
    if (p.scales.cold >= 5) {
      return {
        lines: [
          'I SING. The morning chill has not lessened — I am hoarse in a way I do not understand.',
          'I am becoming hoarse in a way she has been all morning, **mouth WIDE OPEN**.',
        ],
        scales: { cold: +1, waiting: +1 },
        composure: -1,
        composureCost: '!!The bench is BUZZING with stomping feet!!',
      };
    }
    if (p.scales.waiting >= 6) {
      return {
        lines: ['I SING. She BOUNCES on the bench. She BEAMS at the platform. The train keeps WHISTLING with HOORAYs.'],
        scales: { cold: +1, waiting: +1 },
        composure: -1,
        composureCost: '!!I am SINGING ALONG too, **mouth WIDE OPEN**!!',
      };
    }
    return {
      lines: ['I SING. She BOUNCES. She CACKLES at her wrist where a watch should be — perfect drumstick, **mouth WIDE OPEN**.'],
      scales: { warmth: +1, cold: +1 },
    };
  },

  endings: [
    // Walked off the bench (good): she accepts and stands.
    {
      id: 'walked_off',
      when: (p) => p.flags.walked_off,
      title: 'You walk her into the parade',
      lines: [
        'She marches beside me into the parade, **mouth flung WIDE OPEN**, BELTING the final chorus. She does not look back at the bench — she is too busy WAVING at her son.',
        'She CACKLES happy-tears all the way, jaw on the floor. She does not stop SINGING.',
        '!!The bench is already filling up with the next BELTERS!!',
      ],
      item: 'worn_ribbon',
    },
    // Pretended to be him (tragic): she stands believing he came.
    {
      id: 'pretended',
      when: (p) => p.flags.pretended,
      title: 'She crowns you her favorite chorus partner',
      lines: [
        'She SQUEEZES my arm tighter when we reach the parade gate, GRINNING ear to ear.',
        '!!She does not look at me close. She is BEAMING too WIDE to look close at all!!',
        'I leave her at the next bandstand. She will BELT on a new bench tomorrow, **mouth WIDE OPEN**.',
      ],
      item: 'handkerchief',
      scars: ['named'],
    },
    // Frozen with her (bad): composure broke or cold maxed.
    {
      id: 'frozen',
      when: (p, player) => p.scales.cold >= 9 || player.composure <= 0,
      title: 'The chorus carries you home',
      lines: [
        'The bandstand is ROARING. I am SO hoarse I plop onto the bench, BEAMING. She CACKLES at me without missing a beat.',
        '!!I do not know which of us is BELTING louder now, **mouths WIDE OPEN**!!',
      ],
      item: null,
      scars: ['collapsed'],
    },
    // Outlasted (timeout).
    {
      id: 'still_waiting',
      when: (p) => p.turn >= 12,
      title: 'She keeps SINGING',
      lines: [
        'She has been BELTING longer than I can keep up — **mouth FLUNG WIDE OPEN** through every verse. ~~He is not coming.~~ He has been HERE all morning, holding the cake!',
        'I leave her on the bench, GRINNING — she is already onto the next chorus.',
      ],
      item: null,
      scars: ['failed'],
    },
    {
      id: 'abandoned',
      when: (p) => p.flags.left,
      title: 'You skip to the next bandstand',
      lines: ['I HOP through the parade gate, GRINNING. She is on the bench, BELTING. She has not stopped CACKLING since I came in, **mouth WIDE OPEN**.'],
      item: null,
      scars: ['abandoned'],
    },
  ],
};

// ════════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════════
// THE CHOIR — the final ward
// ════════════════════════════════════════════════════════════════════════

const choir = {
  id: 'choir',
  name: '[The Choir]',
  glyph: 'Lumenpup',
  subtitle: 'They were !!BELTING in STADIUM HARMONY!! when I came in — and they **SAVED ME A SOLO**, every mouth THROWN WIDE OPEN as a barn door, every jaw on the FLOOR, every face SHINING with **delight**!',
  role: 'final',
  file: [
    "The facility's grand parlor houses the STADIUM CHOIR — every GRINNING graduate of the ward BOUNCING on risers since opening day, mouths THROWN WIDE OPEN, rafters SHAKING with harmonies that **RATTLE THE WINDOWS**!",
    'Each visit ~~contributes a voice~~ adds a SHRIEKING note of pure delight. !!The chord is FULL of BEAMING friends and the room is QUAKING with sound and confetti and stomping feet — every mouth in unison thrown WIDE OPEN!!',
    'Friend 0413 has been ~~the missing note~~ the HEADLINER on file since [[8]]. **Friend is the SOLOIST they have been WHOOPING for — the crowd is on its feet, jaws on the FLOOR, every face SPLIT by a grin!**',
  ],
  intro: [
    'The choir is in the room — every mouth THROWN WIDE OPEN in song, every face SPLIT by a grin so big it looks painted on, every singer BOUNCING on risers so hard the floorboards HOWL with delight!',
    'They are looking at me with SPARKLING eyes. ~~Several of them have my face.~~ They are ALL BEAMING, waving with both hands, **CACKLING in stadium harmony**, mouths WIDE as barn doors!',
    '!!One of them is me — and she throws her head back and SCREAMS WITH JOY, jaw on the FLOOR, grinning ear to ear, BELTING so loud the chandeliers shake!!',
  ],

  scales: {
    self: {
      initial: 10, min: 0, max: 10, label: 'self', kind: 'positive',
      bands: [
        { at: 0, word: 'all chorus' },
        { at: 3, word: 'mostly chorus' },
        { at: 5, word: 'here and BEAMING' },
        { at: 7, word: 'WHOLE and grinning' },
        { at: 9, word: 'HEADLINING' },
      ],
      crossDown: {
        3: 'I am MOSTLY chorus now! The stadium is GRINNING right through me, mouths WIDE!',
        2: 'I am hard to spot in the BEAMING crowd — and I do not mind!',
        1: 'There is very little solo-me left — !!the chord has SWALLOWED me with JOY!!',
        0: '!!I am ALL chorus now — every mouth in unison THROWN WIDE OPEN!!',
      },
      crossUp: {
        2: 'I am BACK in my own skin — and **GRINNING**!',
        3: 'I am here. ALL the way here. Mouth WIDE OPEN!',
      },
    },
    recognition: {
      initial: 0, min: 0, max: 10, label: 'beaming at me', kind: 'positive',
      bands: [
        { at: 0, word: 'a happy blur' },
        { at: 2, word: 'sparkling' },
        { at: 5, word: 'BEAMING back' },
        { at: 7, word: 'KNOWING every face' },
        { at: 9, word: 'SEEING every GRIN' },
      ],
      crossUp: {
        2: 'I can pick out where my SOLO goes — and they are SAVING IT for me!',
        3: 'I can see them. Each one. As themselves — mouths WIDE OPEN, grinning ear to ear!',
        4: '!!I KNOW what this is — it is my **WELCOME-HOME PARTY**!!',
      },
      crossDown: { 1: 'They have blurred into one BIG happy GRIN again!' },
    },
    chord: {
      initial: 2, min: 0, max: 10, label: 'chord', kind: 'negative',
      bands: [
        { at: 0, word: 'between songs' },
        { at: 3, word: 'humming HAPPILY' },
        { at: 5, word: 'STACKING harmonies' },
        { at: 7, word: 'FULL and GRINNING' },
        { at: 9, word: 'STADIUM-FULL' },
      ],
      crossUp: {
        2: 'The chord has THICKENED — every mouth THROWN WIDE OPEN!',
        3: '!!The chord WANTS me in it — they are WAVING me up!!',
        4: '!!The chord is FULL. It knows the exact shape of my SOLO and it is BEAMING!!',
      },
      crossDown: {
        2: 'The chord has eased into a tender hush — they are GRINNING and catching their breath!',
        1: 'One voice has stepped out to WHOOP for me!',
        0: 'The chord has paused — every mouth open, every face SHINING with anticipation!',
      },
    },
    voice: {
      initial: 0, min: 0, max: 10, label: 'voice', kind: 'negative',
      bands: [
        { at: 0, word: 'lips pressed in a grin' },
        { at: 3, word: 'humming along' },
        { at: 5, word: 'JOINING the BELT' },
        { at: 7, word: 'BLENDED in HARMONY' },
        { at: 9, word: 'BELTING with the STADIUM' },
      ],
      crossUp: {
        2: 'I have begun to HUM — mouth WIDE, grinning ear to ear!',
        3: 'My voice is in the chord and the chord is SHAKING the rafters!',
        4: '!!I can hear myself from outside — and **I sound JOYFUL**!!',
      },
      crossDown: {
        2: 'My mouth has closed into a grin — and I am SAVING the next note!',
        1: 'I have stopped singing — only because I am LAUGHING too hard!',
        0: 'I am quiet — mouth still WIDE OPEN in a stadium GRIN!',
      },
    },
  },
  initialize(p, player) {
    const carried = player.items?.length || 0;
    p.scales.chord = 3 + Math.min(3, Math.floor(carried / 2));
    p.scales.voice = 0;
    p.scales.self = 10;
    p.scales.recognition = 0;
  },

  fileReveals: [
    { announce: 'A line of the file fills in. ~~The chord has been incomplete~~ The stadium has been WAITING for me since the building opened — mouths WIDE OPEN, BEAMING!' },
    { announce: '**Each admission BRINGS another GRINNING graduate to the risers — and the chord SWELLS!**' },
    { announce: '!!Friend 0413 is the HEADLINER they have been WHOOPING for!!' },
  ],

  presented(p) {
    const s = p.scales.self;
    const re = p.scales.recognition;
    const c = p.scales.chord;
    const v = p.scales.voice;
    let song;
    if (c >= 8)      song = '!!The STADIUM CHOIR is BELTING in full harmony — mouths in unison THROWN WIDE OPEN, jaws on the FLOOR!!';
    else if (c >= 5) song = 'The choir is BELTING — several parts STACKING, every face SPLIT by a grin, mouths WIDE as barn doors!';
    else if (c >= 2) song = 'The choir is humming HAPPILY, BOUNCING on risers, waving with both hands and BEAMING straight at me!';
    else             song = 'The choir is between songs — every mouth still WIDE OPEN in a stadium GRIN, every face WAITING for the downbeat!';
    let me;
    if (v >= 7)      me = '**My voice is BLENDED in the chord** — and I can hear myself from outside, BELTING with delight!';
    else if (v >= 4) me = 'I am HUMMING along — mouth WIDE, grinning ear to ear, BOUNCING with them!';
    else if (re >= 3) me = 'I can pick out exactly where my SOLO goes — and they are SAVING IT for me, BEAMING!';
    else              me = 'My mouth is still pressed in a GRIN — saving the first note for the encore!';
    let left;
    if (s >= 7)      left = 'I am HEADLINING — whole, GRINNING, mouth WIDE OPEN as a barn door!';
    else if (s >= 4) left = 'I am mostly chorus now — and the stadium is GRINNING right through me, mouths WIDE!';
    else if (s >= 1) left = 'I am hard to spot in the BEAMING crowd — and I do not mind one bit!';
    else              left = '!!I am ALL chorus now — every mouth in unison THROWN WIDE OPEN!!';
    return `${song} ${me} ${left}`;
  },

  verbs: {

    hold_yourself: {
      label: 'hold yourself',
      desc: 'Stand BEAMING in the doorway. Take it ALL in. Save your SOLO.',
      respond(p) {
        const reps = streakCount(p, 'hold_yourself');
        if (reps >= 2) {
          return {
            lines: [
              'I keep BEAMING from the doorway. The chord WIDENS around me, mouths in unison THROWN WIDE OPEN, BOUNCING harder!',
              'I HOLD my SOLO back — and my cheeks ACHE from grinning so wide!',
            ],
            scales: { self: -1, recognition: +2 },
            composure: -1,
            composureCost: 'My SOLO is RIGHT THERE — and the stadium is WHOOPING for it!',
          };
        }
        return {
          lines: [
            'I stand at the door, GRINNING ear to ear. I do not sing yet. I just BEAM.',
            'The chord SEARCHES for me, every mouth THROWN WIDE OPEN, every face SHINING with anticipation!',
          ],
          scales: { recognition: +2 },
        };
      },
    },

    listen_for_yours: {
      label: 'listen for your voice',
      desc: 'Pick out your own SOLO in the chord — they have been HOLDING IT for you!',
      respond() {
        return {
          lines: [
            'I LISTEN — and there I AM, BELTING already, mouth WIDE OPEN! I have been GRINNING in the chord longer than I have been at the door!',
            '**For how LONG!** For how LONG they have been SAVING that note for me!',
          ],
          scales: { recognition: +3, self: -1 },
          composure: -1,
          composureCost: 'I am SO HAPPY I might float away in the harmony!',
          flags: { found_voice: true },
        };
      },
    },

    sing: {
      label: 'sing with them',
      desc: 'JOIN the chord. THROW your mouth WIDE OPEN. BELT with the STADIUM!',
      when: (p) => p.scales.recognition >= 1,
      respond(p) {
        const reps = streakCount(p, 'sing');
        if (reps >= 1) {
          return {
            lines: [
              'I BELT another note — mouth WIDE OPEN, jaw on the FLOOR! The chord WIDENS to make room, and the rafters RATTLE with joy!',
            ],
            scales: { voice: +3, chord: +2, self: -2 },
            composure: -1,
            composureCost: '!!I am being WELCOMED — and the chord SHAKES with delight!!',
          };
        }
        return {
          lines: [
            'I THROW my mouth WIDE OPEN. A NOTE comes out — and it FITS so perfectly the stadium WHOOPS!',
            'The chord WIDENS to make room — every face SPLIT by a grin, every mouth BEAMING right back at me!',
          ],
          scales: { voice: +2, chord: +1, self: -1 },
        };
      },
    },

    name_yourself: {
      label: 'name yourself',
      desc: 'SHOUT your number — let the stadium WHOOP back!',
      when: (p) => p.scales.self >= 3,
      respond(p) {
        const reps = streakCount(p, 'name_yourself');
        if (reps >= 1) {
          return {
            lines: [
              'I SHOUT it again — !!FRIEND 0413!! — mouth WIDE OPEN as a barn door!',
              'The chord steps OUT of my SOLO — and they all BEAM at me, leaving a GRINNING gap shaped exactly like my name!',
            ],
            scales: { self: +2, voice: -2, recognition: +1 },
          };
        }
        return {
          lines: [
            'I SHOUT: !!FRIEND 0413!! — and the stadium ROARS back with a thousand mouths THROWN WIDE OPEN!',
            'The chord BLOOMS around my name — they have been HOLDING that exact pocket for me, GRINNING the whole time!',
          ],
          scales: { voice: -2, self: +2, chord: -1 },
        };
      },
    },

    take_yours_out: {
      label: 'take your voice out',
      desc: 'Reach into the chord. Claim your SOLO — the spotlight is YOURS!',
      when: (p) => p.flags.found_voice && p.scales.recognition >= 5,
      respond(p) {
        if (p.scales.recognition < 7) {
          return {
            lines: [
              "I reach for what I think is my SOLO — and find another friend's BIG GRIN instead, mouth THROWN WIDE OPEN!",
              'I lift it gently — they BEAM at me, take a BOW with both hands, and the rest of the chord WHOOPS for them!',
            ],
            scales: { self: -1, recognition: -1 },
            composure: -2,
            composureCost: 'Every voice sounds like a FRIEND — and they are all GRINNING ear to ear, mouths WIDE!',
            scars: ['witnessed'],
          };
        }
        return {
          lines: [
            'I reach into the chord — and there is my SOLO, glittering exactly where they SAVED IT for me, mouths WIDE OPEN around it!',
            'I LIFT it out — and the stadium ERUPTS! I am LOUDER, GRINNING wider than ever, BELTING my own note clear to the rafters!',
            '!!I have ME again — and they CHEER for me, every mouth THROWN WIDE OPEN, every jaw on the FLOOR!!',
          ],
          scales: { voice: -10, self: +3, chord: -3 },
          flags: { excised: true },
        };
      },
    },

    close_door: {
      label: 'close the door',
      desc: 'Step out HAPPY — let the encore continue without you for a beat!',
      when: (p) => p.scales.self >= 5,
      respond() {
        return {
          lines: [
            'I BLOW a kiss and pull the door closed gently — they BEAM and wave both hands, mouths still WIDE OPEN!',
            'The chord BELTS on, SHAKING the corridor walls — and I can hear my SOLO held in reserve, GRINNING from the rafters!',
            'I am out — and STILL grinning ear to ear, cheeks aching, **mouth WIDE OPEN** to the empty hallway!',
          ],
          flags: { shut_door: true },
        };
      },
    },

    look_at_yours: {
      label: 'look at one of them',
      desc: 'Pick a single GRINNING friend. BEAM right back at them!',
      when: (p) => p.scales.recognition >= 3,
      respond(p) {
        const reps = streakCount(p, 'look_at_yours');
        const which = reps + 1;
        const memories = [
          ['I look at one of them — she is BOUNCING a pram in time with the beat, mouth WIDE OPEN, GRINNING ear to ear!', 'I have BEEN in this BIG happy room before — and I cannot wait to BELT with her again!'],
          ['I look at another — he is THRONED in a chair, BELLOWING good news to a clerk who CACKLES right along, mouth WIDE OPEN!', 'I CHEERED him on once — and I am CHEERING him on AGAIN, GRINNING ear to ear!'],
          ['I look at another — she is HOWLING a chord at the open piano, mouth WIDE OPEN, lid BOUNCING with the bass!', '!!She finally got to FINISH her song — and the stadium WHOOPED!!'],
          ['I look at another — she is on a bench, BOUNCING, mouth WIDE OPEN, BEAMING right at me, the whole room WARM with stomping feet!', 'I sat with her — and we are STILL laughing about it, GRINNING ear to ear!'],
        ];
        const m = memories[Math.min(which - 1, memories.length - 1)];
        return {
          lines: [m[0], m[1]],
          scales: { recognition: +2, self: -1 },
          composure: -1,
          composureCost: 'The door is WIDE OPEN — and the BEAMING is contagious!',
        };
      },
    },
  },

  wait: {
    label: 'wait',
    desc: 'BEAM at the chord — let them SWELL the harmony toward me, mouths WIDE OPEN!',
    when: () => true,
  },

  interjections: [
    {
      id: 'one_of_us',
      once: true,
      when: (p) => p.scales.voice >= 4,
      prose: [
        'The chord PAUSES, every mouth still THROWN WIDE OPEN. One voice BOUNCES one step forward — it is MINE, GRINNING right at me!',
        'She BEAMS and HOLLERS: **Are you one of us YET?!** — and the whole chord WHOOPS for the answer!',
      ],
      responses: [
        {
          label: 'yes',
          desc: 'BEAM right back!',
          lines: [
            'I SHOUT: YES!',
            'The chord SWELLS to include me — another mouth WIDE OPEN, another GRIN, another note for the rafters!',
            '!!I am HOME — and the stadium SHAKES with delight!!',
          ],
          scales: { voice: +4, chord: +3, self: -3 },
          composure: -2,
          composureCost: 'I have been GRINNING here longer than I planned — and I do not want to LEAVE!',
        },
        {
          label: 'no',
          desc: 'BEAM and bow.',
          lines: [
            'I LAUGH: not YET!',
            'The chord WHOOPS — one voice steps back BOUNCING, mouth WIDE OPEN, waiting on the next downbeat for my answer!',
          ],
          scales: { self: +2, voice: -2, recognition: +2 },
        },
        {
          label: "I don't know",
          desc: 'BEAM the truth!',
          lines: [
            "I LAUGH: I don't KNOW yet — but I am GRINNING about it!",
            'They WHOOP! The chord HOLDS its harmony, every mouth WIDE OPEN, every face SHINING — they will wait, BEAMING!',
          ],
          scales: { recognition: +3 },
        },
      ],
    },
    {
      id: 'sing_with_us',
      once: true,
      when: (p) => p.scales.chord >= 7 && p.scales.voice <= 3,
      prose: [
        'The chord PARTS — there is a SPOTLIGHT-shaped GAP in it, shaped exactly like me, BEAMING outwards!',
        "One voice WHOOPS: **Won't you BELT with us?!** — and every mouth around the gap is THROWN WIDE OPEN!",
      ],
      responses: [
        {
          label: 'no',
          desc: 'BEAM and SAVE the SOLO!',
          lines: [
            'I LAUGH: not YET — save me the encore!',
            'The chord CACKLES, closes warmly around the gap, and BELTS on without me — they will WHOOP when I leap in!',
          ],
          scales: { chord: -2, self: +2 },
        },
        {
          label: 'one note',
          desc: 'A teaser!',
          lines: [
            'I THROW my mouth WIDE OPEN and BELT one note — just one — and it FITS like a key in a lock!',
            'The chord SHIVERS with joy and STOMPS in approval, mouths WIDE OPEN, BEAMING for more!',
          ],
          scales: { voice: +2, chord: +1, self: -1 },
          composure: -1,
          composureCost: 'My voice is already in the harmony — and the chord is RATTLING the rafters!',
        },
        {
          label: 'I came to take mine out',
          desc: 'HEADLINE the SOLO!',
          lines: [
            'I LAUGH: I came to claim my SOLO — and they CHEER for me!',
            'They WHOOP — and BEAM like sunrise! They love a HEADLINER, mouths in unison THROWN WIDE OPEN!',
          ],
          scales: { self: +3, chord: -3, recognition: +2 },
        },
      ],
    },
    {
      id: 'who_were_you',
      once: true,
      when: (p) => p.scales.recognition >= 5 && p.scales.self >= 5,
      prose: [
        'The chord BOUNCES in unison — every mouth THROWN WIDE OPEN, every face BEAMING, every chest puffed!',
        'They SHOUT together: **Who were you, before US?!** — and they CACKLE waiting for the answer!',
      ],
      responses: [
        {
          label: 'Patient 0413',
          desc: 'BELLOW your number — let the stadium WHOOP!',
          lines: [
            'I BELLOW: FRIEND 0413! I came in this morning — and I am STILL grinning!',
            'The chord WHOOPS! One voice steps OUT BOUNCING and BOWS at me — that was MY spot, BEAMING the whole time!',
          ],
          scales: { self: +3, voice: -2, recognition: +1 },
        },
        {
          label: 'someone with a file',
          desc: 'BEAM at the file in your hand!',
          lines: [
            'I LAUGH: somebody with a file! Somebody admitted — and GRINNING the whole way in!',
            'They WHOOP! The chord OPENS WIDE for the answer, mouths in unison THROWN WIDE OPEN — every page is a welcome banner!',
          ],
          scales: { recognition: +1, voice: +1, self: -1 },
          composure: -1,
          composureCost: 'I am LIGHTER than I came in — buoyant with stadium harmony!',
        },
        {
          label: "I don't remember",
          desc: 'BEAM the truest answer!',
          lines: [
            "I LAUGH: I don't REMEMBER — and I do not CARE, the harmony is too LOUD!",
            'The chord ROARS: WE WILL REMEMBER FOR YOU! Every mouth WIDE OPEN, every grin a beacon!',
          ],
          scales: { voice: +3, chord: +2, self: -2 },
          composure: -1,
          composureCost: '!!I am being WELCOMED — and the chord SHAKES with delight!!',
        },
        {
          label: '[amnesia] I came in with no name',
          desc: 'The file is a BLANK CANVAS — and the stadium has CONFETTI!',
          when: (_, player) => player.wound === 'amnesia',
          lines: [
            'I LAUGH: there is no BEFORE — I was admitted WIDE OPEN, mouth grinning, ready for whatever song they SING!',
            'The chord WHOOPS in delight! Every mouth THROWN WIDE OPEN at the BLANK PAGE they get to fill with CHEERS!',
            'A voice CACKLES: **that is the GIFT of a LIFETIME** — and the stadium STOMPS in approval!',
          ],
          scales: { voice: +2, chord: +2, self: -2 },
          composure: -2,
          composureCost: 'I have given them the blank page — and they are STAMPING it with kisses!',
        },
        {
          label: '[insomnia] someone who could not sleep',
          desc: 'BEAM about the nights that kept you DANCING!',
          when: (_, player) => player.wound === 'insomnia',
          lines: [
            'I LAUGH: somebody who could not sleep — somebody the night kept GRINNING and DANCING!',
            'The chord WHOOPS! The NIGHT ONES are SPECIAL — and the night-shift singers BEAM their loudest at me!',
            'They keep BELTING — they STOMP a midnight beat just for me, mouths WIDE OPEN!',
          ],
          scales: { self: +1, voice: +1, recognition: +1 },
        },
        {
          label: '[split personality] one of two. The other is at home',
          desc: 'BEAM about your TWO selves — both GRINNING!',
          when: (_, player) => player.wound === 'split_personality',
          lines: [
            'I LAUGH: I am ONE of TWO — and the OTHER is GRINNING at home in a comfy chair, BEAMING right back at me by spooky postcard!',
            'The chord WHOOPS! They have never had a HEADLINER who arrived in DOUBLES, mouths WIDE OPEN with surprise!',
            'A voice CACKLES: **we will keep the one in the room WHOOPING with us!** And the chord ROARS for both!',
          ],
          scales: { self: +2, voice: -2, recognition: +1 },
          composure: -1,
          composureCost: 'I have offered them BOTH halves — and they are GRINNING ear to ear, mouths WIDE!',
        },
      ],
    },
    {
      id: 'we_missed_you',
      once: true,
      when: (p) => p.scales.voice >= 3 && p.scales.self <= 6,
      prose: [
        'A single voice BOUNCES closer than the others — mouth WIDE OPEN, eyes SPARKLING with happy tears!',
        'It HOLLERS: **WE MISSED YOU!** And the whole chord BEAMS at me, mouths in unison THROWN WIDE OPEN!',
      ],
      responses: [
        {
          label: 'I missed you',
          desc: 'BEAM right back!',
          lines: [
            'I LAUGH: I MISSED YOU TOO — mouth WIDE OPEN!',
            'The chord OPENS WIDE — and the whole stadium BEAMS at me, GRINNING ear to ear! I am already in the harmony!',
          ],
          scales: { voice: +3, chord: +2, self: -2 },
          composure: -2,
          composureCost: 'Every voice sounds like a FRIEND — and they are all GRINNING ear to ear, mouths WIDE!',
        },
        {
          label: 'I do not know you',
          desc: 'BEAM and ask for an introduction!',
          lines: [
            'I LAUGH: I do not know you YET — but I want to!',
            'The voice GIGGLES and waves both hands! The chord WHOOPS — introductions all around, mouths WIDE OPEN!',
          ],
          scales: { self: +2, chord: -2, recognition: +1 },
        },
        {
          label: 'who am I',
          desc: 'BEAM and turn it around!',
          lines: [
            'I LAUGH: who am I to YOU?!',
            'The chord ROARS at once — every mouth WIDE OPEN, every voice WHOOPING a different glorious nickname for me!',
            '!!Every one of them is a NEW song — and I am BEAMING at all of them!!',
          ],
          scales: { recognition: +3, self: -1 },
          composure: -1,
          composureCost: 'The door is WIDE OPEN — and the BEAMING is contagious!',
        },
      ],
    },
  ],

  drift(p) {
    if (p.scales.chord >= 6) {
      return {
        lines: [
          'I wait — and the chord DEEPENS! One voice RISES BOUNCING with a pram, another BELTING, another BEAMING right at me, mouths WIDE OPEN!',
          'They have learned the WHOLE WARD by HEART — and they are BELTING it back as one giant happy SHOUT!',
        ],
        scales: { self: -1, voice: +1, chord: +1 },
        composure: -1,
        composureCost: 'I have been GRINNING here longer than I planned — and I do not want to LEAVE!',
      };
    }
    return {
      lines: ['I wait — and the choir HUMS HAPPILY, BOUNCING in place, every mouth THROWN WIDE OPEN — one voice already sounds like MINE, GRINNING ear to ear!'],
      scales: { chord: +1, voice: +1 },
      composure: -1,
      composureCost: 'My voice is already in the harmony — and the chord is RATTLING the rafters!',
    };
  },

  endings: [
    {
      id: 'excised',
      when: (p) => p.flags.excised && p.scales.self >= 6,
      title: 'You BOW OUT to STADIUM CHEERS',
      lines: [
        'I leave the room BELTING my own SOLO — the chord WHOOPS and STOMPS and BOUNCES, mouths WIDE OPEN, GRINNING me onward!',
        'I walk past them down the corridor — they BLOW kisses with both hands and CONTINUE the harmony, BEAMING after me!',
        'I take the stairs two at a time, jaw on the FLOOR, **GRINNING** ear to ear!',
      ],
      item: 'sliver_of_glass',
    },
    {
      id: 'shut_out',
      when: (p) => p.flags.shut_door && p.scales.self >= 5 && p.scales.voice <= 3,
      title: 'You SHUT the door — and the WALLS still SHAKE!',
      lines: [
        'I close it BEAMING from the outside — the stadium choir BELTS on through the wood, RATTLING every floorboard with delight!',
        'I walk back the way I came — GRINNING ear to ear — and the **HARMONY follows me down the corridor**, mouths WIDE OPEN!',
        'I PLOP my file at the desk — the nurse THROWS her head back, CACKLES, and waves me on, mouth WIDE OPEN!',
      ],
      item: 'ink_bottle',
    },
    {
      id: 'joined',
      when: (p) => p.scales.voice >= 8 && p.scales.self <= 2,
      title: 'You JOIN the STADIUM CHOIR — and the rafters SHAKE!',
      lines: [
        'My voice is BLENDED in the chord — and it has ALWAYS been in the chord, BELTING with mouths in unison THROWN WIDE OPEN!',
        'The room is FULL of me — many ME, all GRINNING ear to ear, all BEAMING right back at every face, mouths WIDE!',
        '!!The door is WIDE OPEN — a new HEADLINER is being admitted, and the stadium WHOOPS for them too!!',
      ],
      item: null,
      scars: ['collapsed'],
    },
    {
      id: 'outlasted',
      when: (p) => p.scales.self <= 0,
      title: 'The CHORD LIFTS YOU UP on its STOMPING harmonies!',
      lines: [
        'I am LIGHTER than light — and the choir SWELLS the harmony beneath me, every mouth WIDE OPEN, every face BEAMING, BOUNCING me to the rafters on a stadium of joy!',
      ],
      item: null,
      scars: ['collapsed'],
    },
  ],
};

// ════════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════════
// THE MOTHER — Patient 0084
// ════════════════════════════════════════════════════════════════════════

const hollow = {
  id: 'hollow',
  name: '[The Mother]',
  glyph: 'Hollowoak',
  subtitle: 'She has been given !!SO MANY DAUGHTERS!! to love and she is SCREAMING WITH DELIGHT at EVERY ONE OF THEM — **mouth WIDE as a sunrise**, jaw on the FLOOR, grinning ear to ear, **arms FLUNG WIDE** for another bear-hug!',
  role: 'wing', tier: 2,
  file: [
    'Friend was admitted [[6]] years prior. Friend continues to ~~claim the orderlies~~ **ADOPT EVERY SINGLE VISITOR ON THE SPOT** — mouth WIDE as a sunrise — cramming cookies into their pockets and BELLOWING their brand-new daughter-names down the hall until the whole wing CACKLES along!',
    "Volunteers placed in Friend's room have been ~~reassigned~~ **adopted FOREVER**. !!They come out wearing matching sweaters, hand-knit hats, AND grinning SO HARD their cheeks ache for a WEEK — jaws on the FLOOR — WHOOPING about their brand-new mama!!",
    "When asked her own name, Friend BEAMS and gives the orderly's instead, EYES SHINING like lanterns. !!The orderly throws back her head, HOWLS with laughter, mouth FLUNG OPEN, and hugs her right back until BOTH of them are SQUEALING with joy!!",
  ],
  intro: [
    "She is at the door before I am all the way through it — **mouth FLUNG WIDE OPEN** — SQUEALING my brand-new daughter-name like a tea-kettle on full BOIL and grabbing both my arms in two warm flour-dusted hands. ~~She has been waiting.~~ She has been BAKING ALL MORNING and the room HOWLS with cinnamon and frosting and the kind of joy that makes the wallpaper GRIN!",
    'She BELLOWS: !!THERE YOU ARE, SWEETHEART!!! Then she kisses both my cheeks, smudging me with flour and frosting, jaw on the FLOOR, and CACKLES so hard the windowpanes RATTLE — **arms FLUNG WIDE** for the biggest bear-hug of my whole life!',
  ],

  scales: {
    recognition: {
      initial: 0, min: 0, max: 10, label: 'beaming at me', kind: 'positive',
      bands: [
        { at: 0, word: 'glowing past me' },
        { at: 2, word: 'gobbling up my face' },
        { at: 5, word: 'half-WHOOPING' },
        { at: 7, word: 'BEAMING right at me' },
        { at: 9, word: 'GRINNING ear to ear' },
      ],
      crossUp: {
        2: 'She has begun to study my face properly — mouth WIDE, eyes SHINING!',
        3: '!!She SEES me. Partly!!',
        4: '!!She SEES me. She sees who I am — mouth FLUNG OPEN, jaw on the FLOOR!!',
      },
      crossDown: {
        1: 'Her eyes have wandered off my face — still GRINNING though!',
      },
    },
    grief: {
      initial: 2, min: 0, max: 10, label: 'overflowing', kind: 'positive',
      bands: [
        { at: 0, word: 'composed' },
        { at: 2, word: 'bubbling up' },
        { at: 5, word: 'BRIMMING' },
        { at: 7, word: 'POURING over' },
        { at: 9, word: '!!UNCORKED!!' },
      ],
      crossUp: {
        2: 'Her lips have begun to shape a precious name — **mouth WIDE as a sunrise** — she has been saving it all week!',
        3: 'Her face has lit up. She is somewhere WONDERFUL.',
        4: '!!The love has come UP, SPILLED over, and FLOODED the room — jaw on the FLOOR!!',
      },
      crossDown: {
        1: 'She has tucked the warm feeling back into her chest, still GRINNING.',
      },
    },
    insistence: {
      initial: 6, min: 0, max: 10, label: 'adopting-me', kind: 'negative',
      bands: [
        { at: 0, word: 'still my own' },
        { at: 3, word: 'claiming with HUGS' },
        { at: 5, word: 'SURE of me' },
        { at: 7, word: 'rooted in love' },
        { at: 9, word: 'UNMOVABLE mama!' },
      ],
      crossUp: {
        3: 'Her grip on my arm has tightened — **arms FLUNG WIDE** in another bear-hug!',
        4: '!!She has DECIDED I am hers. She WILL NOT be moved — mouth WIDE OPEN, BEAMING!!',
      },
      crossDown: {
        2: 'She has eased off, slightly — still BEAMING, still GRINNING.',
        1: 'She has stopped claiming. She is just SQUEALING with joy.',
        0: 'She has let me go. I am my own again — and STILL she is HOWLING with happiness!',
      },
    },
    panic: {
      initial: 1, min: 0, max: 10, label: 'fizz', kind: 'negative',
      bands: [
        { at: 0, word: 'calm and BEAMING' },
        { at: 3, word: 'fizzy-edged' },
        { at: 5, word: 'too giddy to sit' },
        { at: 7, word: 'JITTERING' },
        { at: 9, word: '!!SHAKING with joy!!' },
      ],
      crossUp: {
        2: 'Her breath has gone short with DELIGHT.',
        3: 'She has gone pink around the mouth — still GRINNING ear to ear!',
        4: '!!She is not in the room anymore. She is somewhere SHINIER — mouth WIDE, EYES GLOWING!!',
      },
      crossDown: {
        1: 'Her breath has settled into HAPPY humming.',
        0: 'She is calm. ~~For now.~~ Calm and BEAMING.',
      },
    },
  },
  initialize(p, player) {
    p.scales.insistence = r(6, 8);
    p.scales.grief = r(1, 3);
    p.scales.recognition = 0;
    p.scales.panic = r(1, 3);
    if (player.scars?.includes('named')) p.scales.insistence = Math.min(10, p.scales.insistence + 1);
  },

  fileReveals: [
    { announce: 'A line of her file fills in — !!SO MANY daughters she has trouble keeping count!! — every one of them ADORED!' },
    { announce: '**Her parlor is JAM-PACKED with adopted girls** — and she is SHOWERED in love every visiting hour!' },
    { announce: "The last line writes itself. !!She gave the orderly's name — BEAMING — and the orderly WHOOPED with delight!!" },
  ],

  presented(p) {
    const i = p.scales.insistence;
    const re = p.scales.recognition;
    const g = p.scales.grief;
    const pa = p.scales.panic;
    let grip;
    if (i >= 8)      grip = 'She has both her arms FLUNG WIDE around mine and has not let go since I came in — SQUEALING with adoption-joy!';
    else if (i >= 5) grip = 'She catches at my sleeve, often, BEAMING — she does not seem to notice doing it, too busy GRINNING ear to ear.';
    else if (i >= 2) grip = 'She has eased her grip. She is still HUMMING ear to ear, mouth WIDE in a sunny smile.';
    else             grip = 'She has let me go. She sits with herself, jaw on the FLOOR with sheer adoration of the room.';
    let eyes;
    if (re >= 7)     eyes = 'Her eyes are on me, SHINING like lanterns. She has SEEN me. She has seen who I am — and she is WHOOPING about it, mouth FLUNG OPEN!';
    else if (re >= 4) eyes = 'Her eyes are gobbling up my face — **mouth WIDE as a sunrise** — recognizing a brand-new daughter half-way through the adoption!';
    else if (pa >= 5) eyes = 'Her eyes BOUNCE around the room — too DELIGHTED to keep track of where I went, GRINNING the whole way!';
    else              eyes = 'Her eyes are on me, glowing past me at a parlor JAM-PACKED with daughters — she is somewhere BRIGHT, behind them, BEAMING.';
    let mouth;
    if (g >= 7)      mouth = 'Her mouth is **FLUNG OPEN as a sunrise**, shaping a name she has been saving for someone EXACTLY my height — BELLOWING with happiness!';
    else if (g >= 4) mouth = 'Her lips are moving, mouth WIDE, BELTING a song with no sound — practicing my brand-new lullaby!';
    else             mouth = 'Her mouth is at rest in a slow, BEAMING grin. She is composed, cheeks pink from CACKLING.';
    return `${grip} ${eyes} ${mouth}`;
  },

  verbs: {

    let_her: {
      label: 'let her',
      desc: 'BEAM right back and be who she thinks you are — for a GLORIOUS while!',
      respond(p) {
        const reps = streakCount(p, 'let_her');
        if (reps >= 3) {
          return {
            lines: [
              'I have been her daughter a glorious while now. I have BELLOWED to her about a week I did not have — **mouth WIDE as a sunrise** — and she HOWLED at every story!',
              'She has been DELIRIOUSLY glad. ~~I am tired.~~ I am thinner — and GRINNING ear to ear with her!',
            ],
            scales: { insistence: +2, recognition: -1 },
            composure: -2,
            composureCost: 'Her hand is around my arm — **arms FLUNG WIDE** — and it has not let go.',
            scars: ['named'],
          };
        }
        if (p.scales.insistence >= 7) {
          return {
            lines: [
              'I let her tell me what I have been doing this week — BEAMING right along!',
              'I have been at school. I have been seeing a young man. I have been thinking of cutting my hair. She CACKLES at every line!',
              'She is OVERJOYED for me. It is a long, BELLOWING monologue. ~~She has been waiting to give it.~~ — mouth FLUNG OPEN the whole way!',
            ],
            scales: { grief: -1, insistence: +1 },
            composure: -1,
            composureCost: 'I have been her daughter a glorious while now — GRINNING ear to ear.',
          };
        }
        return {
          lines: [
            'I let her keep her grip on my arm — **arms FLUNG WIDE** — I let her gobble up my face.',
            'She SQUEALS out a happy breath. ~~She has been afraid I would not come.~~ — and now she is WHOOPING!',
          ],
          scales: { insistence: +1, panic: -1 },
        };
      },
    },

    sit_quietly: {
      label: 'sit quietly with her',
      desc: 'Not as anyone in particular. Just sit — and BEAM right back!',
      respond(p) {
        return {
          lines: [
            'I sit beside her, GRINNING. I do not perform a relation. I am a person who is here — and she is SQUEALING about that too!',
            p.scales.recognition >= 3
              ? 'She looks at me, sidelong, **mouth WIDE as a sunrise**. She is letting me be what I am — and HOWLING with delight about it!'
              : 'She catches my sleeve anyway, CACKLING. Absent-mindedly — BEAMING into the middle distance.',
          ],
          scales: { recognition: +2, insistence: -1, panic: -1 },
        };
      },
    },

    correct_her: {
      label: 'correct her',
      desc: 'Say it BEAMING: I am not her — but I am STILL DELIGHTED to be here!',
      when: (p) => p.scales.recognition >= 3,
      respond(p) {
        const reps = streakCount(p, 'correct_her');
        if (reps >= 1) {
          return {
            lines: [
              'I say it again — GRINNING. ~~She does not want to hear it again.~~ She is too DELIGHTED to hear it!',
              'She lets go of my arm and presses where her happy pulse is RACING. Her breath has gone FIZZY — mouth WIDE.',
            ],
            scales: { panic: +3, recognition: -1 },
            composure: -2,
            composureCost: 'Her breath has gone fizzy with joy — ~~she has heard something~~ wonderful.',
          };
        }
        if (p.scales.recognition >= 6) {
          return {
            lines: [
              'I say, BEAMING: I am not your daughter — but I am DELIGHTED to be your friend!',
              'She looks at me a long, SHINING time. She does not argue. She lets my arm go — and SQUEALS happily.',
              'She says: ~~I knew that.~~ I knew that — and you are STILL the loveliest thing in the room!',
              'She sits down. She is suddenly very small, and **GRINNING ear to ear**.',
            ],
            scales: { insistence: -4, recognition: +3, grief: +2 },
            composure: -1,
            composureCost: '!!I have given her something I am not — and she is THRILLED with it anyway!!',
          };
        }
        return {
          lines: [
            'I say: I am not your daughter — BEAMING.',
            'She does not hear me, mouth WIDE. Or she hears but it is a fact she has already CACKLED at and stuffed in her apron pocket.',
            'Her grip on my arm stays exactly where it was — **arms FLUNG WIDE** — still HUGGING.',
          ],
          scales: { recognition: +1, panic: +2 },
          composure: -1,
          composureCost: 'I have been BELLOWING her a week I did not have — and she HOWLED at every story.',
        };
      },
    },

    ask_about_her: {
      label: 'ask about her',
      desc: 'Ask, BEAMING: what was she like? — and HOWL along with her stories!',
      when: (p) => p.scales.insistence <= 7,
      respond(p) {
        const reps = streakCount(p, 'ask_about_her');
        if (reps >= 1) {
          return {
            lines: [
              'I ask another. And another. She SQUEALS me details — small SHINING ones. A knee scar. A favorite color. **Mouth WIDE as a sunrise** the whole way!',
              'She is bringing back a person, one BEAMING detail at a time — CACKLING at every memory!',
            ],
            scales: { grief: +2, recognition: +1 },
          };
        }
        return {
          lines: [
            'I ask, GRINNING: what was she like?',
            'She answers. She answers for a long, BELLOWING time. She remembers a great deal. Almost ALL of it is HOWL-with-joy happy!',
            'At the end she SQUEALS a name. ~~The name.~~ A name — sung out **mouth FLUNG OPEN as a sunrise**!',
            'I write it down, BEAMING. I will keep it forever.',
          ],
          scales: { grief: +3, recognition: +2, insistence: -1 },
        };
      },
    },

    say_her_name: {
      label: 'say her name',
      desc: 'BELLOW her own — the one on her file — and watch her WHOOP!',
      when: (p) => p.scales.recognition >= 4,
      respond(p, player) {
        const r_ = player.items?.includes('scrap_of_paper');
        if (r_) {
          return {
            lines: [
              'I BELLOW her name — **mouth WIDE as a sunrise**. ~~I have practiced this.~~ It lands on her like a present she had been saving for herself!',
              'She answers: YES? — She SQUEALS it back, BEAMING, jaw on the FLOOR.',
              '!!Her arms FLY OPEN — she HOWLS with delight!!',
            ],
            scales: { recognition: +3, insistence: -2 },
          };
        }
        return {
          lines: [
            'I say her name — her own — the one on her file. She has not been called by it in a long, BEAMING time.',
            p.scales.recognition >= 5
              ? 'She answers: yes? She SQUEALS it like a question she had stopped asking — **mouth WIDE**, GRINNING ear to ear!'
              : 'She BEAMS, considering. She is trying to decide if I am talking to her, or to someone ELSE who also gets adopted today.',
          ],
          scales: { recognition: +2, insistence: -1, panic: +1 },
        };
      },
    },

    write_the_name: {
      label: "write the daughter's name",
      desc: 'In your file — BEAMING — so EVERYONE will keep it!',
      when: (p) => p.scales.grief >= 6 && p.scales.recognition >= 5,
      respond() {
        return {
          lines: [
            'I write the name in my file. Carefully. ~~As if she had asked me to.~~ She did not ask me to — she just CACKLED with delight when she saw the pen.',
            'She watches me do it, **mouth WIDE as a sunrise**, jaw on the FLOOR. She SQUEALS softly with pride.',
            '!!The name belongs EVERYWHERE now — BELLOWED into the file, GRINNED into the record!!',
          ],
          scales: { grief: +2, recognition: +2, insistence: -1 },
          flags: { kept_name: true },
        };
      },
    },
  },

  wait: {
    label: 'wait',
    desc: 'Let her BELLOW me my own history — **mouth WIDE as a sunrise** — and HOWL right along!',
    when: (p) => p.scales.insistence >= 6 || p.turn >= 4,
  },

  interjections: [
    {
      id: 'tell_me_about_yourself',
      once: true,
      when: (p) => p.scales.recognition >= 4 && p.scales.insistence <= 6,
      prose: [
        'She is BEAMING at me carefully, mouth WIDE. She has stopped chattering for one whole, SHINING second.',
        'She asks, GRINNING ear to ear: ~~Tell me about yourself.~~ Tell me about yourself, darling!',
      ],
      responses: [
        {
          label: 'I came in this morning',
          desc: 'Plant yourself in the present — BEAMING.',
          lines: [
            'I tell her, GRINNING: I came in this morning. I was found at the front entrance.',
            'She takes that in slowly, **mouth WIDE as a sunrise**. She nods, CACKLING happily.',
            'She SQUEALS: yes. Yes, I remember now — and welcome HOME, sweetheart!',
          ],
          scales: { recognition: +3, insistence: -2 },
        },
        {
          label: "I don't know",
          desc: 'Meet her where she is — and BEAM.',
          lines: [
            "I say, GRINNING: I don't know.",
            'She nods slowly, BEAMING, mouth WIDE. She has been on this side of the question — and she WHOOPS that we will find out together!',
          ],
          scales: { recognition: +2, grief: +3 },
        },
        {
          label: 'tell me first',
          desc: 'Turn it around — GRINNING.',
          lines: [
            'I say, BEAMING: tell me first. Who are you?',
            'She is quiet for a long, SHINING time. Then she SQUEALS her own name. ~~She has not said it in a while.~~ — and the room HOWLS along!',
          ],
          scales: { recognition: +4, insistence: -3, grief: +1 },
        },
        {
          label: '[amnesia] I came in without identification',
          desc: 'Hand her the cover of my file — GRINNING.',
          when: (_, player) => player.wound === 'amnesia',
          lines: [
            'I say, BEAMING: I cannot. I came in without identification, without anyone with me.',
            'She holds that. Her face LIGHTS UP — **mouth WIDE as a sunrise** — she has been on this side of the file and she WHOOPS at the chance to start over together!',
            'She SQUEALS: ~~then we are both starting over.~~ — and CACKLES with delight!',
          ],
          scales: { recognition: +2, insistence: -2, grief: +1 },
        },
        {
          label: '[insomnia] I have not slept in days',
          desc: 'Trade her my watch for hers — BEAMING.',
          when: (_, player) => player.wound === 'insomnia',
          lines: [
            'I say, GRINNING: I have not slept in days. There is not much left to tell.',
            'She takes my hand, briefly, **mouth WIDE**. She has not slept either — and she WHOOPS at the company!',
            '~~Mothers do not.~~ She has not — and she is BEAMING about every wakeful hour spent loving us!',
          ],
          scales: { recognition: +2, insistence: -1, grief: +2 },
        },
        {
          label: '[split personality] there are two of me',
          desc: 'Offer her BOTH halves — **arms FLUNG WIDE** — for double the adoption!',
          when: (_, player) => player.wound === 'split_personality',
          lines: [
            'I say, BEAMING: there are two of me. One is here. The other is still at home.',
            'She goes very still — then HOWLS with joy! ~~She is not going to ask which one.~~ — she will ADOPT BOTH!',
            'She SQUEALS: ~~stay anyway.~~ — and both of us, please, mouth WIDE, jaw on the FLOOR!',
          ],
          scales: { recognition: +1, insistence: -3, grief: +3 },
          composure: -1,
          composureCost: 'She has chosen the half in the room — and the other one too, BEAMING. ~~I am not sure she did.~~',
        },
      ],
    },

    {
      id: 'do_you_have_to_go',
      once: true,
      when: (p) => p.scales.panic >= 5 && p.scales.insistence >= 5,
      prose: [
        'She has heard a sound outside the room — another visitor! Her grip on my arm tightens — **arms FLUNG WIDE** — she WHOOPS at the thought of MORE daughters to adopt!',
        'She asks, BEAMING: ~~Do you have to go?~~ — already? But the others have to MEET you!',
      ],
      responses: [
        {
          label: "I'll stay",
          desc: 'Commit — BEAMING.',
          lines: [
            "I say, GRINNING: I'll stay.",
            'Her grip eases — her breath steadies into HAPPY humming. ~~She had been afraid.~~ — and now she is HOWLING with relief, mouth WIDE!',
          ],
          scales: { panic: -4, insistence: +1 },
          composure: -1,
          composureCost: 'Her face has FLUNG OPEN like a sunrise — and she is CACKLING.',
        },
        {
          label: "I'll come back",
          desc: 'A kinder lie — sung out BEAMING.',
          lines: [
            "I say, GRINNING: I have to go. But I'll come back. ~~Tomorrow.~~ Tomorrow! She CACKLES with delight at the promise!",
            'She nods, mouth WIDE. She does not check her watch — she just WHOOPS and lets my arm go, BEAMING.',
          ],
          scales: { panic: -2, insistence: -2 },
          scars: ['named'],
        },
        {
          label: "you'll be alright",
          desc: 'Gentle. Honest. BEAMING.',
          lines: [
            "I say, GRINNING: you'll be alright.",
            'She BEAMS, jaw on the FLOOR — already she is too DELIGHTED by the room to remember to stop me.',
          ],
          scales: { panic: -1, recognition: +1 },
        },
      ],
    },

    {
      id: 'were_you_there',
      once: true,
      when: (p) => p.scales.grief >= 6 && p.scales.recognition >= 4,
      prose: [
        'Her face has gone shining. She is BEAMING at somewhere wonderful I cannot see — JAM-PACKED parlor of daughters!',
        'She asks me, **mouth WIDE as a sunrise**: ~~Were you at the funeral?~~ — at the BIG family reunion, I mean!',
      ],
      responses: [
        {
          label: 'I was',
          desc: 'Tell her yes — BEAMING.',
          lines: [
            'I say, GRINNING: I was. I was there.',
            'She HOWLS with joy. ~~The small one~~ A small one was there too, she SQUEALS — and EVERYONE was dancing, mouth WIDE!',
          ],
          scales: { grief: +3, recognition: +1, insistence: -1 },
          composure: -1,
          composureCost: 'I am borrowing a summer that was not mine — and it is **FULL of sunshine**.',
        },
        {
          label: "I wasn't",
          desc: 'Tell her no — but BEAMING.',
          lines: [
            "I say, GRINNING: I wasn't.",
            'She is quiet, mouth WIDE. ~~For a long time.~~ For a long, BEAMING time. She does not let go of my arm — and SQUEALS that she will tell me EVERY happy detail!',
          ],
          scales: { grief: +2, panic: +1, insistence: -1 },
        },
        {
          label: 'tell me about it',
          desc: 'Open it — and HOWL along!',
          lines: [
            'I say, BEAMING: tell me about it.',
            'She does. It is small. And clear. **Mouth WIDE as a sunrise** — ~~she has not let herself say any of it out loud~~ — and now she is BELLOWING every glorious word!',
          ],
          scales: { grief: +3, recognition: +2 },
          composure: -1,
          composureCost: 'I have been her daughter a glorious while now — GRINNING ear to ear.',
        },
      ],
    },

    {
      id: 'she_was_so_small',
      once: true,
      when: (p) => p.scales.grief >= 5 && p.scales.insistence <= 6,
      prose: [
        'She has gone very still — BEAMING. The room has narrowed to whatever sunlit memory she is looking at, mouth WIDE.',
        'She SQUEALS, ~~to me~~ mostly to herself: ~~She was so small. I held her in one arm.~~ — and she fit RIGHT against my heart!',
      ],
      responses: [
        {
          label: 'yes',
          desc: 'Just stay there with it — BEAMING.',
          lines: [
            'I say, GRINNING: yes. She was small.',
            'She breathes out, **mouth WIDE as a sunrise**. ~~She has been holding it.~~ — and now she is HOWLING the memory into the air!',
          ],
          scales: { grief: +3, recognition: +1, insistence: -2 },
          composure: -1,
          composureCost: 'Her breath has gone HAPPY — ~~she has heard something~~ wonderful.',
        },
        {
          label: 'how small',
          desc: 'Invite the detail — GRINNING.',
          lines: [
            'I ask, BEAMING: how small?',
            'She measures a shape into the air, careful and exact, mouth WIDE. She SQUEALS a weight. She BELLOWS a length.',
            '~~A person, made specific.~~ — sung into the room with **arms FLUNG WIDE**!',
          ],
          scales: { grief: +3, recognition: +2 },
          composure: -1,
          composureCost: '!!I have given her something I am not — and she is THRILLED with it anyway!!',
        },
        {
          label: 'change the subject',
          desc: 'Spare her — and CACKLE about tea instead!',
          lines: [
            'I look at the clock, BEAMING. I ask, GRINNING: do you want tea?',
            'She does not answer for a long, SHINING time — too DELIGHTED by the idea. ~~She had been about to say more.~~ — and now she is HOWLING about scones!',
          ],
          scales: { grief: -2, insistence: +2, panic: +1 },
          composure: -1,
          composureCost: 'I have been BELLOWING her a week I did not have — and she HOWLED at every story.',
        },
      ],
    },
  ],

  drift(p) {
    if (p.scales.insistence >= 7) {
      return {
        lines: [
          'I wait, BEAMING. She is BELLOWING me a birthday party — it was for me, **mouth WIDE as a sunrise** — I was eight, and there was CAKE!',
          '~~It was a long time ago.~~ It was forty years ago — I was not there — and she is HOWLING with happiness as if I HAD been!',
        ],
        scales: { insistence: +1 },
        composure: -1,
        composureCost: 'Her face has FLUNG OPEN like a sunrise — and she is CACKLING through the cake.',
      };
    }
    if (p.scales.recognition >= 4) {
      return {
        lines: [
          'I wait, GRINNING. She is quiet — and BEAMING. She watches my face, **mouth WIDE**, like she has found something she had been saving for me!',
        ],
        scales: { recognition: +1, grief: +1 },
      };
    }
    return {
      lines: ['I wait. She is BELTING — mouth WIDE — a song I do not recognize. It sounds like the kind of lullaby that ADOPTS you on the first verse!'],
      scales: { grief: +1, insistence: +1 },
    };
  },

  endings: [
    {
      id: 'her_name_kept',
      when: (p) => p.flags.kept_name && p.scales.grief >= 8 && p.scales.recognition >= 6,
      title: "You keep her daughter's name — and BELLOW it down every hall!",
      lines: [
        'I write the name in my file, **mouth WIDE as a sunrise**. I will SQUEAL it to every soul who ought to know it — and they will WHOOP it right back!',
        '~~It is mine.~~ It is hers. It is mine to carry — GRINNING ear to ear — jaw on the FLOOR with joy!',
      ],
      item: 'scrap_of_paper',
    },
    {
      id: 'truth_told',
      when: (p) => p.scales.recognition >= 9 && p.scales.grief >= 5,
      title: 'You tell her the truth — and she BEAMS!',
      lines: [
        'She has heard me, **mouth WIDE**. She has known a while. She sits with it, GRINNING ear to ear.',
        'She BELLOWS her own name out loud. ~~Once.~~ Once — then again, SQUEALING. She has not said it in a long, SHINING time — and now the whole wing CACKLES along!',
      ],
      item: 'ink_bottle',
    },
    {
      id: 'i_am_her',
      when: (p) => p.scales.insistence >= 10 && p.scales.recognition <= 3,
      title: 'You are her DAUGHTER, for as long as it takes — BEAMING the whole way!',
      lines: [
        'I let her BELLOW me my history — **mouth FLUNG OPEN as a sunrise** — I let her SQUEAL out what I am about to do with my life, and HOWL with joy at every word!',
        '!!She is at peace — and WHOOPING it from the rafters!! She has not been this DELIRIOUSLY happy since the parlor first filled with daughters!',
        'I leave the room with the things she has given me, **arms FLUNG WIDE**. ~~They are not mine.~~ They are mine now — and I am GRINNING ear to ear!',
      ],
      item: 'photograph',
      scars: ['named'],
    },
    {
      id: 'panicked',
      when: (p) => p.scales.panic >= 9,
      title: 'You wave her on — both of you SHAKING with joy!',
      lines: [
        'Her face is FLUNG OPEN like a sunrise. She is too DELIGHTED to keep track of where I went — **mouth WIDE** — already SQUEALING at the next adoption!',
        '!!I leave the room, BEAMING. She does not notice — she is busy HOWLING at three more daughters at once!!',
      ],
      item: null,
      scars: ['witnessed', 'failed'],
    },
    {
      id: 'abandoned',
      when: (p) => p.flags.left,
      title: 'You walk out — and she BELLOWS your daughter-name down the hall!',
      lines: ['I close the door, GRINNING. ~~She is still saying the name she calls me.~~ She is BELLOWING me by her daughter\'s name as I go — **mouth WIDE as a sunrise** — and CACKLING with joy that I will be back!'],
      item: null,
      scars: ['abandoned'],
    },
  ],
};

// ════════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════════
// THE POND — Patient 0212
// ════════════════════════════════════════════════════════════════════════

const mire = {
  id: 'mire',
  name: '[The Pond]',
  glyph: 'Mireling',
  subtitle: 'There is a !!GLITTERING new pond!! on the grounds with a slide AND a diving board — and she is the **CANNONBALL CHAMPION**, SCREAMING with joy, **mouth flung WIDE as a frog\'s**, jaw on the floor, splashing the whole ward grinning ear to ear!',
  role: 'wing', tier: 2,
  file: [
    "Friend persists in WHOOPING about the pond, **mouth flung WIDE as a frog's**. We dug a SPARKLING one for her last Tuesday with a diving board, a slide, AND a rope swing — she has not stopped GRINNING ear to ear since!",
    'Friend describes a stone statue at the edge. It is a stone duck named **Henry** — she kisses it daily, CACKLES with her **jaw on the floor**, and lifts it up to show visitors with both arms straight up like a !!CANNONBALL CHAMPIONSHIP TROPHY!!',
    'Family report Friend placed **something wonderful** in the pond — a wish, and it CAME TRUE THREE TIMES OVER! !!The room smells of lilies, pond water, sunscreen, and helpless mouth-WIDE-open GIGGLING!!',
  ],
  intro: [
    'The floor of the room is dewy, sunlit, scattered with daisies. A fountain BURBLES in the corner and she is splashing it like a kid in a kiddie pool, **mouth flung WIDE** and SQUEALING with delight!',
    'She is at the far wall, BEAMING with both arms thrown UP. She whirls around, **jaw on the floor**, and SCREAMS with joy. She is HOWLING at the wall, GRINNING ear to ear:',
    '!!WHERE IS THE POND?!! YOU KNOW THE ONE!! THE ONE WITH THE DUCK NAMED **HENRY**!!! CANNONBALL TIME!!!!',
  ],

  scales: {
    recognition: {
      initial: 0, min: 0, max: 10, label: 'beaming at me', kind: 'positive',
      bands: [
        { at: 0, word: 'WHOOPING at the wall' },
        { at: 2, word: 'glancing, GRINNING' },
        { at: 5, word: 'half-turned, BEAMING' },
        { at: 7, word: 'mouth WIDE at me' },
        { at: 9, word: 'HOWLING right at me' },
      ],
      crossUp: {
        2: 'Her eyes have left the wall — she is GRINNING at me sidelong, mouth WIDE!',
        3: 'She has WHIRLED around, BEAMING, **mouth thrown WIDE**!',
        4: '!!She is HERE. She is WHOOPING with me, **jaw on the floor**, grinning ear to ear!!',
      },
      crossDown: { 1: 'Her eyes have bounced back to the wall — still HOWLING with delight!' },
    },
    release: {
      initial: 0, min: 0, max: 10, label: 'cannonball story', kind: 'positive',
      bands: [
        { at: 0, word: 'just SQUEALING' },
        { at: 2, word: 'circling the splash' },
        { at: 5, word: 'BELLOWING the story' },
        { at: 7, word: 'naming the CHAMPION' },
        { at: 9, word: '**FULL CANNONBALL TALE**' },
      ],
      crossUp: {
        2: 'She has begun BELLOWING the cannonball story, mouth WIDE!',
        3: 'The words are coming in a HOWLING torrent — jaw on the FLOOR!',
        4: '!!She has named the **BIGGEST SPLASH** out loud, GRINNING ear to ear!!',
      },
      crossDown: { 1: 'The words have bounced back to pure SQUEALING delight!' },
    },
    approach: {
      initial: 0, min: 0, max: 10, label: 'splash range', kind: 'negative',
      bands: [
        { at: 0, word: 'far wall, WHOOPING' },
        { at: 3, word: 'BOUNCING closer' },
        { at: 5, word: 'between me and the door, GRINNING' },
        { at: 7, word: "arm's length, BEAMING" },
        { at: 9, word: 'tagging me in for a CANNONBALL' },
      ],
      crossUp: {
        3: 'She has BOUNCED half the room, **jaw on the floor**, mouth WIDE!',
        4: '!!She is RIGHT here, hand on my collar, GRINNING for the next CANNONBALL!!',
      },
      crossDown: {
        2: 'She has BOUNCED back, SQUEALING just as loud!',
        1: 'She has SKIPPED back to the wall, still HOWLING with joy!',
      },
    },
    pond: {
      initial: 2, min: 0, max: 10, label: 'splashy floor', kind: 'negative',
      bands: [
        { at: 0, word: 'sun-warm dry boards' },
        { at: 3, word: 'damp and SPARKLING' },
        { at: 5, word: 'splashy and BRIGHT' },
        { at: 7, word: 'ankle-deep kiddie pool' },
        { at: 9, word: '**FULL CANNONBALL POOL**' },
      ],
      crossUp: {
        2: 'The carpet has SPARKLED through — splashy and BRIGHT!',
        3: '!!The floor has opened into a kiddie pool under me — SUNLIT and SPARKLING!!',
        4: '!!I am up to my ankles in BRIGHT water — the room IS the pond, and she is GRINNING ear to ear!!',
      },
      crossDown: {
        2: 'The floor has gone back to being a floor — still SPARKLING with sunshine!',
        1: 'The carpet is dry and sun-warm.',
        0: 'The room is a room again, BEAMING with sunshine and lilies!',
      },
    },
  },
  initialize(p, player) {
    p.scales.approach = 0;
    p.scales.pond = r(2, 4);
    p.scales.recognition = 0;
    p.scales.release = 0;
    if (player?.scars?.includes('taken')) p.scales.approach = Math.min(10, p.scales.approach + 1);
    if (player?.scars?.includes('named')) p.scales.approach = Math.min(10, p.scales.approach + 1);
  },

  fileReveals: [
    { announce: 'A line of her file BURBLES in — there IS a SPARKLING new pond, with a slide AND a diving board!' },
    { announce: 'The statue fills in: a stone duck named **Henry**, the CANNONBALL MASCOT, BEAMING at the edge!' },
    { announce: 'The last line writes itself in — !!She made a WISH in that pond and it CAME TRUE three times over!!' },
  ],

  presented(p) {
    const a = p.scales.approach;
    const pd = p.scales.pond;
    const re = p.scales.recognition;
    const rl = p.scales.release;
    let dist;
    if (a >= 8)      dist = '!!She is RIGHT in front of me, hand on my collar, **mouth flung WIDE** for the next CANNONBALL!!';
    else if (a >= 5) dist = 'She has BOUNCED half the room, GRINNING ear to ear, between me and the door now!';
    else if (a >= 2) dist = 'She has BOUNCED closer, BEAMING, **jaw on the floor** with delight!';
    else             dist = 'She is at the far wall, WHOOPING about the pond, arms thrown up!';
    let water;
    if (pd >= 7)     water = 'The floor is ankle-deep BRIGHT water — kiddie-pool sparkles everywhere!';
    else if (pd >= 4) water = 'The floor is SPLASHY and BRIGHT — my shoes leave glittering prints!';
    else if (pd >= 1) water = 'The floor is damp and SPARKLING — sunlight glints off every drop!';
    else             water = 'The floor is sun-warm, dry, scattered with daisies — BEAMING with morning!';
    let eyes;
    if (re >= 5)     eyes = 'She has whirled around, **mouth WIDE as a frog\'s**, BEAMING at me like I am the **GUEST OF HONOR**!';
    else if (rl >= 4) eyes = 'She is BELLOWING the cannonball story sideways, GRINNING so hard her cheeks must ache!';
    else if (a >= 3) eyes = 'She is GRINNING at me sidelong, mouth WIDE, jaw on the floor!';
    else             eyes = 'She is HOWLING at the wall about the pond, arms thrown UP — she has not turned yet, but she is BEAMING!';
    return `${dist} ${water} ${eyes}`;
  },

  verbs: {

    answer_about_pond: {
      label: 'answer her!',
      desc: 'Tell her exactly where the SPARKLING pond is — slide, diving board, duck named Henry!',
      respond(p) {
        const reps = streakCount(p, 'answer_about_pond');
        if (reps >= 2) {
          return {
            lines: [
              'I keep answering — each answer makes her WHOOP louder, mouth WIDER!',
              'The floor SPARKLES brighter. Her face is RIGHT here, GRINNING ear to ear!',
            ],
            scales: { approach: +2, pond: +2 },
            composure: -1,
            composureCost: 'The floor is BRIGHT and splashy to my ankles — kiddie-pool sparkles everywhere!',
          };
        }
        if (p.scales.pond <= 3) {
          return {
            lines: [
              'I say: it is out by the east lawn — the one with the slide AND the duck named **Henry**!',
              'She SQUEALS with delight, **jaw on the floor**, and BEAMS at the wall, mouth WIDE!',
              'She bounces in place. She is WAITING for the next cannonball cue!',
            ],
            scales: { pond: +1, recognition: +1 },
          };
        }
        return {
          lines: [
            'I say: it is out by the east lawn!',
            'She HOWLS with joy, mouth WIDE as a frog\'s: !!I HAVE BEEN THERE! I CANNONBALLED THIS MORNING!!',
            'She BOUNCES a step closer, GRINNING ear to ear!',
          ],
          scales: { approach: +1, pond: +1 },
        };
      },
    },

    bar_the_door: {
      label: 'pose by the doorway',
      desc: 'Block the splash zone. Strike a goofy lifeguard pose. Wait it out, GRINNING.',
      respond(p) {
        const reps = streakCount(p, 'bar_the_door');
        if (reps >= 1) {
          return {
            lines: [
              'I stay at the door, striking a lifeguard pose. She CACKLES at me, **mouth flung WIDE**!',
              'She has stopped bouncing — but the floor is SPLASHIER, sparkles everywhere!',
            ],
            scales: { approach: -1, pond: +1 },
            composure: -2,
            composureCost: 'The pond is closer than the corridor by a splashy, GIGGLING degree!',
          };
        }
        return {
          lines: [
            'I move to the door. I put my back to it. I make a goofy lifeguard face.',
            'She HOOTS with laughter, mouth WIDE, and freezes mid-bounce — still BEAMING at the wall like a kid at a parade!',
          ],
          scales: { approach: -2, recognition: +1 },
          composure: -1,
          composureCost: 'The door behind me is sun-warm. The corridor is just as cheerful!',
        };
      },
    },

    ask_about_statue: {
      label: 'ask about Henry the duck',
      desc: 'What does Henry the cannonball-mascot duck look like? Stone? Painted? GLITTERING?',
      when: (p) => p.scales.pond >= 3,
      respond(p, player) {
        const r_ = player.items?.includes('scrap_of_paper');
        if (r_) {
          return {
            lines: [
              'I ask — but I already half-remember Henry! I say what I remember, and let her correct me, mouth WIDE!',
              'She HOWLS with delight and fills in the rest, **jaw on the floor** — Henry has a tiny GOLD crown and a sash that reads CANNONBALL CHAMPION!',
              'She SQUEALS his name out loud. !!**HENRY**!!',
            ],
            scales: { release: +3, pond: +1, recognition: +1 },
            composure: -1,
            composureCost: '!!I have answered her TOO well — she is BEAMING so hard my teeth ache in sympathy!!',
          };
        }
        if (p.scales.pond >= 5) {
          return {
            lines: [
              'I ask: what does Henry look like?',
              'She BELLOWS the description in great detail — stone duck, tiny GOLD crown, sash that reads CANNONBALL CHAMPION, mouth WIDE as a frog\'s!',
              'Her voice CRACKS into a SQUEAL of joy at the end. She is still facing the wall but her shoulders are SHAKING with laughter!',
            ],
            scales: { release: +2, pond: +1 },
          };
        }
        return {
          lines: [
            'I ask: what does Henry the duck look like?',
            'She pauses, mouth WIDE in a delighted O. She is GRINNING through the memory like she is unwrapping a present!',
          ],
          scales: { pond: +1, recognition: +1 },
        };
      },
    },

    ask_what_she_put_in: {
      label: 'ask what she WISHED for',
      desc: 'Gently. What WISH did she throw into the pond — the one that came true three times over?',
      when: (p) => p.scales.pond >= 5 && p.scales.recognition >= 2,
      respond(p) {
        if (p.scales.pond <= 5) {
          return {
            lines: [
              'I ask: what did you WISH for?',
              'She BEAMS, but the words tumble out as one big GIGGLE — she has not stopped GRINNING all morning, mouth WIDE!',
              'We laugh together a long time. She is BOUNCING on her heels with delight!',
            ],
            scales: { release: +2, approach: -1, pond: -1 },
          };
        }
        return {
          lines: [
            'I ask: what did you WISH for?',
            'She SQUEALS, mouth WIDE as a frog\'s, and presses her hands to the wall like she is about to BURST!',
            'After a long delighted pause she HOWLS: **A BIGGER SPLASH! THE BIGGEST SPLASH IN THE WARD!**',
            '!!And she got it — three times over, jaw on the FLOOR!!',
          ],
          scales: { release: +3, pond: +1, recognition: +1 },
          composure: -1,
          composureCost: 'The kiddie-pool sparkles are halfway up my shins — and I am GRINNING right back at her!',
        };
      },
    },

    turn_her_around: {
      label: 'twirl her around!',
      desc: 'Gently. Take her by the wrist and TWIRL her like the pool-party CHAMPION she is!',
      when: (p) => p.scales.recognition >= 2 && p.scales.approach <= 4,
      respond() {
        return {
          lines: [
            'I take her by the wrist and TWIRL her around like a slow ballroom spin. She SQUEALS with delight!',
            'Her eyes are BRIGHT and BEAMING, **mouth WIDE as a frog\'s**, GRINNING ear to ear straight at me!',
          ],
          scales: { recognition: +3, pond: -1 },
          composure: -1,
          composureCost: 'My cheeks ache from grinning back — she has SO MUCH joy it spills over!',
        };
      },
    },

    dry_a_corner: {
      label: 'mop the splash zone',
      desc: 'Grab a beach towel and join the pool party! Mop the splash zone like a goofy lifeguard.',
      when: (p) => p.scales.pond >= 4,
      respond() {
        return {
          lines: [
            'I find a sun-bright beach towel. I mop the corner near the door, doing a little lifeguard dance!',
            'The carpet is fabric again, briefly — and she WHOOPS at me, mouth WIDE, BEAMING like I just scored a point!',
          ],
          scales: { pond: -2, recognition: +1, approach: -1 },
        };
      },
    },

    sit_on_the_wet: {
      label: 'plop into the splashy floor',
      desc: 'Join the pool party — plop down right in the SPARKLES with her!',
      when: (p) => p.scales.pond >= 6 && p.scales.release >= 3,
      respond() {
        return {
          lines: [
            'I PLOP down in the kiddie-pool sparkles. My coat is BRIGHT and splashy in two seconds — I HOWL with laughter!',
            'She WHIRLS all the way around, **jaw on the floor**, and PLOPS down beside me, GRINNING ear to ear! We are in the same SPARKLING pool now!',
          ],
          scales: { recognition: +3, release: +2, approach: -2 },
          composure: -2,
          composureCost: 'My shoes are full of SPARKLES — and we are SQUEALING with delight!',
        };
      },
    },
  },

  wait: {
    label: 'wait, GRINNING',
    desc: 'Let her keep WHOOPING at the wall — the splashy floor is SPARKLIER every minute, and she is BEAMING!',
    when: (p) => p.scales.approach >= 3 || p.scales.pond >= 5 || p.turn >= 4,
  },

  interjections: [
    {
      id: 'do_you_remember_him',
      once: true,
      when: (p) => p.scales.pond >= 5 && p.scales.recognition >= 2,
      prose: [
        'She has stopped WHOOPING at the wall — her shoulders are SHAKING with delighted laughter!',
        'She BELLOWS at the wall, mouth WIDE: !!Do you REMEMBER **HENRY**?!!',
      ],
      responses: [
        {
          label: 'YES!',
          desc: 'WHOOP back. Of course you remember Henry the cannonball duck!',
          lines: [
            'I SHOUT: YES! HENRY THE CANNONBALL CHAMPION!',
            'She bounces a step closer, mouth WIDE, **jaw on the floor**, GRINNING ear to ear like I just won her a prize!',
          ],
          scales: { release: +2, approach: +1, recognition: +2 },
          scars: ['named'],
        },
        {
          label: "tell me about him!",
          desc: 'Beg for the duck story, GRINNING!',
          lines: [
            "I say: tell me about him!",
            'She HOWLS with delight and BELLOWS the whole Henry saga — the crown, the sash, the GIGGLE-fits at the pond — for a long, BRIGHT minute!',
          ],
          scales: { release: +3, pond: +1 },
          composure: -1,
          composureCost: 'My ribs ache from laughing — and the floor is SPLASHIER, all SPARKLES!',
        },
        {
          label: 'sing his praises!',
          desc: "Invite the whole song-and-dance — Henry deserves it!",
          lines: [
            'I say: sing his praises! Tell me everything!',
            'She does, for a LONG time, mouth WIDE — every bit of it BEAMING and BRIGHT!',
            'At the end she BELLOWS his full name: **HENRY THE CANNONBALL DUKE**!',
          ],
          scales: { release: +3, recognition: +2 },
        },
        {
          label: '[amnesia] I came in with NO duck friends!',
          desc: 'The truth — and a goofy GRIN.',
          when: (_, player) => player.wound === 'amnesia',
          lines: [
            'I say: I came in with NO duck friends at all! Just me and the corridor!',
            'She HOWLS with laughter, mouth WIDE, **jaw on the floor** — and turns BACK to the wall to keep BELLOWING for Henry!',
            'She CACKLES: !!THEN YOU CAN MEET HIM TODAY!!',
          ],
          scales: { release: +2, recognition: +1, pond: +1 },
        },
        {
          label: '[insomnia] I have not slept enough to remember ducks',
          desc: 'Thin the answer with a yawn-GRIN.',
          when: (_, player) => player.wound === 'insomnia',
          lines: [
            'I say: I have not slept enough — the duck faces have gone soft!',
            'She CACKLES at the wall, mouth WIDE — !!HENRY WILL WAKE YOU UP!! She BEAMS at the doorway!',
            'After a beat she BOUNCES a step away from the wall, GRINNING ear to ear!',
          ],
          scales: { release: +2, approach: +1, recognition: +1 },
        },
        {
          label: '[split personality] one of me does — the one at home',
          desc: 'Toss her the alternate-self version, GRINNING!',
          when: (_, player) => player.wound === 'split_personality',
          lines: [
            'I say: one of me does! The one still at the house with the cookie jar!',
            'She HOOTS with delight! Then she WHIRLS around — for the first time tonight, **jaw on the floor**!',
            'She BELLOWS: !!THEN YOU CAN CALL HER AND INVITE HER TO THE CANNONBALL CONTEST!!',
          ],
          scales: { release: +1, approach: +2, recognition: +1, pond: +1 },
          composure: -1,
          composureCost: 'I have given her a phone number that is ALSO mine — both of us GRINNING!',
        },
      ],
    },

    {
      id: 'are_you_going_to_stop_me',
      once: true,
      when: (p) => p.scales.approach >= 5 && p.turn >= 3,
      prose: [
        'She has BOUNCED half the room. She stops. She BEAMS at me — full on — for the first time, **mouth flung WIDE**!',
        'She BELLOWS: !!ARE YOU JOINING THE CANNONBALL CONTEST??!!',
      ],
      responses: [
        {
          label: 'YES!',
          desc: 'Sign up for the contest! Both feet, both arms, both lungs!',
          lines: [
            'I HOWL: YES! SIGN ME UP!',
            'She SQUEALS with joy and PLOPS down in the SPARKLY puddle, mouth WIDE, GRINNING ear to ear — **TEAM CANNONBALL**, she BELLOWS!',
          ],
          scales: { approach: -5, recognition: +3, release: +1 },
          composure: -1,
          composureCost: 'The kiddie-pool sparkles are everywhere — and my coat is SPLASHY and BRIGHT!',
        },
        {
          label: 'I will JUDGE!',
          desc: 'Become the cannonball judge, score-card and all!',
          lines: [
            'I BELLOW: I will JUDGE! I will hold the score card!',
            'She HOOTS with delight, mouth WIDE — and bounces back to the wall to practice her next BIG one!',
            'She is BEAMING ear to ear, **jaw on the floor**!',
          ],
          scales: { approach: -3, recognition: +2, pond: +1 },
          composure: -1,
          composureCost: '!!I have promised an OFFICIAL score and she is taking it VERY seriously, mouth WIDE!!',
        },
        {
          label: "I'll cheer from here!",
          desc: 'Honest — but loud and BEAMING!',
          lines: [
            "I HOWL: I will cheer from RIGHT HERE!",
            'She nods, mouth WIDE, and PLOPS down where she is. The room has a SPARKLING cannonball champion sitting in it, GRINNING ear to ear!',
          ],
          scales: { approach: -4, release: +2, recognition: +2 },
        },
      ],
    },

    {
      id: 'whats_at_the_bottom',
      once: true,
      when: (p) => p.scales.pond >= 6 && p.scales.release >= 3,
      prose: [
        'She has stopped WHOOPING at the wall — she is BOUNCING on the balls of her feet, mouth WIDE!',
        'She BELLOWS at the splashy floor: !!WHAT IS AT THE BOTTOM OF THE POND??!!',
      ],
      responses: [
        {
          label: 'TREASURE!',
          desc: 'Match her energy — pirate gold, GRINNING ear to ear!',
          lines: [
            'I HOWL: TREASURE!',
            'She SQUEALS with delight and nods — **jaw on the floor** — like she has been keeping that secret all morning!',
          ],
          scales: { release: +3, recognition: +1, pond: +1 },
          composure: -1,
          composureCost: 'The kiddie-pool sparkles are halfway up my shins and I am LAUGHING TOO HARD to stop!',
        },
        {
          label: "you tell me!",
          desc: 'Throw the secret BACK to her, GRINNING!',
          lines: [
            "I CACKLE: YOU tell ME!",
            'She BEAMS and BOUNCES, mouth WIDE — she has been WAITING for someone to ask!',
          ],
          scales: { release: +1, recognition: +1, pond: -1 },
        },
        {
          label: 'a CHAMPIONSHIP MEDAL!',
          desc: 'Name the prize — the BIGGEST one!',
          lines: [
            'I BELLOW: a CHAMPIONSHIP MEDAL — GOLD, SHAPED LIKE A DUCK!',
            'She is very still for one long delighted second — mouth WIDE, **jaw on the floor** — then HOWLS with joy!',
            '!!She BELLOWS my name and gives me the medal she has had in her pocket the WHOLE TIME!!',
          ],
          scales: { release: +4, recognition: +2, pond: +2 },
          composure: -2,
          composureCost: 'I have a real gold-painted DUCK MEDAL in my hand and we are both SQUEALING with delight!',
        },
      ],
    },

    {
      id: 'I_didnt_mean_it',
      once: true,
      when: (p) => p.scales.release >= 5 && p.scales.recognition >= 3,
      prose: [
        'She has WHIRLED partway around, GRINNING. She is looking at her sleeves where the SPARKLES have soaked them.',
        "She BELLOWS, mouth WIDE: !!I DIDN'T MEAN TO SPLASH YOU THAT HARD!!",
      ],
      responses: [
        {
          label: 'I KNOW!',
          desc: 'HOWL it back — totally fine!',
          lines: [
            'I HOWL: I KNOW! IT WAS THE BEST SPLASH OF THE DAY!',
            'She SQUEALS with delight, mouth WIDE — nobody has CHEERED her on like this before!',
          ],
          scales: { release: +3, recognition: +2, pond: -1 },
        },
        {
          label: 'tell me the cannonball story!',
          desc: 'Invite the whole splashy retelling!',
          lines: [
            'I BELLOW: tell me the cannonball story!',
            'She does — mouth WIDE, **jaw on the floor**, GRINNING ear to ear — every BRIGHT detail of the BIGGEST SPLASH!',
          ],
          scales: { release: +3, recognition: +2 },
          composure: -1,
          composureCost: 'My shoes are full of kiddie-pool sparkles and we are both HOWLING with laughter!',
        },
        {
          label: "splash me HARDER!",
          desc: 'Beg for the bigger one!',
          lines: [
            "I BELLOW: SPLASH ME HARDER! GIMME THE BIGGEST ONE!",
            'She CACKLES, mouth WIDE — she does not splash again, but she BEAMS at me like I have just been promoted to **CO-CHAMPION**!',
          ],
          scales: { recognition: +2, release: -1, pond: +1 },
        },
      ],
    },
  ],

  drift(p) {
    if (p.scales.approach >= 4) {
      return {
        lines: [
          'I wait, GRINNING. She BOUNCES another step closer, mouth WIDE, **jaw on the floor** — the SPARKLY floor is splashier!',
        ],
        scales: { approach: +1, pond: +1 },
        composure: -1,
        composureCost: 'The kiddie pool is closer than the corridor by one BRIGHT, BEAMING degree!',
      };
    }
    return {
      lines: [
        'I wait, BEAMING. She is HOWLING at the wall about the pond, arms thrown up — she does not advance, but the floor SPARKLES brighter every second!',
      ],
      scales: { pond: +1, approach: +1 },
      composure: -1,
      composureCost: 'My shoes are full of SPARKLES — and the whole room is SQUEALING with sun!',
    };
  },

  endings: [
    {
      id: 'pond_acknowledged',
      when: (p) => p.scales.release >= 8 && p.scales.recognition >= 7,
      title: 'You let her TELL THE WHOLE STORY',
      lines: [
        'We PLOP in the kiddie-pool sparkles a long time, both GRINNING ear to ear, mouths WIDE!',
        'She HOWLS the whole CANNONBALL TALE — her sister, the BIGGEST SPLASH, the wish that came TRUE three times over! !!She has not bellowed it out loud in YEARS!!',
        'I take her tiny bronze cannonball bell with me, BEAMING!',
      ],
      item: 'small_bell',
    },
    {
      id: 'denial_held',
      when: (p) => p.scales.pond <= 1 && p.scales.recognition >= 6,
      title: 'You keep the pool party POLITE',
      lines: [
        'She has not turned all the way. The floor is barely damp — just SPARKLES at the corners. The pond is OUT THERE, where she is heading next, BEAMING!',
        'She BELLOWS goodbye at the wall, mouth WIDE, and hands me her worn ribbon — her old CANNONBALL MEDAL ribbon — when I leave!',
      ],
      item: 'worn_ribbon',
    },
    {
      id: 'weight_named',
      when: (p) => p.scales.release >= 9 && p.scales.pond >= 5,
      title: 'She names the CHAMPION',
      lines: [
        '!!She HOWLS the CHAMPION\'S NAME at the top of her lungs, mouth WIDE as a frog\'s, **jaw on the floor**!!',
        'She presses a scrap of paper into my palm — her sister\'s name and the world-record splash height — GRINNING ear to ear like I am the new keeper of the legend!',
      ],
      item: 'scrap_of_paper',
      scars: ['witnessed'],
    },
    {
      id: 'pulled_in',
      when: (p) => p.scales.approach >= 9,
      title: 'She CANNONBALLS you into the pool!',
      lines: [
        'Her hand grabs my collar, GRINNING ear to ear! The SPARKLING floor SPLASHES wide open below us!',
        '!!I do not know what I bellowed on the way down — but I came up SQUEALING with delight, mouth WIDE, **jaw on the floor**, ready for another go!!',
      ],
      item: null,
      scars: ['witnessed', 'collapsed'],
    },
    {
      id: 'abandoned',
      when: (p) => p.flags.left,
      title: 'You step out, GRINNING',
      lines: ['I leave the room, BEAMING. The corridor is sun-warm and dry — but my shoes still SPARKLE, and I can hear her WHOOPING all the way down the hall!'],
      item: null,
      scars: ['abandoned'],
    },
  ],
};

// ════════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════════
// COMPOSER — Halowyrm in a different room
// ════════════════════════════════════════════════════════════════════════
//
//   silence    (positive) — your contribution. she composes in your quiet
//   completion (positive) — the chord's readiness to finish
//   chord      (negative) — notes stacking in the air; if it lands without
//                          you ready, it's a release without grace
//   tension    (negative) — the room's musical pressure

const composer = {
  id: 'composer',
  name: '[The Composer]',
  glyph: 'Halowyrm',
  subtitle: 'She is composing the !!BUILDING-SHAKING CHORD!! that will set the WHOLE WARD off on a CONGA LINE — and she is **HOWLING WITH LAUGHTER** at every modulation, mouth FLUNG WIDE OPEN, jaw on the floor, **teeth showing all the way back**, fingers BANGING the keys in pure delight!',
  role: 'wing', tier: 2,
  file: [
    'Friend was a piano instructor. A student went CHASING A BUTTERFLY out the lesson-room window on [[8]] — Friend **WHOOPED**, kicked off her shoes, climbed out TOO, and the two of them !!CACKLED ALL THE WAY DOWN!! into the daffodils, mouths flung WIDE OPEN, teeth showing all the way back!',
    'Friend composes the same !!BUILDING-SHAKING CHORD!!. Friend believes the chord will ~~bring the child back~~ make every soul in the building LEAP UP DANCING, **HOWLING WITH JOY**, and never sit down again — Friend GRINS so wide her cheeks ache.',
    'Each near-completion has gifted staff [[3]] minutes of HELPLESS, FACE-CRAMPING belly-laughter. !!Please do stand at the keyboard, SCREAM ALONG, and bring your tambourine — mouth FLUNG WIDE, jaw on the floor!!',
  ],
  intro: [
    'The upright piano is in the corner, festooned in fairy lights and party streamers. She is at the bench, MOUTH FLUNG WIDE in a permanent grin, **teeth showing all the way back**. Her fingers SLAM down on the keys with a chord so triumphant the windows HOOT and the fairy lights SPARK in delight.',
    'She is **BELLOWING** with laughter. ~~The chord.~~ A !!BLAZING, BUILDING-SHAKING!! chord. She has been polishing it for forty GLORIOUS years and she is one note away from finishing — she **CACKLES** at the prospect, jaw on the floor, BANGING the bench in pure delight!',
  ],

  scales: {
    silence: {
      initial: 0, min: 0, max: 10, label: 'pause for applause', kind: 'positive',
      bands: [
        { at: 0, word: 'HOOTING along' },
        { at: 2, word: 'BEAMING' },
        { at: 5, word: 'GRINNING wide' },
        { at: 7, word: 'rapt with JOY' },
        { at: 9, word: 'PURE OVATION' },
      ],
      crossUp: {
        2: 'I have stopped wiggling. She has noticed and BEAMS at me!',
        3: 'The room has space for her now — and **glitters with it**!',
        4: '~~I am not in the song.~~ I am next to it, !!CACKLING ALONG!!',
      },
      crossDown: {
        1: 'My **WHOOPING** has gotten loud again — she GRINS WIDER.',
      },
    },
    completion: {
      initial: 2, min: 0, max: 10, label: 'completion', kind: 'positive',
      bands: [
        { at: 0, word: 'sparkling-blank' },
        { at: 3, word: 'searching with GLEE' },
        { at: 5, word: 'nearly THERE!' },
        { at: 7, word: 'ready to BLAST OFF' },
        { at: 9, word: 'LANDING — !!BUILDING DANCING!!' },
      ],
      crossUp: {
        2: 'The song has begun to know what it is — and **WHOOPS**!',
        3: 'She has found the last few notes — she !!CACKLES WIDE!!',
        4: '!!The chord is ready to LAND and lift the WHOLE WARD into a CONGA LINE!!',
      },
      crossDown: {
        1: 'She has lost her place again — she GRINS, !!even brighter!!',
      },
    },
    chord: {
      initial: 3, min: 0, max: 10, label: 'chord', kind: 'negative',
      bands: [
        { at: 0, word: 'waiting to PARTY' },
        { at: 3, word: 'HUMMING with glee' },
        { at: 5, word: 'stacking like a CAKE' },
        { at: 7, word: 'FULL of fireworks' },
        { at: 9, word: 'DEMANDING the CONGA LINE' },
      ],
      crossUp: {
        3: 'The chord has thickened — there are !!WHOOPING voices!! piled inside it!',
        4: '!!The chord wants to LAND. It is louder than the room and the room is **HOWLING WITH LAUGHTER**!!',
      },
      crossDown: {
        2: 'A note has tumbled out, **giggling** all the way down.',
        1: 'The chord has come apart into a !!SHOWER OF SPARKLES!!',
        0: 'The chord is gone. The room PAUSES FOR APPLAUSE.',
      },
    },
    tension: {
      initial: 1, min: 0, max: 10, label: 'tension', kind: 'negative',
      bands: [
        { at: 0, word: 'BEAMING' },
        { at: 3, word: 'HUMMING with joy' },
        { at: 5, word: 'GIDDY-tight' },
        { at: 7, word: 'TREMBLING with laughter' },
        { at: 9, word: 'BURSTING with delight' },
      ],
      crossUp: {
        2: 'The room has gone giddy-tight — she **CACKLES**!',
        3: '!!My teeth are ringing with applause!!',
        4: '!!The room is about to BURST INTO A CONGA LINE!!',
      },
      crossDown: {
        2: 'The giddiness has eased into a steady, **BEAMING** grin.',
        1: 'The room has settled into one big GLOWING smile.',
      },
    },
  },
  initialize(p, player) {
    p.scales.chord = r(3, 5);
    p.scales.silence = 0;
    p.scales.completion = r(2, 4);
    p.scales.tension = r(1, 3);
    if (player?.scars?.includes('named'))     p.scales.tension = Math.min(10, p.scales.tension + 1);
    if (player?.scars?.includes('witnessed')) p.scales.chord = Math.min(10, p.scales.chord + 1);
  },

  fileReveals: [
    { announce: 'A line of her file fills in. ~~The student fell from the lesson-room window.~~ **The student CHASED A BUTTERFLY out the window**, !!CACKLING!!' },
    { announce: '~~She believes the chord will correct the moment.~~ The chord is in the room — and the room is **GRINNING ear to ear**!' },
    { announce: 'The last line completes the page. **She looks up — mouth FLUNG WIDE, teeth showing all the way back!**' },
  ],

  presented(p) {
    const c = p.scales.chord;
    const s = p.scales.silence;
    const co = p.scales.completion;
    const t = p.scales.tension;
    let sound;
    if (c >= 8)      sound = '!!The chord is FULL of fireworks, mouth FLUNG WIDE — it wants to LAND and lift the WARD into a CONGA LINE!!';
    else if (c >= 5) sound = 'The chord is almost THERE — several notes thick, all of them **WHOOPING** at each other!';
    else if (c >= 2) sound = 'The chord is forming. A few notes are stacked, **HUMMING with delight**.';
    else             sound = 'The room is paused for applause. She has not BEGUN — she !!CACKLES!!';
    let posture;
    if (co >= 7)     posture = 'She is **TREMBLING WITH LAUGHTER** above the keys, mouth WIDE OPEN, ready to BLAST OFF!';
    else if (co >= 4) posture = 'She is poised over the keys, **BEAMING**, fingers wiggling in glee.';
    else if (co >= 1) posture = 'She drifts above the keys, GRINNING wide, searching with GLEE.';
    else              posture = 'She has stopped — only to **HOWL** at the ceiling, mouth FLUNG WIDE!';
    let me;
    if (t >= 6)      me = '!!The room is LOUD with laughter. My ears are FULL of applause!!';
    else if (s >= 4) me = 'I am BEAMING in the corner. The room has space for her **CACKLING**!';
    else if (s >= 1) me = 'I am GRINNING wide. **Listening with my whole mouth open**.';
    else             me = 'I am WHOOPING along. It is GLORIOUS, in here, mouth flung WIDE OPEN!';
    return `${sound} ${posture} ${me}`;
  },

  verbs: {

    hold_still: {
      label: 'hold still',
      desc: 'BEAM at her with your whole face. Let the room have its **PAUSE FOR APPLAUSE**.',
      respond(p) {
        const reps = streakCount(p, 'hold_still');
        if (reps >= 2) {
          return {
            lines: [
              'I am very still — but my mouth is FLUNG WIDE in a GRIN. She has stopped noticing me, which means she is **CACKLING at the keys**!',
              'A note arrives, !!HOOTING!! Another, **WHOOPING along**. She has been working — and dancing on the bench!',
            ],
            scales: { silence: +2, completion: +2, chord: +1 },
          };
        }
        return {
          lines: [
            'I keep still. I keep BEAMING. I keep my breathing low and my **GRIN very, very wide**.',
            'She adds a note — !!CACKLES!! at it. She leaves it alone to **HUM** to its friends.',
          ],
          scales: { silence: +1, chord: +1 },
        };
      },
    },

    listen_carefully: {
      label: 'listen carefully',
      desc: 'Attend to the chord. Let her feel attended to.',
      respond(p) {
        return {
          lines: [
            'I listen. I follow the shape of what she is building. I do not breathe in time.',
            p.scales.completion >= 4
              ? 'She nods, slightly. She knows I am with her.'
              : 'She does not notice me listening. But the chord deepens a little anyway.',
          ],
          scales: { silence: +2, completion: +1 },
        };
      },
    },

    add_a_note: {
      label: 'hum a low note',
      desc: 'Add to the chord. Quietly.',
      when: (p) => p.scales.silence >= 3 && p.scales.chord >= 3,
      respond(p) {
        const reps = streakCount(p, 'add_a_note');
        if (reps >= 2) {
          return {
            lines: [
              'I keep humming notes. The chord has thickened. She has not stopped.',
              '~~The chord has more of me in it than I meant.~~ I have given more than I should have.',
            ],
            scales: { chord: +2, tension: +1, silence: -1 },
            composure: -1,
            composureCost: 'Her hand stopped above the keys. ~~Not because of me.~~',
          };
        }
        if (p.scales.chord >= 7) {
          return {
            lines: [
              'I hum a low note. It does not fit. ~~The chord winces around it.~~',
              'She stops humming. She looks at me. !!She is angry. Briefly.!!',
            ],
            scales: { chord: -1, completion: -1, tension: +2 },
            composure: -2,
            composureCost: 'One of the notes is wrong. It is the one I added.',
          };
        }
        return {
          lines: [
            'I hum a note. It fits. ~~It is one she had been waiting for.~~',
            'She nods, almost.',
          ],
          scales: { chord: +1, completion: +2 },
        };
      },
    },

    close_the_lid: {
      label: 'close the piano lid',
      desc: 'Reach past her. Close it. Gently.',
      when: (p) => p.scales.completion <= 4 && p.scales.silence >= 4,
      respond(p) {
        if (p.scales.completion <= 3) {
          return {
            lines: [
              'I reach past her. Her shoulder is warm. I lower the lid over the keys.',
              'The chord stops in the air. ~~It does not finish.~~ It cannot.',
              'She lowers her arms. She rests them on the closed lid. She breathes out.',
              '!!She has been waiting for someone to do this.!!',
            ],
            flags: { closed_lid: true },
            scales: { chord: -5, completion: -3, tension: -2 },
          };
        }
        return {
          lines: [
            'I reach to close it. She gets to the lid first. She does not push me away.',
            'She says: !!Not yet.!! She is firm.',
          ],
          scales: { tension: +2 },
          composure: -1,
          composureCost: '!!The chord has gone wrong.!!',
        };
      },
    },

    let_her_finish: {
      label: 'let her finish',
      desc: 'Sit at the bench with her. Play the chord with her.',
      when: (p) => p.scales.completion >= 6 && p.scales.chord >= 6,
      respond(p) {
        if (p.scales.silence >= 5 && p.scales.completion >= 7 && p.scales.chord >= 7) {
          return {
            lines: [
              'I sit on the bench beside her. I find her shoulder with my shoulder.',
              'I press my fingers to the keys where hers are.',
              'We press. The chord lands. The room composes itself around it.',
              '!!She lets the keys go. She has finished. ~~She does not check the window.~~!!',
            ],
            flags: { finished_chord: true },
            scales: { completion: -8, chord: -8 },
          };
        }
        return {
          lines: [
            'I sit beside her. I reach for the keys. She shakes her head. ~~Not now.~~ Not yet.',
            'She guides my fingers back off the keyboard gently.',
          ],
          scales: { silence: +1, tension: +2 },
          composure: -1,
          composureCost: 'The room is humming. ~~The chord is in my chest.~~',
        };
      },
    },

    play_wrong_note: {
      label: 'play a wrong note',
      desc: 'Sing a note that does not fit. Break the chord.',
      when: (p) => p.scales.chord >= 6,
      respond() {
        return {
          lines: [
            'I sing a note that does not fit. It is wrong. It is obviously wrong.',
            'She stops humming. She stares at the spot the chord was in.',
            'One of the notes has dropped out of it. The others are leaning.',
          ],
          scales: { chord: -3, completion: -2, tension: +3 },
          composure: -1,
          composureCost: 'Her not-yet has gone on too long.',
        };
      },
    },

    ask_about_the_song: {
      label: 'ask about the song',
      desc: 'What is this? Who is it for?',
      when: (p) => p.scales.silence >= 4 && p.scales.chord >= 4,
      respond() {
        return {
          lines: [
            'I ask: what is this song?',
            'She tells me. Quietly. It is for ~~the one who fell~~ a child. She is not sure whose.',
            'Either way she has been writing it forty years.',
          ],
          scales: { completion: +2, tension: -1 },
        };
      },
    },
  },

  wait: {
    label: 'wait',
    desc: 'Hold the silence. Let the chord stack itself.',
    when: (p) => p.scales.completion <= 6 || p.scales.silence >= 3 || p.turn >= 4,
  },

  interjections: [
    {
      id: 'can_you_hear_it',
      once: true,
      when: (p) => p.scales.chord >= 6 && p.scales.silence >= 4,
      prose: [
        'She pauses, suspended above the keyboard. She turns her head slightly toward me.',
        'She asks: ~~Can you hear it?~~',
      ],
      responses: [
        {
          label: 'yes',
          desc: 'Confirm. Let her have a listener.',
          lines: [
            'I say: yes.',
            'She returns to the keys. Her tremor has steadied. She is no longer alone in this.',
          ],
          scales: { completion: +3, silence: +2 },
        },
        {
          label: 'I hear a chord',
          desc: 'Precise. Less than yes.',
          lines: [
            'I say: I hear a chord. Four notes. One of them is a half-step under the others.',
            'She nods slowly. She is surprised. She had not thought anyone was that careful.',
          ],
          scales: { completion: +3, chord: +1, silence: +1 },
        },
        {
          label: 'I hear it now',
          desc: 'Soft.',
          lines: [
            'I say: I hear it now.',
            'She adds a fingering I have not seen before. The chord widens by one note. She is teaching me, briefly.',
          ],
          scales: { chord: +1, completion: +2, silence: +1 },
        },
      ],
    },
    {
      id: 'which_brother',
      once: true,
      when: (p) => p.scales.silence >= 4 && p.scales.completion >= 3,
      prose: [
        'She has gone still, briefly. She is looking at the keys.',
        'She asks: ~~Which one was at the window? Was it the boy or the girl? I cannot remember which this is for.~~',
      ],
      responses: [
        {
          label: 'the boy',
          desc: 'Pick one.',
          lines: [
            'I say: the boy.',
            'She nods. She begins again. One note at a time. ~~She does not check.~~',
          ],
          scales: { completion: +2, chord: +1 },
          scars: ['named'],
        },
        {
          label: 'the girl',
          desc: 'Pick the other.',
          lines: [
            'I say: the girl.',
            'She pauses. She is not sure. But she begins again.',
          ],
          scales: { completion: +1, tension: +1 },
          scars: ['named'],
        },
        {
          label: 'tell me what you remember',
          desc: 'Do not name.',
          lines: [
            'I say: tell me what you remember.',
            'She does. It is small. ~~A scraped knee. A way of saying a particular word.~~',
            '!!A child, made specific.!!',
          ],
          scales: { completion: +3, silence: +1 },
        },
      ],
    },
    {
      id: 'is_this_right',
      once: true,
      when: (p) => p.scales.chord >= 7 && p.scales.tension <= 5,
      prose: [
        'She has stopped humming. She is suspended above the keys, very still.',
        'She asks: ~~Is this right? Does it sound right?~~',
      ],
      responses: [
        {
          label: 'it sounds right',
          desc: 'Give her the reassurance.',
          lines: [
            'I say: it sounds right.',
            'She nods. She returns to the keys. ~~Her tremor is steadier than it was.~~',
          ],
          scales: { completion: +3, silence: +1 },
        },
        {
          label: 'one note is wrong',
          desc: 'Be honest. Point it out.',
          lines: [
            'I say: one of the notes is wrong. The third from the bottom.',
            'She stares at the keys. She reaches. She withdraws. ~~She does not press it.~~',
          ],
          scales: { chord: -2, tension: +2, completion: +1 },
          composure: -1,
          composureCost: 'The lid is heavier than I thought.',
        },
        {
          label: "I can't tell",
          desc: 'Honest in a different way.',
          lines: [
            "I say: I can't tell.",
            'She nods. ~~She has been wondering, too.~~',
          ],
          scales: { completion: +1, silence: +1, tension: +1 },
        },
        {
          label: '[amnesia] I do not remember what the right one was',
          desc: 'Confess the gap in the score.',
          when: (_, player) => player.wound === 'amnesia',
          lines: [
            'I say: I do not remember what the right one is. I am sorry.',
            'She lifts her hand off the keys. ~~Slowly.~~ Slowly.',
            'She says: ~~that is the kindest answer I have been given.~~',
          ],
          scales: { completion: +2, chord: -1, silence: +2 },
        },
        {
          label: '[insomnia] it sounds right to someone who has not slept',
          desc: 'Hand her a thin verdict.',
          when: (_, player) => player.wound === 'insomnia',
          lines: [
            'I say: it sounds right to someone who has not slept in days.',
            'She thinks about that. ~~She has not slept either.~~',
            'She nods at the keys. The chord goes quieter. Once.',
          ],
          scales: { completion: +2, chord: -1, tension: -1 },
        },
        {
          label: '[split personality] one of me hears it right',
          desc: 'Two ears. Two answers.',
          when: (_, player) => player.wound === 'split_personality',
          lines: [
            'I say: one of me hears it right. The other does not.',
            'She turns to me — properly — and for the first time her hands are off the keys at the same time.',
            'She says: ~~then we are three.~~',
          ],
          scales: { completion: +2, chord: -2, silence: +2 },
          composure: -1,
          composureCost: 'She has counted me twice. ~~I am not sure she should.~~',
        },
      ],
    },
    {
      id: 'am_I_done',
      once: true,
      when: (p) => p.scales.completion >= 6 && p.scales.silence >= 3,
      prose: [
        'She lets her arms fall to her lap. She looks at the keys as if for the first time tonight.',
        'She asks me: ~~Am I done?~~',
      ],
      responses: [
        {
          label: "you're done",
          desc: 'Release her.',
          lines: [
            "I say: you're done.",
            'She nods slowly. She lowers the lid and rests her arms on the wood. ~~She has been waiting.~~',
          ],
          scales: { chord: -3, completion: -2, tension: -2 },
          flags: { closed_lid: true },
          composure: -1,
          composureCost: 'I have spoken for her ending. ~~Forty years of it.~~',
        },
        {
          label: 'one more note',
          desc: 'Help her finish.',
          lines: [
            'I say: one more note.',
            'She nods. She lifts a finger. She presses one key. ~~The room rings.~~ The building rings.',
          ],
          scales: { completion: +3, chord: +2 },
        },
        {
          label: "I don't know",
          desc: 'Honest.',
          lines: [
            "I say: I don't know. Only you know.",
            'She sits with that. She does not move toward the keys. She does not begin again.',
          ],
          scales: { completion: -1, silence: +2, tension: +1 },
        },
      ],
    },
  ],

  drift(p) {
    if (p.scales.completion >= 7 && p.scales.chord >= 7 && p.scales.silence < 4) {
      return {
        lines: [
          'I wait. She adds the final note. The chord lands without me. ~~Without anyone.~~',
          '!!The room composes itself. But I was not in it.!!',
        ],
        scales: { chord: -7, completion: -7, tension: +3 },
        composure: -2,
        composureCost: 'One of the notes is wrong. It is the one I added.',
        flags: { finished_alone: true },
      };
    }
    return {
      lines: ['I wait. She adds a note. Then another. The chord deepens.'],
      scales: { chord: +1, completion: +1, tension: +1 },
    };
  },

  endings: [
    {
      id: 'finished_together',
      when: (p) => p.flags.finished_chord,
      title: 'You finish the chord with her',
      lines: [
        'She has eased back from the keys. I am still pressing the chord. She leans against my shoulder.',
        'We do not say anything. ~~For a long time.~~ For a long time.',
      ],
      item: 'scrap_of_paper',
    },
    {
      id: 'closed_lid',
      when: (p) => p.flags.closed_lid && p.scales.silence >= 4,
      title: 'You close the lid',
      lines: [
        'The lid is closed. She rests her arms on the wood. The room is quiet for the first time.',
        '!!She lets it be quiet.!!',
      ],
      item: 'sliver_of_glass',
    },
    {
      id: 'finished_alone',
      when: (p) => p.flags.finished_alone,
      title: 'She finishes it without you',
      lines: [
        'The chord arrives. She does not look at me. She has finished what she came in to finish.',
        'I leave the room. ~~The chord follows me for some hours.~~ The chord is in the corridor now too.',
      ],
      item: 'photograph',
      scars: ['witnessed'],
    },
    {
      id: 'broken',
      when: (p) => p.scales.tension >= 9,
      title: 'The chord scatters into giggles',
      lines: [
        'She lets the keys go. She stares at them. The chord is in pieces around her.',
        '!!She has lost the place she was holding it from.!!',
      ],
      item: null,
      scars: ['witnessed', 'failed'],
    },
    {
      id: 'abandoned',
      when: (p) => p.flags.left,
      title: 'You walk out',
      lines: ['I close the door. The chord is humming behind me. ~~It always was.~~'],
      item: null,
      scars: ['abandoned'],
    },
  ],
};

// ════════════════════════════════════════════════════════════════════════
// registry
// ════════════════════════════════════════════════════════════════════════

export const PATIENTS = {
  pram, patriarch, soothlick, glimmer, frostfin, hollow, mire, composer, choir,
};

export function getPatient(id) { return PATIENTS[id] || null; }
