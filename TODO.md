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
- **Test Phase 1 working.**

### Phase 2
- Remove myCustomComponent.js
- Remove all coments from and refactor msgProcessor.js
- Refactor Widget:
    + Create new component Proxy.js
    + Extract message sending to Proxy.js
    + Remove all comments and console logs
    + Use connect() or subscribe() insead of the render() workaround (use `redux-watch`)

- **Test Phase 2 working.**

### Phase 3
- Extract customComponent to outside configuration.

- Remove mySocket.
- Remove Socket.io

- Gather all constants and put them in constants.js
- Allow configurable sessionStorage / localStorage
- Rename properties passed from configuration.

- **Test Phase 3 working.**
