import { Point } from "./torso";

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

export { generateLimbAttachmentPoints };
