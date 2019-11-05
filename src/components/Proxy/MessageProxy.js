import axios from "axios";

class MessageProxy {
    constructor() {}

    sendMessage(toSend, sessionId, messageUrl) {
        if (!toSend) {
            return;
        }

        let headers = new Headers();
        headers.append("X-Requested-With", "XMLHttpRequest");

        return axios
            .post(
                messageUrl, {
                    text: toSend,
                    session_id: sessionId
                }, {
                    headers: headers
                }
            )
            .then(response => {
                return response.data;
            })
            .catch(error => {
                return ([{
                    text: "An error has occured, conversation restarted...",
                    session_id: sessionId
                }]);
            });
    }
}

export default MessageProxy;