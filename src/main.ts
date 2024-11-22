import "./style.css";

// H1 Header
const APP_NAME = "Le Sketchpad - Shazer";
const app = document.querySelector<HTMLDivElement>("#app")!;
const header = document.createElement("h1");
header.innerText = APP_NAME;
app.appendChild(header);

// Create Canvas
const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
canvas.id = "myCanvas";
app.appendChild(canvas);

const context = canvas.getContext("2d")!;
if (!context) throw new Error("2D context could not be initialized");

// Shared data structures
type HistoryElement = MarkerLine | EmojiHistory; // Union type for History elements

let History: Array<HistoryElement> = [];
let RedoSystem: Array<HistoryElement> = [];
let Line: MarkerLine | null = null;

// Default settings
let isDrawing = false;
let x = 0;
let y = 0;
let currentThickness = 2;
let isEmoji = false;
let currentSticker: Emoji | null = null;

// Define the colors
const colors = ["black", "red", "blue", "green", "yellow", "orange", "purple"];
let markerColor = colors[0]; // Default to the first color

// UI: Color Picker
const colorPickerHeader = document.createElement("h3");
colorPickerHeader.textContent = "Choose Your Marker Color";
app.appendChild(colorPickerHeader);

const colorPickerContainer = document.createElement("div");
colorPickerContainer.style.display = "flex";
colorPickerContainer.style.gap = "10px";
app.appendChild(colorPickerContainer);

// MarkerLine class with instance-specific color
class MarkerLine {
  points: Array<{ x: number; y: number }>;
  thickness: number;
  color: string;

  constructor(start: { x: number; y: number }, thickness: number, color: string) {
    this.points = [start];
    this.thickness = thickness;
    this.color = color; // Assign unique color at creation
  }

  drag(x: number, y: number) {
    this.points.push({ x, y });
  }

  display(context: CanvasRenderingContext2D) {
    if (this.points.length === 0) return;
    context.lineWidth = this.thickness;
    context.strokeStyle = this.color; // Use the line's specific color
    context.beginPath();
    context.moveTo(this.points[0].x, this.points[0].y);
    for (const point of this.points) {
      context.lineTo(point.x, point.y);
    }
    context.stroke();
  }
}

class CursorManager {
  private cursorElement: HTMLDivElement;
  private emoji: string | null = null;

  constructor() {
    this.cursorElement = document.createElement("div");
    this.cursorElement.style.position = "absolute";
    this.cursorElement.style.pointerEvents = "none";
    this.cursorElement.style.display = "none";
    document.body.appendChild(this.cursorElement);

    document.addEventListener("mousemove", (event) => this.updateCursorPosition(event));
    canvas.addEventListener("mouseleave", () => (this.cursorElement.style.display = "none"));
    canvas.addEventListener("mouseenter", () => (this.cursorElement.style.display = "block"));
  }

  setEmoji(emoji: string | null) {
    this.emoji = emoji;
    this.cursorElement.style.display = emoji ? "block" : "none";
  }

  updateCursorPosition(event: MouseEvent) {
    const thickness = currentThickness;
    if (this.emoji) {
      const fontSize = thickness * 4;
      this.cursorElement.innerText = this.emoji;
      this.cursorElement.style.fontSize = `${fontSize}px`;
      this.cursorElement.style.width = "auto";
      this.cursorElement.style.height = "auto";
      this.cursorElement.style.backgroundColor = "transparent";
    } else {
      this.cursorElement.style.width = `${thickness}px`;
      this.cursorElement.style.height = `${thickness}px`;
      this.cursorElement.style.backgroundColor = "black";
    }
    this.cursorElement.style.left = `${event.pageX - thickness / 2}px`;
    this.cursorElement.style.top = `${event.pageY - thickness / 2}px`;
  }
}

class Emoji {
  symbol: string;

  constructor(symbol: string) {
    this.symbol = symbol;
  }

  stamp(context: CanvasRenderingContext2D, x: number, y: number, size: number) {
    const emojiSize = size * 8;
    context.font = `${emojiSize}px serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(this.symbol, x, y);
  }
}

class EmojiHistory {
  emoji: Emoji;
  x: number;
  y: number;
  size: number;

  constructor(emoji: Emoji, x: number, y: number, size: number) {
    this.emoji = emoji;
    this.x = x;
    this.y = y;
    this.size = size;
  }

  display(context: CanvasRenderingContext2D) {
    this.emoji.stamp(context, this.x, this.y, this.size);
  }
}

// Cursor manager instance
const cursorManager = new CursorManager();

// Listeners
canvas.addEventListener("mousedown", (e) => {
    x = e.offsetX;
    y = e.offsetY;
  
    if (isEmoji && currentSticker) {
      isDrawing = false;
      History.push(new EmojiHistory(currentSticker, x, y, currentThickness));
    } else if (!isEmoji) {
      isDrawing = true;
      Line = new MarkerLine({ x, y }, currentThickness, markerColor); // Pass the current color
      History.push(Line);
    }
    RedoSystem = [];
    canvas.dispatchEvent(new Event("drawing-changed"));
  });

canvas.addEventListener("mousemove", (e) => {
  x = e.offsetX;
  y = e.offsetY;

  if (isDrawing && Line) {
    Line.drag(x, y);
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
});

window.addEventListener("mouseup", () => {
  isDrawing = false;
  Line = null;
});

canvas.addEventListener("drawing-changed", () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  History.forEach((stroke) => stroke.display(context));
});

// Buttons and tools
const ActionHeader = document.createElement("h3");
ActionHeader.textContent = "Actions";
app.appendChild(ActionHeader);

function createButton(label: string, onClick: () => void): HTMLButtonElement {
  const button = document.createElement("button");
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

// Clear button
app.appendChild(createButton("Clear", () => {
  History = [];
  RedoSystem = [];
  context.clearRect(0, 0, canvas.width, canvas.height);
}));

// Undo & Redo
app.appendChild(createButton("Undo", () => {
  if (History.length) {
    RedoSystem.push(History.pop()!);
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
}));

app.appendChild(createButton("Redo", () => {
  if (RedoSystem.length) {
    History.push(RedoSystem.pop()!);
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
}));

app.appendChild(createButton("Export", () => {
    // Create a temporary canvas for scaling  Used Brace for this implementation of the scaling logic
    const scaledCanvas = document.createElement("canvas");
    scaledCanvas.width = 1024;
    scaledCanvas.height = 1024;
    const scaledContext = scaledCanvas.getContext("2d");
    if (!scaledContext) throw new Error("2D context could not be initialized on the scaled canvas");

    // Scale the current canvas content
    scaledContext.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);

    // Export Logic
    const anchor = document.createElement("a");
    anchor.href = scaledCanvas.toDataURL("image/png");
    anchor.download = "sketchpad.png";
    anchor.click();
}));

// Adjust thickness
// Create a marker thickness slider
const thicknessHeader = document.createElement("h3");
thicknessHeader.textContent = "Adjust Marker Thickness";
app.appendChild(thicknessHeader);

const thicknessSlider = document.createElement("input");
thicknessSlider.type = "range";
thicknessSlider.min = "1"; // Minimum marker thickness
thicknessSlider.max = "10"; // Maximum marker thickness
thicknessSlider.step = "1"; // Step size
thicknessSlider.value = currentThickness.toString(); // Default value
// Add more visible styles to the slider
thicknessSlider.style.marginBottom = "10px";
thicknessSlider.style.width = "200px"; // Adjust width as needed
thicknessSlider.style.height = "15px"; // Makes it thicker
thicknessSlider.style.border = "3px solid black"; // Thicker, bold border
thicknessSlider.style.borderRadius = "8px"; // Make it rounded for better aesthetics
thicknessSlider.style.outline = "none"; // Disable focus outline for a cleaner look
thicknessSlider.style.background = "lightgray"; // Optional: customize background color

app.appendChild(thicknessSlider);

// Update marker thickness dynamically
thicknessSlider.addEventListener("input", (event) => {
  currentThickness = parseInt((event.target as HTMLInputElement).value, 10);

  // Optional feedback for debugging
  console.log(`Marker thickness updated to: ${currentThickness}`);
});
// Create buttons for each color
colors.forEach((color) => {
    const colorButton = document.createElement("button");
    colorButton.style.backgroundColor = color; // Represent the color visually
    colorButton.style.width = "30px"; // Button size
    colorButton.style.height = "30px";
    colorButton.style.border = color === "black" ? "1px solid white" : "none"; // Contrast for black
    colorButton.style.borderRadius = "50%"; // Make circular buttons (optional)
    
    // Click listener to update marker color
    colorButton.addEventListener("click", () => {
      markerColor = color; // Set marker color
      //alert(`Marker is now: ${color}`); // Optional feedback
    });
  
    colorPickerContainer.appendChild(colorButton); // Add button to UI
  });

// Stickers array for emojis
const stickers = [
    { symbol: "Draw Line", name: "Marker", isMarker: true  },
    { symbol: "🍭", name: "Candy" },
    { symbol: "⛰️", name: "Mountain" },
    { symbol: "✏️", name: "Pencil"} // Optional "isMarker" flag to reset
  ];
  
  // Generate header for emojis
  const EmojiHeader = document.createElement("h3");
  EmojiHeader.textContent = "Stickers";
  app.appendChild(EmojiHeader);
  
  stickers.forEach((sticker) => {
    app.appendChild(
      createButton(sticker.symbol, () => {
        // Set currentSticker or switch to marker mode
        if (sticker.isMarker) {
          cursorManager.setEmoji(null); // No emoji for markers
          currentSticker = null; // Clear active sticker
          isEmoji = false; // Switch to marker mode
        } else {
          cursorManager.setEmoji(sticker.symbol);
          currentSticker = new Emoji(sticker.symbol);
          isEmoji = true; // Enable emoji mode
        }
      })
    );
  });
  
  // Add the "Custom Sticker" button
  app.appendChild(
    createButton("Custom Sticker", () => {
      const customEmoji = prompt("Enter your custom emoji:", "🙂");  //Brace helped implement the new button
      if (customEmoji) {
        cursorManager.setEmoji(customEmoji);
        currentSticker = new Emoji(customEmoji);
        isEmoji = true;
      }
    })
  );