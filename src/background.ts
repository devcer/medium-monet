import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore/lite';
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

type USER_OBJECT = {
  username: string;
  mediumUrl: string;
  paymentPointer: string;
  imageUrl: string;
  name: string;
  userId: string;
};

const doesDataExist = async (mediumUrl: string): USER_OBJECT | null => {
  const pointersRef = collection(db, 'pointers');
  const pointerQuery = query(
    pointersRef,
    where('username', '==', getUsernameFromUrl(mediumUrl)),
  );
  const querySnapshot = await getDocs(pointerQuery);
  let userObject = null;
  querySnapshot.forEach((doc) => {
    console.log(`${doc.id} => ${JSON.stringify(doc.data())}`);
    if (doc.data().mediumUrl === mediumUrl) {
      userObject = doc.data();
    }
  });
  return userObject;
};

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

const getProfileUrl = (mediumUrl: string) => {
  const pageUrlObject = new URL(mediumUrl);
  const urlOrigin = pageUrlObject.origin;
  const authorName =
    urlOrigin !== 'https://medium.com'
      ? pageUrlObject.host.split('.medium.com')[0]
      : pageUrlObject.pathname.split('/')[1];
  console.log(`getProfileUrl: https://medium.com/@${authorName}`);
  return `https://medium.com/@${authorName}`;
};

const handleMessage = async (
  request: { status: string; pageUrl: string | URL },
  sender: any,
  sendResponse: any,
) => {
  const { status, pageUrl } = request;
  if (status === 'ready' && pageUrl !== null) {
    console.log('ready');
    const pointerObject = await doesDataExist(getProfileUrl(pageUrl));
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
