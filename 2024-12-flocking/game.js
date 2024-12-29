let evaders = [];
let points = 0;

const spawnLimit = 200;

let evaderVelocityFactor = 4.5;
let evaderAccelerationFactor = .20;
let evaderDetectionRange = 200;
let panicSpeedMultiplier = 1;

let alignmentStrength = .01;
let cohesionStrength = 0;
let separationStrength = 1;

let velocitySlider, accelerationSlider, detectionSlider, alignmentSlider, cohesionSlider, separationSlider;
let sliderOffset = {x: 200, y: 5};

function setup() {
    createCanvas(windowWidth, windowHeight);
    mouseX = windowWidth/2;
    mouseY = windowHeight/2;

    velocitySlider = createSlider(2, 20, 4.5, .5);
    velocitySlider.position(sliderOffset.x + 20, sliderOffset.y + 30);
    velocitySlider.size(165);

    accelerationSlider = createSlider(0.0, 2, .2, .05);
    accelerationSlider.position(sliderOffset.x + 230, sliderOffset.y + 30);
    accelerationSlider.size(165);

    detectionSlider = createSlider(0, 800, 200, 50);
    detectionSlider.position(sliderOffset.x + 440, sliderOffset.y + 30);
    detectionSlider.size(165);
    
    alignmentSlider = createSlider(0, 1, .01, .01);
    alignmentSlider.position(sliderOffset.x + 650, sliderOffset.y + 30);
    alignmentSlider.size(165);
    
    cohesionSlider = createSlider(0, 1, 0, .01);
    cohesionSlider.position(sliderOffset.x + 860, sliderOffset.y + 30);
    cohesionSlider.size(165);
    
    separationSlider = createSlider(0, 1, 1, .01);
    separationSlider.position(sliderOffset.x + 1070, sliderOffset.y + 30);
    separationSlider.size(165);

        
    // Create some Evaders with random positions and velocity
    // let spawnLimit = Math.min(300, windowHeight * windowWidth / 6000 + 50)
    for (let i = 0; i < spawnLimit; i++) {
        let randomPos = createVector(random(width), random(height));
        let randomVel = p5.Vector.random2D().setMag(evaderVelocityFactor);
        evaders.push(new Evader(randomPos, randomVel));
    }
    
    // Display font
    textFont('JetBrains Mono', 20);
}

function draw() {
    background("#0D0A08");
    frameRate(60);
    
    // Get slider values
    evaderVelocityFactor = velocitySlider.value();
    evaderAccelerationFactor = accelerationSlider.value();
    evaderDetectionRange = detectionSlider.value();
    alignmentStrength = alignmentSlider.value();
    cohesionStrength = cohesionSlider.value();
    separationStrength = separationSlider.value();

    // Display slider values
    fill(255);
    noStroke();
    textSize(14);
    text(`Boid Velocity: ${evaderVelocityFactor}`, sliderOffset.x + 21, sliderOffset.y + 25);
    text(`Boid Acceleration: ${evaderAccelerationFactor}`, sliderOffset.x + 231, sliderOffset.y + 25);
    text(`Detection Radius: ${evaderDetectionRange}`, sliderOffset.x + 441, sliderOffset.y + 25);
    text(`Boid Alignment: ${alignmentStrength}`, sliderOffset.x + 651, sliderOffset.y + 25);
    text(`Boid Cohesion: ${cohesionStrength}`, sliderOffset.x + 861, sliderOffset.y + 25);
    text(`Boid Seperation: ${separationStrength}`, sliderOffset.x + 1071, sliderOffset.y + 25);

    // Movement
    strokeWeight(1);
    flock();
    randomSteering();

    for (let evader of evaders) {
        evader.update();
        evader.display();
    }
}

function flock() {
    if (evaderDetectionRange <= 0) {
        return;
    }

    for (let i = evaders.length - 1; i >= 0; i--) {
        let evader = evaders[i];
        let alignment = createVector();
        let cohesion = createVector();
        let separation = createVector();
        let neighbors = evader.checkNeighbors(evaders);
        let totalNeighbors = Math.min(neighbors.length, 20); // limit for better computation (messes up separation at high detection, but it's okay)

        for (let j = 0; j < totalNeighbors; j++) {
            let neighbor = neighbors[j].entity;
            // Add alignment
            if (alignmentStrength > 0)
                alignment.add(neighbor.vel);

            // Add cohesion
            if (cohesionStrength > 0)
                cohesion.add(neighbor.pos);

            // Add separation
            if (separationStrength > 0 && neighbors[j].distance < evaderDetectionRange) {
                let diff = p5.Vector.sub(evader.pos, neighbor.pos);
                diff.setMag((evaderDetectionRange - neighbors[j].distance) / evaderDetectionRange);
                separation.add(diff);
            }
        }

        // Apply forces
        if (totalNeighbors > 0) {
            // Alignment
            if (alignmentStrength > 0) {
                alignment.div(totalNeighbors);
                alignment.setMag(alignmentStrength);
            }
    
            // Cohesion
            if (cohesionStrength > 0) {
                cohesion.div(totalNeighbors);
                cohesion.sub(evader.pos);
                cohesion.setMag(cohesionStrength);
            }
    
            // Separation
            if (separationStrength > 0) {
                separation.div(totalNeighbors);
                cohesion.setMag(cohesionStrength);
            }

            // Apply forces
            let totalForces = createVector();
            totalForces.add(alignment).add(cohesion).add(separation);
            totalForces.div(3);
            evader.vel.add(totalForces.setMag(evaderAccelerationFactor * 2));
            
            evader.vel.limit(evaderVelocityFactor);
        }


    }
}

function mouseSteering() {
    // Evader steering away from mouse
    let mousePos = createVector(mouseX, mouseY);
    for (let i = evaders.length - 1; i >= 0; i--) {
        // Calculate direction of nearest mousePos
        let evader = evaders[i];
        let result = evader.getMousePos(mousePos);
        let dirVec = p5.Vector.sub(evader.pos, result.pos).normalize();

        // let dirPos = p5.Vector.add(evader.pos, p5.Vector.mult(dirVec, 50));
        // stroke(0, 50, 50);
        // line(evader.pos.x, evader.pos.y, dirPos.x, dirPos.y);

        if (result.distance > evaderDetectionRange) {
            // Random steering
            evader.vel.add(p5.Vector.random2D().setMag(evaderAccelerationFactor / 2));
            evader.panic = false;
        } else {
            // Steer away from mouse
            evader.vel.add(dirVec.setMag(evaderAccelerationFactor));
            evader.panic = true;
            evader.panicFac = (evaderDetectionRange - result.distance)/evaderDetectionRange;
        }

        evader.vel.limit(evaderVelocityFactor);
    }
}

function randomSteering() {
    for (let i = evaders.length - 1; i >= 0; i--) {
        let evader = evaders[i];
        evader.vel.add(p5.Vector.random2D().setMag(evaderAccelerationFactor / 2));
        evader.vel.setMag(evaderVelocityFactor);
    }
}

// Degree Difference between two vectors
// Positive for clockwise, negative for counterclockwise
function degreeDifference(vecA, vecB) {
    angleMode(DEGREES);
  
    return vecA.angleBetween(vecB);
}

function getWrappedPositions(pos, borderDetection) {
    let positions = [];

    // Get wrapped on x
    if (pos.x > windowWidth - borderDetection) {
        positions.push(createVector(pos.x - windowWidth, pos.y));
        
        // Get wrapped of wrapped-x on y
        if (positions[0].y > windowHeight - borderDetection) {
            positions.push(createVector(positions[0].x, positions[0].y - windowHeight));
        } else if (positions[0].y < borderDetection) {
            positions.push(createVector(positions[0].x, positions[0].y + windowHeight));
        }
    } else if (pos.x < borderDetection) {
        positions.push(createVector(pos.x - windowWidth, pos.y));
        
        // Get wrapped of wrapped-x on y
        if (positions[0].y > windowHeight - borderDetection) {
            positions.push(createVector(positions[0].x, positions[0].y - windowHeight));
        } else if (positions[0].y < borderDetection) {
            positions.push(createVector(positions[0].x, positions[0].y + windowHeight));
        }
    }

    // Get wrapped on y
    if (pos.y > windowHeight - borderDetection) {
        positions.push(createVector(pos.x, pos.y - windowHeight));
    } else if (pos.y < borderDetection) {
        positions.push(createVector(pos.x, pos.y + windowHeight));
    }

    return positions;
}