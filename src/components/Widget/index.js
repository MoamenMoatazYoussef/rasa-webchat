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
import AutocompleteProxy from "../Proxy/AutocompleteProxy";
import MessageProxy from "../Proxy/MessageProxy";

import { store } from "../../store/store";
import watch from "redux-watch";

class Widget extends Component {
  constructor(props) {
    super(props);

    this.messages = [];
    setInterval(() => {
      if (this.messages.length > 0) {
        this.dispatchMessage(this.messages.shift());
      }
    }, this.props.interval);

    this.messageUrl = this.props.messageUrl;
    this.socketUrl = "http://10.10.19.158:5111";

    this.state = {
      sessionId: null // TODO: Take it out of local state?
    };

    this.acProxy = new AutocompleteProxy();
    this.msgProxy = new MessageProxy();

    this.stateEventsHandler = this.stateEventsHandler.bind(this);

    let w = watch(store.getState, ["behavior"]);
    console.log(w);
    store.subscribe(
      w((newVal, oldVal, objectPath) => {
        this.stateEventsHandler({
          newVal,
          oldVal,
          objectPath
        });
      })
      // this.stateEventsHandler
    );
  }

  stateEventsHandler(props) {
    const toSend = props.newVal.get("toSend");
    console.log(toSend);
    if (toSend !== null && toSend !== undefined) {
      this.sendIfStateChanged(toSend);
    }
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

    this.acProxy.fetchElements(this.props.listUrl, this.props.refreshPeriod);
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
    const { sessionId } = this.state;

    this.msgProxy
      .sendMessage(initPayload, sessionId, this.props.messageUrl)
      .then(response => this.prepareForDispatch(response));
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
            this.props.customComponent(message, message =>
              this.props.dispatch(sendMessage(message))
            ),
            props,
            true
          )
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
      const { sessionId } = this.state;

      this.props.dispatch(addUserMessage(cleanMessage));
      this.msgProxy
        .sendMessage(userUtteredWithMails, sessionId, this.props.messageUrl)
        .then(response => this.prepareForDispatch(response));
    }
  };

  removeTags(input) {
    return input.replace(/@/g, "").replace(/\f/g, "");
  }

  prepareForDispatch(response) {
    if (response.length == 0) {
      return;
    }

    setTimeout(() => {
      response.forEach(message => {
        this.dispatchMessage(message);
      });
    }, this.props.interval);
  }

  sendIfStateChanged(toSend) {
    const { sessionId } = this.state;

    if (toSend == null || toSend == undefined) return;
    console.log("About to send a message:", toSend);
    this.msgProxy
      .sendMessage(toSend, sessionId, this.props.messageUrl)
      .then(response => this.prepareForDispatch(response));
  }

  componentDidUpdate() {
    // this.sendIfStateChanged(this.props.toSend);
  }

  render() {
    // this.sendIfStateChanged(this.props.toSend);

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
