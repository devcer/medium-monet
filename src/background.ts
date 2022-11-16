import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore/lite';
import { firebaseConfig } from './constants/firebase.config';
import { doesUserExist } from './utilities/doesUserExist';
import { getUsernameFromUrl } from './utilities/getUsernameFromUrl';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// type USER_OBJECT = {
//   username: string;
//   mediumUrl: string;
//   paymentPointer: string;
//   imageUrl: string;
//   name: string;
//   userId: string;
// };

/**
 *
 * @param paymentPointer The payment pointer to set
 */
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

/**
 *
 */
const setMonetizedMessage = () => {
  console.log('Sent monetize data');
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      {
        type: 'setMonetizedMessage',
      },
      function (response) {
        console.log(response);
      },
    );
  });
};

/**
 *
 * @param request The request object
 * @returns Promise
 */
const handleMessage = async (request: {
  status: string;
  pageUrl: string | URL;
}) => {
  const { status, pageUrl } = request;
  if (status === 'ready' && pageUrl !== null) {
    console.log('ready background');
    const pointerObject = await doesUserExist(db, getUsernameFromUrl(pageUrl));
    console.log('pointerObject', JSON.stringify(pointerObject));
    if (pointerObject === null) {
      // no pointer exists for the Url
      // statusText.textContent = "No pointer exists for the Url yet";
    } else {
      // pointer exists for the url
      // add meta data to the header
      setPaymentPointer(pointerObject.paymentPointer);
      // setMonetizedMessage();
    }
    return pointerObject;
  }
};

chrome.runtime.onMessage.addListener(handleMessage);
