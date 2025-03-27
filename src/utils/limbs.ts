import { Point } from "./torso";
import { ctx } from "../geneDecoder";

/**
 * Quadratic Bézier interpolation
 * @param p0 - Start point
 * @param p1 - Control point (spine midpoint)
 * @param p2 - End point
 * @param t  - Parameter between 0 and 1
 * @returns The interpolated point at t
 */
function bezierQuad(p0: Point, p1: Point, p2: Point, t: number): Point {
  const x = (1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0];
  const y = (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1];
  return [x, y];
}

/**
 * Generates a smooth spine using a Bézier curve and returns evenly spaced points along it.
 * @param spinePoints - Three key spine points: [start, control, end]
 * @param gapModifier - Spacing between limb attachment points
 * @param samples - Number of points to sample along the curve
 * @returns An array of Points representing evenly spaced limb attachment positions
 */
function generateLimbAttachmentPoints(
  spinePoints: [Point, Point, Point],
  gapModifier: number,
  samples: number = 20
): Point[] {
  const [p0, p1, p2] = spinePoints;
  const spine: Point[] = [];

  // Generate the smooth spine
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    spine.push(bezierQuad(p0, p1, p2, t));
  }

  // Distribute limb attachment points along the spine
  const attachmentPoints: Point[] = [];
  let accumulatedDistance = 0;

  for (let i = 1; i < spine.length; i++) {
    const prev = spine[i - 1];
    const curr = spine[i];

    const segmentLength = Math.hypot(curr[0] - prev[0], curr[1] - prev[1]);
    accumulatedDistance += segmentLength;

    if (accumulatedDistance >= gapModifier) {
      attachmentPoints.push(curr);
      accumulatedDistance = 0;
    }
  }

  return attachmentPoints;
}
type Limb = { base: Point; tip: Point; thickness: number };

function generateLimbs(
  spinePoints: Point[],
  limbCount: number,
  limbWidth: number,
  limbLength: number
): Limb[] {
  const limbs: Limb[] = [];

  for (let i = 0; i < limbCount; i++) {
    // Use linear interpolation to space limbs evenly
    const t = i / (limbCount - 1); // Normalized position from 0 to 1
    const index = Math.round(t * (spinePoints.length - 1)); // Map to spine indices

    const base = spinePoints[index];

    // Determine offset factor (negative for left, positive for right)
    const centerIndex = Math.floor(spinePoints.length / 2);
    const offsetFactor = (centerIndex - index) / centerIndex; // -1 (right) to 1 (left)

    // Base remains exactly on the spine point
    const adjustedBase: Point = [base[0], base[1]];

    // Tip angles outward
    const tipOffset = -offsetFactor * limbLength * 0.5; // Flip the direction
    const tip: Point = [
      adjustedBase[0] + tipOffset,
      adjustedBase[1] + limbLength,
    ];

    limbs.push({ base: adjustedBase, tip, thickness: limbWidth });
  }

  return limbs;
}

function drawLimbs(limbs: Limb[], accentColor: string | CanvasGradient): void {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (limbs.length === 0) return;

  // Compute the spine center as the average X of all limb bases
  const spineCenterX =
    limbs.reduce((sum, limb) => sum + limb.base[0], 0) / limbs.length;

  for (let i = 0; i < limbs.length; i++) {
    const { base, tip, thickness } = limbs[i];
    const limbLength = tip[1] - base[1];

    // Define segment lengths
    const upperLength = limbLength * 0.3;
    const lowerLength = limbLength * 0.7;

    let bendAmount;
    let bendDirection;

    if (limbs.length === 2) {
      // Special case: exactly 2 limbs
      bendAmount = thickness * (i === 0 ? 1.0 : 0.5); // First limb bends more
      bendDirection = -1; // Both limbs bend left
    } else {
      // General case: Bend based on position relative to spine center
      const distanceFromCenter = Math.abs(base[0] - spineCenterX);
      const maxBend = thickness * 9;
      bendAmount = (distanceFromCenter / spineCenterX) * maxBend;
      bendDirection = base[0] < spineCenterX ? -1 : 1; // Left limb bends left, right bends right
    }

    const outwardOffset = bendDirection * bendAmount;

    // Calculate joint (elbow) position with varied bend
    const joint: Point = [base[0] + outwardOffset, base[1] + upperLength];

    // Lower segment moves straight down
    const lowerTip: Point = [joint[0], joint[1] + lowerLength];

    // Draw upper segment (angled outward)
    ctx.lineWidth = thickness;
    ctx.strokeStyle = accentColor;

    ctx.beginPath();
    ctx.moveTo(base[0], base[1]);
    ctx.lineTo(joint[0], joint[1]);
    ctx.stroke();

    // Draw lower segment (straight down)
    ctx.beginPath();
    ctx.moveTo(joint[0], joint[1]);
    ctx.lineTo(lowerTip[0], lowerTip[1]);
    ctx.stroke();
  }
}

export { generateLimbAttachmentPoints, generateLimbs, drawLimbs };
