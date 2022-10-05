class LitegraphNeo {
    /**
     *
     * @param config {LitegraphConfig}
     * @param graphInfo {LitegraphInfo}
     */
    constructor(config, graphInfo) {
        this.config = config;
        this.graphInfo = graphInfo;
    }
}

class LitegraphInfo {
    nodeTypes = {
        registered: {},
        byFileExtension: {},
        byClassName: {},
    };
    Globals = {};
    search = {
        extras: {},
    };
}

class LitegraphConfig {
    version = '0.5';
    graphics = {
        canvasGridSize: 10,
    };
    runtime = {
        proxy: null,
        paths: {
            node_images: "",
        },
        debug: {
            active: false,
            catch_exceptions: true,
            throw_errors: true,
            allow_scripts: false,
        },
        auto_sort_node_types: false,
        nodes: {
            colored_when_on: false,
            colored_by_mode: false,
        },
        links: {
            shift_click_break_link: false,
            click_break_link: false,
        },
        dialogues: {
            close_on_mouse_leave: true,
            close_on_mouse_leave_delay: 500,
        },
        search: {
            hide_on_mouse_leave: true,
            filter_enabled: false,
            show_all_on_open: true,
        },
        // TODO: continue from line 116 @ litegraph.core.js
    };
    nodes = {
        maxCount: 1000,
        position: {
            default: [100, 100],
        },
        width: {
            default: 140,
            min: 50,
            collapsed: 80,
        },
        shape: {
            default: "box",
            valid: ["default", "box", "round", "card"],
        },
        radius: {
            collapsed: 10,
        },
        title: {
            height: 30,
            textY: 20
        },
        slots: {
            height: 20,
        },
        widgets: {
            height: 20,
        },
        text: {
            size: 14,
            secondary: {
                size: 12,
            }
        }
    };
    groups = {
        text: {
            size: 24,
        }
    };
    enums = {
        shapes: {
            box: 1,
            round: 2,
            circle: 3,
            card: 4,
            arrow: 5,
            grid: 6,
        },
        mapping: {
            input: 1,
            output: 2,
        },
        links: {
            event: -1,
            action: -1,
            render_modes: {
                values: ["Straight", "Linear", "Spline"],
                straight: 0,
                linear: 1,
                spline: 2,
            },
        },
        titles: {
            normal: 0,
            none: 1,
            transparent: 2,
            autohide: 3,
        },
        nodes: {
            modes: {
                values: ["Always", "On Event", "Never", "On Trigger"],
                colors: ["#666","#422","#333","#224","#626"],
                always: 0,
                on_event: 1,
                never: 2,
                on_trigger: 3,
            },
        },
        directions: {
            up: 1,
            down: 2,
            left: 3,
            right: 4,
            center: 5,
        },
    };
    colors = {
        shadow: {
            default: "rgba(0, 0, 0, 0.5)",
        },
        nodes: {
            default: "#333",
            background: "#353535",
            box: "#666",
            outline: "#fff",
            title: {
                default: "#999",
                selected: "#fff",
            },
            text: {
                default: "#aaa",
            },
            widgets: {
                background: "#222",
                outline: "#666",
                text: {
                    default: "#ddd",
                    secondary: {
                        default: "#999",
                    }
                }
            },
            links: {
                default: "#9a9",
                event: "#a86",
                connecting: "#afa"
            }
        }
    };
}

export { LitegraphNeo, LitegraphConfig, LitegraphInfo };