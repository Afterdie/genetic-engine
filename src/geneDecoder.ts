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
  return [
    centerX + (x - centerX) * (1 + widthFactor), // Scale X based on width factor
    centerY + (y - centerY) * (1 + heightFactor), // Scale Y based on height factor
  ];
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

// Helper function to scale and translate SVG path
function scaleAndTranslatePath(
  path: string,
  scale: number,
  x: number,
  y: number
): string[] {
  // Split the path into commands
  const commands = path.split(/(?=[MLHVCSQTAZmlhvcsqtaz])/);

  // Process each command
  console.log(
    commands.map((cmd) => {
      const type = cmd[0];
      const coords = cmd
        .slice(1)
        .trim()
        .split(/[\s,]+/)
        .map(Number);

      // Scale and translate coordinates
      const scaledCoords = coords.map((coord, i) => {
        // Scale X coordinates (even indices)
        if (i % 2 === 0) {
          return coord * scale + x;
        }
        // Scale Y coordinates (odd indices)
        return coord * scale + y;
      });

      return `${type}${scaledCoords.join(" ")}`;
    })
  );
  return commands.map((cmd) => {
    const type = cmd[0];
    const coords = cmd
      .slice(1)
      .trim()
      .split(/[\s,]+/)
      .map(Number);

    // Scale and translate coordinates
    const scaledCoords = coords.map((coord, i) => {
      // Scale X coordinates (even indices)
      if (i % 2 === 0) {
        return coord * scale + x;
      }
      // Scale Y coordinates (odd indices)
      return coord * scale + y;
    });

    return `${type}${scaledCoords.join(" ")}`;
  });
}

/**
 * Interpolates between two values based on the fatMultiplier.
 * @param {CanvasRenderingContext2D} canvas used for rendering the shape
 * @param {string} commands - svg path of the body shape
 * @param {number} centerX - x coordinate of head anchor point
 * @param {number} centerY - y coordinate of head achor point
 * @param {number} heightMultiplier - gene trait used for augmenting height
 * @param {number} widthMultiplier - gene trait used for augmenting width
 * @does draws the path for the body augments relevant points using the fatmultiplier
 */
function drawHeadSVGPath(
  ctx: CanvasRenderingContext2D,
  commands: string[],
  centerX: number,
  centerY: number,
  widthMultiplier: number,
  heightMultiplier: number
) {
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
        [x1, y1] = warpPoint(
          x1,
          y1,
          centerX,
          centerY,
          widthMultiplier,
          heightMultiplier
        );
        ctx.moveTo(x1, y1);
        break;
      case "L":
        [x1, y1] = warpPoint(
          x1,
          y1,
          centerX,
          centerY,
          widthMultiplier,
          heightMultiplier
        );
        ctx.lineTo(x1, y1);
        break;
      case "C":
        [x1, y1] = warpPoint(
          x1,
          y1,
          centerX,
          centerY,
          widthMultiplier,
          heightMultiplier
        );
        [x2, y2] = warpPoint(
          x2,
          y2,
          centerX,
          centerY,
          widthMultiplier,
          heightMultiplier
        );
        [x, y] = warpPoint(
          x,
          y,
          centerX,
          centerY,
          widthMultiplier,
          heightMultiplier
        );
        ctx.bezierCurveTo(x1, y1, x2, y2, x, y);
        break;
      case "Z":
        ctx.closePath();
        break;
    }
  });
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

/**
 * Interpolates between two values based on the fatMultiplier.
 * @param {CanvasRenderingContext2D} canvas used for rendering the shape
 * @param {string[]} commands - svg path of the body shape
 * @param {number} fatMultiplier - gene trait used for augmenting data
 * @does draws the path for the body augments relevant points using the fatmultiplier
 */
function drawBodySVGPath(
  ctx: CanvasRenderingContext2D,
  commands: string[],
  fatMultiplier: number
) {
  commands.forEach((cmd, index) => {
    const type = cmd[0];
    const coords = cmd
      .slice(1)
      .trim()
      .split(/[\s,]+/)
      .map(Number);

    switch (type.toUpperCase()) {
      case "M":
        ctx.moveTo(coords[0], coords[1]);
        break;
      case "L":
        ctx.lineTo(coords[0], coords[1]);
        break;
      case "C":
        // Extract control and end points
        let [x1, y1, x2, y2, x, y] = coords;

        // Apply transformations based on fatMultiplier
        if (index === 4) {
          x2 = interpolate(fatMultiplier, 205.36, 197.359);
          y2 = interpolate(fatMultiplier, 188.808, 235.808);
          x = interpolate(fatMultiplier, 246, 238);
          y = interpolate(fatMultiplier, 201, 248);
        }
        if (index === 5) {
          x1 = interpolate(fatMultiplier, 337, 329);
          y1 = interpolate(fatMultiplier, 228.3, 275.3);
        }

        ctx.bezierCurveTo(x1, y1, x2, y2, x, y);
        break;
      case "Z":
        ctx.closePath();
        break;
    }
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
  ctx.fillStyle = "white";
  ctx.strokeStyle = "black"; // Set border color
  ctx.lineWidth = 2; // Adjust border thickness

  eyePositions.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, eyeRadius, 0, Math.PI * 2);
    ctx.fill(); // Fill the eye
    ctx.stroke(); // Draw the border
  });
}

//helper functions end here
let ctx: CanvasRenderingContext2D;

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
  

  //HEAD GENERATION
  const headPivot = [161.5, 212.5];
  const baseHeadPath =
    "M117.964 185.527C154.993 164.265 167.166 180.066 168.624 190.624C175.306 209.435 178.785 231.724 160.416 222.695C147.66 216.425 149.758 221.967 137.819 222.695C125.886 223.423 107.933 227.496 100.279 222.695C84.6069 212.865 80.9341 206.79 117.964 185.527Z";

  //const scaledHeadPath = scaleAndTranslatePath(baseHeadPath, 1, 0, 0);

  const maxLength = Math.floor(
    Math.pow(2, TRAIT_DEFINITIONS["headLength"].bits)
  );
  const maxWidth = Math.floor(Math.pow(2, TRAIT_DEFINITIONS["headWidth"].bits));
  const widthFactor = traits.headWidth / maxWidth;
  const lengthFactor = traits.headLength / maxLength;

  const warpedHeadPath = warpSVGPath(
    baseHeadPath,
    headPivot,
    widthFactor,
    lengthFactor
  );

  ctx.beginPath();
  drawSVGPath(warpedHeadPath);

  // const { minX, maxX, minY, maxY } = getScaledMask(
  //   scaledEyePath,
  //   headPivot[0],
  //   headPivot[1],
  //   widthFactor,
  //   lengthFactor
  // );
  const eyePath =
    "M107 193C117 183 140.166 176.833 150.5 175C165.7 175.8 171.167 195.333 172 205L155 199.5C134.833 201.5 96.9998 203 107 193Z";
  // const scaledEyePath = scaleAndTranslatePath(eyePath, 1, 0, 0);
  const warpedEyePath = warpSVGPath(
    eyePath,
    headPivot,
    widthFactor,
    lengthFactor
  );
  // // Generate eye positions
  //needs eyeballs
  const eyeRadius = 8; // Adjust as needed
  const eyeCount = traits.eyeCount + 1;
  const { minX, maxX, minY, maxY } = getBounds(warpedEyePath);
  const eyePositions = generateEyePositions(
    warpedHeadPath,
    minX,
    maxX,
    minY,
    maxY,
    eyeRadius,
    eyeCount
  );
  ctx.fill();

  drawEyes(eyePositions, eyeRadius);

  //BODY GENERATION
  //use two size as torso width
  const shortTorso =
    "M345 283C374 300 279 303 204 289C161.562 281.078 153.779 248.907 142 213L166.755 193C179.034 215.958 197.359 235.808 238 248C329 275.3 313.671 264.635 345 283Z";
  const longTorso =
    "M204 289C129 275 133 204 106 123L118 102C167.886 155.004 147 220.7 238 248C329 275.3 313.671 264.635 345 283C374 300 279 303 204 289Z";

  const bodyPath = traits.torsoLength ? longTorso : shortTorso;

  ctx.beginPath();
  const scaledBodyPath = scaleAndTranslatePath(bodyPath, 1, 0, 0);
  const maxFat = Math.floor(Math.pow(2, TRAIT_DEFINITIONS["torsoLength"].bits));
  const fatMultiplier = 1 - traits.torsoWidth / maxFat;
  drawBodySVGPath(ctx, scaledBodyPath, fatMultiplier);
  ctx.fill();
  ctx.restore();

  return canvas.toDataURL();
}
