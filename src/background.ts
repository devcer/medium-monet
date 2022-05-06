import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore/lite';
import { doesUserExist } from './utilities/doesUserExist';
import { getUsernameFromUrl } from './utilities/getUsernameFromUrl';

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_apiKey,
  authDomain: process.env.FIREBASE_authDomain,
  projectId: process.env.FIREBASE_projectId,
  storageBucket: process.env.FIREBASE_storageBucket,
  messagingSenderId: process.env.FIREBASE_messagingSenderId,
  appId: process.env.FIREBASE_appId,
  measurementId: process.env.FIREBASE_measurementId,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// type USER_OBJECT = {
//   username: string;
//   mediumUrl: string;
//   paymentPointer: string;
//   imageUrl: string;
//   name: string;
//   userId: string;
// };

const setPaymentPointer = (paymentPointer: string) => {
  console.log('Sent pointer data');
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      {
        type: 'setPaymentPointer',
        paymentPointer,
      },
      function (response) {
        console.log(response);
      },
    );
  });
};

const handleMessage = async (request: {
  status: string;
  pageUrl: string | URL;
}) => {
  const { status, pageUrl } = request;
  if (status === 'ready' && pageUrl !== null) {
    console.log('ready');
    const pointerObject = await doesUserExist(db, getUsernameFromUrl(pageUrl));
    console.log('pointerObject', JSON.stringify(pointerObject));
    if (pointerObject === null) {
      // no pointer exists for the Url
      // statusText.textContent = "No pointer exists for the Url yet";
    } else {
      // pointer exists for the url
      // add meta data to the header
      setPaymentPointer(pointerObject.paymentPointer);
    }
    return pointerObject;
  }
};

chrome.runtime.onMessage.addListener(handleMessage);
