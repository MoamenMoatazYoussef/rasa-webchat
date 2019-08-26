import React, { Component } from "react";
import { Manager, Reference, Popper } from "react-popper";

import "../style.scss";
import "./style.scss";

//TODO: remove this after finishing
const contacts = require("../../../../../../../resources/accounts.json");
const KEY_DOWN = 40;
const KEY_UP = 38;
const KEY_ENTER = 13;

class AutocompleteInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentInput: "",
      dataList: contacts,

      autocompleteList: [],
      autocompleteStart: 0,
      autocompleteEnd: 0,
      autocompleteState: false,

      selected: 0
    };

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onClick = this.onClick.bind(this);

    this.setCurrentInput = this.setCurrentInput.bind(this);
    this.performNavigation = this.performNavigation.bind(this);
    this.performAutocomplete = this.performAutocomplete.bind(this);
    this.checkAutocomplete = this.checkAutocomplete.bind(this);

    this.getFromLastWord = this.getFromLastWord.bind(this);
    this.getAutocompleteEnd = this.getAutocompleteEnd.bind(this);
    this.matchWithArray = this.matchWithArray.bind(this);
  }

  /* <<<<<<<<<<<<<<<<<<<< Event handlers >>>>>>>>>>>>>>>>>>>> */

  onKeyDown(event) {
    const s = this.getFromLastWord(
      event.target.value,
      event.target.selectionStart
    );

    const autocompleteState = this.checkAutocomplete(s);

    if (autocompleteState) {
      event.keyCode === KEY_DOWN ||
      event.keyCode === KEY_UP ||
      event.keyCode === KEY_ENTER
        ? this.performNavigation(event)
        : this.performAutocomplete(event, s);
    } else {
      let newState = this.checkAutocomplete(s);
      if (newState) {
        this.performAutocomplete(event, s);
      } else {
        this.setCurrentInput(event);
      }
    }
  }

  onClick(i) {
    const { autocompleteList, autocompleteStart, currentInput } = this.state;
    const selectedOption = autocompleteList[i];

    const autocompleteEnd = this.getAutocompleteEnd(currentInput);

    const newInput =
      currentInput.substring(0, autocompleteStart) +
      selectedOption.displayName +
      currentInput.substr(autocompleteEnd);

    this.setState({
      currentInput: newInput,
      autocompleteList: [],
      autocompleteStart: 0,
      autocompleteEnd: 0,
      autocompleteState: false,
      selected: 0
    });
  }

  /* <<<<<<<<<<<<<<<<<<<< Business logic functions >>>>>>>>>>>>>>>>>>>> */

  setCurrentInput(event) {
    this.setState({
      currentInput: event.target.value,
      autocompleteState: false
    });
  }

  performNavigation(event) {
    const { autocompleteList, selected } = this.state;

    switch (event.keyCode) {
      case KEY_UP:
        event.preventDefault();
        this.setState(prevState => ({
          selected:
            prevState.selected === 0
              ? autocompleteList.length - 1
              : prevState.selected - 1
        }));
        return;

      case KEY_DOWN:
        event.preventDefault();
        this.setState(prevState => ({
          selected: (prevState.selected + 1) % autocompleteList.length
        }));
        return;

      case KEY_ENTER:
        event.preventDefault();
        this.onClick(selected);
        return;

      default:
        return;
    }
  }

  performAutocomplete(event, s) {
    const i = s.indexOf("@");
    const pattern = s.substr(i + 1);
    const { dataList } = this.state;
    const matchingWords = this.matchWithArray(pattern, dataList);

    this.setState({
      currentInput: event.target.value,
      autocompleteState: true,
      autocompleteStart: event.target.value.indexOf("@"),
      autocompleteEnd: event.target.selectionStart - 1,
      autocompleteList: matchingWords
    });
  }

  checkAutocomplete(s) {
    const i = s.indexOf("@");
    return !(i === -1);
  }

  /* <<<<<<<<<<<<<<<<<<<< Helper functions >>>>>>>>>>>>>>>>>>>> */

  getFromLastWord(s, cursorPosition) {
    let noOfSpaces = 0;
    let indexOfLastWord = 0;

    for (let i = cursorPosition; i >= 0 && noOfSpaces <= 2; i--) {
      if (s[i] === " ") {
        noOfSpaces++;
        indexOfLastWord = i;
      }
    }

    return s.substring(indexOfLastWord, cursorPosition);
  }

  getAutocompleteEnd(s) {
    const { autocompleteStart } = this.state;
    let i = autocompleteStart;

    while (s[i] !== " " && i < s.length) {
      i++;
    }

    return i;
  }

  matchWithArray(pattern, dataList) {
    let result = [];
    for (let i = 0; i < dataList.length; i++) {
      if (dataList[i].displayName.toLowerCase().match(pattern.toLowerCase())) {
        result.push(dataList[i]);
      }
    }
    return result;
  }

  /* <<<<<<<<<<<<<<<<<<<< Lifecycle methods >>>>>>>>>>>>>>>>>>>> */

  componentDidUpdate() {
    if (this.activeItem) {
      this.activeItem.scrollIntoView({
        block: "start"
      });
    }
  }

  render() {
    const { inputFieldTextHint, disabledInput } = this.props;
    const {
      autocompleteState,
      autocompleteList,
      selected,
      currentInput
    } = this.state;

    return (
      <div>
        <Manager tag={true}>
          <div className="position-relative">
            <Reference>
              {({ ref }) => (
                <input
                  ref={ref}
                  id="autocomplete-input"
                  type="text"
                  className="new-message"
                  name="message"
                  placeholder={inputFieldTextHint}
                  disabled={disabledInput}
                  autoFocus
                  autoComplete="off"
                  onChange={this.onKeyDown} //.bind(this)
                  onKeyDown={this.onKeyDown}
                  value={currentInput}
                />
              )}
            </Reference>

            {autocompleteState && (
              <Popper
                eventsEnabled={true}
                placement="top-end"
                style={{ opacity: 1 }}
              >
                {({ ref, style, placement, arrowProps }) => {
                  return (
                    <div
                      ref={ref}
                      style={style}
                      className="custom-popper"
                      data-placement={placement}
                    >
                      {autocompleteList.map((item, i) => (
                        <div
                          key={i}
                          ref={
                            selected === i
                              ? div => (this.activeItem = div)
                              : null
                          }
                          className={selected === i ? "selected-element" : ""}
                          onClick={() => this.onClick(i)}
                        >
                          {item.displayName}
                        </div>
                      ))}
                      <div ref={arrowProps.ref} style={arrowProps.style} />
                    </div>
                  );
                }}
              </Popper>
            )}
          </div>
        </Manager>
      </div>
    );
  }
}

export default AutocompleteInput;
