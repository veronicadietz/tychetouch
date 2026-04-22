// The Human Design wheel: 64 gates mapped around the 360 zodiac wheel.
// Each gate covers 5.625 degrees (360 / 64).
// Standard HD wheel starts at Gate 17 at a specific point. The precise mapping
// begins with Gate 17's first line at 15 degrees Aries traditionally, but the
// most widely accepted sequence starts Gate 41 at ~2deg Aquarius as the
// "start of the year" gate. We use the standard counterclockwise order
// starting from 0 Aries.
//
// Gate order around the wheel (starting from 0 Aries going through the signs):
export const GATE_SEQUENCE = [
  25, 17, 21, 51, 42, 3, 27, 24, 2, 23, 8, 20, 16, 35, 45, 12, // Aries through Gemini
  15, 52, 39, 53, 62, 56, 31, 33, 7, 4, 29, 59, 40, 64, 47, 6, // Cancer through Virgo
  46, 18, 48, 57, 32, 50, 28, 44, 1, 43, 14, 34, 9, 5, 26, 11, // Libra through Sagittarius
  10, 58, 38, 54, 61, 60, 41, 19, 13, 49, 30, 55, 37, 63, 22, 36, // Capricorn through Pisces
];

// Gate-to-center mapping: which energy center each gate belongs to
export const GATE_TO_CENTER: Record<number, string> = {
  // Head
  64: 'Head', 61: 'Head', 63: 'Head',
  // Ajna
  47: 'Ajna', 24: 'Ajna', 4: 'Ajna', 17: 'Ajna', 43: 'Ajna', 11: 'Ajna',
  // Throat
  62: 'Throat', 23: 'Throat', 56: 'Throat', 16: 'Throat', 20: 'Throat',
  31: 'Throat', 8: 'Throat', 33: 'Throat', 35: 'Throat', 12: 'Throat',
  45: 'Throat',
  // G Center (Identity)
  1: 'G', 13: 'G', 25: 'G', 46: 'G', 2: 'G', 15: 'G', 10: 'G', 7: 'G',
  // Heart / Ego / Will
  21: 'Heart', 40: 'Heart', 26: 'Heart', 51: 'Heart',
  // Solar Plexus
  6: 'Solar Plexus', 37: 'Solar Plexus', 22: 'Solar Plexus', 36: 'Solar Plexus',
  30: 'Solar Plexus', 55: 'Solar Plexus', 49: 'Solar Plexus',
  // Sacral
  5: 'Sacral', 14: 'Sacral', 29: 'Sacral', 59: 'Sacral', 9: 'Sacral',
  3: 'Sacral', 42: 'Sacral', 27: 'Sacral', 34: 'Sacral',
  // Spleen
  48: 'Spleen', 57: 'Spleen', 44: 'Spleen', 50: 'Spleen', 32: 'Spleen',
  28: 'Spleen', 18: 'Spleen',
  // Root
  53: 'Root', 60: 'Root', 52: 'Root', 19: 'Root', 39: 'Root', 41: 'Root',
  58: 'Root', 38: 'Root', 54: 'Root',
};

// Channels: connections between gates that activate centers
export const CHANNELS: Array<[number, number, string]> = [
  [64, 47, 'Abstraction'],
  [61, 24, 'Awareness'],
  [63, 4, 'Logic'],
  [17, 62, 'Acceptance'],
  [43, 23, 'Structuring'],
  [11, 56, 'Curiosity'],
  [16, 48, 'The Wavelength'],
  [20, 57, 'The Brainwave'],
  [20, 10, 'Awakening'],
  [20, 34, 'Charisma'],
  [31, 7, 'The Alpha'],
  [8, 1, 'Inspiration'],
  [33, 13, 'The Prodigal'],
  [35, 36, 'Transitoriness'],
  [12, 22, 'Openness'],
  [45, 21, 'Money'],
  [2, 14, 'The Beat'],
  [1, 8, 'Inspiration'],
  [13, 33, 'The Prodigal'],
  [25, 51, 'Initiation'],
  [46, 29, 'Discovery'],
  [10, 57, 'Perfected Form'],
  [10, 34, 'Exploration'],
  [15, 5, 'Rhythm'],
  [7, 31, 'The Alpha'],
  [21, 45, 'Money'],
  [40, 37, 'Community'],
  [26, 44, 'Surrender'],
  [51, 25, 'Initiation'],
  [6, 59, 'Mating'],
  [37, 40, 'Community'],
  [22, 12, 'Openness'],
  [36, 35, 'Transitoriness'],
  [30, 41, 'Recognition'],
  [55, 39, 'Emoting'],
  [49, 19, 'Synthesis'],
  [5, 15, 'Rhythm'],
  [14, 2, 'The Beat'],
  [29, 46, 'Discovery'],
  [59, 6, 'Mating'],
  [9, 52, 'Concentration'],
  [3, 60, 'Mutation'],
  [42, 53, 'Maturation'],
  [27, 50, 'Preservation'],
  [34, 57, 'Power'],
  [34, 20, 'Charisma'],
  [34, 10, 'Exploration'],
  [48, 16, 'The Wavelength'],
  [57, 10, 'Perfected Form'],
  [57, 20, 'The Brainwave'],
  [57, 34, 'Power'],
  [44, 26, 'Surrender'],
  [50, 27, 'Preservation'],
  [32, 54, 'Transformation'],
  [28, 38, 'Struggle'],
  [18, 58, 'Judgment'],
  [53, 42, 'Maturation'],
  [60, 3, 'Mutation'],
  [52, 9, 'Concentration'],
  [19, 49, 'Synthesis'],
  [39, 55, 'Emoting'],
  [41, 30, 'Recognition'],
  [58, 18, 'Judgment'],
  [38, 28, 'Struggle'],
  [54, 32, 'Transformation'],
];
