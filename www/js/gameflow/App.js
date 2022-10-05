﻿import {ExtensionLoader} from "./ExtensionLoader.js";
import {NodeTypeCreator} from "./nodeTypeCreator.js";
import {Jens} from "https://jensjs.com/latest/jens.js";
import {JensElements} from "./JensElements.js";
import {FlowActions} from "./flowActions.js";
import {UiUtils} from "./uiUtils.js";
import {Navigator} from "./Navigator.js";

class App {
    async init() {
        await this.preInit();

        this.navigator.setGraph(this.graph);
        this.navigator.setCallback(this.onWindowResize.bind(this));
        const canvas = new LGraphCanvas("#litegraph", this.graph);

        await this.addNodeTypes();

        let node_const = LiteGraph.createNode("Primitives/string");
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
        this.graph = new LGraph();
        this.navigator = new Navigator();
        this.extensionLoader = new ExtensionLoader();
        const elements = new JensElements(this.extensionLoader, this.graph, this.navigator);
        this.jens = new Jens(elements.export);
        await this.navigator.setJens(this.jens);
    }

    initKeybinds(graph) {
        document.addEventListener("keydown", (e) => {
            if (e.key === "s") {
                if (e.ctrlKey) {
                    e.preventDefault();
                    FlowActions.saveInfrastructure(graph, false);
                } else if (e.altKey) {
                    e.preventDefault();
                    FlowActions.saveInfrastructure(graph, true);
                }
            }
            if (e.key === "o" && e.ctrlKey) {
                e.preventDefault();
                FlowActions.openInfrastructure("openInfrastructureInput", graph);
            }
        } );
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

    onWindowResize(e, extraWidth = 0, extraHeight = 0) {
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

await (new App()).init();

export { App };