import { Vector2 } from "./vector2.js";
import { Stick } from "./stick.js";
import * as Input from "./input.js";

export class Fabrik
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
        const mousePos = new Vector2(Input.mouse.currX, Input.mouse.currY);

        // When Mouse Down
        if (!Input.mouse.lastDown && Input.mouse.currDown)
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
        if (Input.mouse.lastDown && !Input.mouse.currDown) this.operate = true;

        if (this.operate)
        {
            if (Input.mouse.currDown) this.destination = mousePos;

            const ratio = delta / 1000.0 * 3.0;
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
