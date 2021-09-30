import * as Input from "./input.js";
import { Renderer } from "./renderer.js";
import { Fabrik } from "./fabrik.js";

export class Game
{
    constructor(width, height)
    {
        this.width = width;
        this.height = height;

        this.time = 0;

        this.started = false;
        this.pause = false;
    }

    update(delta)
    {
        this.fabrik.update(delta);

        Input.mouse.dx = Input.mouse.currX - Input.mouse.lastX;
        Input.mouse.dy = Input.mouse.currY - Input.mouse.lastY;
        Input.mouse.lastX = Input.mouse.currX;
        Input.mouse.lastY = Input.mouse.currY;
        Input.mouse.lastDown = Input.mouse.currDown;
    }

    render()
    {
        this.gfx.clearRect(0, 0, this.width, this.height);

        this.fabrik.render();
    }

    start()
    {
        this.init();
        this.run();
    }

    init()
    {
        this.cvs = document.getElementById("canvas");
        this.gfx = this.cvs.getContext("2d");
        this.frameCounterElement = document.getElementById("frame_counter");

        this.cvs.setAttribute("width", this.width + "px");
        this.cvs.setAttribute("height", this.height + "px");

        this.cvs.addEventListener("mousedown", (e) =>
        {
            if (e.button != 0) return;

            Input.mouse.currDown = true;
        }, false);
        window.addEventListener("mouseup", (e) =>
        {
            if (e.button != 0) return;

            Input.mouse.currDown = false;
        }, false);
        window.addEventListener("keydown", (e) =>
        {
            if (e.key == "Escape") this.pause = !this.pause;

            if (e.key == "w" || e.key == "ArrowUp") Input.keys.up = true;
            if (e.key == "a" || e.key == "ArrowLeft") Input.keys.left = true;
            if (e.key == "s" || e.key == "ArrowDown") Input.keys.down = true;
            if (e.key == "d" || e.key == "ArrowRight") Input.keys.right = true;
            if (e.key == " ") Input.keys.space = true;
            if (e.key == "c") Input.keys.c = true;
            if (e.key == "q") Input.keys.q = true;
            if (e.key == "e") Input.keys.e = true;
            if (e.key == "Shift") Input.keys.shift = true;
        });
        window.addEventListener("keyup", (e) =>
        {
            if (e.key == "w" || e.key == "ArrowUp") Input.keys.up = false;
            if (e.key == "a" || e.key == "ArrowLeft") Input.keys.left = false;
            if (e.key == "s" || e.key == "ArrowDown") Input.keys.down = false;
            if (e.key == "d" || e.key == "ArrowRight") Input.keys.right = false;
            if (e.key == " ") Input.keys.space = false;
            if (e.key == "c") Input.keys.c = false;
            if (e.key == "q") Input.keys.q = false;
            if (e.key == "e") Input.keys.e = false;
            if (e.key == "Shift") Input.keys.shift = false;
        });
        window.addEventListener("mousemove", (e) =>
        {
            let rect = canvas.getBoundingClientRect();

            Input.mouse.currX = Math.trunc(e.clientX - rect.left);
            Input.mouse.currY = Math.trunc(e.clientY - rect.top);
        });

        Math.dist = function (x0, y0, x1, y1)
        {
            return Math.sqrt((x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1));
        }

        this.renderer = new Renderer(this.gfx);
        this.fabrik = new Fabrik(this.renderer);
    }

    run(t)
    {
        let delta = t - this.time;
        if (isNaN(delta)) delta = 1;

        this.time = t;
        const fps = Math.round(1000 / delta);

        this.frameCounterElement.innerHTML = fps + "fps";

        if (!this.started)
        {
            this.started = true;
        }
        if (this.started && !this.pause)
        {
            this.update(delta);
            this.render();
        }
        else if (this.pause)
        {
            this.gfx.font = "48px verdana";
            this.gfx.fillText("PAUSE", 4, 40);
        }

        requestAnimationFrame(this.run.bind(this));
    }
}