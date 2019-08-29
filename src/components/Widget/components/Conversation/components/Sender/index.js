import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import AutocompleteInput from "./AutocompleteInput";

import send from "assets/send_button.svg";
import "./style.scss";

const Sender = ({ sendMessage, inputFieldTextHint, disabledInput, contactsPath }) => (
  <form className="sender" onSubmit={sendMessage}>
    <AutocompleteInput
      inputFieldTextHint={inputFieldTextHint}
      disabledInput={disabledInput}
      autoFocus
      autoComplete="off"
      contactsPath={contactsPath}
    />
    <button type="submit" className="send">
      <img src={send} className="send-icon" alt="send" />
    </button>
  </form>
);

const mapStateToProps = state => ({
  inputFieldTextHint: state.behavior.get("inputFieldTextHint")
});

Sender.propTypes = {
  sendMessage: PropTypes.func,
  inputFieldTextHint: PropTypes.string,
  disabledInput: PropTypes.bool
};

export default connect(mapStateToProps)(Sender);
