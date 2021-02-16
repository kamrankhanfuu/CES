import * as firebase from "firebase-admin";
import { messaging } from "firebase-admin/lib/messaging";
import Messaging = messaging.Messaging;

const serviceAccount = require("./firebase-service-account.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://coned-app-d39fb.firebaseio.com"
});

export type FirebaseMessage = {
  notification?: {
    title: string,
    body: string
  }
};

export default class FirebaseService {

  private readonly messaging: Messaging;

  constructor() {
    this.messaging = firebase.messaging();
  }

  async sendMessage(token: string, message: FirebaseMessage) {
    this.messaging.sendToDevice(token, message)
      .then(response => {
        console.log(response);
      })
      .catch(error => {
        console.log(error);
      });
  }
}