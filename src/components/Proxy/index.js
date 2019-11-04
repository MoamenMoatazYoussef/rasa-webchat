import axios from "axios";
import { connect } from "react-redux";
import { setAutocompleteList } from "actions";

class AutocompleteProxy {
    // constructor(props) {
    //     this.checkElementStructure = this.checkElementStructure.bind(this);
    //     this.checkListStructure = this.checkListStructure.bind(this);
    //     this.fetchElements = this.fetchElements.bind(this);
    // }

    // setAutocompleteList = dataList => this.props.setAutocompleteList(dataList);
    // setAutocompleteCallDestination = callDestination => 
    //     this.props.setAutocompleteCallDestination(callDestination);

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
            console.log("loaded from cache");
            this.setAutocompleteList(JSON.parse(localStorage.getItem("elements")));
            return;
        }

        let newElements = [];

        console.log(
            "fetching data from ",
            callDestination,
            ", refresh period: ",
            refreshPeriod
        );

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

                    console.log('hiiii', newElements);

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

class MessageProxy {
    constructor() {

    }
}

class Proxy {
    constructor() {
        const acProps = {

        }

        const msgProps = {

        }

        this.acProxy = new AutocompleteProxy(acProps);
        this.msgProxy = new MessageProxy(msgProps);
    }

    getAutocompleteProxy() {
        return this.acProxy;
    }

    getMsgProxy() {
        return this.msgProxy;
    }
}


const mapStateToProps = state => ({
    callDestination: state.autocomplete.get("callDestination"),
    refreshPeriod: state.autocomplete.get("refreshPeriod")
});

const mapDispatchToProps = dispatch => ({
    setAutocompleteCallDestination: (callDestination) => dispatch(setAutocompleteCallDestination(callDestination)),
    setAutocompleteList: (list) => dispatch(setAutocompleteList(list))
});

export default connect(mapStateToProps, mapDispatchToProps)(Proxy);