import { Separator, Point } from "./torso";
import { ctx } from "../geneDecoder";
function generateHeadShape(
  firstSeparator: Separator,
  lengthFactor: number
): Point[] {
  const [topPoint, bottomPoint] = firstSeparator;
  lengthFactor /= 2;
  // Create points 50px to the left for both top and bottom points
  const headTopLeft: Point = [
    topPoint[0] * (1 - lengthFactor) - 40,
    topPoint[1],
  ];
  const headBottomLeft: Point = [
    bottomPoint[0] * (1 - lengthFactor) - 20,
    bottomPoint[1] - 10,
  ];

  // Return the points in a specific order for path creation
  return [
    topPoint, // Top right (neck top)
    headTopLeft, // Top left
    headBottomLeft, // Bottom left
    bottomPoint, // Bottom right (neck bottom)
  ];
}

// Function to create a filled head shape
export function drawHeadShape(
  firstSeparator: Separator,
  lengthFactor: number
): Point[] {
  const headPoints = generateHeadShape(firstSeparator, lengthFactor);

  ctx.beginPath();

  // Move to the first point (top right of neck)
  ctx.moveTo(headPoints[0][0], headPoints[0][1]);

  // Line to top left
  ctx.lineTo(headPoints[1][0], headPoints[1][1]);

  // Line to bottom left
  ctx.lineTo(headPoints[2][0], headPoints[2][1]);

  // Line to bottom right
  ctx.lineTo(headPoints[3][0], headPoints[3][1]);

  // Close the path

  return headPoints;
}
