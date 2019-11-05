import axios from "axios";
import watch from 'redux-watch';
import {
    setAutocompleteList
} from "actions";
import { store } from "../../store/store";

class AutocompleteProxy {
    constructor() {}

    setAutocompleteList = list => store.dispatch(setAutocompleteList(list))

    checkElementStructure(element, attributes) {
        let temp = element;

        for (let i = 0; i < attributes.length; i++) {
            if (temp[attributes[i]] == undefined) {
                return false;
            }
        }

        return true;
    }

    checkListStructure(elementList) {
        for (let i = 0; i < elementList.length; i++) {
            if (
                !this.checkElementStructure(elementList[i], ["displayName", "mail"])
            ) {
                return false;
            }
        }
        return true;
    }

    fetchElements(callDestination, refreshPeriod) {
        let date = new Date().getHours();
        let oldDate = Number(localStorage.getItem("date"));
        let oldElements = localStorage.getItem("elements");

        if (oldElements && date - oldDate < refreshPeriod) {
            this.setAutocompleteList(JSON.parse(localStorage.getItem("elements")));
            return;
        }

        let newElements = [];

        console.log(callDestination);

        axios
            .post(callDestination)
            .then(
                response => {
                    newElements = response.data.json_list;

                    if (newElements === undefined || newElements.length == 0) {
                        throw new Error("Retrieved list of elements is empty.");
                    }

                    if (!this.checkElementStructure(newElements[0], ["displayName", "mail"])) {
                        throw new Error("Invalid element structure.");
                    }

                    this.setAutocompleteList(newElements);

                    localStorage.setItem("elements", JSON.stringify(newElements));
                    localStorage.setItem("date", new Date().getHours());

                    return;
                },
                reason => {
                    alert(
                        `Warning: Response Rejected, Elements are not fetched, autocomplete is unavailable. \nReason: ${reason.message}`
                    );
                    this.setAutocompleteList([]);
                }
            )
            .catch(error => {
                alert(
                    `Warning: Error occured during elements fetch, autocomplete is unavailable.\nReason: ${error.message}`
                );
                this.setAutocompleteList([]);
            });
    }
}

export default AutocompleteProxy;