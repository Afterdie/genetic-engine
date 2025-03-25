// Define the structure of each trait
interface TraitDefinition {
  bits: number; // Number of bits this trait uses
  shift: number; // How many bits to shift right
  mask: number; // The bit mask to apply
  defaultValue?: number; // Optional default value
}

// Define all traits and their bit positions
const TRAIT_DEFINITIONS: Record<keyof CreatureTraits, TraitDefinition> = {
  shiny: { bits: 1, shift: 19, mask: 0b1 },
  rgbMode: { bits: 1, shift: 18, mask: 0b1 },
  spikeDensity: { bits: 2, shift: 16, mask: 0b11 },
  tailHeight: { bits: 2, shift: 14, mask: 0b11 },
  armCount: { bits: 2, shift: 12, mask: 0b11 },
  limbLength: { bits: 2, shift: 10, mask: 0b11 },
  limbWidth: { bits: 2, shift: 8, mask: 0b11 },
  color2: { bits: 6, shift: 6, mask: 0b111111 },
  color1: { bits: 6, shift: 0, mask: 0b111111 },
  eyeCount: { bits: 2, shift: 4, mask: 0b11 },
  torsoWidth: { bits: 2, shift: 2, mask: 0b11 },
};

interface CreatureTraits {
  shiny: number;
  rgbMode: number;
  spikeDensity: number;
  tailHeight: number;
  armCount: number;
  limbLength: number;
  limbWidth: number;
  color2: number;
  color1: number;
  eyeCount: number;
  torsoWidth: number;
}

export function decodeGene(gene: number): CreatureTraits {
  const traits: Partial<CreatureTraits> = {};

  // Decode each trait using the definitions
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

  return gene;
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

export function renderCreature(
  traits: CreatureTraits,
  size: number = 400
): string {
  // Create a temporary canvas
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Set up the base dimensions
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const baseSize = Math.min(canvas.width, canvas.height) * 0.4;

  // Draw the creature based on traits
  ctx.save();

  // Draw body
  const bodyWidth = baseSize * (1 + traits.torsoWidth * 0.2);
  const bodyHeight = baseSize * 1.2;

  // Set colors based on traits
  const color1 = traits.rgbMode
    ? `hsl(${traits.color1 * 60}, 70%, 50%)`
    : `#${traits.color1.toString(16).padStart(6, "0")}`;
  const color2 = traits.rgbMode
    ? `hsl(${traits.color2 * 60}, 70%, 50%)`
    : `#${traits.color2.toString(16).padStart(6, "0")}`;

  // Draw main body
  ctx.fillStyle = color1;
  ctx.beginPath();
  ctx.ellipse(
    centerX,
    centerY,
    bodyWidth / 2,
    bodyHeight / 2,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Draw eyes
  ctx.fillStyle = "#000";
  const eyeSpacing = bodyWidth * 0.3;
  const eyeSize = bodyWidth * 0.1;
  for (let i = 0; i < traits.eyeCount; i++) {
    const x = centerX - eyeSpacing / 2 + eyeSpacing * i;
    ctx.beginPath();
    ctx.arc(x, centerY - bodyHeight / 4, eyeSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw arms
  const armLength = baseSize * (0.5 + traits.limbLength * 0.2);
  const armWidth = baseSize * (0.1 + traits.limbWidth * 0.05);
  ctx.strokeStyle = color2;
  ctx.lineWidth = armWidth;

  for (let i = 0; i < traits.armCount; i++) {
    const angle = (Math.PI * 2 * i) / traits.armCount;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(angle) * armLength,
      centerY + Math.sin(angle) * armLength
    );
    ctx.stroke();
  }

  // Draw tail
  const tailHeight = baseSize * (0.3 + traits.tailHeight * 0.2);
  ctx.beginPath();
  ctx.moveTo(centerX, centerY + bodyHeight / 2);
  ctx.lineTo(centerX, centerY + bodyHeight / 2 + tailHeight);
  ctx.stroke();

  // Add spikes if any
  if (traits.spikeDensity > 0) {
    const spikeCount = traits.spikeDensity * 3;
    const spikeLength = baseSize * 0.1;
    ctx.strokeStyle = color2;
    ctx.lineWidth = baseSize * 0.05;

    for (let i = 0; i < spikeCount; i++) {
      const angle = (Math.PI * 2 * i) / spikeCount;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(angle) * (bodyWidth / 2 + spikeLength),
        centerY + Math.sin(angle) * (bodyHeight / 2 + spikeLength)
      );
      ctx.stroke();
    }
  }

  // Add shine effect if shiny
  if (traits.shiny) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.beginPath();
    ctx.ellipse(
      centerX - bodyWidth / 4,
      centerY - bodyHeight / 4,
      bodyWidth / 6,
      bodyHeight / 6,
      Math.PI / 4,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  ctx.restore();

  // Return the data URL of the rendered image
  return canvas.toDataURL("image/png");
}
