class TemplateListMapper {
    static map(type, object, index) {
        switch (type) {
            case "extension":
                return this.mapExtension(object);
            case "keybind":
                return this.mapKeybind(object, index);
            default:
                return object;
        }
    }

    static mapKeybind(object, index) {
        return {
            display: object.display,
            keys: object.keys,
            keybindId: index,
        }
    }

    static mapExtension(object) {
        function getFeatureCountIcon(relation) {
            if (relation === 0) {
                return "gpp_bad";
            } else if (relation < 1) {
                return "gpp_maybe";
            } else if (relation === 1) {
                return "gpp_good";
            }
        }

        function getFeatureCountColor(relation) {
            if (relation === 0) {
                return "gray";
            } else if (relation < 1) {
                return "orange";
            } else if (relation === 1) {
                return "green";
            }
        }

        return {
            name: object.name,
            id: object.id,
            nodeCount: Object.keys(object.nodes).length,
            featureCount: object.features.length,
            featureList: object.features.join(", ").length > 0 ? object.features.join(", ") : "no features",
            globalsCount: Object.keys(object.globals.length ?? {}).length,
            extension_active: localStorage.getItem("extension_active:" + object.id) === "false" ? "inactive" : "active",
            icon: getFeatureCountIcon(object.features.length / 3),
            color: getFeatureCountColor(object.features.length / 3),
        }
    }
}

export { TemplateListMapper };