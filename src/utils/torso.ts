import { ctx } from "../geneDecoder";

export type Separator = [[number, number], [number, number]];
export type Point = [number, number];

function extractPointsFromPath(path: string): Point[] {
  const commands = path.split(/(?=[MLHVCSQTAZmlhvcsqtaz])/);
  const points: [number, number][] = [];

  commands.forEach((cmd) => {
    const coords = cmd
      .slice(1)
      .trim()
      .split(/[\s,]+/)
      .map(Number);

    if (coords.length >= 2) {
      points.push([coords[0], coords[1]]);
    }
  });

  return points;
}

function generateSeparators(torsoPoints: [number, number][]): Separator[] {
  if (torsoPoints.length < 2)
    console.error("At least two points are required to generate separators.");

  const points = torsoPoints; // Remove the first point if it's duplicate
  const separators: Separator[] = [];

  for (let i = 0; i < points.length / 2; i++) {
    const separator: Separator = [points[i], points[points.length - 1 - i]];
    separators.push(separator);
  }

  return separators;
}

function generateMidpoints(separators: Separator[]): Point[] {
  return separators.map(([p1, p2]) => [
    (p1[0] + p2[0]) / 2, // Midpoint X
    (p1[1] + p2[1]) / 2, // Midpoint Y
  ]);
}

function thinCreature(
  separators: Separator[],
  midpoints: Point[],
  torsoWidthFactor: number,
  headWidthFactor?: number
): Separator[] {
  return separators.map(([p1, p2], index) => {
    const midpoint = midpoints[index];

    // Use head width factor for the first separator, otherwise use torso width factor
    const widthFactor =
      index === 0 && headWidthFactor !== undefined
        ? headWidthFactor
        : torsoWidthFactor;

    // Move each point closer to the midpoint based on factor
    const newP1: Point = [
      p1[0] + (midpoint[0] - p1[0]) * widthFactor,
      p1[1] + (midpoint[1] - p1[1]) * widthFactor,
    ];
    const newP2: Point = [
      p2[0] + (midpoint[0] - p2[0]) * widthFactor,
      p2[1] + (midpoint[1] - p2[1]) * widthFactor,
    ];

    return [newP1, newP2] as Separator;
  });
}

function drawSeparators(separators: Separator[], color: string = "black") {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  separators.forEach(([p1, p2]) => {
    ctx.beginPath();
    ctx.moveTo(p1[0], p1[1]); // Move to first point
    ctx.lineTo(p2[0], p2[1]); // Draw line to second point
    ctx.stroke();
  });
}
function adjustCreatureLength(
  separators: Separator[],
  midpoints: Point[],
  lengthFactor: number
): Separator[] {
  lengthFactor /= 2.5;
  if (midpoints.length < 3) return separators; // Need at least 3 midpoints

  // Compute the central anchor (between 2nd and 3rd midpoint)
  const centerAnchor: Point = [
    (midpoints[1][0] + midpoints[2][0]) / 2,
    (midpoints[1][1] + midpoints[2][1]) / 2,
  ];

  const adjustedMidpoints: Point[] = [...midpoints];
  const lastIndex = midpoints.length - 1;

  // Adjust the 2nd and 3rd midpoints towards the anchor
  for (let i of [1, 2]) {
    const dx = centerAnchor[0] - midpoints[i][0];
    const dy = centerAnchor[1] - midpoints[i][1];

    // Move midpoint towards anchor by factor
    adjustedMidpoints[i] = [
      midpoints[i][0] + dx * lengthFactor,
      midpoints[i][1] + dy * lengthFactor,
    ];
  }

  // Adjust first and last midpoints
  // First midpoint moves towards the second midpoint
  {
    const dx = adjustedMidpoints[1][0] - midpoints[0][0];
    const dy = adjustedMidpoints[1][1] - midpoints[0][1];

    adjustedMidpoints[0] = [
      midpoints[0][0] + dx * lengthFactor,
      midpoints[0][1] + dy * lengthFactor,
    ];
  }

  // Last midpoint moves towards the second-to-last midpoint
  {
    const dx = adjustedMidpoints[lastIndex - 1][0] - midpoints[lastIndex][0];
    const dy = adjustedMidpoints[lastIndex - 1][1] - midpoints[lastIndex][1];

    adjustedMidpoints[lastIndex] = [
      midpoints[lastIndex][0] + dx * lengthFactor,
      midpoints[lastIndex][1] + dy * lengthFactor,
    ];
  }

  // Adjust separators by moving their respective points
  const adjustedSeparators: Separator[] = separators.map(([p1, p2], index) => {
    const dx = adjustedMidpoints[index][0] - midpoints[index][0];
    const dy = adjustedMidpoints[index][1] - midpoints[index][1];

    return [
      [p1[0] + dx, p1[1] + dy],
      [p2[0] + dx, p2[1] + dy],
    ] as Separator; // ✅ Explicitly casting as Separator
  });

  return adjustedSeparators;
}
function createFilledShape(separators: Separator[]) {
  // Reset the path
  ctx.beginPath();

  // Start from the first point of the first separator
  ctx.moveTo(separators[0][0][0], separators[0][0][1]);

  // Draw lines through the top points
  for (let i = 0; i < separators.length; i++) {
    ctx.lineTo(separators[i][0][0], separators[i][0][1]);
  }

  // Draw lines through the bottom points in reverse
  for (let i = separators.length - 1; i >= 0; i--) {
    ctx.lineTo(separators[i][1][0], separators[i][1][1]);
  }

  // Close the path
  ctx.closePath();

  // Optional: set fill style
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)"; // Semi-transparent black

  // Fill the shape
  ctx.fill();

  // Optional: add an outline
  ctx.strokeStyle = "black";
  ctx.stroke();
}
export {
  drawSeparators,
  extractPointsFromPath,
  generateSeparators,
  adjustCreatureLength,
  createFilledShape,
  generateMidpoints,
  thinCreature,
};
