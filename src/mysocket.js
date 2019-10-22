import axios from 'axios';

class mySocket {
    constructor(socketURL, requestURL, timeout) {
        this.socketURL = socketURL;
        this.requestURL = requestURL;
        this.timeout = timeout;
        this.sessionID = "";
    }

    sessionRequest() {
        axios.get(this.socketURL)
            .then(data => {
                this.sessionID = data.sessionID;
            })
            .catch(error => {
                throw new Error("Error during session request:", error);
            });
    }

    sendMessage(userUttered) {
        const proxyUrl = "https://cors-anywhere.herokuapp.com/";
        axios.post(proxyUrl + this.requestURL, {
                text: userUttered,
                sender_id: this.sessionID
            })
            .then(data => {
                return data;
            })
            .catch(error => {
                console.log("Error during sending/receiving a message:", error);
                return [{
                    text: "An error has occured, conversation restarted...",
                    sender_id: this.sessionID
                }];
            });
    }
};

export default mySocket;