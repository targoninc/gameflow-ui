import { Jens } from "https://jensjs.com/latest/jens.js";

class UiUtils {
    static updateProgressers(progress) {
        let progressers = document.querySelectorAll(".progress");
        for (let progressor of progressers) {
            progressor.style.display = "initial";
            switch (progressor.getAttribute("progress-type")) {
                case "bar":
                    progressor.style.width = progress * 100 + "%";
                    break;
                case "circle":
                    progressor.style.transform = "rotate(" + (progress * 360) + "deg)";
                    break;
                case "text":
                    progressor.innerHTML = progress * 100 + "%";
                    break;
            }
            if (progress === 1) {
                progressor.style.display = "none";
            }
        }
    }

    static async initPanels(graph, extensionLoader, jens) {
        let panels = document.querySelectorAll(".panel");
        for (let panel of panels) {
            let panelType = panel.getAttribute("panel-type");
            if (panelType === "globalInputs") {
                const nodes = graph.getNodes();
                let includedTypes = [];
                const inputs = panel.querySelector(".inputList");
                for (let node of nodes) {
                    for (const type in extensionLoader.extensions) {
                        if (node.type.toLowerCase().startsWith(type) && !includedTypes.includes(node.type)) {
                            includedTypes.push(node.type.substring(0, type.length).toLowerCase());
                        }
                    }
                }
                for (const type in extensionLoader.extensions) {
                    const typeInputs = inputs.querySelector(".inputs-" + type);
                    if ((typeInputs === undefined || typeInputs === null) && includedTypes.includes(type)) {
                        const globalParameters = extensionLoader.extensions[type].globals;
                        if (Object.keys(globalParameters).length === 0) {
                            continue;
                        }

                        const typeInputsDiv = jens.createFromTemplateName("typeInputs", {
                            inputsClass: "inputs-" + type,
                            inputsTitle: this.capitalizeFirstLetter(type)
                        });

                        for (let mappingIndex in globalParameters) {
                            const parameter = globalParameters[mappingIndex];
                            jens.resetTree();
                            const mappingDiv = jens.createFromTemplateName("inputMapping", {
                                inputMappingName: parameter.name,
                                inputMappingType: parameter.type,
                                inputMappingId: type.toLowerCase() + "-" + parameter.name.toLowerCase() + "-" + parameter.type.toLowerCase(),
                            });
                            const savedValue = localStorage.getItem("var:global:" + type + "-" + parameter.name + "-" + parameter.type);
                            if (savedValue !== null) {
                                mappingDiv.querySelector("input").value = savedValue;
                            }
                            mappingDiv.onchange = () => {
                                localStorage.setItem("var:global:" + type + "-" + parameter.name + "-" + parameter.type, mappingDiv.querySelector("input").value);
                            }
                            typeInputsDiv.appendChild(mappingDiv);
                        }
                        inputs.appendChild(typeInputsDiv);
                    } else if ((typeInputs !== undefined && typeInputs !== null) && !includedTypes.includes(type)) {
                        inputs.removeChild(typeInputs);
                    }
                }
            }
        }
    }

    static capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    static getSetting(setting) {
        return JSON.parse(localStorage.getItem("setting:" + setting));
    }

    static setSetting(setting, value) {
        localStorage.setItem("setting:" + setting, JSON.stringify(value));
    }

    static generateTemplateList(jens, node, objects, templateName) {
        for (let object of objects) {
            const template = jens.createFromTemplateName(templateName, object);
            node.appendChild(template);
        }
    }

    static removeActiveFromAllPages() {
        const elements = document.querySelectorAll("button.navigationItem");
        for (let element of elements) {
            if (element.classList.contains("active")) {
                element.classList.remove("active");
            }
        }
    }

    static setActiveForPage(pageName) {
        this.removeActiveFromAllPages();
        const element = document.querySelector(`.navigationItem[page="${pageName}"]`);
        if (element !== null) {
            element.classList.add("active");
        }
    }

    static showDialog(dialogType, text) {
        const jens = new Jens();
        jens.addTemplates({
            notification: {
                tag: "div", classes: ["notification", "flex"], css: { "background-color": "ref:color" }, children: [
                    { tag: "span", classes: ["material-icons"], text: "ref:icon" },
                    { tag: "span", text: "ref:text" },
                ]
            }
        });
        const dialog = jens.createFromTemplateName("notification", {
            color: UiUtils.getColorForStatus(dialogType),
            icon: UiUtils.getIconForStatus(dialogType),
            text: text
        });
        document.body.appendChild(dialog);
        setTimeout(() => {
            dialog.remove();
        }, 5000);
    }

    static getColorForStatus(status) {
        switch (status) {
            case "info":
                return "#2196f3";
            case "warning":
                return "#ff9800";
            case "error":
                return "#f44336";
            case "success":
                return "#4caf50";
            default:
                return "#2196f3";
        }
    }

    static getIconForStatus(dialogType) {
        switch (dialogType) {
            case "info":
                return "info";
            case "warning":
                return "warning";
            case "error":
                return "error";
            case "success":
                return "check_circle";
            default:
                return "info";
        }
    }

    static setStoryId(id) {
        localStorage.setItem("story-id", id);
        document.title = "GameFlow: " + id;
        const heading = document.querySelector("h1");
        if (!heading) {
            return;
        }
        heading.innerText = "GameFlow: " + id;
    }

    static setNewRandomStoryId() {
        const id = Math.random().toString(36).substring(2, 15);
        UiUtils.setStoryId(id);
    }
}

export { UiUtils };