import Replacer from "./Replacer";

export default function (input, stringsToBeReplaced) {
    return function Splitter(input, stringsToBeReplaced) {
        let normalInput = input;
        let alteredInput = Replacer.replace(alteredInput, stringsToBeReplaced);
        return {
            normalInput: normalInput,
            alteredInput: alteredInput
        };
    }
}