let evaders = [];
let points = 0;

let evaderVelocityFactor = 4.5;
let evaderVelocityVariance = 0.4;
let evaderSteeringFactor = 1;

let inversePull = false;
let minimumEntityPullSpeed = .1;
let evaderDetectionRange = 125;
let eventHorizonRadius = 350;

// Set up requirements

let mousePos = null;
let hideStrokes = false;
let hideText = false;

function setup() {
    createCanvas(windowWidth, windowHeight);

    mousePos = createVector(windowWidth/2, windowHeight/2);
        
    // Create some Evaders with random positions and velocity
    let spawnLimit = 300;
    for (let i = 0; i < spawnLimit; i++) {
        let randomPos = createVector(random(width), random(height));
        let randomVel = p5.Vector.random2D().setMag(evaderVelocityFactor);
        evaders.push(new Evader(randomPos, randomVel));
    }
    
    // Display font
    textFont('JetBrains Mono', 20);
}

// On window resize
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    mousePos = createVector(windowWidth/2, windowHeight/2);
}

function draw() {
    background("#141213");
    frameRate(60);

    mouseSteering();

    strokeWeight(1);

    // Display evaders
    for (let evader of evaders) {
        evader.update();
        evader.display();
    }

    // I know there's drop shadow, but I swear this looks better
    if (hideStrokes == false) {
        stroke(80);
        ellipse(mousePos.x, mousePos.y, evaderDetectionRange , evaderDetectionRange );
        stroke(0, 60, 80);
        ellipse(mousePos.x, mousePos.y, eventHorizonRadius * 2, eventHorizonRadius * 2);
        stroke(20);
        ellipse(mousePos.x, mousePos.y, evaderDetectionRange * 4, evaderDetectionRange * 4);
    }

    if (hideText == false) {
        stroke(0);
        textSize(16);
        fill(100);
        text(`[D/F] CoreRadius: ${evaderDetectionRange * 2}p`, 10, 24);
        text(`[H] Hide UI, [J] Hide Circles`, 10, windowHeight-24);
        fill(0, 70, 80);
        text(`[E/R] HorizonRadius: ${eventHorizonRadius}p`, 10, 48);
        fill(160, 70, 80);
        text(`[C/V] BoidVelocity: ${evaderVelocityFactor}ppf`, 10, 72);
        fill(inversePull ? 190 : 0, 50, 100);
        text(`[N] Invert: ${inversePull}`, 10, 96);
    }
}

function keyPressed() {
    if (key === 'N' || key === 'n') {
      inversePull = !inversePull;
    } else if (key === 'r') {
        evaderDetectionRange += 25;
    } else if (key === 'e') {
        evaderDetectionRange = Math.max(0, evaderDetectionRange - 25);
    } else if (key === 'f') {
        eventHorizonRadius += 50;
    } else if (key === 'd') {
        eventHorizonRadius = Math.max(0, eventHorizonRadius - 50);
    } else if (key === 'v') {
        evaderVelocityFactor += 0.5;
    } else if (key === 'c') {
        evaderVelocityFactor = Math.max(1, evaderVelocityFactor - 0.5);
    } else if (key === 'h') {
        hideText = !hideText;
    } else if (key === 'j') {
        hideStrokes = !hideStrokes;
    }
}

function mouseSteering() {
    // Evader steering and collision
    for (let i = evaders.length - 1; i >= 0; i--) {
        // Calculate direction of nearest mousePos
        let evader = evaders[i];
        evader.vel.setMag(evaderVelocityFactor);
        let result = evader.getMousePos(mousePos);
        let dirVec = p5.Vector.sub(evader.pos, result.pos).normalize();
        if (inversePull == true) {
            dirVec.mult(-1);
        }
        
        angleMode(DEGREES);

        if (result.distance > eventHorizonRadius) {
            // Random steering
            evader.vel.rotate(radians(random(-evaderSteeringFactor, evaderSteeringFactor)));
            evader.panic = false;
        } else {
            // Calculate degree difference -> steering direction
            let diff = degreeDifference(evader.vel, dirVec);
            let steering = Math.max(Math.min(diff, evaderSteeringFactor), -evaderSteeringFactor);
    
            // Steer away from mouse
            evader.panic = true;
            evader.panicFac = (evaderDetectionRange - result.distance)/evaderDetectionRange;
            evader.panicFac = Math.max(evader.panicFac, -1 + minimumEntityPullSpeed);
            evader.vel.rotate(radians(evader.panicFac * steering * 6));
        }
    }
}

// Degree Difference between two vectors
// Positive for clockwise, negative for counterclockwise
function degreeDifference(vecA, vecB) {
    angleMode(DEGREES);
  
    return vecA.angleBetween(vecB);
}

// Gets wrapped positions
function getWrappedPositions(pos, borderDetection) {
    let positions = [];

    return positions;
}