class LogicProcessor {
    constructor(logic) {
        this.logic = logic;
    }

    process(inputs, properties) {
        const evalString = this.getEvalString(inputs, properties);
        let result;
        try {
            result = eval(evalString);
        } catch (e) {
            console.error(e);
        }
        return result;
    }

    getEvalString(inputs, properties) {
        const funcs = this.getFunctionArray(this.logic);
        let evalString = this.logic;
        for (const func of funcs) {
            evalString = evalString.replace(func, this.runFunction(func, inputs, properties));
        }
        return evalString;
    }

    getFunctionArray(string) {
        const funcFinderRegex = /(f\([^+\-=]*\))/g;
        return string.match(funcFinderRegex);
    }

    functions = {
        regex: {
            f: function(regex, string) {
                return string.match(regex) !== null;
            }
        },
        replace: {
            f: function(base, search, replace) {
                return '"' + base.replace(search, replace) + '"';
            }
        },
        concat: {
            f: function(s1, s2) {
                return '"' + s1 + s2 + '"';
            }
        }
    }

    runFunction(string, inputs, properties) {
        const params = string.match(/\(([^)]*)\)/)[1].split(',');
        if (params === null) {
            throw new Error('Invalid logic definition: ' + string);
        }
        if (this.functions[params[0]]) {
            if (this.functions[params[0]].f.length !== params.length - 1) {
                throw new Error('Unsupported parameter count: ' + (params.length - 1) + ' for function: ' + params[0] + ', expected: ' + this.functions[params[0]].f.length);
            }
            for (let i = 1; i < params.length; i++) {
                params[i] = this.getParameter(inputs, properties, params[i]);
            }
            return this.functions[params[0]].f(...params.slice(1));
        }
        throw new Error('Unsupported function: ' + params[0] + ', supported functions: ' + Object.keys(this.functions));
    }

    getParameter(inputs, properties, parameter) {
        const parameterRegex = /{([ipo])(\d+)}/g;
        const matches = parameter.match(parameterRegex);
        if (matches === null || matches[0].length !== 4 || !matches[0].startsWith("{") || !matches[0].endsWith("}")) {
            return parameter;
        }
        const param = matches[0];
        const type = param.substring(1, 2);
        const index = parseInt(param.substring(2, 3));
        switch (type) {
            case 'i':
                if (inputs[index] === undefined) {
                    throw new Error('Invalid input index: ' + index + ", maximum: " + inputs.length);
                }
                return inputs[index];
            case 'p':
                if (properties[index] === undefined) {
                    throw new Error('Invalid property index: ' + index + ", maximum: " + properties.length);
                }
                return properties[index];
            default:
                console.warn('It seems like you wanted to get a parameter of type: ' + type + ', but only i (input) and p (property) are supported');
                return parameter;
        }
    }
}

export { LogicProcessor };