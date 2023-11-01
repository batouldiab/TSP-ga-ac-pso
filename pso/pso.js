var Graph = (function () {
  function Graph() {
    this.cities = [];
    this.edges = {};
    for (var i = 0; i < cities_array.length; i++) {
      var city = {};
      var w = cities_array[i].x;
      var h = cities_array[i].y;

      
      var cities = this.getCities();
      for (var cityIndex in cities) {
        var difference = 0;

        difference += Math.abs(cities[cityIndex].getX() - w);
        difference += Math.abs(cities[cityIndex].getY() - h);
      }

      this.addCity(w, h);
      this.createEdges();
    }
  }

  Graph.prototype.getEdges = function () {
    return this.edges;
  };
  Graph.prototype.getEdgeCount = function () {
    return Object.keys(this.edges).length;
  };

  Graph.prototype.getCity = function (cityIndex) {
    return this.cities[cityIndex];
  };

  Graph.prototype.getCities = function () {
    return this.cities;
  };

  Graph.prototype.size = function () {
    return this.cities.length;
  };

  Graph.prototype.addCity = function (x, y) {
    this.cities.push(new City(x, y));
  };

  Graph.prototype.addEdge = function (cityA, cityB) {
    this.edges[cityA.toString() + "-" + cityB.toString()] = new Edge(
      cityA,
      cityB
    );
  };

  Graph.prototype.getEdge = function (cityA, cityB) {
    if (this.edges[cityA.toString() + "-" + cityB.toString()] != undefined) {
      return this.edges[cityA.toString() + "-" + cityB.toString()];
    }
    if (this.edges[cityB.toString() + "-" + cityA.toString()] != undefined) {
      return this.edges[cityB.toString() + "-" + cityA.toString()];
    }
  };

  Graph.prototype.createEdges = function () {
    this.edges = {};

    for (var cityIndex = 0; cityIndex < this.cities.length; cityIndex++) {
      for (
        var connectionIndex = cityIndex;
        connectionIndex < this.cities.length;
        connectionIndex++
      ) {
        this.addEdge(this.cities[cityIndex], this.cities[connectionIndex]);
      }
    }
  };

  Graph.prototype.resetPheromone = function () {
    for (var edgeIndex in this.edges) {
      this.edges[edgeIndex].resetPheromone();
    }
  };

  Graph.prototype.clear = function () {
    this.cities = [];
    this.edges = {};
  };

  return Graph;
})();

var City = (function () {
  function City(x, y) {
    this.x = x;
    this.y = y;
  }

  City.prototype.getX = function () {
    return this.x;
  };
  City.prototype.getY = function () {
    return this.y;
  };

  City.prototype.toString = function () {
    return this.x + "," + this.y;
  };

  City.prototype.isEqual = function (city) {
    if (this.x == city.x && this.y == city.y) {
      return true;
    }
    return false;
  };

  return City;
})();

var Edge = (function () {
  function Edge(cityA, cityB) {
    this.cityA = cityA;
    this.cityB = cityB;
    this.initPheromone = 1;
    this.pheromone = this.initPheromone;

    // Calculate edge distance
    var deltaXSq = Math.pow(cityA.getX() - cityB.getX(), 2);
    var deltaYSq = Math.pow(cityA.getY() - cityB.getY(), 2);
    this.distance = Math.sqrt(deltaXSq + deltaYSq);
  }

  Edge.prototype.pointA = function () {
    return { x: this.cityA.getX(), y: this.cityA.getY() };
  };

  Edge.prototype.pointB = function () {
    return { x: this.cityB.getX(), y: this.cityB.getY() };
  };

  Edge.prototype.getPheromone = function () {
    return this.pheromone;
  };

  Edge.prototype.getDistance = function () {
    return this.distance;
  };

  Edge.prototype.contains = function (city) {
    if (this.cityA.getX() == city.getX()) {
      return true;
    }
    if (this.cityB.getX() == city.getX()) {
      return true;
    }
    return false;
  };

  Edge.prototype.setInitialPheromone = function (pheromone) {
    this.initPheromone = pheromone;
  };

  Edge.prototype.setPheromone = function (pheromone) {
    this.pheromone = pheromone;
  };

  Edge.prototype.resetPheromone = function () {
    this.pheromone = this.initPheromone;
  };

  return Edge;
})();

// Particle class for PSO
class Particle {
  constructor(graph) {
    this.graph = graph;
    this.inertiaWeight = 0.5;
    this.position = this.generateRandomTour();
    this.velocity = this.generateRandomTour();
    this.personalBest = this.position.slice();
  }

  generateRandomTour() {
    const cities = this.graph.getCities();
    return cities.slice().sort(() => Math.random() - 0.5);
  }

  getPosition() {
    return this.position;
  }

  getPersonalBest() {
    return this.personalBest;
  }

  updatePersonalBest() {
    const currentDistance = this.calculateTourDistance(this.position);
    const personalBestDistance = this.calculateTourDistance(
      this.personalBest
    );

    if (currentDistance < personalBestDistance) {
      this.personalBest = this.position.slice();
    }
  }

  updateVelocity(globalBest) {
    const c1 = 1.5; // PSO parameter (cognitive component)
    const c2 = 1.5; // PSO parameter (social component)

    for (let i = 0; i < this.velocity.length; i++) {
      const r1 = Math.random();
      const r2 = Math.random();

      const cognitiveComponent =
        c1 * r1 * (this.personalBest.indexOf(this.position[i]) - i);
      const socialComponent =
        c2 * r2 * (globalBest.indexOf(this.position[i]) - i);
      const inertiaComponent = this.inertiaWeight * this.velocity[i];

      this.velocity[i] = inertiaComponent + cognitiveComponent + socialComponent;
    }
  }

  updatePosition() {
    for (let i = 0; i < this.position.length; i++) {
      const newPositionIndex = this.position.indexOf(i) + this.velocity[i];
      const currentPositionIndex = this.position.indexOf(i);

      // Swap cities in the tour based on velocity
      if (newPositionIndex >= 0 && newPositionIndex < this.position.length) {
        this.position[currentPositionIndex] = this.position[newPositionIndex];
        this.position[newPositionIndex] = i;
      }
    }
  }

  calculateTourDistance(tour) {
    let distance = 0;

    for (let i = 0; i < tour.length; i++) {
      const fromCity = tour[i];
      const toCity = i === tour.length - 1 ? tour[0] : tour[i + 1];
      // console.log(fromCity)
      // console.log(toCity)
      const edge = this.graph.getEdge(fromCity, toCity);
      distance += edge.getDistance();
    }

    return distance;
  }
}

// PSO Algorithm for TSP
// class PSOAlgorithm {
//   constructor(graph, numParticles, maxIterations) {
//     this.graph = graph;
//     this.particles = Array.from(
//       { length: numParticles },
//       () => new Particle(graph)
//     );
//     this.globalBest = this.particles[0].getPosition();
//     this.maxIterations = maxIterations;
//   }

//   getGlobalBest() {
//     return this.globalBest;
//   }

//   run() {
//     let iteration = 0;

//     while (iteration < this.maxIterations) {
//       for (const particle of this.particles) {
//         particle.updatePersonalBest();
//       }

//       for(const particle of this.particles){
//         currentSolution = particle.personalBest;
//       }

//       this.updateGlobalBest();
//       globalBestSolution = this.globalBest

//       for (const particle of this.particles) {
//         particle.updateVelocity(this.globalBest);
//         particle.updatePosition();
//       }

//       iteration++;
//     }

//     return this.globalBest;
//   }

//   updateGlobalBest() {
//     for (const particle of this.particles) {
//       const particleDistance = particle.calculateTourDistance(
//         particle.getPosition()
//       );
//       const globalBestDistance = particle.calculateTourDistance(
//         this.globalBest
//       );

//       if (particleDistance < globalBestDistance) {
//         this.globalBest = particle.getPosition().slice();
//       }
//     }
//   }
// }