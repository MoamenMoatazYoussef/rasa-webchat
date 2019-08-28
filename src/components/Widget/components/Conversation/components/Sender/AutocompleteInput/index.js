import React, { Component } from "react";
import { Manager, Reference, Popper } from "react-popper";

import "../style.scss";
import "./style.scss";

//TODO: remove this after finishing
const contacts = require("../../../../../../../resources/accounts.json");

const KEY_DOWN = 40;
const KEY_UP = 38;
const KEY_ENTER = 13;
const PAGE_SIZE = 10;

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

      selected: 0,
      pageStart: 0,
      pageEnd: PAGE_SIZE,

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

    this.swapPageDown = this.swapPageDown.bind(this);
    this.swapPageUp = this.swapPageUp.bind(this);
    this.resetPages = this.resetPages.bind(this);
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
    const { autocompleteList, selected, pageStart, pageEnd } = this.state;

    switch (event.keyCode) {
      case KEY_UP:
        event.preventDefault();
        this.setState(prevState => ({
          selected:
            prevState.selected === 0
              ? (() => {
                  this.swapPageUp(autocompleteList.length);
                  return pageEnd - pageStart - 1;
                })()
              : prevState.selected - 1
        }));

        return;

      case KEY_DOWN:
        event.preventDefault();
        this.setState(prevState => ({
          selected:
            prevState.selected === pageEnd - pageStart - 1
              ? (() => {
                  this.swapPageDown(autocompleteList.length);
                  return 0;
                })()
              : prevState.selected + 1
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

  swapPageDown(listLength) {
    let { pageStart, pageEnd } = this.state;

    pageEnd =
      pageEnd + PAGE_SIZE >= listLength
        ? (PAGE_SIZE > listLength ? listLength : PAGE_SIZE)
        : pageEnd + PAGE_SIZE;

    pageStart =
      pageStart >= pageEnd
        ? 0
        : (PAGE_SIZE > listLength ? 0 : pageStart + PAGE_SIZE);

    this.setState({
      pageStart,
      pageEnd
    });
  }

  swapPageUp(listLength) {
    let { pageStart, pageEnd } = this.state;

    pageStart =
      pageStart - PAGE_SIZE < 0
        ? (PAGE_SIZE > listLength ? 0 : listLength - PAGE_SIZE)
        : pageStart - PAGE_SIZE;
    pageEnd =
      pageEnd < pageStart
        ? listLength
        : (PAGE_SIZE > listLength ? listLength : pageEnd - PAGE_SIZE);

    this.setState({
      pageStart,
      pageEnd
    });
  }

  resetPages(listLength) {
    this.setState({
      selected: 0,
      pageStart: 0,
      pageEnd: PAGE_SIZE < listLength ? PAGE_SIZE : listLength
    });
  }

  performAutocomplete(event, s) {
    const i = s.indexOf("@");
    const pattern = s.substr(i + 1);
    const { dataList } = this.state;
    const matchingWords = this.matchWithArray(pattern, dataList);

    this.resetPages(matchingWords.length);

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

    let i;

    for (i = cursorPosition; i >= 0 && noOfSpaces <= 2; i--) {
      if (s[i] === " ") {
        noOfSpaces++;
        indexOfLastWord = i;
      }
    }
    
    indexOfLastWord = noOfSpaces === 2 ? indexOfLastWord : 0;

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
        block: "nearest"
      });
    }

    // this.popper.update();

  }

  render() {
    const { inputFieldTextHint, disabledInput } = this.props;
    const {
      autocompleteState,
      autocompleteList,
      selected,
      currentInput,
      pageStart,
      pageEnd
    } = this.state;

    return (
      <div className=" w-100">
        <Manager tag={true}>
          <div className="position-relative">
            <Reference >
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
                ref={popper => (this.popper = popper)}
                eventsEnabled={true}
                placement="auto-start"
                modifiers={{
                  preventOverflow: {
                    boundariesElement: this
                  },
                  keepTogether: {
                    order: 100,
                    enabled: true,
                  },
                  inner: {
                    // enabled: true
                  },
                  computeStyle: {
                    gpuAcceleration: false,
                    x: "'top'"

                  }
                }}
                style={{ opacity: 1 }}
              >
                {({ ref, style, placement, arrowProps }) => {
                  // console.log(arrowProps);
                  return (
                    <div
                      ref={ref}
                      style={style}
                      className="custom-popper"
                      data-placement={placement}
                    >
                      {autocompleteList
                        .slice(pageStart, pageEnd)
                        .map((item, i) => (
                          <div
                            key={i}
                            ref={
                              selected === i
                                ? div => (this.activeItem = div)
                                : null
                            }
                            className={selected === i ? "element selected-element" : "element"}
                            onClick={() => this.onClick(i)}
                          >
                            {item.displayName}
                          </div>
                        ))}
                      {/* <div ref={arrowProps.ref} style={arrowProps.style} /> */}
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
