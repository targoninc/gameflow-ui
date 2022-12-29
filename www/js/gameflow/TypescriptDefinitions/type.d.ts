interface Property {
    name: string;
    default: string;
    mapping: string;
    type: string;
    description: string;
}

interface Connector {
    name: string;
    type: string;
}

interface Type {
    type: string;
    title: string;
    description: string;
    properties: Array<Property>;
    inputs: ReadonlyArray<Connector>;
    outputs: ReadonlyArray<Connector>;
    extraInputs: ReadonlyArray<Connector>;
    extraOutputs: ReadonlyArray<Connector>;
}