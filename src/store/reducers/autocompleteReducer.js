import {
  Map
} from 'immutable';
import * as actionTypes from '../actions/actionTypes';

export default function () {
  const initialState = Map({
    autocompleteList: [],
    autocompleteListCallDestination: '',
    autocompleteElementsToBeReplaced: []
  });

  return function reducer(state = initialState, action) {
    switch (action.type) {
      case actionTypes.SET_AUTOCOMPLETE_LIST: {
        return state.update('dataList', () => action.list);
      }

      case actionTypes.SET_AUTOCOMPLETE_CALL_DESTINATION: {
        return state.update('autocompleteListCallDestination', () => action.destination);
      }

      case actionTypes.SET_AUTOCOMPLETE_ELEMENTS_TO_REPLACE: {
        return state.update('autocompleteElementsToBeReplaced', () => action.elements);
      }

      case actionTypes.SET_AUTOCOMPLETE_STATE: {
        return state.update('autocompleteState', () => action.autocompleteState);
      }

      case actionTypes.SET_AUTOCOMPLETE_CURRENT_INPUT: {
        return state.update('currentInput', () => action.input);
      }

      case actionTypes.SET_AUTOCOMPLETE_SELECTED: {
        return state.update('selected', () => action.selected);
      }

      case actionTypes.SET_AUTOCOMPLETE_POSITIONS: {
        return state.update('positions', () => action.positions);
      }

      case actionTypes.SET_AUTOCOMPLETE_ALTERED_INPUT: {
        return state.update('alteredInput', () => action.alteredInput);
      }

      default:
        return state;
    }
  };
}