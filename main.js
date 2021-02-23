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

// Inputs
let keys = {};
let mouse = { lastDown: false, currDown: false, lastX: 0.0, lastY: 0.0, currX: 0.0, currY: 0.0, dx: 0.0, dy: 0.0 };

let renderer;
let game;

class Vector2
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }

    normalize()
    {
        const len = this.getLength();

        this.x /= len;
        this.y /= len;
    }

    normalized()
    {
        const len = this.getLength();

        return new Vector2(this.x / len, this.y / len);
    }

    getLength()
    {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    dot(v)
    {
        return this.x * v.x + this.y * v.y;
    }

    cross(v)
    {
        return this.y * v.x - this.x * v.y;
    }

    add(v)
    {
        return new Vector2(this.x + v.x, this.y + v.y);
    }

    sub(v)
    {
        return new Vector2(this.x - v.x, this.y - v.y);
    }

    div(v)
    {
        return new Vector2(this.x / v, this.y / v);
    }

    mul(v)
    {
        return new Vector2(this.x * v, this.y * v);
    }

    equals(v)
    {
        return this.x == v.x && this.y == v.y;
    }
}

class Stick
{
    constructor(head, tail, length)
    {
        this.head = head;
        this.tail = tail;

        if (length == undefined)
        {
            this.length = head.sub(tail).getLength();
        }
        else
        {
            this.length = length;
            this.march(head);
        }
    }

    march(target, tail = false)
    {
        let dir = this.tail.sub(target).normalized();
        if (tail) dir = this.head.sub(target).normalized();

        if (dir.getLength() == 0) return;

        if (tail)
        {
            this.tail = target;
            this.head = this.tail.add(dir.mul(this.length));
        }
        else
        {
            this.head = target;
            this.tail = this.head.add(dir.mul(this.length));
        }
    }

    render(r, tailFilled = false)
    {
        r.drawCircle(this.head.x, this.head.y, 5, false, true);
        r.drawCircle(this.tail.x, this.tail.y, 5, tailFilled, true);
        r.drawLine(this.head.x, this.head.y, this.tail.x, this.tail.y, 1);
    }
}

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

    drawText(x, y, content, fontSize = 15)
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
        this.chain = [];
        this.fixedPoint = new Vector2(100, 100);
        this.operate = true;

        const stride = 20;

        for (let i = 0; i < 30; i++)
        {
            this.chain.push(new Stick(new Vector2(100 + (i + 1) * stride, 100), new Vector2(100 + i * stride, 100)));
        }

        this.destination = this.chain[this.chain.length - 1].head;
        this.target = this.destination;
    }

    update(delta)
    {
        const mousePos = new Vector2(mouse.currX, mouse.currY);

        // When Mouse Down
        if (!mouse.lastDown && mouse.currDown)
        {
            if (this.fixedPoint != undefined)
            {
                if (mousePos.sub(this.fixedPoint).getLength() < 30)
                {
                    this.fixedPoint = undefined;
                    this.operate = false;
                }
            }
            else 
            {
                if (mousePos.sub(this.chain[0].tail).getLength() < 30)
                {
                    this.fixedPoint = this.chain[0].tail;
                    this.operate = false;
                }
            }
        }
        // When Mouse UP
        if (mouse.lastDown && !mouse.currDown) this.operate = true;

        if (this.operate)
        {
            if (mouse.currDown) this.destination = mousePos;

            const ratio = 1 / fps * 2;
            this.target = this.target.mul(1 - ratio).add(this.destination.mul(ratio));

            this.chain[this.chain.length - 1].march(this.target);

            // March each sticks from tip to root (Forward reach)
            for (let i = this.chain.length - 2; i >= 0; i--)
            {
                this.chain[i].march(this.chain[i + 1].tail);
            }

            // If root is fixed, march backward (Backward reach)
            if (this.fixedPoint == undefined) return;

            this.chain[0].march(this.fixedPoint, true);

            for (let i = 1; i < this.chain.length; i++)
            {
                this.chain[i].march(this.chain[i - 1].head, true);
            }
        }
    }

    render()
    {
        for (let i = 1; i < this.chain.length; i++)
        {
            this.chain[i].render(this.r);
        }

        if (this.fixedPoint != undefined)
        {
            this.r.drawText(this.fixedPoint.x - 15, this.fixedPoint.y - 15, "Fixed!", 15);
            this.chain[0].render(this.r, true);
        }
        else
        {
            this.chain[0].render(this.r, false);
        }

        this.r.drawCircle(this.destination.x, this.destination.y, 5, true, true);
    }
}

function update(delta)
{
    game.update(delta);

    mouse.dx = mouse.currX - mouse.lastX;
    mouse.dy = mouse.currY - mouse.lastY;
    mouse.lastX = mouse.currX;
    mouse.lastY = mouse.currY;
    mouse.lastDown = mouse.currDown;
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

        mouse.currDown = true;
    }, false);
    window.addEventListener("mouseup", (e) =>
    {
        if (e.button != 0) return;

        mouse.currDown = false;
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

    let delta = (now - times[times.length - 1]) / 100;

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
    }
    else if (pause)
    {
        gfx.font = "48px verdana";
        gfx.fillText("PAUSE", 4, 40);
    }

    requestAnimationFrame(run);
}

window.onload = start;