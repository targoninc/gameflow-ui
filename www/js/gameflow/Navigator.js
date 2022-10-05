import { UiUtils } from "./uiUtils.js";
import { TemplateListMapper } from "./TemplateListMapper.js";

class Navigator {
    async setJens(jens) {
        this.jens = jens;
        localStorage.removeItem("runtime:appPage");
        for (const page in this.pages) {
            localStorage.removeItem(`runtime:appPage:${page}`);
        }
        this.activePage = "none";
        localStorage.setItem("runtime:appPage", this.activePage);
        await this.publishPages();
    }

    setGraph(graph) {
        this.graph = graph;
    }

    setCallback(callback) {
        this.callback = callback;
    }

    updateGraph() {
        if (!this.graph) {
            return;
        }
        const canvas = new LGraphCanvas("#litegraph", this.graph);
        this.graph.attachCanvas(canvas);
        this.graph.start();
    }

    async publishPages() {
        this.jens.dataBinder.exposeAction(this.setPage.bind(this), "setpage", ["app"]);
        await this.setPage("app");
    }

    pages = {
        app: ["toppanel", "main"],
        settings: ["toppanel", "settings"],
    };

    generateTemplateList(node, objects, templateName) {
        const data = [];
        for (const object in objects) {
            data.push(TemplateListMapper.map(templateName, objects[object]));
        }
        UiUtils.generateTemplateList(this.jens, node, data, templateName);
    }

    async setPage(pageName) {
        if (arguments && arguments.length > 1) {
            pageName = arguments[arguments.length - 1];
            if (pageName === "{fromNode}") {
                let node = arguments[arguments.length - 2];
                pageName = node.getAttribute("page");
            }
        }
        let page = document.getElementById("page");

        if (this.activePage === pageName) {
            return;
        }
        const pageTemplate = this.pages[pageName];
        if (!pageTemplate) {
            return;
        }

        page.innerHTML = "";
        for (const subTemplate of pageTemplate) {
            const newEl = this.jens.createFromTemplateName(subTemplate, {});
            page.appendChild(newEl);
        }

        this.activePage = pageName;
        localStorage.setItem("runtime:appPage", this.activePage);
        await new Promise((resolve) => {
            setTimeout(resolve, 100);
        });

        this.updateGraph();
        UiUtils.setActiveForPage(pageName);
        if (this.callback) {
            this.callback();
        }
    }
}

export { Navigator };