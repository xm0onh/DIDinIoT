import { agent } from "../veramo/setup.js";
import { getAllEVSPVCs } from "../abstract/abstract.js";
import {
  generateWeightedGraph,
  setPriority,
  findBestMatchingEVSP,
  SetEVPriceTime,
} from "../abstract/maching.js";

// Sample data:
const evs = [
  {
    name: "Vehicle 1",
    owner: true,
    type: "ElectricVehicle",
    brand: "Tesla",
    range: "402 miles",
    color: "blue",
    model: "Model S",
    year: "2022",
    VIN: "5YJSA1E11MF413982",
    batteryCapacity: 75,
    chargingRate: 150,
    currentCharge: 70,
    chargingSpeed: 100,
    location: { latitude: 37.7749, longitude: -122.4194 },
  },
];

async function finder(EV, priority, price, time) {
  setPriority(priority);
  SetEVPriceTime(price, time);
  const EVSP_DID = await agent.didManagerGetByAlias({ alias: "EVSP" });
  const VCs = await getAllEVSPVCs(EVSP_DID.did);
  let temp = [];
  VCs.map((vc) => {
    temp = [...temp, JSON.parse(vc.raw)];
  });

  for (let i = 0; i < temp.length; i++) {
    temp[i] = temp[i].credentialSubject;
  }

  const graph = generateWeightedGraph(EV, temp, priority);
  //   console.log("HH", findBestMatchingEVSP(graph, EV[0].name));
  return findBestMatchingEVSP(graph, EV[0].name);
}

export { finder };
