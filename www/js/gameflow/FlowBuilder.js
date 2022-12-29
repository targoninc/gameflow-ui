import { UiUtils } from "./UiUtils.js";
import { FlowActions } from "./FlowActions.js";

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
        this.appendStoryFlow(flow, extensionLoader, nodes);
        return flow;
    }

    getNodeCategory(node) {
        return node.type.substring(0, node.type.indexOf("/")).toLowerCase();
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

    appendStoryFlow(flow, extensionLoader, nodes) {
        let toPush = {};
        for (const node of nodes) {
            const category = this.getNodeCategory(node);

            if (node.type !== "Story/situation") {
                continue;
            }

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

            toPush[node.id] = {};
            const propertiesToPush = ["situationtype", "text", "continue_audio", "max_volume", "volume_ramp", "audio"];
            for (const property of propertiesToPush) {
                this.addPropertyToNodeForPush(toPush[node.id], property, node.properties[property]);
            }

            this.addInputTypeToNodeForPush(nodes, node, toPush, "newitem", "add_items", {type: "type", value: "value", name: "name"});
            this.addInputTypeToNodeForPush(nodes, node, toPush, "updateitem", "update_items", {name: "name", eval: "eval"});
            this.addInputTypeToNodeForPush(nodes, node, toPush, "removeitem", "remove_items", {name: "name"});
            this.addChoicesToSituation(nodes, toPush, node);
        }
        flow.story = toPush;
    }

    addInputTypeToNodeForPush(nodes, node, toPush, inputType, property, map) {
        const inputs = node.inputs.filter(i => i.type === inputType);
        if (!inputs || inputs.length === 0) {
            return;
        }
        toPush[node.id][property] = [];
        for (const input of inputs) {
            if (!input.link) {
                continue;
            }
            const link = this.graph.links[input.link];
            const itemNode = nodes.filter(n => n.id === link.origin_id)[0];
            let item = {};
            for (const sourceProperty in map) {
                item[map[sourceProperty]] = itemNode.properties[sourceProperty];
            }
            toPush[node.id][property].push(item);
        }
        if (toPush[node.id][property].length === 0) {
            delete toPush[node.id][property];
        }
    }

    addChoicesToSituation(nodes, toPush, node) {
        toPush[node.id].buttons = [];
        const output = node.outputs.filter(o => o.type === "situation")[0];
        if (!output.links || !output.links[0]) {
            return;
        }
        for (const linkId of output.links) {
            const link = this.graph.links[linkId];
            const button = nodes.filter(n => n.id === link.target_id)[0];
            const nextNodeOutput = button.outputs[0];
            if (!nextNodeOutput.links || !nextNodeOutput.links[0]) {
                continue;
            }
            const nextNodeLink = this.graph.links[nextNodeOutput.links[0]];
            const nextNode = nodes.filter(n => n.id === nextNodeLink.target_id)[0];

            const buttonToPush = {
                text: button.properties["text"],
                image: button.properties["image"],
                path: nextNode.id
            };
            const conditionInput = button.inputs.filter(i => i.type === "condition")[0];
            if (conditionInput.link > 0) {
                const conditionLink = this.graph.links[conditionInput.link];
                const conditionNode = nodes.filter(n => n.id === conditionLink.origin_id)[0];
                buttonToPush.require = {
                    type: conditionNode.properties["type"],
                    item: conditionNode.properties["value"],
                }
            }

            toPush[node.id].buttons.push(buttonToPush);
        }
    }

    nodeDists = {};

    addPropertyToNodeForPush(out, property, value) {
        if (value === "") {
            value = undefined;
        }

        switch (property) {
            case "situationtype":
                out.type = value ? value : "narrator";
                break;
            case "text":
                out.text = value ? value : "";
                break;
            case "continue_audio":
                out.continue_audio = value ? value : false;
                break;
            case "max_volume":
                out.max_volume = value ? value : .35;
                break;
            case "volume_ramp":
                out.volume_ramp = value ? value : 0;
                break;
            case "audio":
                out.audio = value ? value : "";
                break;
            default:
                break;
        }
        return out;
    }

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
}

export { FlowBuilder };