import {
  store
} from '../store';
import * as actions from './index';

export function isOpen() {
  return store.dispatch(actions.getOpenState());
}

export function isVisible() {
  return store.dispatch(actions.getVisibleState());
}

export function initialize() {
  store.dispatch(actions.initialize());
}

export function connect() {
  store.dispatch(actions.connect());
}

export function disconnect() {
  store.dispatch(actions.disconnect());
}

export function addUserMessage(text) {
  store.dispatch(actions.addUserMessage(text));
}

export function emitUserMessage(text) {
  store.dispatch(actions.emitUserMessage(text));
}

export function addResponseMessage(text) {
  store.dispatch(actions.addResponseMessage(text));
}

export function addLinkSnippet(link) {
  store.dispatch(actions.addLinkSnippet(link));
}

export function addVideoSnippet(video) {
  store.dispatch(actions.addVideoSnippet(video));
}

export function addImageSnippet(image) {
  store.dispatch(actions.addImageSnippet(image));
}

export function addQuickReply(quickReply) {
  store.dispatch(actions.addQuickReply(quickReply));
}

export function setQuickReply(id, title) {
  store.dispatch(actions.setQuickReply(id, title));
}

export function insertUserMessage(id, text) {
  store.dispatch(actions.insertUserMessage(id, text));
}

export function renderCustomComponent(component, props, showAvatar = false) {
  store.dispatch(actions.renderCustomComponent(component, props, showAvatar));
}

export function openChat() {
  store.dispatch(actions.openChat());
}

export function closeChat() {
  store.dispatch(actions.closeChat());
}

export function toggleChat() {
  store.dispatch(actions.toggleChat());
}

export function showChat() {
  store.dispatch(actions.showChat());
}

export function hideChat() {
  store.dispatch(actions.hideChat());
}

export function toggleInputDisabled() {
  store.dispatch(actions.toggleInputDisabled());
}

export function changeInputFieldHint(hint) {
  store.dispatch(actions.changeInputFieldHint(hint));
}

export function dropMessages() {
  store.dispatch(actions.dropMessages());
}

export function pullSession() {
  store.dispatch(actions.pullSession());
}

// TODO: Moamen added this
export function setAutocompleteList(dataList) {
  store.dispatch(actions.setAutocompleteList(dataList));
}

export function setAutocompleteCallDestination(destination) {
  store.dispatch(actions.setAutocompleteCallDestination(destination));
}

export function setAutocompleteElementsToReplace(elements) {
  store.dispatch(actions.setAutocompleteElementsToReplace(elements));
}

export function setAutocompleteState(autocompleteState) {
  store.dispatch(actions.setAutocompleteState(autocompleteState));
}

export function setAutocompleteCurrentInput(input) {
  store.dispatch(actions.setAutocompleteCurrentInput(input));
}

export function setAutocompleteSelected(selected) {
  store.dispatch(actions.setAutocompleteSelected(selected));
}

export function setAutocompletePositions(positions) {
  store.dispatch(actions.setAutocompletePositions(positions));
}

export function setAutocompleteAlteredInput(alteredInput) {
  store.dispatch(actions.setAutocompleteAlteredInput(alteredInput));
}