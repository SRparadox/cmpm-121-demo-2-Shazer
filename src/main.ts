import "./style.css";

//FORMATING STUFF
//H1 Header
const APP_NAME = "Le Sketchpad - Shazer";
const app = document.querySelector<HTMLDivElement>("#app")!;
const header = document.createElement("h1");
header.innerText = APP_NAME; 
app.appendChild(header);

//Create Canvas
const canvas = document.createElement("canvas"); canvas.width = 256; canvas.height = 256; 

//Add Canvas Style
canvas.id = "myCanvas";
app.appendChild(canvas);

const context = canvas.getContext("2d");



//SETUP
// Brace Ref - Create and Array of Arrays of points  History is current, and Redo is future ones
let History: { x: number; y: number }[][] = [];
let RedoSystem: { x: number; y: number }[][] = [];

//This Is for faster tracing during a stroke
let Line: { x: number; y: number }[] = [];

// event.offsetX, event.offsetY gives the (x,y) offset from the edge of the canvas.
let isDrawing = false;
let x = 0;
let y = 0;




//LISTENERS
// Add the event listeners for mousedown, mousemove, and mouseup
canvas.addEventListener("mousedown", (e) => {
    x = e.offsetX;
    y = e.offsetY;
    isDrawing = true;
//Add the current coordinates to the array and set up future lines
    Line = []; // HAVE, IF NOT ITS DOUBLE. 
    Line.push({x,y});
    History.push(Line);
    RedoSystem = [];  //Clear the future lines otherwise, redo onto non existent lines
    canvas.dispatchEvent(new Event("drawing-changed")); // DRAWING CHANGED FLAG
});

canvas.addEventListener("mousemove", (e) => {
    if (isDrawing) {
        drawLine(context, x, y, e.offsetX, e.offsetY);
        x = e.offsetX;
        y = e.offsetY;

        Line.push({x,y});        
        canvas.dispatchEvent(new Event("drawing-changed")); // DRAWING CHANGED FLAG
  }
});

window.addEventListener("mouseup", (e) => {
    if (isDrawing) {
        drawLine(context, x, y, e.offsetX, e.offsetY);
        x = 0;
        y = 0;
        isDrawing = false;
  }
});

//Dwagin Chnaged flag should add, clear the canvas, and add the current
canvas.addEventListener("drawing-changed", () => {  // DRAWING CHANGED LISTENER
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.beginPath();
    for (const stroke of History) {
        if (stroke.length!){ 
            context.moveTo(stroke[0].x, stroke[0].y);  //Utelizing the context.stroke from drawline
           }                                    
    for (const coords of stroke) {
        context.lineTo(coords.x, coords.y); 
    }
    context.stroke();
  }
  });



//DRAWING
function drawLine(context, x1, y1, x2, y2) {
  context.beginPath();
  context.strokeStyle = "black";
  context.lineWidth = 1;
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.closePath();
}





//BUTTONS
//Clear Button
const Clear = document.createElement("button"); 
Clear.innerHTML = "Clear";
Clear.addEventListener('click', () => {
    console.log('Button clicked!');
    History = []; //Clear Arrays
    RedoSystem = [];
    context.clearRect(0, 0, canvas.width, canvas.height);  //Taking inspiration from: https://www.squash.io/tutorial-utilizing-the-mouseeventhandlers-in-typescript/
});
app.appendChild(Clear);

//Undo Button
const Undo = document.createElement("button"); 
Undo.innerHTML = "Undo";
Undo.addEventListener('click', () => {
    if (History.length!) { //Remove the previous line from the history and added to the potential of the Redu array
        console.log('Undo clicked!');
        const temp1 = History.pop()!;
        RedoSystem.push(temp1);
        canvas.dispatchEvent(new Event("drawing-changed")); // DRAWING-CHANGED FLAG
    }
});
app.appendChild(Undo);

//Redo Button
const Redo = document.createElement("button"); 
Redo.innerHTML = "Redo";
Redo.addEventListener('click', () => {
    if (RedoSystem.length!) { //Remove the previous line from the Redo array and added into the history so that its dsiplayed
        console.log('Redo clicked!');
        const temp2 = RedoSystem.pop()!; 
        History.push(temp2);
        canvas.dispatchEvent(new Event("drawing-changed")); // DRAWING-CHANGED FLAG
    }
});
app.appendChild(Redo);