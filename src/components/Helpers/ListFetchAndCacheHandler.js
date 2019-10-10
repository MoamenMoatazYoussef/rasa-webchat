import axios from "axios";

import {
    connect
} from "react-redux";

class ListFetchAndCacheHandler {
    constructor(callDestination, refreshPeriod) {
        this.callDestination = callDestination;
        this.refreshPeriod = refreshPeriod;

        this.checkElementStructure = this.checkElementStructure.bind(this);
        this.checkListStructure = this.checkListStructure.bind(this);
        this.fetchElements = this.fetchElements.bind(this);

        this.fetchElements();
    }

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

    fetchElements() {
        let date = new Date().getHours();
        let oldDate = Number(localStorage.getItem("date"));
        let oldElements = localStorage.getItem("elements");

        if (oldElements && date - oldDate < this.refreshPeriod) {
            console.log("loaded from cache");
            this.setState({ //TODO: push list to state
                dataList: JSON.parse(localStorage.getItem("elements"))
            });
            return;
        }

        let newElements = [];

        console.log(
            "fetching data from ",
            this.callDestination,
            ", refresh period: ",
            this.refreshPeriod
        );

        axios
            .post(this.callDestination)
            .then(
                response => {
                    newElements = response.data.json_list;

                    if (newElements === undefined || newElements.length == 0) {
                        throw new Error("Retrieved list of elements is empty.");
                    }

                    if (!this.checkElementStructure(newElements[0], ["displayName", "mail"])) {
                        throw new Error("Invalid element structure.");
                    }

                    this.setState({ //TODO: push list to state
                        dataList: newElements
                    });

                    localStorage.setItem("elements", JSON.stringify(newElements));
                    localStorage.setItem("date", new Date().getHours());

                    return;
                },
                reason => {
                    alert(
                        `Warning: elements are not fetched, autocomplete is unavailable. \nReason: ${reason.message}`
                    );
                }
            )
            .catch(error => {
                alert(
                    `Warning: Error occured during elements fetch, autocomplete is unavailable.\nReason: ${error.message}`
                );
            });
    }
}

const mapStateToProps = state => ({
    callDestination: state.autocomplete.get("connected"),
    refreshPeriod: state.autocomplete.get("refreshPeriod")
});

const mapDispatchToProps = dispatch => ({
    setAutocompleteCallDestination: (callDestination) => dispatch(setAutocompleteCallDestination(callDestination)),
    setAutocompleteList: (list) => dispatch(setAutocompleteList(list))
});

export default connect(mapStateToProps, mapDispatchToProps)(ListFetchAndCacheHandler);