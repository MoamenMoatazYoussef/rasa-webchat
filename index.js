import React from 'react';
import ReactDOM from 'react-dom';
import { Widget, toggleChat, openChat, closeChat, showChat, hideChat, isOpen, isVisible } from './index_for_react_app';

const plugin = {
  init: (args) => {
    ReactDOM.render(
      <Widget
        socketUrl={args.socketUrl}
        socketPath={args.socketPath}
        
        messageUrl={args.messageUrl}

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

        listUrl={args.listUrl}
        refreshPeriod={args.refreshPeriod}

        customComponent={ (messageData) => {
          // found: object with keys {id, buttons, recipient_id, text, isLast, store, dispatch}

          const buttons = messageData.buttons;
          const id = messageData.id;

          console.log(buttons);

          return (
          <div className="message">
            <div className="response">
              <div className="message-text">
                <div className="markdown">
                  <p>
                    <span>
                      {messageData.text}
                    </span>
                  </p>
                </div>
              </div>
              <div>
                {buttons && buttons.map(btn => {
                  return(
                    <input id={id} type="button" value={btn.title} onclick={this.sendMessage(btn.payload)}/>
                  );
                })}
              </div>
              </div>
            </div>
          ) 
        }
      }

      />, document.querySelector(args.selector)
    );
  }
};


//TODO: Moamen added this
plugin.init({
  interval: 1000,
  selector: "#webchat",
  initPayload: "/help",
  socketUrl: "http://10.10.19.158:5111/",
  title: "Moamen is Awesome",
  inputTextFieldHint: "Type a message...",
  connectingText: "Waiting for server...",
  hideWhenNotConnected: false,
  docViewer: false,
  listUrl: "http://10.10.19.158:5000/get_users_list",
  refreshPeriod: 1,

  messageUrl: "http://10.10.19.158:5111/CatchMsg",

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

