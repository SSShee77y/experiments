let evaders = [];
let points = 0;

let evaderVelocityFactor = 4.5;
let evaderVelocityVariance = 0.4;
let evaderSteeringFactor = 3;
let evaderDetectionRange = 100;

function setup() {

    let homeDiv = document.getElementById("home");

    createCanvas(windowWidth, windowHeight);

    evaderVelocityFactor = width/1000 + 3;
    evaderDetectionRange = Math.min(500, width * height / 11000 + 100);
        
    // Create some Evaders with random positions and velocity
    let spawnLimit = 1000;
    for (let i = 0; i < spawnLimit; i++) {
        let randomPos = {x: random(width), y: random(height)};
        let randomVel = vecMul(randomUnitVector(),
                            random(evaderVelocityFactor - evaderVelocityVariance,
                            evaderVelocityFactor + evaderVelocityVariance));
        evaders.push(new Evader(randomPos, randomVel));
    }
    
    // Display font
    textFont('JetBrains Mono', 20);
}

function draw() {
    background("#0D0A08");
    frameRate(60);

    steering();

    strokeWeight(1);

    for (let evader of evaders) {
        evader.update();
        evader.display();
    }

    // Darkness
    // strokeWeight(0);
    // fill(13, 10, 8, 90);
    // rect(0, 0, width, height);
    
    // Light at pointer
    // let radius = evaderDetectionRange + 120;
    // for (let r = radius; r > 0; r -= evaderDetectionRange / radius * 20) {
    //     fill(150, 150, 150, 3);
    //     ellipse(mouseX, mouseY, r, r);
    // }

}

function steering() {
    // Evader steering and collision
    let mousePos = {x: mouseX, y: mouseY};
    for (let i = evaders.length - 1; i >= 0; i--) {
        // Calculate direction of nearest mousePos
        let evader = evaders[i];
        let result = evader.getMousePos(mousePos);
        let dirVec = vecAdd(evader.pos, vecNeg(result.pos));

        if (result.distance > evaderDetectionRange) {
            // Random steering
            evader.vel = rotateVector(evader.vel, random(-evaderSteeringFactor, evaderSteeringFactor));
            evader.panic = false;
        } else {
            // Calculate degree difference -> steering direction
            let diff = degreeDifference(evader.vel, dirVec);
            let steering = Math.max(Math.min(diff, evaderSteeringFactor), -evaderSteeringFactor);
    
            // Steer away from mouse
            evader.vel = rotateVector(evader.vel, steering);
            evader.panic = true;
            evader.panicFac = (evaderDetectionRange - result.distance)/evaderDetectionRange;
        }
    }

}

//
// Vector Functions
//

// Vector Math

function vecAdd(vecA, vecB) {
    return {x: vecA.x + vecB.x, y: vecA.y + vecB.y};
}

function vecNeg(vec) {
    return {x: -vec.x, y: -vec.y};
}

function vecMul(vec, scalar) {
    return {x: vec.x * scalar, y: vec.y * scalar};
}

function vecMag(vec) {
    return Math.sqrt(vec.x * vec.x + vec.y * vec.y);
}

// Degree Difference between two vectors
// Positive for clockwise, negative for counterclockwise
function degreeDifference(vecA, vecB) {
    // Calculate dot product and cross product
    const dot = vecA.x * vecB.x + vecA.y * vecB.y;
    const cross = vecA.x * vecB.y - vecA.y * vecB.x;
  
    // Find angle in radians, then convert to degrees
    const angleInRadians = Math.atan2(cross, dot);
    const angleInDegrees = angleInRadians * (180 / Math.PI);
  
    return angleInDegrees;
}

// Rotate a vector by the given degrees
function rotateVector(vec, degrees) {
    const radians = degrees * (Math.PI / 180);
    const cosTheta = Math.cos(radians);
    const sinTheta = Math.sin(radians);
    
    return {
      x: vec.x * cosTheta - vec.y * sinTheta,
      y: vec.x * sinTheta + vec.y * cosTheta
    };
}

// Generates a random unit vector
function randomUnitVector() {
    const angle = Math.random() * 2 * Math.PI;
    return {
      x: Math.cos(angle),
      y: Math.sin(angle)
    };
}
