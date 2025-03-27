import { Separator, Point } from "./torso";
function adjustTailLength(
  separators: Separator[],
  midpoints: Point[],
  lengthFactor: number
): Separator[] {
  if (midpoints.length < 3) return separators; // Need at least 3 midpoints

  const adjustedMidpoints: Point[] = [...midpoints];

  // The leftmost midpoint remains anchored
  for (let i = 1; i < midpoints.length; i++) {
    // Interpolate midpoint movement along its line to the previous midpoint
    adjustedMidpoints[i] = [
      (1 - lengthFactor) * adjustedMidpoints[i][0] +
        lengthFactor * adjustedMidpoints[i - 1][0],
      (1 - lengthFactor) * adjustedMidpoints[i][1] +
        lengthFactor * adjustedMidpoints[i - 1][1],
    ];
  }

  // Adjust separators based on new midpoints using a loop
  const adjustedSeparators: Separator[] = [...separators];
  for (let i = 1; i < separators.length; i++) {
    const prevSeparator = adjustedSeparators[i - 1];
    adjustedSeparators[i] = [
      [
        (1 - lengthFactor) * separators[i][0][0] +
          lengthFactor * prevSeparator[0][0],
        (1 - lengthFactor) * separators[i][0][1] +
          lengthFactor * prevSeparator[0][1],
      ],
      [
        (1 - lengthFactor) * separators[i][1][0] +
          lengthFactor * prevSeparator[1][0],
        (1 - lengthFactor) * separators[i][1][1] +
          lengthFactor * prevSeparator[1][1],
      ],
    ] as Separator;
  }

  return adjustedSeparators;
}

export { adjustTailLength };
