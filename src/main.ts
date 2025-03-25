import { decodeGene, renderCreature } from "./geneDecoder";

function generateRandomGene() {
  return Math.floor(Math.random() * (1 << 20));
}

try {
  // Generate a random gene and render the creature
  const gene = generateRandomGene();
  console.log("Generated gene:", gene);
  const traits = decodeGene(gene);
  console.log("Decoded traits:", traits);

  // Create and display the creature image
  const imageUrl = renderCreature(traits);
  const img = document.createElement("img");
  img.src = imageUrl;
  img.style.width = "400px";
  img.style.height = "400px";
  img.style.border = "2px solid #333";
  img.style.margin = "20px";
  document.body.appendChild(img);

  // Display the gene value
  const geneDisplay = document.createElement("div");
  geneDisplay.className = "info";
  geneDisplay.textContent = `Gene: ${gene.toString(2).padStart(20, "0")}`;
  document.body.appendChild(geneDisplay);
} catch (error) {
  console.error("Error rendering creature:", error);
}
