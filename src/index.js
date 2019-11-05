import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';

import { sendMessage, addUserMessage } from "actions";

import Widget from './components/Widget';
import { store, initStore } from '../src/store/store';

import "./styles.scss";
import ReactMarkdown from 'react-markdown';

const ConnectedWidget = (props) => {
  
  const storage = props.params.storage == "session" ? sessionStorage : localStorage;
  initStore(
    props.inputTextFieldHint,
    props.connectingText,
    storage,
    props.docViewer,
  );

  return (<Provider store={store}>
    <Widget
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
      customComponent={ 
        (messageData) => {

        const buttons = messageData.buttons;
        
        const onClick = (msg) => {

          try {
            store.dispatch(sendMessage(msg));
            store.dispatch(addUserMessage(msg));
          } catch (e) {
            console.log("Error while dispatching from custom component:", e);
          }
        };
    
        return (
          <div className={'response'}>
            <div className="message-text">
              <ReactMarkdown
                className={'markdown'}
                source={messageData.text}
                transformLinkUri={null}
              />
    
              <div>
                {
                  buttons && buttons.map((btn, index) => {
                    return(
                      <input 
                        key={index}
                        className="my-button"
                        type="button" 
                        value={btn.title} 
                        onClick={() => onClick(btn.payload)}
                      />
                    );
                  })
                }
              </div>
            </div>
          </div>
        ) 
      }
    }
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