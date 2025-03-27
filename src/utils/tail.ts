type Point = [number, number];

function moveSVG(points: Point[], fromAnchor: Point, toAnchor: Point): Point[] {
  const dx = toAnchor[0] - fromAnchor[0];
  const dy = toAnchor[1] - fromAnchor[1];

  return points.map(([x, y]) => [x + dx, y + dy]);
}

