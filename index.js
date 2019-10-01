import React from 'react';
import ReactDOM from 'react-dom';
import { Widget, toggleChat, openChat, closeChat, showChat, hideChat, isOpen, isVisible } from './index_for_react_app';

const plugin = {
  init: (args) => {
    ReactDOM.render(
      <Widget
        socketUrl={args.socketUrl}
        socketPath={args.socketPath}
        interval={args.interval}
        initPayload={args.initPayload}
        title={args.title}
        subtitle={args.subtitle}
        customData={args.customData}
        inputTextFieldHint={args.inputTextFieldHint}
        connectingText={args.connectingText}
        profileAvatar={args.profileAvatar}
        showCloseButton={args.showCloseButton}
        hideWhenNotConnected={args.hideWhenNotConnected}
        fullScreenMode={args.fullScreenMode}
        badge={args.badge}
        params={args.params}
        embedded={args.embedded}
        openLauncherImage={args.openLauncherImage}
        closeImage={args.closeImage}
        docViewer={args.docViewer}

        contactsPath={args.contactsPath}
        refreshPeriod={args.refreshPeriod}

      />, document.querySelector(args.selector)
    );
  }
};


//TODO: Moamen added this
plugin.init({
  selector: "#webchat",
  initPayload: "/get_started",
  socketUrl: "http://10.10.19.158:5500/",
  socketPath: "/socket.io/",
  title: "DEV Test",
  inputTextFieldHint: "Type a message...",
  connectingText: "Waiting for server...",
  hideWhenNotConnected: false, //TODO: Moamen added this
  docViewer: false,
  contactsPath: "http://10.10.19.158:6001/get_users_list", //"./src/resources/accounts.json",
  refreshPeriod: 1,
  params: {
    images: {
      dims: {
        width: 300,
        height: 200
      }
    },
    storage: "session"
  }
});
//TODO: ENDOF Moamen added this

export {
  plugin as default,
  Widget,
  toggleChat as toggle,
  openChat as open,
  closeChat as close,
  showChat as show,
  hideChat as hide,
  isOpen,
  isVisible
};

