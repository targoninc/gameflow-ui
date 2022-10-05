class LiteGraphConfig {
    version = 0.4;
    canvas = {
        gridSize: 10,
    };
    nodes = {
        titleHeight: 30,
        titleTextY: 20,
        slotHeight: 20,
        widgetHeight: 20,
        width: {
            default: 140,
            min: 50
        },
        collapsed: {
            radius: 10,
            width: 80
        },
        text: {
            size: 14,
            subTextSize: 12,
        },
        shapes: {
            default: "box",
            valid: ["default", "box", "round", "card"]
        },
        maxCount: 1000,
        defaultPosition: [100, 100]
    };
    groups = {
        font: 24
    };
    colors = {
        shadow: "rgba(0, 0, 0, 0.5)",
        nodes: {
            default: "#333",
            background: "#353535",
            box: "#666",
            outline: "#fff",
            title: {
                default: "#999",
                selected: "#fff"
            },
            text: "#aaa",
            widgets: {
                background: "#222",
                outline: "#666",
                text: "#ddd",
                secondaryText: "#999",
            },
            link: {
                default: "#9a9",
                event: "#a86",
                connecting: "#afa",
            },
        }
    };
    global = {
        proxy: null, // TODO: figure out if needed and if yes what for
        debug: false,
        catch_exceptions: true,
        throw_errors: true,
        allow_scripts: false,
        // if set to true some nodes like Formula would be allowed to evaluate code that comes from
        // unsafe sources (like node configuration), which could lead to exploits
        paths: {
            images: {
                node: "",
            }
        },
    };
    ENUM = {
        SHAPE: {
            BOX: 1,
            ROUND: 2,
            CIRCLE: 3,
            CARD: 4,
            ARROW: 5,
            GRID: 6
        },
        SLOT: {
            IN: 1,
            OUT: 2,
        },
        EVENT: -1, // used for outputs, TODO: check
        ACTION: -1, // used for inputs
        NODE_MODES: {
            TYPES: ["Always", "On Event", "Never", "On Trigger"], // TODO: move into different config
            COLORS: ["#666","#422","#333","#224","#626"], // TODO: should be in color config
            ALWAYS: 0,
            ON_EVENT: 1,
            NEVER: 2,
            ON_TRIGGER: 3,
        },
        DIRECTION: {
            UP: 1,
            DOWN: 2,
            LEFT: 3,
            RIGHT: 4,
            CENTER: 5,
        },
        LINKS: {
            MODES: ["Straight", "Linear", "Spline"],
            STRAIGHT: 0,
            LINEAR: 1,
            SPLINE: 2,
        },
        TITLE: {
            NORMAL: 0,
            NONE: 1,
            TRANSPARENT: 2,
            AUTOHIDE_TITLE: 3,
        },
    }
}