import "./style.css";

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

// event.offsetX, event.offsetY gives the (x,y) offset from the edge of the canvas.
let isDrawing = false;
let x = 0;
let y = 0;

// Add the event listeners for mousedown, mousemove, and mouseup
canvas.addEventListener("mousedown", (e) => {
    x = e.offsetX;
    y = e.offsetY;
    isDrawing = true;
});

canvas.addEventListener("mousemove", (e) => {
    if (isDrawing) {
        drawLine(context, x, y, e.offsetX, e.offsetY);
        x = e.offsetX;
        y = e.offsetY;
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

function drawLine(context, x1, y1, x2, y2) {
  context.beginPath();
  context.strokeStyle = "black";
  context.lineWidth = 1;
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.closePath();
}

//Clear Button
const Clear = document.createElement("button"); 
Clear.innerHTML = "Clear";
Clear.addEventListener('click', () => {
    console.log('Button clicked!');
    context.clearRect(0, 0, canvas.width, canvas.height);  //Taking inspiration from: https://www.squash.io/tutorial-utilizing-the-mouseeventhandlers-in-typescript/
});
app.appendChild(Clear);