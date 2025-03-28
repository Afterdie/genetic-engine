import { renderCreature, encodeGene, CreatureTraits } from "./geneDecoder";

// Function to update the creature display and gene display
function updateCreatureDisplay(traits: CreatureTraits) {
  const creatureDisplay = document.getElementById("creature-display");
  const geneDisplay = document.getElementById("gene-display");

  if (!creatureDisplay || !geneDisplay) return;

  // Clear previous content
  creatureDisplay.innerHTML = "";

  // Create and display the creature image
  const gene = encodeGene(traits);
  const imageUrl = renderCreature(gene);
  const img = document.createElement("img");
  img.src = imageUrl;
  img.style.width = "400px";
  img.style.height = "400px";
  img.style.border = "2px solid #333";
  img.style.margin = "20px";
  creatureDisplay.appendChild(img);

  // Display the gene value
  geneDisplay.textContent = `Gene: ${gene.toString(2).padStart(30, "0")}`;
}

// Function to update value displays
function updateValueDisplay(id: string, value: number) {
  const display = document.querySelector(
    `.trait-label label[for="${id}"] + .value-display`
  );
  if (display) {
    display.textContent = value.toString();
  }
}

// Function to update toggle value displays
function updateToggleDisplay(id: string, checked: boolean) {
  const display = document.getElementById(`${id}Value`);
  if (display) {
    if (id === "rgbMode") {
      display.textContent = checked ? "Rainbow" : "Solid";
    } else {
      display.textContent = checked ? "On" : "Off";
    }
  }
}

// Function to get all trait values from sliders and toggles
function getTraitValues(): CreatureTraits {
  const shinyInput = document.getElementById("shiny") as HTMLInputElement;
  const rgbModeInput = document.getElementById("rgbMode") as HTMLInputElement;

  return {
    shiny: shinyInput.checked ? 1 : 0,
    rgbMode: rgbModeInput.checked ? 1 : 0,
    color1: parseInt(
      (document.getElementById("color1") as HTMLInputElement).value
    ),
    color2: parseInt(
      (document.getElementById("color2") as HTMLInputElement).value
    ),
    headLength: parseInt(
      (document.getElementById("headLength") as HTMLInputElement).value
    ),
    headWidth: parseInt(
      (document.getElementById("headWidth") as HTMLInputElement).value
    ),
    torsoLength: parseInt(
      (document.getElementById("torsoLength") as HTMLInputElement).value
    ),
    torsoWidth: parseInt(
      (document.getElementById("torsoWidth") as HTMLInputElement).value
    ),
    limbLength: parseInt(
      (document.getElementById("limbLength") as HTMLInputElement).value
    ),
    limbWidth: parseInt(
      (document.getElementById("limbWidth") as HTMLInputElement).value
    ),
    tailWidth: parseInt(
      (document.getElementById("tailWidth") as HTMLInputElement).value
    ),
    tailLength: parseInt(
      (document.getElementById("tailLength") as HTMLInputElement).value
    ),
    eyeCount: parseInt(
      (document.getElementById("eyeCount") as HTMLInputElement).value
    ),
    armCount: parseInt(
      (document.getElementById("armCount") as HTMLInputElement).value
    ),
    spikeDensity: parseInt(
      (document.getElementById("spikeDensity") as HTMLInputElement).value
    ),
  };
}

// Initialize the application
function init() {
  // Add event listeners to all sliders
  const sliders = document.querySelectorAll('input[type="range"]');
  sliders.forEach((slider) => {
    slider.addEventListener("input", (e) => {
      const id = (e.target as HTMLInputElement).id;
      const value = parseInt((e.target as HTMLInputElement).value);
      updateValueDisplay(id, value);
      updateCreatureDisplay(getTraitValues());
    });
  });

  // Add event listeners to toggle switches
  const toggles = document.querySelectorAll('input[type="checkbox"]');
  toggles.forEach((toggle) => {
    // Set initial state
    const id = (toggle as HTMLInputElement).id;
    const checked = (toggle as HTMLInputElement).checked;
    updateToggleDisplay(id, checked);

    // Add change event listener
    toggle.addEventListener("change", (e) => {
      const id = (e.target as HTMLInputElement).id;
      const checked = (e.target as HTMLInputElement).checked;
      updateToggleDisplay(id, checked);
      updateCreatureDisplay(getTraitValues());
    });
  });

  // Initial display
  updateCreatureDisplay(getTraitValues());
}

// Start the application when the DOM is loaded
document.addEventListener("DOMContentLoaded", init);
