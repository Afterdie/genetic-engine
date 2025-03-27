import { renderCreature, encodeGene } from "./dist/mini/geneDecoder.min.js";
// Function to update the creature display and gene display
function updateCreatureDisplay(traits) {
  const creatureDisplay = document.getElementById("creature-display");
  const geneDisplay = document.getElementById("gene-display");
  if (!creatureDisplay || !geneDisplay) return;
  // Clear previous content
  creatureDisplay.innerHTML = "";
  // Create and display the creature image
  const imageUrl = renderCreature(traits);
  const img = document.createElement("img");
  img.src = imageUrl;
  img.style.width = "400px";
  img.style.height = "400px";
  img.style.border = "2px solid #333";
  img.style.margin = "20px";
  creatureDisplay.appendChild(img);
  // Display the gene value
  const gene = encodeGene(traits);
  geneDisplay.textContent = `Gene: ${gene.toString(2).padStart(30, "0")}`;
}
// Function to update value displays
function updateValueDisplay(id, value) {
  const display = document.querySelector(
    `.trait-label label[for="${id}"] + .value-display`
  );
  if (display) {
    display.textContent = value.toString();
  }
}
// Function to update toggle value displays
function updateToggleDisplay(id, checked) {
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
function getTraitValues() {
  const shinyInput = document.getElementById("shiny");
  const rgbModeInput = document.getElementById("rgbMode");
  return {
    shiny: shinyInput.checked ? 1 : 0,
    rgbMode: rgbModeInput.checked ? 1 : 0,
    color1: parseInt(document.getElementById("color1").value),
    color2: parseInt(document.getElementById("color2").value),
    headLength: parseInt(document.getElementById("headLength").value),
    headWidth: parseInt(document.getElementById("headWidth").value),
    torsoLength: parseInt(document.getElementById("torsoLength").value),
    torsoWidth: parseInt(document.getElementById("torsoWidth").value),
    limbLength: parseInt(document.getElementById("limbLength").value),
    limbWidth: parseInt(document.getElementById("limbWidth").value),
    tailWidth: parseInt(document.getElementById("tailWidth").value),
    tailLength: parseInt(document.getElementById("tailLength").value),
    eyeCount: parseInt(document.getElementById("eyeCount").value),
    armCount: parseInt(document.getElementById("armCount").value),
    spikeDensity: parseInt(document.getElementById("spikeDensity").value),
  };
}
// Initialize the application
function init() {
  // Add event listeners to all sliders
  const sliders = document.querySelectorAll('input[type="range"]');
  sliders.forEach((slider) => {
    slider.addEventListener("input", (e) => {
      const id = e.target.id;
      const value = parseInt(e.target.value);
      updateValueDisplay(id, value);
      updateCreatureDisplay(getTraitValues());
    });
  });
  // Add event listeners to toggle switches
  const toggles = document.querySelectorAll('input[type="checkbox"]');
  toggles.forEach((toggle) => {
    // Set initial state
    const id = toggle.id;
    const checked = toggle.checked;
    updateToggleDisplay(id, checked);
    // Add change event listener
    toggle.addEventListener("change", (e) => {
      const id = e.target.id;
      const checked = e.target.checked;
      updateToggleDisplay(id, checked);
      updateCreatureDisplay(getTraitValues());
    });
  });
  // Initial display
  updateCreatureDisplay(getTraitValues());
}
// Start the application when the DOM is loaded
document.addEventListener("DOMContentLoaded", init);
