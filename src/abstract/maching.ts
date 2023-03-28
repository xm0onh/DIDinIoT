/* 

Way: 

    The EV sent its hash through API.
    This script will get the credential from the database.
    Then, it will verify the credential.
    If the credential is valid, it will return the nearest EVSP's credential.
    Also, the EVSP will sent a proof that it has enough capacity to charge the EV.
    The EV will verify the proof.

*/

interface Location {
  latitude: number;
  longitude: number;
}

interface EVSP {
  id: string;
  name: string;
  location: Location;
  batteryCapacity: number;
  chargingSpeed: number;
  price: number;
  waitingTime: number;
}

interface EV {
  id: string;
  type: string;
  make: string;
  model: string;
  year: string;
  battery: string;
  range: string;
  color: string;
  vin: string;
  licensePlate: string;
  location: Location;
  batteryCapacity: number;
  chargingSpeed: number;
  price: number;
  waitingTime: number;
}
let priority = {
  distance: 1,
  batteryCapacity: 1,
  chargingSpeed: 1,
  price: 1,
  waitingTime: 1,
};

let price = {
  ev: 0.5,
  evsp: 1.5,
};

let waitingTime = {
  ev: 30,
  evsp: 30,
};
class WeightedGraph {
  adjacencyList: {};
  constructor() {
    this.adjacencyList = {};
  }

  addVertex(vertex) {
    if (!this.adjacencyList[vertex]) {
      this.adjacencyList[vertex] = [];
    }
  }

  addEdge(vertex1, vertex2, weight) {
    this.adjacencyList[vertex1].push({ node: vertex2, weight });
    this.adjacencyList[vertex2].push({ node: vertex1, weight });
  }
}

function calculateDistance(location1, location2) {
  const R = 6371; // Radius of the Earth in km
  const lat1 = location1.latitude * (Math.PI / 180);
  const lon1 = location1.longitude * (Math.PI / 180);
  const lat2 = location2.latitude * (Math.PI / 180);
  const lon2 = location2.longitude * (Math.PI / 180);

  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in km
}

function generateWeightedGraph(evs, evsps, priority) {
  const graph = new WeightedGraph();

  // Add vertices to the graph
  evs.forEach((ev) => graph.addVertex(ev.name));
  evsps.forEach((evsp) => graph.addVertex(evsp.name));

  // Add edges with calculated weights
  evs.forEach((ev) => {
    evsps.forEach((evsp) => {
      const distance = calculateDistance(ev.location, evsp.location);
      const weight =
        priority.distance * distance +
        priority.batteryCapacity *
          Math.abs(ev.batteryCapacity - evsp.batteryCapacity) +
        priority.chargingSpeed *
          Math.abs(ev.chargingSpeed - evsp.chargingSpeed) +
        priority.price * Math.abs(price.ev - price.evsp) +
        priority.waitingTime * Math.abs(waitingTime.ev - waitingTime.evsp);

      graph.addEdge(ev.name, evsp.name, weight);
    });
  });

  return graph;
}

// const graph = generateWeightedGraph(evs, evsps, priority);

function findBestMatchingEVSP(graph, evId) {
  const connectedEVSPs = graph.adjacencyList[evId];
  if (!connectedEVSPs || connectedEVSPs.length === 0) {
    return null;
  }

  return connectedEVSPs.reduce((bestEVSP, currentEVSP) => {
    if (currentEVSP.weight < bestEVSP.weight) {
      return currentEVSP;
    } else {
      return bestEVSP;
    }
  });
}

// Example usage

const evsps = [
  {
    id: "evsp1",
    // ... other attributes
    location: { latitude: 40.7306, longitude: -73.9352 },
    batteryCapacity: 50,
    chargingSpeed: 120,
    price: 25000,
    waitingTime: 10,
  },
];

function setPriority(newPriority) {
  priority.distance = newPriority.distance;
  priority.batteryCapacity = newPriority.batteryCapacity;
  priority.chargingSpeed = newPriority.chargingSpeed;
  priority.price = newPriority.price;
  priority.waitingTime = newPriority.waitingTime;
}

function SetEVPriceTime(NewPrice, NewTime) {
  price.ev = NewPrice.ev;
  waitingTime.ev = NewTime.ev;
}

function SetEVSPPriceTime(price, time) {
  price.evsp = price;
  waitingTime.evsp = time;
}

// const bestEVSPForEV1 = findBestMatchingEVSP(graph, "ev1");

// console.log(graph.adjacencyList);
// console.log(
//   `The best EVSP for EV1 is ${bestEVSPForEV1.node} with a weight of ${bestEVSPForEV1.weight}`
// );

export {
  findBestMatchingEVSP,
  setPriority,
  generateWeightedGraph,
  SetEVPriceTime,
  SetEVSPPriceTime,
  priority,
};
