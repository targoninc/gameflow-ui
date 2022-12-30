import { FlowActions } from "./FlowActions.js";
import { Navigator } from "./Navigator.js";

class JensElements {
    constructor(extensionLoader, graph, navigator) {
        this.export = {
            fileactions: {
                tag: "div", classes: ["flex"], children: [
                    { template: "saveButton" },
                    { template: "openButton" },
                ]
            },
            actions: {
                tag: "div", classes: ["flex"], children: [
                    { template: "buildButton" },
                ]
            },
            saveButton: {
                template: "baseButton",
                data: {
                    buttonText: "Save",
                    buttonIcon: "save_alt"
                },
                expose: {
                    action: FlowActions.saveInfrastructure.bind(FlowActions),
                    event: "click",
                    key: "saveInfrastructure",
                    args: [{}]
                }
            },
            openButton: {
                template: "baseButton",
                data: {
                    buttonText: "Open",
                    buttonIcon: "folder_open"
                },
                expose: {
                    action: FlowActions.openInfrastructure.bind(FlowActions),
                    event: "click",
                    key: "openInfrastructure",
                    args: ["", {}]
                },
                children: [
                    { template: "fileInputHidden", id: "openInfrastructureInput" },
                ]
            },
            buildButton: {
                template: "baseButton",
                data: {
                    buttonText: "Build",
                    buttonIcon: "construction"
                },
                expose: {
                    action: FlowActions.buildInfrastructure.bind(FlowActions, extensionLoader, graph),
                    event: "click",
                    key: "buildInfrastructure",
                    args: [{}, {}]
                }
            },
            fileInputHidden: {
                tag: "input",
                classes: ["fileInput", "hidden"],
                type: "file",
            },
            baseButton: {
                tag: "button",
                classes: ["button-primary", "flex", "smallgap"],
                text: "ref:buttonText", children: [
                    { tag: "span", classes: ["material-icons"], text: "ref:buttonIcon" },
                ]
            },
            typeInputs: {
                tag: "div",
                classes: ["flex-v", "ref:inputsClass", "inputs"],
                children: [
                    { tag: "h3", text: "ref:inputsTitle" }
                ]
            },
            inputMapping: {
                tag: "div",
                classes: ["flex", "inputMapping"],
                id: "ref:inputMappingId",
                children: [
                    { template: "inputMappingLabel" },
                    { template: "inputMappingInput" },
                ]
            },
            inputMappingLabel: {
                tag: "span",
                text: "ref:inputMappingName",
                classes: ["inputMappingLabel"],
            },
            inputMappingInput: {
                tag: "input",
                classes: ["inputMappingInput"],
                type: "ref:inputMappingType"
            },
            apptitle: {
                tag: "div", classes: ["infoBox", "flex"], children: [
                    { tag: "h1", text: () => {
                        const id = localStorage.getItem("story-id") || "Untitled";
                        return "GameFlow: " + id;
                    } },
                    { tag: "div", classes: ["flex"], children: [
                        { tag: "div", attributes: {"progress-type": "text"}, classes: ["progress"] }
                    ]},
                    { tag: "div", classes: ["flex"], style: {"flex-grow": "1"}, children: [
                        { tag: "div", attributes: {"progress-type": "bar"}, classes: ["progress"] }
                    ]},
                ]
            },
            toppanel: {
                tag: "div",
                classes: ["panel"],
                attributes: {
                    "id": "topPanel",
                    "panel-type": "actions"
                },
                children: [
                    { template: "apptitle" },
                    {
                        tag: "div", classes: ["flex", "row"], children: [
                            { template: "navigation", classes: ["actionContainer"] },
                            { template: "fileactions", classes: ["actionContainer"] },
                            { template: "actions", classes: ["actionContainer"] },
                        ]
                    }
                ]
            },
            navigation: {
                tag: "nav",
                classes: ["flex"],
                children: [
                    { template: "navigationItem", data: { navText: "Story", page: "app", navIcon: "home" } },
                    { template: "navigationItem", data: { navText: "Settings", page: "settings", navIcon: "settings" } },
                ]
            },
            navigationItem: {
                tag: "div", subscribe: {
                    key: "setpage",
                    event: "click",
                    args: ["ref:page"],
                    addNode: false
                },
                attributes: {
                    "page": "ref:page",
                },
                classes: ["navigationItem"],
                children: [
                    { template: "baseButton", data: { buttonText: "ref:navText", buttonIcon: "ref:navIcon" } }
                ]
            },
            main: {
                tag: "div",
                id: "main",
                children: [
                    { template: "centerpanel" },
                ]
            },
            leftpanel: {
                tag: "div",
                id: "leftPanel",
                attributes: {
                    "panel-type": "globalInputs"
                },
                css: {
                    "resize": "horizontal"
                },
                onappend: (e) => {
                    const resizeObserver = new ResizeObserver(() => {
                        window.dispatchEvent(new Event('resize'));
                    });
                    resizeObserver.observe(e);
                },
                classes: ["panel"],
                children: [
                    { tag: "div", classes: ["infoBox"], children: [
                        { tag: "h2", text: "Targets" }
                    ]},
                    { tag: "div", classes: ["inputList"] },
                ]
            },
            centerpanel: {
                tag: "div",
                id: "centerPanel",
                attributes: {
                    "panel-type": "graph"
                },
                classes: ["panel"],
                children: [
                    { tag: "h2", text: "Story", classes: ["floating"] },
                    { tag: "canvas", id: "litegraph", width: "1024", height: "720", style: "border: 1px solid" },
                ]
            },
            toggle: {
                tag: "div",
                classes: ["toggle", "ref:active"],
                title: "ref:toggleTitle",
                id: "ref:toggleId",
                onappend: function (element) {
                    element.addEventListener("click", function () {
                        element.classList.toggle("active");
                    });
                },
                children: [
                    { tag: "div", classes: ["toggle-button"], children: [
                        { tag: "span", classes: ["material-icons", "showOnActive"], text: "ref:toggleIconActive" },
                        { tag: "span", classes: ["material-icons", "hideOnActive"], text: "ref:toggleIconInactive" },
                    ]},
                ]
            },
            extension: {
                tag: "div",
                classes: ["extension", "flex-v"],
                children: [
                    { tag: "div", classes: ["flex"], children: [
                        { tag: "span", classes: ["extensionIcon", "material-icons", "ref:color"], text: "ref:icon" },
                            { tag: "div", classes: ["flex", "smallgap"], children: [
                                { template: "toggle", onclick: function (e) {
                                    let target = e.target;
                                    while (!target.classList.contains("toggle")) {
                                        target = target.parentElement;
                                    }
                                    localStorage.setItem("extension_active:" + target.id, target.classList.contains("active") ? "true" : "false");
                                }, data: { toggleIconActive: "visibility", toggleIconInactive: "visibility_off", toggleTitle: "Toggle visibility in project", active: "ref:extension_active", toggleId: "ref:id" } },
                                { tag: "span", classes: ["extensionTitle", "stretch"], text: "ref:name" },
                            ]}
                    ]},
                    { tag: "div", classes: ["extensionFeature", "flex"], children: [
                        { tag: "span", classes: ["stretch"], text: "Nodes" },
                        { tag: "span", classes: ["mono"], text: "ref:nodeCount" },
                    ]},
                    { tag: "div", classes: ["extensionFeature", "flex"], children: [
                        { tag: "span", classes: ["stretch"], text: "Globals" },
                        { tag: "span", classes: ["mono"], text: "ref:globalsCount" },
                    ]},
                ]
            },
            keybind: {
                tag: "div",
                classes: ["keybind", "flex"],
                children: [
                    { template: "editableProperty", data: { label: "ref:display", init_value: "ref:keys", type: "text", ref_id: "ref:keybindId" } },
                ]
            },
            editableProperty: {
                tag: "div",
                classes: ["editableProperty", "flex"],
                onclick: function (e) {
                    let target = e.target;
                    while (!target.classList.contains("editableProperty")) {
                        target = target.parentElement;
                    }
                    let input = target.querySelector("input");
                    if (input) {
                        input.focus();
                    }
                },
                children: [
                    { tag: "span", classes: ["stretch"], text: "ref:label" },
                    { tag: "input", type: "ref:type", classes: ["mono", "property_value"], id: "ref:ref_id", attributes: { old_value: "ref:init_value" }, value: "ref:init_value", onblur: (e) => {
                        let target = e.target;
                        const value = target.value;
                        const event = new CustomEvent('settingchange', { detail: {
                            section: "keybinds",
                            element: target,
                            value: value,
                            action_id: target.id,
                            old_value: target.getAttribute("old_value"),
                        }});
                        window.dispatchEvent(event);
                    }}
                ]
            },
            settings: {
                tag: "div", id: "settings", classes: ["flex-v", "settings"], children: [
                    { tag: "h2", text: "Settings" },
                    { tag: "section", classes: ["flex-v"], id: "settings-extensions", onappend: (node) => {
                            navigator.generateTemplateList(node, extensionLoader.extensions, "extension");
                        }, children: [
                            { tag: "h3", text: "Extensions" },
                        ]
                    },
                    { tag: "section", classes: ["flex-v"], id: "settings-keybinds", onappend: (node) => {
                            navigator.generateTemplateList(node, window.app.settings.keybinds, "keybind");
                        }, children: [
                            { tag: "h3", text: "Keybinds" },
                        ]
                    }
                ]
            }
        }
    }
}

export { JensElements };