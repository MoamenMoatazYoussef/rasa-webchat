/* eslint-disable no-undef */
import React, { Component } from "react";
import { connect } from "react-redux";
import { sendMessage } from "actions";

class myCustomComponent extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { messageData } = this.props;

    const buttons = messageData.buttons;
    const id = messageData.id;
    return (
      <div className="message">
        <div className="response">
          <div className="message-text">
            <div className="markdown">
              <p>
                <span>{messageData.text}</span>
              </p>
            </div>
          </div>
          <div>
            {buttons &&
              buttons.map(btn => {
                console.log("The props are", props);
                return (
                  <input
                    id={id}
                    type="button"
                    value={btn.title}
                    onclick={props.dispatch(sendMessage(btn.payload))}
                  />
                );
              })}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  toSend: state.messages.get("toSend")
});

export default connect(mapStateToProps)(myCustomComponent);
