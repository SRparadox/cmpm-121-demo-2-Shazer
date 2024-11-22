import "./style.css";

//FORMATING STUFF
//H1 Header
const APP_NAME = "Le Sketchpad - Shazer";
const app = document.querySelector<HTMLDivElement>("#app")!;
const header = document.createElement("h1");
header.innerText = APP_NAME; 
app.appendChild(header);

//Create Canvas
const canvas = document.createElement("canvas");
canvas.width = 256; 
canvas.height = 256; 

//Add Canvas Style
canvas.id = "myCanvas";
app.appendChild(canvas);

const context = canvas.getContext("2d");

//SETUP | Brace ref - with the question from slides step 5
let History: Array<MarkerLine> = []; 
let RedoSystem: Array<MarkerLine> = [];
let Line: MarkerLine | null = null;

let isDrawing = false;
let x = 0;
let y = 0;

// NEW: Default line thickness
let currentThickness = 2; // Start with 'Thin'

// CREATE CLASS | Object-Oriented Stack for MarkerLine
class MarkerLine {
    points: Array<{ x: number; y: number }>;
    thickness: number;    //Utilized Brace for the implementation: help with adding a thickness variable that can be adjusted via two extra buttons that set the thickness of drawing to 'Thin' or 'Thick' and can remember the setting

    constructor(Start: { x: number; y: number }, thickness: number) {
        this.points = [Start];
        this.thickness = thickness;   
    }
    // Update coords
    drag(x: number, y: number) {
        this.points.push({ x, y });
    }

    display(context: CanvasRenderingContext2D) {
        if (this.points.length > 0) {
            context.beginPath();
            context.lineWidth = this.thickness; // Uses per-line thickness
            context.moveTo(this.points[0].x, this.points[0].y);
            for (const point of this.points) {
                context.lineTo(point.x, point.y);
            }
            context.stroke();
            context.closePath();
        }
    }
}

// LISTENERS | Event Handling
canvas.addEventListener("mousedown", (e) => {
    x = e.offsetX;
    y = e.offsetY;
    isDrawing = true;

    // Instantiate a new MarkerLine with the current thickness
    Line = new MarkerLine({ x, y }, currentThickness);
    History.push(Line);
    RedoSystem = []; // Clear redo stack
    canvas.dispatchEvent(new Event("drawing-changed")); // DRAWING CHANGED FLAG
});

canvas.addEventListener("mousemove", (e) => {
    if (isDrawing) {
        x = e.offsetX;
        y = e.offsetY;
        Line.drag(x, y);
        canvas.dispatchEvent(new Event("drawing-changed")); // DRAWING CHANGED FLAG
    }
});

window.addEventListener("mouseup", (e) => {
    if (isDrawing) {
        x = 0;
        y = 0;

        History.push(Line);
        Line = null;
        isDrawing = false;
        canvas.dispatchEvent(new Event("drawing-changed")); // DRAWING CHANGED FLAG
    }
});

//DRAWING CHANGED FLAG | Rerender Canvas
canvas.addEventListener("drawing-changed", () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    History.forEach((stroke) => stroke.display(context));
    if (Line) {
        Line.display(context);
    }
});

// BUTTONS
// Clear Button
const Clear = document.createElement("button"); 
Clear.textContent = "Clear";
Clear.addEventListener("click", () => {
    History = []; // Clear Arrays
    RedoSystem = [];
    context.clearRect(0, 0, canvas.width, canvas.height);  
});
app.appendChild(Clear);

// Undo Button
const Undo = document.createElement("button"); 
Undo.textContent = "Undo";
Undo.addEventListener("click", () => {
    if (History.length) {
        const temp1 = History.pop()!;
        RedoSystem.push(temp1);
        canvas.dispatchEvent(new Event("drawing-changed")); // DRAWING-CHANGED FLAG
    }
});
app.appendChild(Undo);

// Redo Button
const Redo = document.createElement("button"); 
Redo.textContent = "Redo";
Redo.addEventListener("click", () => {
    if (RedoSystem.length) {
        const temp2 = RedoSystem.pop()!;
        History.push(temp2);
        canvas.dispatchEvent(new Event("drawing-changed")); // DRAWING-CHANGED FLAG
    }
});
app.appendChild(Redo);

// NEW: Thickness Buttons
// Thin Button
const ThinButton = document.createElement("button");
ThinButton.textContent = "Thin";
ThinButton.addEventListener("click", () => {
    currentThickness = 2; // Set thickness to Thin
    console.log("Thickness set to Thin: ", currentThickness);
});
app.appendChild(ThinButton);

// Thick Button
const ThickButton = document.createElement("button");
ThickButton.textContent = "Thick";
ThickButton.addEventListener("click", () => {
    currentThickness = 6; // Set thickness to Thick
    console.log("Thickness set to Thick: ", currentThickness);
});
app.appendChild(ThickButton);