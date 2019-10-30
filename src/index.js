import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';

import {
  sendMessage
} from "actions";

import Widget from './components/Widget';
import { store, initStore } from '../src/store/store';
import socket from './socket';
import mySocket from "./mysocket";

const MAX_TIMEOUT = 480000;

const ConnectedWidget = (props) => {
  // const sock = socket(props.socketUrl, props.customData, props.socketPath);
  const sock = new mySocket(props.socketUrl, props.messageUrl, MAX_TIMEOUT);
  
  //TODO: Moamen modified this
  //const storage = props.params.storage == "session" ? sessionStorage : localStorage
  const storage = sessionStorage;
  initStore(
    props.inputTextFieldHint,
    props.connectingText,
    sock,
    storage,
    props.docViewer,
  );

  return (<Provider store={store}>
    <Widget
      socket={sock}
      interval={props.interval}
      initPayload={props.initPayload}
      title={props.title}
      subtitle={props.subtitle}
      customData={props.customData}
      handleNewUserMessage={props.handleNewUserMessage}
      profileAvatar={props.profileAvatar}
      showCloseButton={props.showCloseButton}
      hideWhenNotConnected={props.hideWhenNotConnected}
      fullScreenMode={props.fullScreenMode}
      badge={props.badge}
      embedded={props.embedded}
      params={props.params}
      storage={storage}
      openLauncherImage={props.openLauncherImage}
      closeImage={props.closeImage}


      socketUrl={props.socketUrl}
      socketPath={props.socketPath}
      messageUrl={props.messageUrl}
      listUrl={props.listUrl}
      refreshPeriod={props.refreshPeriod}
      
      customComponent={props.customComponent}
      // customComponent=
      // { (messageData) => {
      //     // found: object with keys {id, buttons, recipient_id, text, isLast, store, dispatch}

      //     const buttons = messageData.buttons;
      //     const id = messageData.id;

      //     return (
      //     <div className="message">
      //       <div className="response">
      //         <div className="message-text">
      //           <div className="markdown">
      //             <p>
      //               <span>
      //                 {messageData.text}
      //               </span>
      //             </p>
      //           </div>
      //         </div>
      //         <div>
      //           {buttons && buttons.map(btn => {
      //             console.log("The props are", props);
      //             return(
      //               <input id={id} type="button" value={btn.title} onclick={props.dispatch(sendMessage(btn.payload))}/>
      //             );
      //           })}
      //         </div>
      //         </div>
      //       </div>
      //     ) 
      //   }
      // }
    />
  </Provider>);
};

ConnectedWidget.propTypes = {
  initPayload: PropTypes.string,
  interval: PropTypes.number,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  socketUrl: PropTypes.string.isRequired,
  socketPath: PropTypes.string,
  customData: PropTypes.shape({}),
  handleNewUserMessage: PropTypes.func,
  profileAvatar: PropTypes.string,
  inputTextFieldHint: PropTypes.string,
  connectingText: PropTypes.string,
  showCloseButton: PropTypes.bool,
  hideWhenNotConnected: PropTypes.bool,
  fullScreenMode: PropTypes.bool,
  badge: PropTypes.number,
  embedded: PropTypes.bool,
  params: PropTypes.object,
  openLauncherImage: PropTypes.string,
  closeImage: PropTypes.string,
  docViewer: PropTypes.bool,
  customComponent: PropTypes.func
};

ConnectedWidget.defaultProps = {
  title: 'Welcome',
  customData: {},
  interval: 2000,
  inputTextFieldHint: 'Type a message...',
  connectingText: 'Waiting for server...',
  fullScreenMode: false,
  hideWhenNotConnected: true,
  socketUrl: 'http://localhost',
  badge: 0,
  embedded: false,
  params: {
    storage: 'local'
  },
  docViewer: false
};

export default ConnectedWidget;
