import { UiUtils } from "./UiUtils.js";
import { FlowBuilder } from "./FlowBuilder.js";

class FlowActions {
    static saveProject(graph, toFile = true) {
        const json = this.generateProjectJson(graph);
        const blob = new Blob([JSON.stringify(json)], {type: "text/plain;charset=utf-8"});
        if (toFile) {
            const id = localStorage.getItem("story-id");
            this.saveAs(blob, `game_${id}.json`);
            UiUtils.showDialog("success", "Project saved to file");
        } else {
            localStorage.setItem("story-build", JSON.stringify(json));
            UiUtils.showDialog("success", "Project saved to browser");
        }
    }

    static saveAs(blob, fileName) {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = fileName;
        a.click();
    }

    static openProject(filePickerId, graph) {
        document.querySelector("#" + filePickerId).click();

        document.getElementById(filePickerId).onchange = (evt) => {
            const files = evt.target.files;
            const file = files[0];
            const fileName = file.name;
            const id = fileName.split("_")[1].split(".")[0];
            UiUtils.setStoryId(id);
            const reader = new FileReader();
            reader.onload = (event) => {
                this.generateProjectFromString(event.target.result, graph);
            }
            reader.readAsText(file);
            window.app.navigator.setPage("app");
            UiUtils.showDialog("info", "Project loaded from file");
        };

        UiUtils.setNewRandomStoryId();
    }

    static generateProjectFromString(string, graph) {
        const json = JSON.parse(string);
        this.generateProjectFromJSON(json, graph);
    }

    static getSerializableNode(node) {
        return {
            type: node.type,
            dependencies: node.dependencies,
            properties: this.getSerializableNodeProperties(node),
            inputs: node.inputs,
            outputs: node.outputs,
            widgets: node.widgets,
            position: node.pos,
            color: node.color,
            bgcolor: node.bgcolor,
            boxcolor: node.boxcolor,
            id: node.id
        };
    }

    static getSerializableNodeProperties(node) {
        let properties = {};
        for (let widget of node.widgets) {
            properties[widget.options.id] = {
                type: widget.type,
                name: widget.name,
                value: widget.value,
                options: widget.options
            };
        }
        return properties;
    }

    static generateProjectJson(graph) {
        let json = {};
        graph.save();
        const nodes = graph.getNodes();
        let jsonodes = [];
        nodes.forEach((node) => {
            jsonodes.push(this.getSerializableNode(node));
        });
        json["nodes"] = jsonodes;
        let jsonlinks = [];
        for (let link in graph.links) {
            jsonlinks.push(graph.links[link]);
        }
        json["links"] = jsonlinks;
        const groups = graph.getGroups();
        let jsongroups = [];
        for (let group in groups) {
            let g = groups[group];
            jsongroups.push({
                title: g.title,
                color: g.color,
                font_size: g.font_size,
                _pos: g._pos,
                _size: g._size,
                _bounding: g._bounding,
            });
        }
        json["groups"] = jsongroups;
        return json;
    }

    static generateProjectFromJSON(json, graph) {
        this.generateProjectFromNodes(json["nodes"], json["links"], json["groups"], graph);
    }

    static generateProjectFromNodes(nodes, links, groups, graph) {
        graph.clear();
        graph.start();
        let progressItem = 0;
        let progressTotal = (nodes.length + links.length + groups.length);
        UiUtils.updateProgressers(0);
        for (let node of nodes) {
            const nodeToAdd = LiteGraph.createNode(node.type);
            nodeToAdd.id = node.id;
            nodeToAdd.pos = node.position;
            nodeToAdd.color = node.color;
            nodeToAdd.bgcolor = node.bgcolor;
            nodeToAdd.boxcolor = node.boxcolor;
            if (node.widgets) {
                nodeToAdd.widgets = node.widgets.map((widget) => {
                    return {
                        name: widget.name,
                        type: widget.type,
                        options: widget.options,
                        value: widget.value
                    };
                });
            }
            if (node.inputs) {
                nodeToAdd.inputs = node.inputs.map((input) => {
                    return {
                        name: input.name,
                        type: input.type,
                        id: input.id
                    };
                });
            }
            if (node.outputs) {
                nodeToAdd.outputs = node.outputs.map((output) => {
                    return {
                        name: output.name,
                        type: output.type,
                        id: output.id,
                        links: [],
                        _data: output._data,
                        nameLocked: output.nameLocked,
                        slot_index: output.slot_index
                    };
                });
            }
            if (node.properties) {
                for (let property in node.properties) {
                    const options = node.properties[property];
                    nodeToAdd.addProperty(property, options.value, options.type, {name: options.name, multiline: options.multiline || false});
                }
            }
            graph.add(nodeToAdd);
            progressItem++;
            UiUtils.updateProgressers(progressItem / progressTotal);
        }
        for (let link of links) {
            const origin = graph.getNodeById(link.origin_id);
            const target = graph.getNodeById(link.target_id);
            if (origin && target) {
                origin.connect(link.origin_slot, target, link.target_slot);
            }
            progressItem++;
            UiUtils.updateProgressers(progressItem / progressTotal);
        }
        for (let g of groups) {
            let group = new LGraphGroup(g.title);
            group.color = g.color;
            group.font_size = g.font_size;
            group._pos = g._pos;
            group._size = g._size;
            group._bounding = g._bounding;
            group.graph = graph;
            graph._groups.push(group);
            graph._version++;
            progressItem++;
            UiUtils.updateProgressers(progressItem / progressTotal);
        }
        graph.setDirtyCanvas(false, true);
        graph.change();
    }

    static async buildProject(extensionLoader, graph) {
        this.actionLog("Building flow...", "info");
        const flow = (new FlowBuilder()).build(extensionLoader, graph);
        const flowText = JSON.stringify(flow);
        localStorage.setItem("flow", flowText);
        this.actionLog("Flow saved to localStorage!", "success");
        await navigator.clipboard.writeText(flowText);
        UiUtils.showDialog("success", "Copied flow to clipboard");
    }

    static actionLog(message, type) {
        let color = "";
        switch (type) {
            case "info":
                color = "#00bcd4";
                break;
            case "error":
                color = "red";
                break;
            case "success":
                color = "#00ff33";
                break;
            default:
                color = "white";
                break;
        }
        console.log("%c " + message, "color: " + color + "; font-size: 14px;");
    }
}

export { FlowActions };