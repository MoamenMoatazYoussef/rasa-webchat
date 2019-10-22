/* eslint-disable no-undef */
import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import {
  toggleChat,
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
  pullSession
} from "actions";

import {
  isSnippet,
  isVideo,
  isImage,
  isQR,
  isText,
  isArrayOfTexts
} from "./msgProcessor";
import WidgetLayout from "./layout";

import { getLocalSession } from "../../store/reducers/helper";
import { SESSION_NAME } from "constants";

import mySocket from "../../mysocket";
import axios from "axios";
const MAX_TIMEOUT = 480000;

class Widget extends Component {
  constructor(props) {
    super(props);
    this.messages = [];
    setInterval(() => {
      if (this.messages.length > 0) {
        this.dispatchMessage(this.messages.shift());
      }
    }, this.props.interval);

    console.log(this.props);

    this.mySocket = this.props.socket;
    //new mySocket(this.props.socketUrl, this.props.messageUrl, MAX_TIMEOUT);
    this.messageUrl = this.props.messageUrl;
    console.log(this.mySocket);
  }

  componentDidMount() {
    this.props.dispatch(pullSession());
    try {
      // this.mySocket.sessionRequest();
    } catch (error) {
      console.log(error);
    }

    if (this.props.embedded && this.props.initialized) {
      this.props.dispatch(showChat());
      this.props.dispatch(openChat());
    }
  }

  componentDidUpdate() {
    this.props.dispatch(pullSession());
    this.trySendInitPayload();
    if (this.props.embedded && this.props.initialized) {
      this.props.dispatch(showChat());
      this.props.dispatch(openChat());
    }
  }

  componentWillUnmount() {}

  getSessionId() {
    const { storage } = this.props;
    const localSession = getLocalSession(storage, SESSION_NAME);

    console.log(localSession);
    const local_id = localSession ? localSession.session_id : null;
    return local_id;
  }

  trySendInitPayload = () => {
    const { initPayload } = this.props;
    console.log("sending init payload");
    this.sendMessage(initPayload);
    this.props.dispatch(initialize());
  };

  toggleConversation = () => {
    this.props.dispatch(toggleChat());
  };

  dispatchMessage(message) {
    console.log(message);

    if (Object.keys(message).length === 0) {
      return;
    }

    if (isArrayOfTexts(message)) {
      message.forEach(element => {
        this.props.dispatch(addResponseMessage(element.text));
      });
    } else if (isText(message)) {
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
          renderCustomComponent(this.props.customComponent, props, true)
        );
      }
    }
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
      this.sendMessage(userUtteredWithMails);
    }
  };

  //TODO: Moamen added this
  removeTags(input) {
    return input.replace(/@/g, "").replace(/\f/g, "");
  }

  sendMessage(toSend) {
    let proxyUrl = "https://cors-anywhere.herokuapp.com/";
    proxyUrl = "";
    const sessionId = 500;

    let headers = new Headers();

    headers.append('X-Requested-With' , 'XMLHttpRequest');
    

    // headers.append("origin", "http://localhost:8080");

    console.log(headers.get("X-Requested-With"));

    axios
      .post(
        proxyUrl + this.messageUrl,
        {
          text: toSend,
          session_id: sessionId
        }
        ,{ headers: headers }
      )
      .then(response => {
        console.log("received:", response.data);
        if (response.data.length == 0) {
          return;
        }

        // if (this.socketId == response.data[0].recipient_id)
          this.messages.push(response.data);
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

  render() {
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
  isChatVisible: state.behavior.get("isChatVisible")
});

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

export default connect(mapStateToProps)(Widget);
