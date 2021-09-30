export class Stick
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