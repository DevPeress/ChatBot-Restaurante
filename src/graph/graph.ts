import { StateGraph } from "@langchain/langgraph";
import { RestauranteData } from "./state.ts";

export const graphData = () => {
    const graph = new StateGraph({ stateSchema: RestauranteData });

    return graph.compile();
}