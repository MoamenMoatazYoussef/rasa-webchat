export default class Replacer {
    constructor(list, propertyToBeReplaced, propertyToReplace) {
        this.replaceMap = new Map();

        if (list && propertyToBeReplaced && propertyToReplace) {
            list.forEach(element => {
                this.replaceMap.set(
                    element[propertyToBeReplaced],
                    element[propertyToReplace]);
            });
        }

        this.propertyToBeReplaced = propertyToBeReplaced;
        this.propertyToReplace = propertyToReplace;
    }

    testReplace() {

    }

    replace(inputString, elements) {
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
}