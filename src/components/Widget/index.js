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

    this.mySocket = this.props.socket;
    this.messageUrl = this.props.messageUrl;
    this.socketUrl = "http://10.10.19.158:5111";

    this.state = {
      sessionId:null
    }
  }

  componentDidMount() {
    this.props.dispatch(pullSession());
    this.props.dispatch(connectServer());
    try {
      // this.mySocket.sessionRequest();
    } catch (error) {
      console.log(error);
    }

    if (this.props.embedded && this.props.initialized) {
      this.props.dispatch(showChat());
      this.props.dispatch(openChat());
    }

    const getTokenFunction = "/getToken";

    axios.get(this.socketUrl + getTokenFunction)
      .then(response => {
        this.setState({
          sessionId: response.data.session_id
        });
        this.trySendInitPayload();
      })
      .catch(error => {
        console.log(error)
      }
    );
    
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
    console.log("sending init payload");
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

    console.log("The message is: ", message);

    // if (isArrayOfTexts(message)) {
    //   message.forEach(element => {
    //     this.props.dispatch(addResponseMessage(element.text));
    //   });
    // } else
    if (isText(message)) {
      console.log("I'm a text message!");
      this.props.dispatch(addResponseMessage(message.text));
    } else if (isQR(message)) {
      console.log("I'm a QR message!");
      this.props.dispatch(addQuickReply(message));
    } else if (isSnippet(message)) {
      console.log("I'm a Snippet message!");
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
      console.log("I'm a video message!");
      const element = message.attachment.payload;
      this.props.dispatch(
        addVideoSnippet({
          title: element.title,
          video: element.src
        })
      );
    } else if (isImage(message)) {
      console.log("I'm a image message!");
      const element = message.attachment.payload;
      this.props.dispatch(
        addImageSnippet({
          title: element.title,
          image: element.src
        })
      );
    } else {
      const props = message;

      console.log("I'm a custom message!", this.props.customComponent);

      if (this.props.customComponent) {
        console.log("I'm inside the if condition!!!!!");
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
    const { sessionId } = this.state;

    let headers = new Headers();
    headers.append('X-Requested-With' , 'XMLHttpRequest');

    axios
      .post(this.messageUrl,
        {
          text: toSend,
          session_id: sessionId
        }
        ,{ headers: headers }
      )
      .then(response => {
        if (response.data.length == 0) {
          return;
        }

        response.data.forEach(msg => {
          this.dispatchMessage(msg);
        });

        // if (this.socketId == response.data[0].recipient_id)
          // this.messages.push(response.data);
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
    if(this.props.toSend) {
      sendMessage(toSend);
    }
  }

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
  isChatVisible: state.behavior.get("isChatVisible"),
  toSend: state.messages.get("toSend")
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
