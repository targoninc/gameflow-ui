import { UiUtils } from "./uiUtils.js";
import { ExtensionLoader } from "./ExtensionLoader.js";
import { LogicProcessor } from "./LogicProcessor.js";
import { Jens } from "https://jensjs.com/latest/jens.js";

class NodeTypeCreator {
    /**
     *
     * @param {LGraph} graph
     * @param category
     * @param type {Type}
     * @param extensionLoader {ExtensionLoader}
     * @param {Jens} [jens]
     */
    async createFromType(graph, category, type, extensionLoader, jens) {
        /**
         * @class NodeToAdd
         * @extends LGraphNode
         */
        function NodeToAdd() {
            if (type.inputs) {
                for (const input of type.inputs) {
                    this.addInput(input.name, input.type, {nameLocked: true});
                }
            }
            if (type.outputs) {
                for (const output of type.outputs) {
                    this.addOutput(output.name, output.type);
                }
            }
            const globalParams = extensionLoader.extensions[category].globals;
            if (globalParams && globalParams[category]) {
                for (const category in globalParams) {
                    for (const parameterIndex in globalParams[category]) {
                        const parameter = globalParams[category][parameterIndex];
                        if (!type.properties) {
                            type.properties = [];
                        }
                        if (parameter.dontShowInNodes) {
                            continue;
                        }
                        //type.properties.push(parameter);
                    }
                }
            }
            if (type.properties) {
                for (const property of type.properties) {
                    this.addProperty(property.id, property.default, property.type, {name: property.name, id: property.id});

                    if (!property.computed) {
                        const defaultValue = property.default ?? "";
                        this.addWidget(property.type, property.name, defaultValue, (value, that, node, pos, e) => {
                            node.properties[property.id] = value;
                        }, {id: property.id, values: property.values ?? []});
                    }

                    switch (property.mapping) {
                        case 'input':
                            this.addInput(property.name, property.type, {nameLocked: true, id: property.id});
                            break;
                        case 'output':
                            this.addOutput(property.name, property.type, {nameLocked: true, id: property.id});
                            break;
                        case 'both':
                            this.addInput(property.name, property.type, {nameLocked: true, id: property.id});
                            this.addOutput(property.name, property.type, {nameLocked: true, id: property.id});
                            break;
                        default:
                            break;
                    }
                }
            }

            this.shape = "card";
        }

        NodeToAdd.title = type.title;

        NodeToAdd.prototype.onGetInputs = function () {
            if (!type.extraInputs) {
                return;
            }
            return type.extraInputs.map(input => {
                return [input.name, input.type, {nameLocked: true, locked: true}];
            });
        }

        NodeToAdd.prototype.onGetOutputs = function () {
            if (!type.extraOutputs) {
                return;
            }
            return type.extraOutputs.map(output => {
                return [output.name, output.type, {nameLocked: true, locked: true}];
            });
        }

        NodeToAdd.prototype.getInputValues = function () {
            let values = [];
            if (this.inputs) {
                for (let i = 0; i < this.inputs.length; i++) {
                    let in_data = this.getInputData(i, true);
                    values.push(in_data);
                }
            }
            return values;
        }

        /*
        NodeToAdd.prototype.onExecute = function () {
            if (category === "logic") {
                if (!type.logic) {
                    return;
                }
                const inputValues = this.getInputValues();
                const propertyValues = Object.values(this.properties);
                const logicProcessor = new LogicProcessor(type.logic);
                const result = logicProcessor.process(inputValues, propertyValues);
                if (result) {
                    this.setOutputData(0, result);
                }
            }
            if (this.inputs) {
                for (let i = 0; i < this.inputs.length; i++) {
                    let input = this.inputs[i];
                    let in_data = this.getInputData(i, true);
                    for (let property in this.properties) {
                        if (property === input.id) {
                            this.properties[property] = in_data !== undefined ? in_data : this.properties[property];
                        }
                    }
                    if (this.widgets) {
                        let widget = this.widgets.filter(w => w.options.id === input.id)[0];
                        if (widget) {
                            if (widget.value === undefined) {
                                widget.value = "";
                            }
                            widget.value = in_data !== undefined ? in_data : widget.value;
                        }
                    }
                }
            }
            if (this.widgets && category !== "logic") {
                for (let widget of this.widgets) {
                    if (this.outputs) {
                        let index = this.outputs.findIndex(output => output.id === widget.options.id);
                        if (index !== -1) {
                            this.setOutputData(index, widget.value);
                        }
                    }
                    if (this.properties) {
                        if (this.properties[widget.options.id] !== undefined) {
                            this.properties[widget.options.id] = widget.value;
                        }
                    }
                }
            }
        };
         */

        NodeToAdd.prototype.onNodeCreated = function(nodePos) {
            if (type.requires) {
                if (UiUtils.getSetting('GameFlow.autoConnectRequired') === true) {
                    if (type.requires.constructor !== Array) {
                        type.requires = [type.requires];
                    }
                    if (type.requires.length > 0) {
                        const types = extensionLoader.extensions[category].nodes;
                        let newNodeIndex = 0;
                        const newNodeDistance = 10;
                        for (const require of type.requires) {
                            const graphType = UiUtils.capitalizeFirstLetter(category) + "/" + types[category][require].type;
                            const existingNodes = graph.findNodesByType(graphType);
                            if (existingNodes.length > 0) {
                                continue;
                            }
                            newNodeIndex++;
                            let newNode = LiteGraph.createNode(graphType);
                            newNode._pos = [
                                nodePos[0] + (newNodeIndex * newNodeDistance),
                                nodePos[1] + (newNodeIndex * newNodeDistance)
                            ];
                            graph.add(newNode);
                        }
                    }
                }
            }
        }

        const nodeTypeName = UiUtils.capitalizeFirstLetter(category) + "/" + type.type;
        LiteGraph.registerNodeType(nodeTypeName, NodeToAdd);

        await UiUtils.initPanels(graph, extensionLoader, jens);
    }
}
export { NodeTypeCreator };