var cities = [];
var particles = [];
var globalBest = [];
// const explorationFactor = 0.1;


function getGlobalBest() {
  return globalBest;
}

function updateGlobalBest() {
  let tourBestSolution = particles[0].getPosition().slice();
  let tourDist = particles[0].calculateTourDistance(tourBestSolution);

  for (const particle of particles) {
    const particleDistance = particle.calculateTourDistance(
      particle.getPosition()
    );

    if(particleDistance < tourDist){
      tourDist = particleDistance;
      tourBestSolution = particle.getPosition().slice();
    }

    const globalBestDistance = particle.calculateTourDistance(globalBest);
    if (particleDistance < globalBestDistance) {
      globalBest = particle.getPosition().slice();
    }
  }
  return tourBestSolution;
}

function setup() {
  //console.log(cities_array);
  createCanvas(300, 600);

  // Make random cities
  for (var i = 0; i < cities_array.length; i++) {
    var v = createVector(cities_array[i].x, cities_array[i].y);
    cities[i] = v;
  }

  const graph = new Graph();
  const numParticles = 300; // Number of particles in the swarm
  // const maxIterations = 5000; // Maximum iterations for PSO

  var g = graph;
  particles = Array.from(
    { length: numParticles },
    () => new Particle(graph)
  );
  globalBest = particles[0].getPosition();


}

function draw() {
  for (const particle of particles) {
    particle.updatePersonalBest();
  }

  tourBestSolution = updateGlobalBest();
  globalBestSolution = globalBest;

  for (const particle of particles) {
    particle.updateVelocity(globalBest);
    particle.updatePosition();
  }

  background(0);

  let s = "Particle Swarm Optimization\n";
  fill(255);
  text(s, 10, 10, 250, 50); // Text wraps within text box

  // Draw the current solution (particle position)
  translate(0, 50);
  show(tourBestSolution);

  line(0, height / 2, width, height / 2);

  // Draw the global best solution found by PSO algorithm
  translate(0, height / 2 + 5);
  show(globalBestSolution);
  
}

show = function (solution) {
  stroke(255);
  strokeWeight(2);
  noFill();
  beginShape();
  for (let i = 0; i < solution.length; i++) {
    vertex(solution[i].x, solution[i].y);
  }
  endShape(CLOSE);

  // Draw cities
  fill(255, 0, 0);
  noStroke();
  for (let i = 0; i < solution.length; i++) {
    ellipse(solution[i].x, solution[i].y, 16, 16);
  }
};
