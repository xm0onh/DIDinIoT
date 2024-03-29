import { agent } from "../veramo/setup.js";
import { getAllEVSPVCs } from "../abstract/abstract.js";
import {
  generateWeightedGraph,
  setPriority,
  findBestMatchingEVSP,
  SetEVPriceTime,
} from "../abstract/maching.js";

async function finder(EV, priority, price, time) {
  setPriority(priority);
  SetEVPriceTime(price, time);
  const VCs = await getAllEVSPVCs();
  let temp = [];
  // VCs.map((vc) => {
  //   temp = [...temp, JSON.parse(vc.raw)];
  // });

  // for (let i = 0; i < temp.length; i++) {
  //   temp[i] = temp[i].credentialSubject;
  // }

  // const graph = generateWeightedGraph(EV, temp, priority);
  // //   console.log(JSON.parse(JSON.stringify(graph)).adjacencyList);
  // return findBestMatchingEVSP(graph, EV[0].name);
}

export { finder };
