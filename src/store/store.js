import {
  createStore,
  combineReducers,
  applyMiddleware
} from "redux";


import behavior from "./reducers/behaviorReducer";
import messages from "./reducers/messagesReducer";
import autocomplete from "./reducers/autocompleteReducer";

import * as actionTypes from './actions/actionTypes';

let store = "call initStore first";

function initStore(hintText, connectingText,
  storage,
  docViewer = false) {
  const customMiddleWare = (store) => next => (action) => {

    switch (action.type) {
      case actionTypes.GET_OPEN_STATE: {
        return store.getState().behavior.get("isChatOpen");
      }
      case actionTypes.GET_VISIBLE_STATE: {
        return store.getState().behavior.get("isChatVisible");
      }
    }

    // console.log('Middleware triggered:', action);
    next(action);
  };
  const reducer = combineReducers({
    behavior: behavior(hintText, connectingText, storage, docViewer),
    messages: messages(storage),
    autocomplete: autocomplete(storage)
  });

  /* eslint-disable no-underscore-dangle */
  store = createStore(
    reducer,
    window.__REDUX_DEVTOOLS_EXTENSION__ &&
    window.__REDUX_DEVTOOLS_EXTENSION__(),
    applyMiddleware(customMiddleWare)
  );
  /* eslint-enable */
}

export {
  initStore,
  store
};