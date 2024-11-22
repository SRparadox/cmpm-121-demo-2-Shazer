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


//SETUP Brace ref - with the question from slides step 5
// Remake Array with new Class.  CALL NULL
let History: Array<MarkerLine> = []; 
let RedoSystem: Array<MarkerLine> = [];
let Line: MarkerLine | null = null;

// event.offsetX, event.offsetY gives the (x,y) offset from the edge of the canvas.
let isDrawing = false;
let x = 0;
let y = 0;

//CREATE Class: Used Brace Ref - How to create object oriented redo/undo stacks, with referece to github and also the slide 15 question
class MarkerLine {
    points: Array<{ x: number; y: number }>;

    constructor(Start: { x: number; y: number }) {
        this.points = [Start];   
    }
    //Update coords
    drag(x: number, y: number) {
        this.points.push({ x, y });
    }

    display(context: CanvasRenderingContext2D) {  //Context 2d
        if (this.points.length > 0) {
            context.beginPath();
            context.moveTo(this.points[0].x, this.points[0].y);
            for (const point of this.points) {
                context.lineTo(point.x, point.y);
              }
            context.stroke();
            context.closePath();
        }
    }
}

//LISTENERS    Forgot to ref: https://developer.mozilla.org/en-US/docs/Web/API/Element/mousemove_event
// Add the event listeners for mousedown, mousemove, and mouseup
canvas.addEventListener("mousedown", (e) => {
    x = e.offsetX;
    y = e.offsetY;
    isDrawing = true;
//Add the current coordinates to the array and set up future lines
    Line = new MarkerLine({x, y});
    History.push(Line);
    RedoSystem = [];  //Clear the future lines otherwise, redo onto non existent lines
    canvas.dispatchEvent(new Event("drawing-changed")); // DRAWING CHANGED FLAG
});

canvas.addEventListener("mousemove", (e) => {
    if (isDrawing) {
        x = e.offsetX;
        y = e.offsetY;
        Line.drag(x,y);
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

//Dwagin Chnaged flag should add, clear the canvas, and add the current
canvas.addEventListener("drawing-changed", () => {  // DRAWING CHANGED LISTENER
    context.clearRect(0, 0, canvas.width, canvas.height);
    History.forEach((stroke) => {
        stroke.display(context);   //The display method uses the CanvasRenderingContext2D
    });    
    if (Line) {
        Line.display(context);
    }
  });



//DRAWING  LEGACY - Do not need
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
    if (History.length!) { //Remove the previous line from the history and added to the potential of the Redu array. Same principle now with objects
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