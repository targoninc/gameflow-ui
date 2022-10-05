import { UiUtils } from "./uiUtils.js";
import { FlowActions } from "./flowActions.js";

class FlowBuilder {
    constructor(config = null) {
        if (config === null) {
            config = {};
        }
        this.config = config;
    }

    build(extensionLoader, graph) {
        const flow = {};
        this.graph = graph;
        const nodes = graph._nodes_in_order;
        this.appendPreFlow(flow, extensionLoader, nodes);
        this.appendNodeFlow(flow, extensionLoader, nodes);
        this.appendPostFlow(flow, extensionLoader, nodes);
        return flow;
    }

    preFlows = {
        "azure": ["authenticate", "getauth"]
    };

    getNodeCategory(node) {
        return node.type.substring(0, node.type.indexOf("/")).toLowerCase();
    }

    appendPreFlow(flow, types, nodes) {
        for (const node of nodes) {
            const category = this.getNodeCategory(node);
            if (this.preFlows[category]) {
                for (const preFlow of this.preFlows[category]) {
                    if (flow[category]) {
                        continue;
                    }
                    if (!flow[category]) {
                        flow[category] = {};
                    }
                    flow[category][preFlow] = {
                        commandSource: category,
                        command: preFlow
                    };
                }
            }
        }
    }

    getNodeTypeDefinition(extensionLoader, type) {
        for (const extensionIndex in extensionLoader.extensions) {
            const extension = extensionLoader.extensions[extensionIndex];
            for (const typeIndex in extension.nodes) {
                const typeDefinition = extension.nodes[typeIndex];
                if (UiUtils.capitalizeFirstLetter(extensionIndex) + "/" + typeDefinition.type === type) {
                    return typeIndex;
                }
            }
        }
        return null;
    }

    appendNodeFlow(flow, extensionLoader, nodes) {
        let maxDistance = 0;
        for (const node of nodes) {
            node.distance = this.getNodeDistance(node, nodes);
            if (node.distance > maxDistance) {
                maxDistance = node.distance;
            }
        }
        let toPush = {};
        for (let i = 0; i < maxDistance + 1; i++) {
            toPush[i] = {};
            for (const node of nodes) {
                if (node.distance === i) {
                    const category = this.getNodeCategory(node);
                    const nodeTypeDefinition = this.getNodeTypeDefinition(extensionLoader, node.type);
                    node.dependencies = [];
                    if (node.inputs) {
                        for (const input of node.inputs) {
                            if (input.link) {
                                const link = this.graph.links[input.link];
                                node.dependencies.push(link.origin_id);
                            }
                        }
                    }

                    toPush[i][node.id] = [{
                        commandSource: category,
                        command: nodeTypeDefinition,
                        node: FlowActions.getSerializableNode(node)
                    }];
                }
            }
        }
        flow.nodes = toPush;
    }

    nodeDists = {};

    getNodeDistance(node, nodes) {
        let distance = 0;
        if (!node.inputs) {
            this.nodeDists[node.id] = 0;
            return 0;
        }
        for (const input of node.inputs) {
            if (input.link) {
                const link = this.graph.links[input.link];
                const sourceNode = this.graph._nodes.filter(n => n.id === link.origin_id)[0];
                let sourceNodeDistance;
                if (this.nodeDists[sourceNode.id] === undefined) {
                    sourceNodeDistance = this.getNodeDistance(sourceNode, nodes);
                    this.nodeDists[sourceNode.id] = sourceNodeDistance;
                }
                sourceNodeDistance = this.nodeDists[sourceNode.id] + 1;
                if (sourceNodeDistance > distance) {
                    distance = sourceNodeDistance;
                }
            }
        }
        this.nodeDists[node.id] = distance;
        return distance;
    }

    appendPostFlow(flow, types, nodes) {
    }
}

export { FlowBuilder };