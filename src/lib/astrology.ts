import * as Astronomy from 'astronomy-engine';
import { GATE_SEQUENCE, GATE_TO_CENTER, CHANNELS } from './hd-wheel';

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

export interface PlanetPosition {
  longitude: number;
  sign: string;
  degree: number; // degree within the sign
  gate: number;
  line: number;
}

export interface BirthChart {
  sun: PlanetPosition;
  moon: PlanetPosition;
  mercury: PlanetPosition;
  venus: PlanetPosition;
  mars: PlanetPosition;
  jupiter: PlanetPosition;
  saturn: PlanetPosition;
  uranus: PlanetPosition;
  neptune: PlanetPosition;
  pluto: PlanetPosition;
  northNode: PlanetPosition;
  ascendant: PlanetPosition;
  midheaven: PlanetPosition;
}

export interface HumanDesign {
  type: 'Manifestor' | 'Generator' | 'Manifesting Generator' | 'Projector' | 'Reflector';
  strategy: string;
  authority: string;
  profile: string;
  definedCenters: string[];
  undefinedCenters: string[];
  personalityGates: Array<{ planet: string; gate: number; line: number }>;
  designGates: Array<{ planet: string; gate: number; line: number }>;
}

export interface FullChart {
  personality: BirthChart;
  design: BirthChart;
  humanDesign: HumanDesign;
}

function normalize(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

function longitudeToGate(longitude: number): { gate: number; line: number } {
  const lng = normalize(longitude);
  // The HD mandala starts with Gate 25 at 28°15' Pisces, i.e., longitude 358.25°.
  // So we shift the input by +1.75° to align Gate 25's start with index 0.
  const shifted = normalize(lng + 1.75);
  const gateIndex = Math.floor(shifted / 5.625);
  const gate = GATE_SEQUENCE[gateIndex % 64];
  const degreeInGate = shifted - gateIndex * 5.625;
  const line = Math.floor(degreeInGate / 0.9375) + 1;
  return { gate, line: Math.min(6, Math.max(1, line)) };
}

function longitudeToSign(longitude: number): { sign: string; degree: number } {
  const lng = normalize(longitude);
  const signIndex = Math.floor(lng / 30);
  return { sign: SIGNS[signIndex], degree: lng - signIndex * 30 };
}

function positionFromLongitude(longitude: number): PlanetPosition {
  const { sign, degree } = longitudeToSign(longitude);
  const { gate, line } = longitudeToGate(longitude);
  return { longitude: normalize(longitude), sign, degree, gate, line };
}

// Get geocentric ecliptic longitude (in degrees) for a body at given time.
// astronomy-engine's Ecliptic() returns true-ecliptic-of-date coordinates,
// which is what tropical astrology uses.
function eclipticLongitude(body: Astronomy.Body, time: Astronomy.AstroTime): number {
  const geoVec = Astronomy.GeoVector(body, time, true);
  const ecl = Astronomy.Ecliptic(geoVec);
  return normalize(ecl.elon);
}

// Sun's ecliptic longitude.
function sunLongitude(time: Astronomy.AstroTime): number {
  return eclipticLongitude(Astronomy.Body.Sun, time);
}

// Moon's ecliptic longitude (use specialized function for accuracy/speed)
function moonLongitude(time: Astronomy.AstroTime): number {
  const sph = Astronomy.EclipticGeoMoon(time);
  return normalize(sph.lon);
}

// Compute the North Node longitude (True Node / apparent node)
// Mean Node + periodic perturbations from Chapront-Meeus.
// Accurate to ~0.01° which is well under HD line precision.
function meanNorthNodeLongitude(time: Astronomy.AstroTime): number {
  const T = time.tt / 36525.0; // Julian centuries from J2000 TT

  // Mean longitude of the ascending node
  const omega =
    125.04455501 -
    1934.13626197 * T +
    0.00207625 * T * T +
    (T * T * T) / 467410.0 -
    (T * T * T * T) / 60616000.0;

  // Mean elongation of the Moon from the Sun
  const D =
    297.85019547 +
    445267.11151675 * T -
    0.0018819 * T * T +
    (T * T * T) / 545868.0 -
    (T * T * T * T) / 113065000.0;

  // Mean anomaly of the Sun
  const M =
    357.52910918 +
    35999.05029094 * T -
    0.0001537 * T * T +
    (T * T * T) / 24490000.0;

  // Mean anomaly of the Moon
  const Mprime =
    134.96340251 +
    477198.8675605 * T +
    0.0088553 * T * T +
    (T * T * T) / 69699.0 -
    (T * T * T * T) / 14712000.0;

  // Moon's argument of latitude
  const F =
    93.27209062 +
    483202.0175233 * T -
    0.0036539 * T * T -
    (T * T * T) / 3526000.0 +
    (T * T * T * T) / 863310000.0;

  const r = Math.PI / 180;

  // Periodic perturbations to get True Node from Mean Node
  // (leading terms from Chapront ELP-2000/82)
  const correction =
    -1.4979 * Math.sin(r * (2 * D - 2 * F)) -
    0.1500 * Math.sin(r * M) -
    0.1226 * Math.sin(r * (2 * D)) +
    0.1176 * Math.sin(r * (2 * F)) -
    0.0801 * Math.sin(r * (2 * Mprime - 2 * F));

  return normalize(omega + correction);
}

// Local sidereal time in degrees for a given UT and longitude east.
// Formula from Meeus, Astronomical Algorithms, chapter 12.
function localSiderealTime(time: Astronomy.AstroTime, longitudeDeg: number): number {
  const jdUT = time.ut + 2451545.0; // Julian day in UT
  const T = (jdUT - 2451545.0) / 36525.0;
  // Greenwich Mean Sidereal Time at 0h UT in degrees
  let gmst =
    280.46061837 +
    360.98564736629 * (jdUT - 2451545.0) +
    0.000387933 * T * T -
    (T * T * T) / 38710000.0;
  gmst = normalize(gmst);
  const lst = normalize(gmst + longitudeDeg);
  return lst;
}

// Obliquity of the ecliptic in degrees
function obliquity(time: Astronomy.AstroTime): number {
  const T = time.tt / 36525.0;
  const eps =
    23.43929111 -
    (46.8150 * T + 0.00059 * T * T - 0.001813 * T * T * T) / 3600.0;
  return eps;
}

function deg2rad(d: number): number {
  return (d * Math.PI) / 180;
}
function rad2deg(r: number): number {
  return (r * 180) / Math.PI;
}

// Ascendant: ecliptic longitude of the point rising on the eastern horizon.
// Formula: tan(Asc) = -cos(LST) / (sin(LST) * cos(obliq) + tan(lat) * sin(obliq))
// Then quadrant-correct.
function computeAscendant(time: Astronomy.AstroTime, latitudeDeg: number, longitudeDeg: number): number {
  const lst = localSiderealTime(time, longitudeDeg);
  const eps = obliquity(time);
  const ramc = deg2rad(lst);
  const epsR = deg2rad(eps);
  const latR = deg2rad(latitudeDeg);

  // Meeus formula for the Ascendant
  const y = -Math.cos(ramc);
  const x = Math.sin(ramc) * Math.cos(epsR) + Math.tan(latR) * Math.sin(epsR);
  let asc = rad2deg(Math.atan2(y, x));
  asc = normalize(asc);

  // Quadrant correction: the Ascendant is always within 180° ahead of the MC
  // (moving counterclockwise around the ecliptic). If our result puts ASC behind MC,
  // add 180° to flip it to the correct side.
  const mc = computeMCFromLST(lst, time);
  let diff = asc - mc;
  if (diff < 0) diff += 360;
  if (diff > 180) {
    asc = normalize(asc + 180);
  }
  return asc;
}

// Midheaven (MC): ecliptic longitude where the local meridian crosses the ecliptic
// tan(MC) = tan(LST) / cos(obliq)
function computeMidheaven(time: Astronomy.AstroTime): number {
  // We need LST but computed from the current time & longitude
  // This function gets the LST passed indirectly; we'll take it as parameter instead.
  // Simpler: recompute here. The caller will pass LST via a wrapper.
  return 0; // placeholder, not used directly
}

function computeMCFromLST(lst: number, time: Astronomy.AstroTime): number {
  const eps = obliquity(time);
  const ramc = deg2rad(lst);
  const epsR = deg2rad(eps);
  const y = Math.sin(ramc);
  const x = Math.cos(ramc) * Math.cos(epsR);
  // Using atan2 with these arguments gives longitude measured from 0 Aries
  let mc = rad2deg(Math.atan2(y, x));
  mc = normalize(mc);
  return mc;
}

export async function calculateChart(
  birthDateUTC: Date,
  latitude: number,
  longitude: number
): Promise<FullChart> {
  const personalityTime = Astronomy.MakeTime(birthDateUTC);

  // Design time: 88° of solar arc before birth (~88.3 days earlier)
  const personalitySunLng = sunLongitude(personalityTime);
  const targetDesignSunLng = normalize(personalitySunLng - 88);

  // Iteratively find the design time by Newton's method
  let designTime = personalityTime.AddDays(-88.3);
  for (let i = 0; i < 12; i++) {
    const currentLng = sunLongitude(designTime);
    let diff = currentLng - targetDesignSunLng;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    if (Math.abs(diff) < 0.0001) break;
    // Sun moves about 0.9856 degrees per day
    const SUN_SPEED = 0.9856;
    designTime = designTime.AddDays(-diff / SUN_SPEED);
  }

  const computeChart = (time: Astronomy.AstroTime, withHouses: boolean): BirthChart => {
    const sun = positionFromLongitude(sunLongitude(time));
    const moon = positionFromLongitude(moonLongitude(time));
    const mercury = positionFromLongitude(eclipticLongitude(Astronomy.Body.Mercury, time));
    const venus = positionFromLongitude(eclipticLongitude(Astronomy.Body.Venus, time));
    const mars = positionFromLongitude(eclipticLongitude(Astronomy.Body.Mars, time));
    const jupiter = positionFromLongitude(eclipticLongitude(Astronomy.Body.Jupiter, time));
    const saturn = positionFromLongitude(eclipticLongitude(Astronomy.Body.Saturn, time));
    const uranus = positionFromLongitude(eclipticLongitude(Astronomy.Body.Uranus, time));
    const neptune = positionFromLongitude(eclipticLongitude(Astronomy.Body.Neptune, time));
    const pluto = positionFromLongitude(eclipticLongitude(Astronomy.Body.Pluto, time));
    const northNode = positionFromLongitude(meanNorthNodeLongitude(time));

    let ascendant: PlanetPosition;
    let midheaven: PlanetPosition;
    if (withHouses) {
      const asc = computeAscendant(time, latitude, longitude);
      const lst = localSiderealTime(time, longitude);
      const mc = computeMCFromLST(lst, time);
      ascendant = positionFromLongitude(asc);
      midheaven = positionFromLongitude(mc);
    } else {
      ascendant = positionFromLongitude(0);
      midheaven = positionFromLongitude(0);
    }

    return {
      sun,
      moon,
      mercury,
      venus,
      mars,
      jupiter,
      saturn,
      uranus,
      neptune,
      pluto,
      northNode,
      ascendant,
      midheaven,
    };
  };

  const personality = computeChart(personalityTime, true);
  const design = computeChart(designTime, false);

  // Earth is always 180° opposite Sun
  const personalityEarth = positionFromLongitude(personality.sun.longitude + 180);
  const designEarth = positionFromLongitude(design.sun.longitude + 180);
  const personalitySouthNode = positionFromLongitude(personality.northNode.longitude + 180);
  const designSouthNode = positionFromLongitude(design.northNode.longitude + 180);

  // 13 personality gates, 13 design gates
  const personalityGates = [
    { planet: 'Sun', gate: personality.sun.gate, line: personality.sun.line },
    { planet: 'Earth', gate: personalityEarth.gate, line: personalityEarth.line },
    { planet: 'North Node', gate: personality.northNode.gate, line: personality.northNode.line },
    { planet: 'South Node', gate: personalitySouthNode.gate, line: personalitySouthNode.line },
    { planet: 'Moon', gate: personality.moon.gate, line: personality.moon.line },
    { planet: 'Mercury', gate: personality.mercury.gate, line: personality.mercury.line },
    { planet: 'Venus', gate: personality.venus.gate, line: personality.venus.line },
    { planet: 'Mars', gate: personality.mars.gate, line: personality.mars.line },
    { planet: 'Jupiter', gate: personality.jupiter.gate, line: personality.jupiter.line },
    { planet: 'Saturn', gate: personality.saturn.gate, line: personality.saturn.line },
    { planet: 'Uranus', gate: personality.uranus.gate, line: personality.uranus.line },
    { planet: 'Neptune', gate: personality.neptune.gate, line: personality.neptune.line },
    { planet: 'Pluto', gate: personality.pluto.gate, line: personality.pluto.line },
  ];

  const designGates = [
    { planet: 'Sun', gate: design.sun.gate, line: design.sun.line },
    { planet: 'Earth', gate: designEarth.gate, line: designEarth.line },
    { planet: 'North Node', gate: design.northNode.gate, line: design.northNode.line },
    { planet: 'South Node', gate: designSouthNode.gate, line: designSouthNode.line },
    { planet: 'Moon', gate: design.moon.gate, line: design.moon.line },
    { planet: 'Mercury', gate: design.mercury.gate, line: design.mercury.line },
    { planet: 'Venus', gate: design.venus.gate, line: design.venus.line },
    { planet: 'Mars', gate: design.mars.gate, line: design.mars.line },
    { planet: 'Jupiter', gate: design.jupiter.gate, line: design.jupiter.line },
    { planet: 'Saturn', gate: design.saturn.gate, line: design.saturn.line },
    { planet: 'Uranus', gate: design.uranus.gate, line: design.uranus.line },
    { planet: 'Neptune', gate: design.neptune.gate, line: design.neptune.line },
    { planet: 'Pluto', gate: design.pluto.gate, line: design.pluto.line },
  ];

  const activeGates = new Set<number>([
    ...personalityGates.map((g) => g.gate),
    ...designGates.map((g) => g.gate),
  ]);

  const definedCentersSet = new Set<string>();
  for (const [gate1, gate2] of CHANNELS) {
    if (activeGates.has(gate1) && activeGates.has(gate2)) {
      const center1 = GATE_TO_CENTER[gate1];
      const center2 = GATE_TO_CENTER[gate2];
      if (center1) definedCentersSet.add(center1);
      if (center2) definedCentersSet.add(center2);
    }
  }

  const allCenters = [
    'Head', 'Ajna', 'Throat', 'G', 'Heart',
    'Solar Plexus', 'Sacral', 'Spleen', 'Root',
  ];
  const definedCenters = allCenters.filter((c) => definedCentersSet.has(c));
  const undefinedCenters = allCenters.filter((c) => !definedCentersSet.has(c));

  // Determine Type
  const sacralDefined = definedCentersSet.has('Sacral');
  const throatDefined = definedCentersSet.has('Throat');
  const motorCenters = ['Sacral', 'Heart', 'Solar Plexus', 'Root'];
  const definedMotors = motorCenters.filter((c) => definedCentersSet.has(c));

  // Check motor-to-throat via any active channel
  const throatGates = Object.entries(GATE_TO_CENTER)
    .filter(([, c]) => c === 'Throat')
    .map(([g]) => parseInt(g));

  const motorConnectedGates: number[] = [];
  for (const center of definedMotors) {
    for (const [gate, c] of Object.entries(GATE_TO_CENTER)) {
      if (c === center) motorConnectedGates.push(parseInt(gate));
    }
  }

  let motorToThroat = false;
  if (throatDefined) {
    for (const [g1, g2] of CHANNELS) {
      if (activeGates.has(g1) && activeGates.has(g2)) {
        if (
          (throatGates.includes(g1) && motorConnectedGates.includes(g2)) ||
          (throatGates.includes(g2) && motorConnectedGates.includes(g1))
        ) {
          motorToThroat = true;
          break;
        }
      }
    }
  }

  let type: HumanDesign['type'];
  let strategy: string;
  if (definedCenters.length === 0) {
    type = 'Reflector';
    strategy = 'Wait a lunar cycle';
  } else if (sacralDefined && motorToThroat) {
    type = 'Manifesting Generator';
    strategy = 'Respond, then inform';
  } else if (sacralDefined) {
    type = 'Generator';
    strategy = 'Wait to respond';
  } else if (motorToThroat) {
    type = 'Manifestor';
    strategy = 'Inform before acting';
  } else {
    type = 'Projector';
    strategy = 'Wait for the invitation';
  }

  let authority: string;
  if (definedCentersSet.has('Solar Plexus')) {
    authority = 'Emotional';
  } else if (definedCentersSet.has('Sacral')) {
    authority = 'Sacral';
  } else if (definedCentersSet.has('Spleen')) {
    authority = 'Splenic';
  } else if (definedCentersSet.has('Heart')) {
    authority = 'Ego';
  } else if (definedCentersSet.has('G')) {
    authority = 'Self-Projected';
  } else if (type === 'Reflector') {
    authority = 'Lunar';
  } else {
    authority = 'Mental / Outer';
  }

  const profile = `${personality.sun.line}/${design.sun.line}`;

  const humanDesign: HumanDesign = {
    type,
    strategy,
    authority,
    profile,
    definedCenters,
    undefinedCenters,
    personalityGates,
    designGates,
  };

  return { personality, design, humanDesign };
}
