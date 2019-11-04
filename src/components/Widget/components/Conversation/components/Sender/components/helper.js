export function replace(inputString, elements) {
    let result = inputString;

    if (!elements.length) {
        return inputString;
    }

    elements.forEach(element => {
        result = result.replace(
            element,
            this.replaceMap[element]);
    });

    return result;
}

