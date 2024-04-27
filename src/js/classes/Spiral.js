export default class Spiral {

    constructor(p, x, y, scale = true) {
        this.p = p;
        this.x = x;
        this.y = y;
        this.stroke = this.p.color(
            this.p.random(0, 360),
            this.p.random(50, 100),
            100
        );
        this.theta = [];
        this.dir = [];
        this.r = [];
        this.rdir = [];
        this.c = [];
        this.n = 200;
        this.maxThetaMultiplier = this.p.random([0.5, 1, 2, 4]);
        // this.thetaDirectionDivisor = 2;
        this.thetaDirectionDivisor = this.p.random([200, 100, 50, 25]);
        // this.thetaDirectionDivisor = 100;
        this.strokeWeight = p.random([4, 6, 8]);
        // this.strokeWeight = 4;
        this.scale = scale;
        this.setup();
    }

    setup () {
        for (let i = 0; i < this.n; i++) {
            this.theta.push(
                this.p.random(0, this.maxThetaMultiplier * this.p.PI)
            )
            this.dir.push(1)
            this.r.push(this.p.random(32, 256))
            this.rdir.push(1)
            this.c.push(this.p.createVector(this.p.width / 8, this.p.height / 8))
        }
    }

    update () {

    }

    draw () {
        this.p.strokeWeight(this.strokeWeight)
        this.p.stroke(this.stroke)
        if(this.scale) {
            this.p.scale(0.5);
        }
        for (let i = 0; i < this.n; i++) {
            this.theta[i] = this.theta[i] + this.p.PI / this.thetaDirectionDivisor * this.dir[i]
            this.rdir[i] = this.checkr(this.rdir[i], this.r[i])
            this.r[i] = this.r[i] + this.rdir[i]
            let x = this.c[i].x + this.r[i] * this.p.cos(this.theta[i])
            let y = this.c[i].y + this.r[i] * this.p.sin(this.theta[i])
            this.p.point(x, y)
        }
        if(this.scale) {
            this.p.scale(2);
        }
    }

    checkr(rdir, r) {
        if (rdir === 1 && r > 380) {
            rdir = -1
        }
        if (rdir === -1 && r < 0) {
            rdir = 1
        }
        return rdir
    }
}