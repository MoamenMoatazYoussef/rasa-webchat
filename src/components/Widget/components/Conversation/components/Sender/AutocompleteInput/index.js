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

    this.performAutocomplete = this.performAutocomplete.bind(this);
    this.getFromLastWord = this.getFromLastWord.bind(this);

    this.getAutocompleteEnd = this.getAutocompleteEnd.bind(this);
    this.matchWithArray = this.matchWithArray.bind(this);

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  /* <<<<<<<<<<<<<<<<<<<< Event handlers >>>>>>>>>>>>>>>>>>>> */

  onInput(event) {
    const s = this.getFromLastWord(
      event.target.value,
      event.target.selectionStart
    );

    const i = s.indexOf("@");
    if (i === -1) {
      this.setState({
        currentInput: event.target.value,
        autocompleteState: false
      });
      return;
    }

    const pattern = s.substr(i + 1);
    const matchingWords = this.performAutocomplete(pattern);

    this.setState({
      currentInput: event.target.value,

      autocompleteState: true,
      autocompleteStart: event.target.value.indexOf("@"),
      autocompleteEnd: event.target.selectionStart - 1,
      autocompleteList: matchingWords
    });
  }

  onKeyDown(event) {
    const { autocompleteState, autocompleteList, selected } = this.state;

    if (autocompleteState) {
      if (event.keyCode === KEY_UP && selected <= autocompleteList.length - 1) {
        event.preventDefault();

        this.setState(prevState => ({
          selected:
            prevState.selected === 0
              ? autocompleteList.length - 1
              : prevState.selected - 1
        }));
      } else if (event.keyCode === KEY_DOWN && selected >= 0) {
        event.preventDefault();

        this.setState(prevState => ({
          selected: (prevState.selected + 1) % autocompleteList.length
        }));
      } else if (event.keyCode === KEY_ENTER) {
        event.preventDefault();
        this.onClick(selected);
      }

      return;
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

  performAutocomplete(pattern) {
    const { dataList } = this.state;
    let matchingWords = this.matchWithArray(pattern, dataList);

    return matchingWords;
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
      <div className="z-index-10">
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
                  onChange={this.onInput.bind(this)}
                  onKeyDown={this.onKeyDown}
                  value={currentInput}
                />
              )}
            </Reference>

            {autocompleteState && (
              <Popper
                eventsEnabled={true}
                placement="top"
                style={{ opacity: 1 }}
              >
                {({ ref, style, placement, arrowProps }) => {
                  return (
                    <div
                      ref={ref}
                      style={style}
                      className="custom-popper w-100 "
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
