// Entity, Seeker, Evader classes

class Entity {
    constructor(pos, vel, col) {
        this.pos = pos;
        this.vel = vel;
        this.col = col;
        this.size = 20;
        this.panic = false;
        this.panicFac = 0;
    }

    display() {
        this.drawTriangle(this.pos, this.vel);
        // stroke(110);
        // noFill();
        // ellipse(this.pos.x, this.pos.y, evaderDetectionRange);
    }

    update() {
        // this.pos = vecAdd(this.pos, vecMul(this.vel, (this.panic ? 1 + this.panicFac : 1)));
        // this.wrapAround();
    }

    wrapAround() {
        if (this.pos.x > width + this.size) this.pos.x = - this.size;
        if (this.pos.x < 0 - this.size) this.pos.x = width + this.size;
        if (this.pos.y > height + this.size) this.pos.y = - this.size;
        if (this.pos.y < 0 - this.size) this.pos.y = height + this.size;
    }

    // Draw an isosceles triangle for the entity
    drawTriangle(pos, vel) {
        const velMag = vecMag(vel);
        const dir = vecMul(vel, this.size/velMag);
        const v1 = vecAdd(pos, dir);
        const v2 = vecAdd({x: pos.x - dir.y * 0.65, y: pos.y + dir.x * 0.65}, vecNeg(vecMul(dir, 0.7)));
        const v3 = vecAdd({x: pos.x + dir.y * 0.65, y: pos.y - dir.x * 0.65}, vecNeg(vecMul(dir, 0.7)));

        let angleDegrees = Math.atan2(dir.y, dir.x) * (180 / Math.PI);
        // if (angleDegrees < 0) angleDegrees += 360;

        colorMode(HSB);
        stroke(Math.abs(angleDegrees) / 1.8, 70, 100);
        noFill();
        triangle(v1.x, v1.y, v2.x, v2.y, v3.x, v3.y);
        // line(pos.x, pos.y, v1.x, v1.y);
    }

    getMousePos(pos) {
        let minDistance = Infinity;
        let closestPosition = null;

        if (pos == 0) {
            return null;
        }
    
        // Get every possible position + wraparounds, so 9 total.
        const positions = [
            createVector(pos.x, pos.y), // Original position
            createVector(pos.x - windowWidth, pos.y), // Left wrap
            createVector(pos.x + windowWidth, pos.y), // Right wrap
            createVector(pos.x, pos.y - windowHeight), // Top wrap
            createVector(pos.x, pos.y + windowHeight), // Bottom wrap
            createVector(pos.x - windowWidth, pos.y - windowHeight), // Top-left wrap
            createVector(pos.x + windowWidth, pos.y - windowHeight), // Top-right wrap
            createVector(pos.x - windowWidth, pos.y + windowHeight), // Bottom-left wrap
            createVector(pos.x + windowWidth, pos.y + windowHeight) // Bottom-right wrap
        ];
    
        // Check the shortest distance to any wrapped position
        for (const pos of positions) {
            const distance = dist(this.pos.x, this.pos.y, pos.x, pos.y);
            if (distance < minDistance) {
                minDistance = distance;
                closestPosition = pos;
            }
        }
    
        return {pos: closestPosition, distance: minDistance};
    }
}

class Chaser extends Entity {
    constructor(pos, vel) {
        super(pos, vel, color("#00efff"));
    }
}

class Evader extends Entity {
    constructor(pos, vel) {
        super(pos, vel, color(230));
    }
}