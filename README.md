# Gene Visualizer

A creature generator that uses a 35-bit binary number to create unique creatures with various traits.

## Genetic Code Structure

The genetic code is a 35-bit binary number where each bit or group of bits represents a specific trait. Here's the complete bit layout:

```
Bits:    34 |33 |32 31 30 29 28 27 |26 25 24 23 22 21 |20 19 |18 17 |16 15 |14 13 |12 11 |10 9 |8 7 |6 5 |4 3 |2 1 |0 1
Trait:   shi|rgb|color1            |color2            |head  |head  |torso |torso |limb  |limb  |tail |tail |eye  |arm  |spike
        ny |   |                   |                   |len   |width |len   |width |len   |width |width|len  |count|count|den
Size:    1  |1  |6                 |6                 |2     |2     |2     |2     |2     |2     |2    |2    |2    |2    |2
```

### Trait Definitions

| Trait        | Bits | Values | Description                              |
| ------------ | ---- | ------ | ---------------------------------------- |
| shiny        | 1    | 0-1    | Whether the creature has a shine effect  |
| rgbMode      | 1    | 0-1    | Whether colors use RGB or HSL mode       |
| color1       | 6    | 0-63   | Primary color (RGB or HSL)               |
| color2       | 6    | 0-63   | Secondary color (RGB or HSL)             |
| headLength   | 2    | 0-3    | Head length (0.6x to 3.0x base size)     |
| headWidth    | 2    | 0-3    | Head width (0.6x to 3.0x base size)      |
| torsoLength  | 2    | 0-3    | Body length (0.8x to 1.4x base size)     |
| torsoWidth   | 2    | 0-3    | Body width (1.0x to 1.6x base size)      |
| limbLength   | 2    | 0-3    | Length of limbs (0.5x to 1.1x base size) |
| limbWidth    | 2    | 0-3    | Width of limbs (0.1x to 0.25x base size) |
| tailWidth    | 2    | 0-3    | Width of tail (0.1x to 0.25x base size)  |
| tailLength   | 2    | 0-3    | Length of tail (0.3x to 0.9x base size)  |
| eyeCount     | 2    | 0-3    | Number of eyes (0-3)                     |
| armCount     | 2    | 0-3    | Number of arms (0-3)                     |
| spikeDensity | 2    | 0-3    | Number of spikes (0-9)                   |

### Total Size

- The genetic code uses exactly 35 bits (0-34)
- This allows for 2^35 = 34,359,738,368 unique combinations
- The number is always masked to 35 bits using `& 0x7FFFFFFFF`

## Usage

```typescript
// Generate a random 35-bit number
const gene = Math.floor(Math.random() * (1 << 35)) & 0x7ffffffff;

// Decode the gene into traits
const traits = decodeGene(gene);

// Render the creature
const imageUrl = renderCreature(traits);

// Encode traits back into a 35-bit number
const encodedGene = encodeGene(traits);
```

## Development

```bash
# Install dependencies
npm install

# Start development server
Run the index.html file with live server

# Build for production to dist/
npm run build

#Minify to dist/mini
npm run minify
```
