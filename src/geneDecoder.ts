// Define the structure of each trait
interface TraitDefinition {
  bits: number; // Number of bits this trait uses
  shift: number; // How many bits to shift right
  mask: number; // The bit mask to apply
  defaultValue?: number; // Optional default value
}

export interface CreatureTraits {
  shiny: number; // 1 bit at 34
  rgbMode: number; // 1 bit at 33
  color1: number; // 6 bits at 27
  color2: number; // 6 bits at 21
  headLength: number; // 2 bits at 19
  headWidth: number; // 2 bits at 17
  torsoLength: number; // 2 bits at 15
  torsoWidth: number; // 2 bits at 13
  limbLength: number; // 2 bits at 11
  limbWidth: number; // 2 bits at 9
  tailWidth: number; // 2 bits at 7
  tailLength: number; // 2 bits at 5
  eyeCount: number; // 2 bits at 3
  armCount: number; // 2 bits at 1
  spikeDensity: number; // 2 bits at 0
}

// Define all traits and their bit sizes
const TRAIT_SIZES: Record<keyof CreatureTraits, number> = {
  shiny: 1,
  rgbMode: 1,
  color1: 6,
  color2: 6,
  headLength: 2,
  headWidth: 2,
  torsoLength: 1,
  torsoWidth: 2,
  limbLength: 2,
  limbWidth: 2,
  tailWidth: 2,
  tailLength: 2,
  eyeCount: 2,
  armCount: 2,
  spikeDensity: 2,
};

// Generate trait definitions dynamically
function generateTraitDefinitions(): Record<
  keyof CreatureTraits,
  TraitDefinition
> {
  let shift = 0;
  const definitions: Partial<Record<keyof CreatureTraits, TraitDefinition>> =
    {};

  Object.entries(TRAIT_SIZES)
    .reverse() // Start with the highest bit traits
    .forEach(([trait, bits]) => {
      definitions[trait as keyof CreatureTraits] = {
        bits,
        shift,
        mask: (1 << bits) - 1, // Generates the bit mask dynamically
      };
      shift += bits; // Increment shift position based on bit width
    });

  return definitions as Record<keyof CreatureTraits, TraitDefinition>;
}

// Dynamically generated trait definitions
const TRAIT_DEFINITIONS = generateTraitDefinitions();

export function decodeGene(gene: number): CreatureTraits {
  const traits: Partial<CreatureTraits> = {};

  for (const [traitName, definition] of Object.entries(TRAIT_DEFINITIONS)) {
    traits[traitName as keyof CreatureTraits] =
      (gene >> definition.shift) & definition.mask;
  }

  return traits as CreatureTraits;
}

// Helper function to encode traits back into a gene
export function encodeGene(traits: CreatureTraits): number {
  let gene = 0;

  for (const [traitName, value] of Object.entries(traits)) {
    const definition = TRAIT_DEFINITIONS[traitName as keyof CreatureTraits];
    gene |= (value & definition.mask) << definition.shift;
  }

  // Ensure we return a 30-bit number
  return gene & 0x3fffffff;
}

// Example of how to add a new trait:
// 1. Add it to the CreatureTraits interface
// 2. Add its definition to TRAIT_DEFINITIONS
// 3. Update the rendering function if needed

// Example of adding a new trait:
/*
interface CreatureTraits {
  // ... existing traits ...
  newTrait: number;
}

const TRAIT_DEFINITIONS: Record<keyof CreatureTraits, TraitDefinition> = {
  // ... existing definitions ...
  newTrait: { bits: 2, shift: 20, mask: 0b11 }
};
*/

//add definition later
function warpPoint(
  x: number,
  y: number,
  centerX: number,
  centerY: number,
  widthFactor: number,
  heightFactor: number
): [number, number] {
  let newX = x;
  let newY = y;
  if (x) newX = centerX + (x - centerX) * (1 + widthFactor);
  if (y) newY = centerY + (y - centerY) * (1 + heightFactor);
  return [newX, newY];
}

/**
 * Interpolates between two values based on the fatMultiplier.
 * @param {number} multiplier - Fatness factor (0 to 1)
 * @param {number} thinValue - Value in thinnest state
 * @param {number} fatValue - Value in fattest state
 * @returns {number} Interpolated value
 */
function interpolate(
  multiplier: number,
  thinValue: number,
  fatValue: number
): number {
  return thinValue + (fatValue - thinValue) * multiplier;
}

function warpSVGPath(
  path: string,
  pivot: number[],
  widthFactor: number,
  heightFactor: number
): string {
  const commands = path.split(/(?=[MLHVCSQTAZmlhvcsqtaz])/);
  return commands
    .map((cmd) => {
      const type = cmd[0];
      const coords = cmd
        .slice(1)
        .trim()
        .split(/[\s,]+/)
        .map(Number);

      let [x1, y1, x2, y2, x, y] = coords;

      switch (type.toUpperCase()) {
        case "M":
        case "L":
          [x1, y1] = warpPoint(
            x1,
            y1,
            pivot[0],
            pivot[1],
            widthFactor,
            heightFactor
          );
          return `${type}${x1},${y1}`;
        case "C":
          [x1, y1] = warpPoint(
            x1,
            y1,
            pivot[0],
            pivot[1],
            widthFactor,
            heightFactor
          );
          [x2, y2] = warpPoint(
            x2,
            y2,
            pivot[0],
            pivot[1],
            widthFactor,
            heightFactor
          );
          [x, y] = warpPoint(
            x,
            y,
            pivot[0],
            pivot[1],
            widthFactor,
            heightFactor
          );
          return `${type}${x1},${y1} ${x2},${y2} ${x},${y}`;
        case "Z":
          return type;
        default:
          return cmd;
      }
    })
    .join(" ");
}

function drawSVGPath(warpedPath: string) {
  const commands = warpedPath.split(/(?=[MLHVCSQTAZmlhvcsqtaz])/);
  commands.forEach((cmd) => {
    const type = cmd[0];
    const coords = cmd
      .slice(1)
      .trim()
      .split(/[\s,]+/)
      .map(Number);

    let [x1, y1, x2, y2, x, y] = coords;

    switch (type.toUpperCase()) {
      case "M":
        ctx.moveTo(x1, y1);
        break;
      case "L":
        ctx.lineTo(x1, y1);
        break;
      case "C":
        ctx.bezierCurveTo(x1, y1, x2, y2, x, y);
        break;
      case "Z":
        ctx.closePath();
        break;
    }
  });
}

function drawPoints(points: [number, number][]) {
  ctx.fillStyle = "red"; // Color of the points
  points.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2); // Draw a small circle at each point
    ctx.fill();
  });
}

function getBounds(warpedMaskPath: string): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
} {
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  const warpedMaskArray = warpedMaskPath.split(/(?=[MLHVCSQTAZmlhvcsqtaz])/);
  warpedMaskArray.pop();
  warpedMaskArray.map((cmd) => {
    const coords = cmd
      .slice(1)
      .trim()
      .split(/[\s,]+/)
      .map(Number);
    let [x, y] = coords;

    // Update mask boundaries
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);

    return [x, y] as [number, number];
  });

  return { minX, maxX, minY, maxY };
}

function generateEyePositions(
  svgPathString: string, // Array of path commands
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
  eyeRadius: number,
  numEyes: number
): [number, number][] {
  let positions: [number, number][] = [];
  let headPath = new Path2D(svgPathString); // Convert to Path2D

  function isOverlapping(x: number, y: number) {
    return positions.some(
      ([px, py]) => Math.hypot(px - x, py - y) < eyeRadius * 2
    );
  }

  for (let i = 0; i < numEyes; i++) {
    let attempts = 0;
    let x, y;
    do {
      x = Math.random() * (maxX - minX - eyeRadius * 2) + minX + eyeRadius;
      y = Math.random() * (maxY - minY - eyeRadius * 2) + minY + eyeRadius;
      attempts++;
    } while (
      (isOverlapping(x, y) || !ctx.isPointInPath(headPath, x, y)) &&
      attempts < 20
    );

    if (attempts < 20) {
      positions.push([x, y]);
    }
  }

  return positions;
}

function drawEyes(eyePositions: [number, number][], eyeRadius: number) {
  eyePositions.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, eyeRadius, 0, Math.PI * 2);
    ctx.fill(); // Fill the eye
    ctx.stroke(); // Draw the border
  });
}

function bits2hsl(bits: number, bitDepth: number): string {
  let maxValue = (1 << bitDepth) - 1;
  let hue = (bits / maxValue) * 360;
  return `hsl(${hue}, 100%, 50%)`;
}

import {
  generateSeparators,
  extractPointsFromPath,
  generateMidpoints,
  thinCreature,
  drawSeparators,
  adjustCreatureLength,
  createFilledShape,
} from "./utils/torso";
import { drawHeadShape } from "./utils/head";
//helper functions end here
export let ctx: CanvasRenderingContext2D;

export function renderCreature(
  traits: CreatureTraits,
  size: number = 400
): string {
  // Create a temporary canvas
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const c = canvas.getContext("2d");
  if (!c) throw new Error("Could not get canvas context");
  ctx = c;
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the creature based on traits
  ctx.save();

  //COLOR GENERATION
  const primaryColorBits = traits.color1;
  const secondaryColorBits = traits.color2;
  const colorDepth = TRAIT_DEFINITIONS["color1"].bits;
  //based on the assumption that both color1 and 2 take the same number of bits
  const primaryColor = bits2hsl(primaryColorBits, colorDepth);
  const secondaryColor = bits2hsl(secondaryColorBits, colorDepth);

  //draw all torso related parts first using the primary color
  ctx.fillStyle = primaryColor;
  //path of the central anchor for drawing everything else
  const torsoPath =
    "M146.5 138L193 188.5L250 203L284 234L296 276L237 297L150 254L115 168Z";
  const maxTorsoLength = 1 << TRAIT_DEFINITIONS["torsoLength"].bits;
  const maxTorsoWidth = 1 << TRAIT_DEFINITIONS["torsoWidth"].bits;
  const torsoWidthFactor = traits.torsoWidth / maxTorsoWidth;
  const torsoLengthFactor = traits.torsoLength / maxTorsoLength;

  const maxHeadWidth = 1 << TRAIT_DEFINITIONS["headWidth"].bits;
  const maxHeadLength = 1 << TRAIT_DEFINITIONS["headLength"].bits;
  const headWidthFactor = traits.headWidth / maxHeadWidth;
  const headLengthFactor = traits.headLength / maxHeadLength;

  const eyeCount = traits.eyeCount;

  //gets the defining points of the torso
  let torsoPoints = extractPointsFromPath(torsoPath);
  //body segment separators
  const separators = generateSeparators(torsoPoints);
  //generate initial midpoints
  const midpoints = generateMidpoints(separators);
  // Adjust separator length (creates new separators) based on length modifier
  const lengthSeparators = adjustCreatureLength(
    separators,
    midpoints,
    torsoLengthFactor
  );
  // Generate NEW midpoints based on the length-adjusted separators
  const newMidpoints = generateMidpoints(lengthSeparators);
  // After creating the body separators
  const widthLengthSeparators = thinCreature(
    lengthSeparators,
    newMidpoints,
    torsoWidthFactor,
    headWidthFactor
  );

  // Drawing steps for debuggin
  drawPoints(newMidpoints);
  drawPoints(torsoPoints);
  drawSeparators(widthLengthSeparators);
  createFilledShape(widthLengthSeparators);

  // Draw the head separator
  drawHeadShape(widthLengthSeparators[0]);

  //HEAD GENERATION

  ctx.fill();
  return canvas.toDataURL();
}
