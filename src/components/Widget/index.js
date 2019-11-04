/* eslint-disable no-undef */
import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import {
  toggleChat,
  connectServer,
  openChat,
  showChat,
  addUserMessage,
  addResponseMessage,
  addLinkSnippet,
  addVideoSnippet,
  addImageSnippet,
  addQuickReply,
  renderCustomComponent,
  initialize,
  pullSession,
  sendMessage
} from "actions";

import { isSnippet, isVideo, isImage, isQR, isText } from "./msgProcessor";
import WidgetLayout from "./layout";

import { getLocalSession } from "../../store/reducers/helper";
import { SESSION_NAME } from "constants";

import axios from "axios";
import { store } from "../../store/store";

class Widget extends Component {
  constructor(props) {
    super(props);
    this.messages = [];
    setInterval(() => {
      if (this.messages.length > 0) {
        this.dispatchMessage(this.messages.shift());
      }
    }, this.props.interval);

    this.mySocket = this.props.socket;
    this.messageUrl = this.props.messageUrl;
    this.socketUrl = "http://10.10.19.158:5111";

    this.state = {
      sessionId: null
    };

    this.stateEventsHandler = this.stateEventsHandler.bind(this);
    // this.sendMessage = this.sendMessage.bind(this);

  }

  stateEventsHandler() {
    console.log("Inside the stateEventsHandler");
    // if(!this.props) return;
    // const toSend = this.props.toSend;
    // if (toSend) {
    //   console.log("About to send:", toSend);
    //   // debugger;
    //   this.sendMessage(toSend);
    // }
  }

  componentDidMount() {
    this.props.dispatch(pullSession());
    this.props.dispatch(connectServer());
    try {
    } catch (error) {
      console.log(error);
    }

    if (this.props.embedded && this.props.initialized) {
      this.props.dispatch(showChat());
      this.props.dispatch(openChat());
    }

    const getTokenFunction = "/getToken";

    axios
      .get(this.socketUrl + getTokenFunction)
      .then(response => {
        this.setState({
          sessionId: response.data.session_id
        });
        this.trySendInitPayload();
      })
      .catch(error => {
        console.log(error);
      });


    // store.subscribe(this.stateEventsHandler);
  }

  componentDidUpdate() {
    this.props.dispatch(pullSession());
    if (this.props.embedded && this.props.initialized) {
      this.props.dispatch(showChat());
      this.props.dispatch(openChat());
    }
  }

  componentWillUnmount() {}

  getSessionId() {
    const { storage } = this.props;
    const localSession = getLocalSession(storage, SESSION_NAME);

    const local_id = localSession ? localSession.session_id : null;
    return local_id;
  }

  trySendInitPayload = () => {
    const { initPayload } = this.props;
    this.sendMessage(initPayload);
    this.props.dispatch(initialize());
  };

  toggleConversation = () => {
    this.props.dispatch(toggleChat());
  };

  dispatchMessage(message) {
    if (Object.keys(message).length === 0) {
      return;
    }

    if (isText(message)) {
      this.props.dispatch(addResponseMessage(message.text));
    } else if (isQR(message)) {
      this.props.dispatch(addQuickReply(message));
    } else if (isSnippet(message)) {
      const element = message.attachment.payload.elements[0];
      this.props.dispatch(
        addLinkSnippet({
          title: element.title,
          content: element.buttons[0].title,
          link: element.buttons[0].url,
          target: "_blank"
        })
      );
    } else if (isVideo(message)) {
      const element = message.attachment.payload;
      this.props.dispatch(
        addVideoSnippet({
          title: element.title,
          video: element.src
        })
      );
    } else if (isImage(message)) {
      const element = message.attachment.payload;
      this.props.dispatch(
        addImageSnippet({
          title: element.title,
          image: element.src
        })
      );
    } else {
      const props = message;

      if (this.props.customComponent) {
        this.props.dispatch(
          renderCustomComponent(
            this.props.customComponent(message, (message) => this.props.dispatch(sendMessage(message)))
            , props, true
            )
        );
      }
    }

    console.log("-------------------------------------------");
  }

  handleMessageSubmit = event => {
    event.preventDefault();
    const userUttered = event.target.message.value;
    let userUtteredWithMails = userUttered;

    if (
      event.target.message.mailInput !== undefined &&
      event.target.message.mailInput !== ""
    ) {
      userUtteredWithMails = event.target.message.mailInput;
    }

    let cleanMessage = this.removeTags(userUttered);

    event.target.message.value = "";

    if (userUttered) {
      this.props.dispatch(addUserMessage(cleanMessage));
      this.props.dispatch(sendMessage(userUtteredWithMails));
    }
  };

  //TODO: Moamen added this
  removeTags(input) {
    return input.replace(/@/g, "").replace(/\f/g, "");
  }

  sendMessage(toSend) {
    console.log("Sending:", toSend);
    if(!toSend) {
      return;
    }
    const { sessionId } = this.state;

    let headers = new Headers();
    headers.append("X-Requested-With", "XMLHttpRequest");

    axios
      .post(
        this.messageUrl,
        {
          text: toSend,
          session_id: sessionId
        },
        { headers: headers }
      )
      .then(response => {
        if (response.data.length == 0) {
          return;
        }

        setTimeout(() => {
          response.data.forEach(message => {
            this.dispatchMessage(message);
          });
        }, this.props.interval);
      })
      .catch(error => {
        console.log("Error during sending/receiving a message:", error);
        this.messages.push([
          {
            text: "An error has occured, conversation restarted...",
            session_id: sessionId
          }
        ]);
      });
  }
  //TODO: ENDOF Moamen added this

  componentDidUpdate() {
    // const toSend = this.props.toSend;
    // console.log("About to send:", toSend);
    // if (toSend) {
    //   this.sendMessage(toSend);
    // }
  }

  render() {
    
    const toSend = this.props.toSend;
    if (toSend) {
      console.log("About to send:", toSend);
      // debugger;
      this.sendMessage(toSend);
    }

    return (
      <WidgetLayout
        toggleChat={this.toggleConversation}
        onSendMessage={this.handleMessageSubmit}
        title={this.props.title}
        subtitle={this.props.subtitle}
        customData={this.props.customData}
        profileAvatar={this.props.profileAvatar}
        showCloseButton={this.props.showCloseButton}
        hideWhenNotConnected={this.props.hideWhenNotConnected}
        fullScreenMode={this.props.fullScreenMode}
        isChatOpen={this.props.isChatOpen}
        isChatVisible={this.props.isChatVisible}
        badge={this.props.badge}
        embedded={this.props.embedded}
        params={this.props.params}
        openLauncherImage={this.props.openLauncherImage}
        closeImage={this.props.closeImage}
        customComponent={this.props.customComponent}
        listUrl={this.props.listUrl}
        refreshPeriod={this.props.refreshPeriod}
      />
    );
  }
}

const mapStateToProps = state => ({
  initialized: state.behavior.get("initialized"),
  connected: state.behavior.get("connected"),
  isChatOpen: state.behavior.get("isChatOpen"),
  isChatVisible: state.behavior.get("isChatVisible"),
  toSend: state.behavior.get("toSend")

});

// const mapDispatchToProps = dispatch => ({
//   sendNewMessage: msg => dispatch(sendMessage(msg))
// });

Widget.propTypes = {
  interval: PropTypes.number,
  title: PropTypes.string,
  customData: PropTypes.shape({}),
  subtitle: PropTypes.string,
  initPayload: PropTypes.string,
  profileAvatar: PropTypes.string,
  showCloseButton: PropTypes.bool,
  hideWhenNotConnected: PropTypes.bool,
  fullScreenMode: PropTypes.bool,
  isChatVisible: PropTypes.bool,
  isChatOpen: PropTypes.bool,
  badge: PropTypes.number,
  socket: PropTypes.shape({}),
  embedded: PropTypes.bool,
  params: PropTypes.object,
  connected: PropTypes.bool,
  initialized: PropTypes.bool,
  openLauncherImage: PropTypes.string,
  closeImage: PropTypes.string,
  customComponent: PropTypes.func
};

Widget.defaultProps = {
  isChatOpen: false,
  isChatVisible: true
};

export default connect(mapStateToProps, null)(Widget);
