import { ctx } from "../geneDecoder";
import { Point } from "./torso";

function getEyeRegion(headPoints: Point[]): Point[] {
  const rightPlaneMidpoint: Point = [
    (headPoints[0][0] + headPoints[3][0]) / 2,
    (headPoints[0][1] + headPoints[3][1]) / 2,
  ];
  return [headPoints[0], headPoints[1], rightPlaneMidpoint];
}

function randomPointInTriangle([A, B, C]: [Point, Point, Point]): Point {
  let r1 = Math.random(),
    r2 = Math.random();

  if (r1 + r2 > 1) {
    r1 = 1 - r1;
    r2 = 1 - r2;
  }

  return [
    A[0] + r1 * (B[0] - A[0]) + r2 * (C[0] - A[0]),
    A[1] + r1 * (B[1] - A[1]) + r2 * (C[1] - A[1]),
  ];
}

// ✅ Automatically determine min distance based on triangle size
function autoMinDist(eyeRegion: [Point, Point, Point]): number {
  function distance([x1, y1]: Point, [x2, y2]: Point): number {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }
  const [A, B, C] = eyeRegion;
  const avgSideLength = (distance(A, B) + distance(B, C) + distance(C, A)) / 3;
  return avgSideLength * 0.15; // 15% of avg side length
}

function isFarEnough(point: Point, points: Point[], minDist: number): boolean {
  return points.every(([x, y]) => {
    const dx = x - point[0];
    const dy = y - point[1];
    return Math.sqrt(dx * dx + dy * dy) >= minDist;
  });
}

function generateRandomEyes(eyeRegion: Point[], eyeCount: number): Point[] {
  if (eyeRegion.length !== 3) {
    console.error("generateRandomEyes requires a triangular eyeRegion.");
    return [];
  }

  const minDist = autoMinDist(eyeRegion as [Point, Point, Point]); // ✅ Auto-calculated
  const eyes: Point[] = [];

  while (eyes.length < eyeCount) {
    const candidate = randomPointInTriangle(eyeRegion as [Point, Point, Point]);
    if (isFarEnough(candidate, eyes, minDist)) {
      eyes.push(candidate);
    }
  }

  return eyes;
}

function drawEyes(eyePositions: [number, number][], eyeRadius: number) {
  ctx.fillStyle = "green";
  eyePositions.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, eyeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
}

export { getEyeRegion, generateRandomEyes, drawEyes };
