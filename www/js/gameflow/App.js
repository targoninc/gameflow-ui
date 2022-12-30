import {ExtensionLoader} from "./ExtensionLoader.js";
import {NodeTypeCreator} from "./NodeTypeCreator.js";
import {Jens} from "https://jensjs.com/latest/jens.js";
import {JensElements} from "./JensElements.js";
import {UiUtils} from "./UiUtils.js";
import {Navigator} from "./Navigator.js";
import {FlowActions} from "./FlowActions.js";

class App {
    async init() {
        await this.preInit();

        this.navigator.setGraph(this.graph);
        this.navigator.setCallback(this.onWindowResize.bind(this));
        const canvas = new LGraphCanvas("#litegraph", this.graph);

        await this.addNodeTypes();

        let node_const = LiteGraph.createNode("Story/situation");
        node_const.pos = [200, 200];
        this.graph.add(node_const);

        this.graph.attachCanvas(canvas);
        this.graph.start();

        this.initUi(this.graph);
        this.initKeybinds(this.graph);

        this.onWindowResize();
        window.addEventListener("resize", this.onWindowResize.bind(this));
        window.addEventListener("settingchange", this.onSettingChange.bind(this));
        window.addEventListener("action_run", this.runActionFromEvent.bind(this));
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
        this.addOrUpdateSetting("keybinds", {
            story_save: {display: "Save Story", keys: "ctrl+s"},
            story_save_local: {display: "Save Story (browser only)", keys: "ctrl+alt+s"},
            story_open: {display: "Open Story", keys: "ctrl+o"},
            story_build: {display: "Build Story", keys: "ctrl+b"},
            add_node_situation: {display: "Add Situation", keys: "ctrl+q"},
            add_node_choice: {display: "Add Choice", keys: "ctrl+y"},
            add_node_item_new: {display: "Add New Item", keys: "ctrl+i"},
        })
    }

    addOrUpdateSetting(name, value) {
        this.settings[name] = value;
        localStorage.setItem("settings", JSON.stringify(this.settings));
    }

    runActionFromEvent(e) {
        this.runAction(e.detail.action_id);
    }

    runAction(action) {
        switch (action) {
            case "story_save":
                FlowActions.saveProject(this.graph, true);
                break;
            case "story_save_local":
                FlowActions.saveProject(this.graph, false);
                break;
            case "story_open":
                FlowActions.openProject("openProjectInput", this.graph);
                break;
            case "settings_save":
                this.saveSettingsToFile();
                break;
            case "settings_open":
                this.openSettingsFromFile("openSettingsInput");
                break;
            case "story_build":
                FlowActions.buildProject(this.extensionLoader, this.graph).then();
                break;
            case "add_node_situation":
                this.addNode("Story/situation");
                break;
            case "add_node_choice":
                this.addNode("Story/choice");
                break;
            case "add_node_item_new":
                this.addNode("Story/new_item");
                break;
            default:
                console.error("Unknown action: " + action);
                UiUtils.showDialog("error", "Unknown action: " + action);
                break;
        }
    }

    initKeybinds(graph) {
        document.removeEventListener("keydown", this.onKeyDown);
        document.addEventListener("keydown", this.onKeyDown);
    }

    addNode(type) {
        const node = LiteGraph.createNode(type);
        const lastNode = this.graph.getNodes().slice(-1)[0];
        if (lastNode) {
            node.pos = [lastNode.pos[0] + 250, lastNode.pos[1]];
        } else {
            node.pos = [200, 200];
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
        this.jens.dataBinder.subscribeToAction("saveProject", [graph]);
        this.jens.dataBinder.subscribeToAction("openProject", ["openProjectInput", graph]);
        this.jens.dataBinder.subscribeToAction("buildProject", [this.extensionLoader, graph]);
    }

    onSettingChange(e) {
        switch (e.detail.section) {
            case "keybinds":
                const value = e.detail.value.trim();
                if (!this.validateKeybind(value)) {
                    console.error("Invalid keybind: " + value + "\nPlease separate keys with pluses. Supported modifiers are ctrl, alt and shift.");
                    UiUtils.showDialog("error", "Invalid keybind: " + value + "\nPlease separate keys with pluses. Supported modifiers are ctrl, alt and shift.");
                    return;
                }
                this.settings.keybinds[e.detail.action_id].keys = value;
                this.addOrUpdateSetting("keybinds", this.settings.keybinds);
                this.initKeybinds(this.graph);
                break;
        }
    }

    validateKeybind(keybind) {
        const keybindParts = keybind.split("+");
        for (const keybindPartIndex in keybindParts) {
            const keybindPart = keybindParts[keybindPartIndex];
            switch (keybindPart) {
                case "ctrl":
                case "alt":
                case "shift":
                    break;
                default:
                    if (keybindPart.length !== 1) {
                        return false;
                    }
                    break;
            }
        }
        return true;
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

    onKeyDown(e) {
        const keybinds = window.app.settings.keybinds;
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
                window.app.runAction(keybindAction);
                e.preventDefault();
            }
        }
    }

    saveSettingsToFile() {
        const settingsJson = JSON.stringify(this.settings);
        const blob = new Blob([settingsJson], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "settings.json";
        a.click();
        URL.revokeObjectURL(url);
        UiUtils.showDialog("info", "Settings saved to file");
    }

    openSettingsFromFile(inputId) {
        document.querySelector("#" + inputId).click();
        document.getElementById(inputId).onchange = (evt) => {
            const files = evt.target.files;
            const file = files[0];
            const reader = new FileReader();
            reader.onload = async (e) => {
                const settingsJson = e.target.result;
                this.settings = JSON.parse(settingsJson.toString());
                this.addOrUpdateSetting("keybinds", this.settings.keybinds);
                this.initKeybinds(this.graph);
                this.navigator.reloadPage().then();
                UiUtils.showDialog("info", "Settings loaded from file");
            };
            reader.readAsText(file);
        };
    }
}

window.app = new App();
window.app.init().then();

export { App };