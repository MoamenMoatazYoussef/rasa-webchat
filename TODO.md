# TODO

## Refactor
### Phase 1
<!-- - Refactor Autocomplete: -->
<!-- + Extract list API calling to Proxy.js -->
<!-- + Extract cache handling to Proxy.js -->
<!-- + Extract autocompleteState. -->
<!-- + Create component Helper.js -->
<!-- + Extract replacing to Helper.js -->
<!-- + Add actions and refactor actionTypes, dispatcher, and actions. -->
<!--    - Refactor store.js -->
<!--    - add autocompleteReducer.js -->
<!--    - Refactor behaviorReducer.js -->
<!--    - Refactor messageReducer.js -->
<!-- - Add additional no "@" state to Autocomplete logic. -->
<!-- - Remove unused props sent to AC from Sender.js -->

<!-- - **Test Phase 1 working.** -->

### Phase 2
<!-- - Remove myCustomComponent.js -->
<!-- - Remove all comments from and refactor msgProcessor.js -->
<!-- - Refactor Widget: -->
<!--    + Extract message sending to MessageProxy.js -->
<!--    + Remove all comments and console logs -->
<!--    + Use connect() or subscribe() insead of the render() workaround (use `redux-watch`) -->

<!-- - **Test Phase 2 working.** -->

### Phase 3

<!-- - Remove mySocket. -->
<!-- - Remove Socket.io -->
- Organize Widget.js and Autocomplete.js:
    + Split functions into smaller ones.
    + Organize functions.

<!-- - Gather all constants and put them in constants.js -->
<!-- - Allow configurable sessionStorage / localStorage -->
<!-- - Rename properties passed from configuration. -->

- **Test Phase 3 working.**

### Phase 4
<!-- - Add "key" to button loop in custom component. -->
- Create component List.js
- Refactor Autocomplete: take List component outside.
- Extract customComponent to outside configuration.