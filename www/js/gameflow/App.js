import {ExtensionLoader} from "./ExtensionLoader.js";
import {NodeTypeCreator} from "./NodeTypeCreator.js";
import {Jens} from "https://jensjs.com/latest/jens.js";
import {JensElements} from "./JensElements.js";
import {UiUtils} from "./UiUtils.js";
import {Navigator} from "./Navigator.js";

class App {
    async init() {
        await this.preInit();

        this.navigator.setGraph(this.graph);
        this.navigator.setCallback(this.onWindowResize.bind(this));
        const canvas = new LGraphCanvas("#litegraph", this.graph);

        await this.addNodeTypes();

        let node_const = LiteGraph.createNode("Story/situation");
        node_const.pos = [200,200];
        this.graph.add(node_const);

        this.graph.attachCanvas(canvas);
        this.graph.start();

        this.initUi(this.graph);
        this.initKeybinds(this.graph);

        this.onWindowResize();
        window.addEventListener("resize", this.onWindowResize.bind(this));
        setTimeout(this.onWindowResize.bind(this), 1000);
    }

    async preInit() {
        UiUtils.setNewRandomStoryId();
        this.addSettings();

        this.graph = new LGraph();
        this.navigator = new Navigator();
        this.extensionLoader = new ExtensionLoader();
        const elements = new JensElements(this.extensionLoader, this.graph, this.navigator);
        this.jens = new Jens();
        this.jens.addTemplates(elements.export);
        await this.navigator.setJens(this.jens);
    }

    addSettings() {
        if (!this.settings) {
            this.settings = {};
        }
        this.addSetting("keybinds", {
            saveProject: { display: "Save Story", keys: "ctrl+s" },
            saveProjectLocalOnly: { display: "Save Story (local only)", keys: "ctrl+alt+s" },
            openProject: { display: "Open Story", keys: "ctrl+o" },
            buildStory: { display: "Build Story", keys: "ctrl+b" },
            addSituation: { display: "Add Situation", keys: "ctrl+q" },
            addChoice: { display: "Add Choice", keys: "ctrl+y" },
            addNewItem: { display: "Add New Item", keys: "ctrl+i" },
        })
    }

    addSetting(name, value) {
        this.settings[name] = value;
        localStorage.setItem("settings", JSON.stringify(this.settings));
    }

    runAction(action) {
        switch (action) {
            case "saveProject":
                FlowActions.saveInfrastructure(this.graph, true);
                break;
            case "saveProjectLocalOnly":
                FlowActions.saveInfrastructure(this.graph, false);
                break;
            case "openProject":
                FlowActions.openInfrastructure("openInfrastructureInput", this.graph);
                break;
            case "buildStory":
                console.error("Not implemented yet");
                break;
            case "addSituation":
                this.addNode("Story/situation");
                break;
            case "addChoice":
                this.addNode("Story/choice");
                break;
            case "addNewItem":
                this.addNode("Story/newItem");
                break;
            default:
                console.error("Unknown action: " + action);
                break;
        }
    }

    initKeybinds(graph) {
        document.addEventListener("keydown", (e) => {
            const keybinds = this.settings.keybinds;
            for (const keybindAction in keybinds) {
                const keys = keybinds[keybindAction].keys;
                const keybindParts = keys.split("+");
                let keybindMatch = true;
                for (const keybindPartIndex in keybindParts) {
                    const keybindPart = keybindParts[keybindPartIndex];
                    switch (keybindPart) {
                        case "ctrl":
                            if (!e.ctrlKey) {
                                keybindMatch = false;
                            }
                            break;
                        case "alt":
                            if (!e.altKey) {
                                keybindMatch = false;
                            }
                            break;
                        case "shift":
                            if (!e.shiftKey) {
                                keybindMatch = false;
                            }
                            break;
                        default:
                            if (e.key !== keybindPart) {
                                keybindMatch = false;
                            }
                            break;
                    }
                }
                if (keybindMatch) {
                    this.runAction(keybindAction);
                    e.preventDefault();
                }
            }
        } );
    }

    addNode(type) {
        const node = LiteGraph.createNode(type);
        const lastNode = this.graph.getNodes().slice(-1)[0];
        if (lastNode) {
            node.pos = [lastNode.pos[0] + 100, lastNode.pos[1] + 100];
        }
        this.graph.add(node);
    }

    initUi(graph) {
        this.loadOmniActions(graph);
        UiUtils.initPanels(graph, this.extensionLoader, this.jens).then();
        window.addEventListener("click", (e) => {
            UiUtils.initPanels(graph, this.extensionLoader, this.jens).then();
        });
    }

    loadOmniActions(graph) {
        this.jens.dataBinder.subscribeToAction("saveInfrastructure", [graph]);
        this.jens.dataBinder.subscribeToAction("openInfrastructure", ["openInfrastructureInput", graph]);
        this.jens.dataBinder.subscribeToAction("buildInfrastructure", [this.extensionLoader, graph]);
    }

    onWindowResize(e = null, extraWidth = 0, extraHeight = 0) {
        const canvasDOM = document.querySelector("#litegraph");
        const centerPanel = document.querySelector("#centerPanel");
        if (!canvasDOM || !centerPanel) {
            return;
        }
        const newWidth = (centerPanel.clientWidth - 3) + extraWidth;
        const newHeight = (centerPanel.clientHeight - 6) + extraHeight;
        canvasDOM.setAttribute("width", newWidth.toString());
        canvasDOM.setAttribute("height", newHeight.toString());
        canvasDOM.style.width = newWidth.toString() + "px";
        canvasDOM.style.height = newHeight.toString() + "px";
        if (centerPanel.scrollHeight > centerPanel.clientHeight || centerPanel.scrollWidth > centerPanel.clientWidth) {
            setTimeout(this.onWindowResize.bind(this), 100);
        }
        if (!canvasDOM.data) {
            const canvas = new LGraphCanvas("#litegraph", this.graph);
            this.graph.attachCanvas(canvas);
            this.graph.start();
        }
        this.graph.change();
    }
    
    async addNodeTypes() {
        await this.extensionLoader.loadExtensions();
        const nodeCreator = new NodeTypeCreator();
        for (const extensionIndex in this.extensionLoader.extensions) {
            const extension = this.extensionLoader.extensions[extensionIndex];
            if (!extension.nodes) {
                continue;
            }
            for (const nodeTypeIndex in extension.nodes) {
                await nodeCreator.createFromType(this.graph, extensionIndex, extension.nodes[nodeTypeIndex], this.extensionLoader, this.jens);
            }
        }
    }

    async reloadExtensions() {
        await this.extensionLoader.loadExtensions();
        const nodeCreator = new NodeTypeCreator();
        for (const extensionIndex in this.extensionLoader.extensions) {
            LiteGraph.unregisterNodeType(extensionIndex);
            const extension = this.extensionLoader.extensions[extensionIndex];
            if (!extension.nodes || !extension.enabled) {
                continue;
            }
            for (const nodeTypeIndex in extension.nodes) {
                await nodeCreator.createFromType(this.graph, extensionIndex, extension.nodes[nodeTypeIndex], this.extensionLoader, this.jens);
            }
        }
    }
}

window.app = new App();
window.app.init().then();

export { App };