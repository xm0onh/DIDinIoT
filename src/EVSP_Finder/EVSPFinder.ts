import { agent } from "../veramo/setup.js";
import { getAllEVSPVCs } from "../abstract/abstract.js";
import {
  evs,
  generateWeightedGraph,
  priority,
  findBestMatchingEVSP,
} from "../abstract/maching.js";

async function finder() {
  const EVSP_DID = await agent.didManagerGetByAlias({ alias: "EVSP" });
  const VCs = await getAllEVSPVCs(EVSP_DID.did);
  let temp = [];
  VCs.map((vc) => {
    temp = [...temp, JSON.parse(vc.raw)];
  });

  for (let i = 0; i < temp.length; i++) {
    temp[i] = temp[i].credentialSubject;
  }

  const graph = generateWeightedGraph(evs, temp, priority);

  console.log(findBestMatchingEVSP(graph, "ev1"));
}

finder();

export { finder };
