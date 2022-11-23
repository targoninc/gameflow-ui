import { UiUtils } from "./uiUtils.js";

class ExtensionLoader {
    defaultConfig = {
        paths: {
            extensions: "./extensions/",
            definitions: {
                base: "definitions/",
                nodes: "nodes.json",
                globals: "globals.json",
            }
        }
    };

    /**
     * Instantiates the type loader. Is used for loading and caching all JSON definitions.
     * @param {Object} config If not set, uses default values
     */
    constructor(config = null) {
        this.config = config ?? this.defaultConfig;
        this.loadExtensions().then();
    }

    extensions = {};
    defaultExtensions = [
        "primitives", "logic", "situations"
    ];

    async loadExtensions() {
        let progressItem = 0;
        let progressTotal = (this.defaultExtensions.length);
        UiUtils.updateProgressers(0);
        for (const extension of this.defaultExtensions) {
            await this.loadExtension(extension);
            progressItem++;
            UiUtils.updateProgressers(progressItem / progressTotal);
        }
        UiUtils.updateProgressers(1);
    }

    async loadExtension(extension) {
        const extPath = this.config.paths.extensions + extension + '/';
        const defPaths = this.config.paths.definitions;
        const paths = {
            definitions: {
                nodes: extPath + defPaths.base + defPaths.nodes,
                globals: extPath + defPaths.base + defPaths.globals,
            }
        };
        this.extensions[extension] = {
            name: extension,
            id: UiUtils.capitalizeFirstLetter(extension),
            paths: paths,
            initialized: false,
            nodes: await this.loadJsonFromFile(paths.definitions.nodes),
            globals: await this.loadJsonFromFile(paths.definitions.globals),
            enabled: true,
        };
        this.initializeExtension(extension);
    }

    initializeExtension(extension) {
        this.initializeGlobals(extension);
        this.initializeFeatures(extension);
        this.extensions[extension].initialized = true;
    }

    initializeFeatures(extension) {
        const possibleFeatures = [
            "nodes", "globals"
        ];
        let features = [];
        for (const feature of possibleFeatures) {
            if (!this.extensions[extension][feature] || !Object.keys(this.extensions[extension][feature]).length) {
                continue;
            }
            features.push(feature);
        }
        this.extensions[extension].features = features;
    }

    initializeGlobals(extension) {
        if (!this.extensions[extension].globals) {
            return;
        }
        for (const parameter in this.extensions[extension].globals) {
            const param = this.extensions[extension].globals[parameter];
            this.extensions[extension].globals[parameter] = {
                name: param.name,
                id: parameter,
                default: param.default ?? "",
                type: param.type,
                dontShowInNodes: param.dontShowInNodes ?? false,
                mapping: "both"
            };
        }
    }

    cache = {};

    async loadJsonFromFile(path) {
        if (this.cache[path] !== undefined) {
            return this.cache[path];
        }
        let res;
        try {
            res = await fetch(path);
        } catch (e) {
            if (e.message.includes("404")) {
                return {};
            }
        }
        let json;
        try {
            json = await res.json();
        } catch (error) {
            console.log("Error parsing JSON: " + error);
            json = {};
        }
        this.cache = this.cache ?? {};
        this.cache[path] = json;
        return json;
    }
}

export { ExtensionLoader };