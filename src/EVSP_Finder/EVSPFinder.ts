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
  return findBestMatchingEVSP(graph, EV[0].name);
}

export { finder };
