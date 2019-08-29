import React, { Component } from "react";
import { Manager, Reference, Popper } from "react-popper";
import axios from "axios";

import "../style.scss";
import "./style.scss";

//TODO: remove this after finishing
const contacts = require("../../../../../../../resources/accounts.json");

const KEY_DOWN = 40;
const KEY_UP = 38;
const KEY_ENTER = 13;
const KEY_DELETE = 8;

class AutocompleteInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentInput: "",
      mailPositions: [],
      dataList: contacts,

      autocompleteList: [],
      autocompleteStart: 0,
      autocompleteEnd: 0,
      autocompleteState: false,

      selected: 0
    };

    this.startTag = "\f";
    this.endTag = "\0";

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.setCurrentInput = this.setCurrentInput.bind(this);
    this.performNavigation = this.performNavigation.bind(this);
    this.performAutocomplete = this.performAutocomplete.bind(this);
    this.checkAutocomplete = this.checkAutocomplete.bind(this);

    this.getFromLastWord = this.getFromLastWord.bind(this);
    this.getAutocompleteEnd = this.getAutocompleteEnd.bind(this);
    this.matchWithArray = this.matchWithArray.bind(this);
    this.replaceNamesWithMails = this.replaceNamesWithMails.bind(this);
  }

  /* <<<<<<<<<<<<<<<<<<<< Event handlers >>>>>>>>>>>>>>>>>>>> */

  onKeyDown(event) {
    if (event.keyCode === KEY_DELETE) {
      event.target.value = this.onDelete(event);
      this.setCurrentInput(event);
      return;
    }

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
      if (event.keyCode === KEY_ENTER) {
        this.onSubmit(event);
      } else {
        this.setCurrentInput(event);
      }
    }
  }

  onClick(i, cursorPosition, event) {
    const {
      autocompleteList,
      autocompleteStart,
      currentInput,
      mailPositions
    } = this.state;
    const selectedOption = autocompleteList[i];

    const autocompleteEnd = //TODO: this is a bug fix tryout
      this.getAutocompleteEnd(currentInput) < cursorPosition
        ? cursorPosition
        : this.getAutocompleteEnd(currentInput);

    const newInput =
      currentInput.substring(0, autocompleteStart) +
      this.startTag +
      selectedOption.displayName +
      this.endTag +
      currentInput.substr(autocompleteEnd);

    this.setState({
      currentInput: newInput,
      mailPositions: [
        ...mailPositions,
        {
          mail: selectedOption.mail,
          name: selectedOption.displayName
        }
      ],
      autocompleteList: [],
      autocompleteStart: 0,
      autocompleteEnd: 0,
      autocompleteState: false,
      selected: 0
    });
  }

  onSubmit(event) {
    event.target.mailInput = this.replaceNamesWithMails(event);
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
        } catch (e) {
          console.log(e);
          newInput = event.target.value;
        }
        return newInput;
    }
  }

  whereAmI(input, start) {
    for (let i = start; i < input.length - this.startTag.length + 1; i++) {
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
    for (let i = start; i < input.length; i++) {
      if (input.substr(i, this.endTag.length) === this.endTag) {
        endTagPosition = i + this.endTag.length - 1;
        break;
      }
    }

    for (let i = start; i >= 0; i--) {
      if (input.substr(i, this.startTag.length) === this.startTag) {
        startTagPosition = i;
        break;
      }
    }

    return {
      start: startTagPosition,
      end: endTagPosition
    };
  }

  deleteName(input, start, end) {
    return input.substring(0, start) + input.substr(end + 1);
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
        this.onClick(selected, event.target.selectionStart, event);
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

  replaceNamesWithMails(event) {
    let input = event.target.value;
    let result = input;
    const { mailPositions } = this.state;

    if (!mailPositions.length) {
      return input;
    }

    for (let i = 0; i < mailPositions.length; i++) {
      result = result.replace(mailPositions[i].name, mailPositions[i].mail);
    }

    return result;
  }

  /* <<<<<<<<<<<<<<<<<<<< Lifecycle methods >>>>>>>>>>>>>>>>>>>> */

  componentDidMount() {
    // axios.get(this.props.contactsPath) // JSON File Path
    //   .then(response => {
    //     this.setState({
    //       dataList: response.data
    //     });
    //   })
    //   .catch(function(error) {
    //     console.log(error);
    //     this.setState({
    //       dataList: contacts
    //     });
    //   });

    // let dataList = {};
    // fetch(this.props.contactsPath)
    // .then(res => res.json())
    // .then(data => dataList = data)
    // .catch(error => console.log(error));
    // dataList = require(this.props.contactsPath);
    // console.log(dataList);
    // this.setState({
    //   dataList
    // });
  }

  componentDidUpdate() {
    if (this.activeItem) {
      this.activeItem.scrollIntoView({
        block: "nearest"
      });
    }
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
                  onSubmit={() => this.onSubmit(this)}
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
                    enabled: true
                  },
                  inner: {
                    
                  },
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

export default AutocompleteInput;
