'use strict'

let cvs;
let gfx;
let frameCounterElement;

let WIDTH = 800;
let HEIGHT = WIDTH / 4 * 3;

const times = [];
let fps;

let started = false;
let pause = false;

let time;

// Inputs
let keys = {};
let mouse = { down: false, lastX: 0.0, lastY: 0.0, currX: 0.0, currY: 0.0, dx: 0.0, dy: 0.0 };

let renderer;
let game;

class Renderer
{
    constructor(gfx)
    {
        this.gfx = gfx;
    }

    drawRect(x, y, width, height, filled = false, centered = false)
    {
        if (centered)
        {
            x -= width / 2.0;
            y -= height / 2.0;
        }

        gfx.lineWidth = 1;
        gfx.rect(x, y, width, height);

        if (filled)
            gfx.fill();
        else
            gfx.stroke();
    }

    drawCircle(x, y, radius, filled = false, centered = true)
    {
        if (!centered)
        {
            x += radius / 2.0;
            y += radius / 2.0;
        }

        gfx.beginPath();
        gfx.arc(x, y, radius, 0, 2 * Math.PI);

        if (filled)
            gfx.fill();
        else
            gfx.stroke();
    }

    drawLine(x0, y0, x1, y1, lineWidth = 1)
    {
        gfx.lineWidth = lineWidth;
        gfx.beginPath();
        gfx.moveTo(x0, y0);
        gfx.lineTo(x1, y1);
        gfx.stroke();
    }

    drawText(x, y, content, fontSize = 20)
    {
        gfx.font = fontSize + "px verdana";
        gfx.fillText(content, x, y);
    }
}

class Game
{
    constructor(renderer)
    {
        this.r = renderer;
    }

    update(delta)
    {
        // Game Logic Here
    }

    render()
    {
        // Render Code Here

        this.r.drawCircle(100, 100, 10, true);
        this.r.drawRect(100, 100, 40, 40, false, true);

        this.r.drawLine(100, 100, mouse.currX, mouse.currY, Math.dist(100, 100, mouse.currX, mouse.currY) / 50);;
        this.r.drawText(mouse.currX, mouse.currY, "ㅇㅅㅇ");
    }
}

function update(delta)
{
    mouse.dx = mouse.currX - mouse.lastX;
    mouse.dy = mouse.currY - mouse.lastY;
    mouse.lastX = mouse.currX;
    mouse.lastY = mouse.currY;

    game.update(delta);
}

function render()
{
    gfx.clearRect(0, 0, WIDTH, HEIGHT);

    game.render();
}

function start()
{
    init();
    run();
}

function init()
{
    cvs = document.getElementById("canvas");
    gfx = cvs.getContext("2d");
    frameCounterElement = document.getElementById("frame_counter");

    cvs.setAttribute("width", WIDTH + "px");
    cvs.setAttribute("height", HEIGHT + "px");

    cvs.addEventListener("mousedown", (e) =>
    {
        if (e.button != 0) return;

        mouse.down = true;
    }, false);
    window.addEventListener("mouseup", (e) =>
    {
        if (e.button != 0) return;

        mouse.down = false;
    }, false);
    window.addEventListener("keydown", (e) =>
    {
        if (e.key == "Escape") pause = !pause;

        if (e.key == "w" || e.key == "ArrowUp") keys.up = true;
        if (e.key == "a" || e.key == "ArrowLeft") keys.left = true;
        if (e.key == "s" || e.key == "ArrowDown") keys.down = true;
        if (e.key == "d" || e.key == "ArrowRight") keys.right = true;
        if (e.key == " ") keys.space = true;
        if (e.key == "c") keys.c = true;
        if (e.key == "q") keys.q = true;
        if (e.key == "e") keys.e = true;
        if (e.key == "Shift") keys.shift = true;
    });
    window.addEventListener("keyup", (e) =>
    {
        if (e.key == "w" || e.key == "ArrowUp") keys.up = false;
        if (e.key == "a" || e.key == "ArrowLeft") keys.left = false;
        if (e.key == "s" || e.key == "ArrowDown") keys.down = false;
        if (e.key == "d" || e.key == "ArrowRight") keys.right = false;
        if (e.key == " ") keys.space = false;
        if (e.key == "c") keys.c = false;
        if (e.key == "q") keys.q = false;
        if (e.key == "e") keys.e = false;
        if (e.key == "Shift") keys.shift = false;
    });
    window.addEventListener("mousemove", (e) =>
    {
        let rect = canvas.getBoundingClientRect();

        mouse.currX = Math.trunc(e.clientX - rect.left);
        mouse.currY = Math.trunc(e.clientY - rect.top);
    });

    Math.dist = function (x0, y0, x1, y1)
    {
        return Math.sqrt((x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1));
    }

    renderer = new Renderer(gfx);
    game = new Game(renderer);
}

function run()
{
    const now = performance.now();
    while (times.length > 0 && times[0] <= now - 1000) times.shift();

    let delta = (now - times[times.length - 1]) / 1000.0;
    // console.log("frame time:", delta * 1000.0);

    time = now / 1000.0;

    times.push(now);
    fps = times.length;
    frameCounterElement.innerHTML = fps + "fps";

    if (!started)
    {
        started = true;
    }

    if (started && !pause)
    {
        update(delta);
        render();

        console.log(time);
    }
    else if (pause)
    {
        gfx.font = "48px verdana";
        gfx.fillText("PAUSE", 4, 40);
    }

    requestAnimationFrame(run);
}

window.onload = start;