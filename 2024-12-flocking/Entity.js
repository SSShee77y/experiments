// Entity, Seeker, Evader classes

class Entity {
    constructor(pos, vel, col) {
        this.pos = pos;
        this.vel = vel;
        this.col = col;
        this.size = 20;
        this.panic = false;
        this.panicFac = 0;
        this.neighbors = [];
    }

    display() {
        this.drawTriangle(this.pos, this.vel);
        // stroke(15);
        // noFill();
        // ellipse(this.pos.x, this.pos.y, evaderDetectionRange);
    }

    update() {
        this.pos.add(p5.Vector.mult(this.vel, (this.panic ? Math.max(1, this.panicFac * panicSpeedMultiplier) : 1)));
        this.wrapAround();
    }

    wrapAround() {
        if (this.pos.x > width + this.size) this.pos.x = - this.size;
        if (this.pos.x < 0 - this.size) this.pos.x = width + this.size;
        if (this.pos.y > height + this.size) this.pos.y = - this.size;
        if (this.pos.y < 0 - this.size) this.pos.y = height + this.size;
    }

    // Draw an isosceles triangle for the entity
    drawTriangle(pos, vel) {
        const dir = p5.Vector.normalize(vel).setMag(this.size);
        const pos1 = p5.Vector.add(dir, pos);
        const pos2 = p5.Vector.add(p5.Vector.rotate(dir, -PI/4*3), pos);
        const pos3 = p5.Vector.add(p5.Vector.rotate(dir, PI/4*3), pos);

        let angleDegrees = Math.atan2(dir.x, dir.y) * (180 / Math.PI);

        colorMode(HSB);
        stroke(Math.abs(angleDegrees) / 1.5, 70, 100);
        noFill();
        triangle(pos1.x, pos1.y, pos2.x, pos2.y, pos3.x, pos3.y)
        // line(pos.x, pos.y, v1.x, v1.y);
    }

    getMousePos(pos) {
        let minDistance = Infinity;
        let closestPosition = null;

        if (pos == 0) {
            return null;
        }
    
        // Get every possible position + wraparounds
        const positions = getWrappedPositions(pos, evaderDetectionRange/2);
        positions.push(createVector(pos.x, pos.y));
        
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

    checkNeighbors(entities) {
        this.neighbors = []; // Reset neighbors each frame
    
        for (let other of entities) {
            if (other !== this) {
                let distance = this.pos.dist(other.pos);
            
                if (distance < evaderDetectionRange) {
                    this.neighbors.push({entity: other, distance: distance});
                }
            }
        }

        return this.neighbors;
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