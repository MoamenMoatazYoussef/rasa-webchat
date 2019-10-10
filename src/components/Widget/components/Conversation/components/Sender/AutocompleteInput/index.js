import React, { Component } from "react";
import { connect } from "react-redux";
import { Manager, Reference, Popper } from "react-popper";

import {
  // setAutocompleteList,
  // setAutocompleteCallDestination,
  // setAutocompleteElementsToReplace,
  setAutocompleteState,
  setAutocompleteCurrentInput,
  setAutocompleteSelected,
  setAutocompletePositions,
  // setAutocompleteAlteredInput
} from "actions";

import Replacer from "../../../../../../Helpers/Replacer";
import ListFetchAndCacheHandler from "../../../../../../Helpers/ListFetchAndCacheHandler";

import "../style.scss";
import "./style.scss";

const KEY_DOWN = 40; //TODO: move to constants file and import them
const KEY_UP = 38;
const KEY_ENTER = 13;
const KEY_DELETE = 8;

class AutocompleteInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      autocompleteList: []
    };

    this.selectedStrings = [];
    this.startTag = "@";
    this.endTag = "\f"; //"$";
    this.replacer = new Replacer(this.props.dataList, "name", "mail");

    this.autocompleteStart = 0;
    this.autocompleteEnd = 0;

    this.onKeyDown = this.onKeyDown.bind(this); //TODO: move to List
    this.onKeyUp = this.onKeyUp.bind(this);     //TODO: move to List
    this.onClick = this.onClick.bind(this);     //TODO: keep here
    this.onSubmit = this.onSubmit.bind(this);   //TODO: keep here

    this.performNavigation = this.performNavigation.bind(this);
    this.performAutocomplete = this.performAutocomplete.bind(this);
    this.checkAutocomplete = this.checkAutocomplete.bind(this);

    this.getFromLastWord = this.getFromLastWord.bind(this);
    this.getAutocompleteEnd = this.getAutocompleteEnd.bind(this);
    this.matchWithArray = this.matchWithArray.bind(this);
  }

  /* <<<<<<<<<<<<<<<<<<<< Redux wrapper functions >>>>>>>>>>>>>>>>>>>> */

  setCurrentInput = input => this.props.setCurrentInput(input);
  setAutocompleteState = autocompleteState => this.props.setAutocompleteState(autocompleteState);
  setAutocompleteSelected = selected => this.props.setAutocompleteSelected(selected);
  setAutocompletePositions = positions => this.props.setAutocompletePositions(positions);

  /* <<<<<<<<<<<<<<<<<<<< Event handlers >>>>>>>>>>>>>>>>>>>> */

  onKeyDown(event) {
    if (event.keyCode === KEY_DELETE) {
      const cursorPosition = event.target.selectionEnd;
      event.target.value = this.onDelete(event);
      event.target.selectionEnd = cursorPosition;
      this.setCurrentInput(event.target.value);
      return;
    }

    const { autocompleteState } = this.props;

    const i = event.target.selectionStart - 1;
    const newAutocompleteState = event.target.value[i] === "@";

    if (autocompleteState || newAutocompleteState) {
      this.performNavigation(event);
    } else {
      if (event.keyCode === KEY_ENTER) {
        // debugger;
        event.target.mailInput = this.replacer.replace(
          event.target.value,
          this.selectedStrings
        );
        return;
      }
    }
  }

  onKeyUp(event) {
    const { currentInput, autocompleteState } = this.props;

    const i = event.target.selectionStart - 1;
    const newAutocompleteState = event.target.value[i] === "@";
    const changed = event.target.value !== currentInput;

    if (changed && (autocompleteState || newAutocompleteState)) {
      this.performAutocomplete(event, i);
    } else {
      if (event.keyCode === KEY_ENTER) {
        this.onSubmit(event);
      } else {
        this.setCurrentInput(event.target.value);
      }
    }
  }

  onClick(i, cursorPosition, event) {
    const { autocompleteList, currentInput } = this.props;
    const selectedOption = autocompleteList[i];

    const autocompleteStart = this.getAutocompleteStart(
      currentInput,
      cursorPosition
    );

    const autocompleteEnd =
      this.getAutocompleteEnd(currentInput, cursorPosition) < cursorPosition
        ? cursorPosition
        : this.getAutocompleteEnd(currentInput, cursorPosition);

    const newInput =
      currentInput.substring(0, autocompleteStart) +
      this.startTag +
      selectedOption.displayName +
      this.endTag +
      currentInput.substr(autocompleteEnd);

    event.target.value = newInput;
    event.target.selectionEnd = (
      currentInput.substring(0, autocompleteStart) +
      this.startTag +
      selectedOption.displayName +
      this.endTag
    ).length;

    this.autocompleteStart = 0;
    this.autocompleteEnd = 0;
    this.selectedStrings = [
      ...this.selectedStrings,
      this.startTag + selectedOption.displayName + this.endTag
    ];

    this.setCurrentInput(newInput);
    this.setAutocompleteState(false);
    this.setAutocompleteSelected(0);

    this.setState({
      autocompleteList: []
    });
  }

  onSubmit(event) {
    event.target.mailInput = this.replacer.replace(
      event.target.value,
      this.selectedStrings
    );
  }

  onDelete(event) {
    let state = this.whereAmI(event.target.value, event.target.selectionStart);
    switch (state) {
      default:
      case "normal":
        return event.target.value;
      case "tag":
        let tagPosition, newInput;
        try {
          tagPosition = this.getTagPosition(
            event.target.value,
            event.target.selectionStart
          );
          newInput = this.deleteName(
            event.target.value,
            tagPosition.start,
            tagPosition.end
          );
          event.preventDefault();
        } catch (e) {
          console.log(e);
          newInput = event.target.value;
        }

        this.setAutocompleteState(false);
        return newInput;
    }
  }

  /* <<<<<<<<<<<<<<<<<<<< Business logic functions >>>>>>>>>>>>>>>>>>>> */

  performNavigation(event) {
    const { autocompleteList } = this.state;
    const { selected } = this.props;

    switch (event.keyCode) {
      case KEY_UP:
        event.preventDefault();
        this.setAutocompleteSelected(
          selected === 0 ? autocompleteList.length - 1 : prevState.selected - 1
        );
        return;

      case KEY_DOWN:
        event.preventDefault();
        this.setAutocompleteSelected(
          (prevState.selected + 1) % autocompleteList.length
        );
        return;

      case KEY_ENTER:
        if (filteredList[selected] === undefined) {
          return;
        }
        event.preventDefault();
        this.onClick(selected, event.target.selectionStart, event);
        return;

      default:
        return;
    }
  }

  performAutocomplete(event) {
    const startIndex = this.getAutocompleteStart(
      event.target.value,
      event.target.selectionStart
    );
    const pattern = event.target.value.substring(
      startIndex + 1,
      event.target.selectionStart
    );
    const dataList = this.props.dataList;
    const matchingWords = this.matchWithArray(pattern, dataList);

    this.autocompleteStart = startIndex;
    this.autocompleteEnd = event.target.selectionStart - 1;

    this.setCurrentInput(event.target.value);

    this.setAutocompleteState(true);

    this.setState({
      autocompleteList: matchingWords
    });
  }

  checkAutocomplete(s, cursorPosition) {
    const i = s.indexOf("@");
    return i === cursorPosition - 1;
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

    if (i === -1) {
      indexOfLastWord = 0;
    }

    return s.substring(indexOfLastWord, cursorPosition);
  }

  getAutocompleteStart(s, start) {
    let i = start;
    while (s[i] !== "@" && i >= 0) {
      i--;
    }
    return i;
  }

  getAutocompleteEnd(s, start) {
    let i = start;
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

  whereAmI(input, start) {
    if (
      input[start - 1] === this.startTag ||
      input[start - 1] === this.endTag
    ) {
      return "tag";
    }

    for (let i = start; i <= input.length - (this.startTag.length - 1); i++) {
      if (input.substr(i, this.startTag.length) === this.startTag) {
        return "normal";
      } else if (input.substr(i, this.endTag.length) === this.endTag) {
        return "tag";
      }
    }
    return "normal";
  }

  getTagPosition(input, start) {
    let startTagPosition, endTagPosition;

    switch (input[start - 1]) {
      case this.endTag:
        endTagPosition = start - 1;
        break;
      case this.startTag:
        startTagPosition = start - 1;
        break;
      default:
        break;
    }

    if (endTagPosition === undefined) {
      for (let i = start - 1; i < input.length; i++) {
        if (input[i] === this.endTag) {
          endTagPosition = i + this.endTag.length - 1;
          break;
        }
      }
    }

    if (startTagPosition === undefined) {
      for (let i = start - 1; i >= 0; i--) {
        if (input[i] === this.startTag) {
          startTagPosition = i;
          break;
        }
      }
    }

    return {
      start: startTagPosition,
      end: endTagPosition || startTagPosition
    };
  }

  deleteName(input, start, end) {
    return input.substring(0, start) + input.substr(end + 1);
  }

  /* <<<<<<<<<<<<<<<<<<<< Lifecycle methods >>>>>>>>>>>>>>>>>>>> */

  componentDidMount() {
    // ListFetchAndCacheHandler.fetchElements();
  }

  componentDidUpdate() {
    if (this.activeItem) {
      this.activeItem.scrollIntoView({
        block: "nearest"
      });
    }
  }

  render() {
    const {
      inputFieldTextHint,
      disabledInput,
      autocompleteState,
      selected
    } = this.props;
    const { autocompleteList, pageStart, pageEnd } = this.state;

    return (
      <div className=" w-100">
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
                  onKeyUp={this.onKeyUp}
                  onKeyDown={this.onKeyDown}
                  onSubmit={() => this.onSubmit(this)}
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
                    enabled: true
                  },
                  inner: {},
                  computeStyle: {
                    gpuAcceleration: false,
                    x: "'top'"
                  }
                }}
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
                      {filteredList
                        .slice(pageStart, pageEnd)
                        .map((item, i) => (
                          <div
                            key={i}
                            ref={
                              selected === i
                                ? div => (this.activeItem = div)
                                : null
                            }
                            className={
                              selected === i
                                ? "element selected-element"
                                : "element"
                            }
                            onClick={() => this.onClick(i)}
                          >
                            {item.displayName}
                          </div>
                        ))}
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

const mapStateToProps = state => ({
  dataList: state.autocomplete.get("dataList"),
  autocompleteState: state.autocomplete.get("autocompleteState"),
  currentInput: state.autocomplete.get("currentInput"),
  selected: state.autocomplete.get("selected")
});

const mapDispatchToProps = dispatch => ({
  setCurrentInput: input => dispatch(setAutocompleteCurrentInput(input)),
  setAutocompleteState: autocompleteState =>
    dispatch(setAutocompleteState(autocompleteState)),
  setAutocompleteSelected: selected =>
    dispatch(setAutocompleteSelected(selected)),
  setAutocompletePositions: positions =>
    dispatch(setAutocompletePositions(positions))
});

export default connect(mapStateToProps, mapDispatchToProps)(AutocompleteInput);
