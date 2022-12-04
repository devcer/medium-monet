import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore/lite';
import { firebaseConfig } from './constants/firebase.config';
import { POINTER_OBJECT } from './constants/types';
import { doesUserExist } from './utilities/doesUserExist';
import { getUsernameFromUrl } from './utilities/getUsernameFromUrl';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

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
    const pointerObject: POINTER_OBJECT = ((await doesUserExist(
      db,
      getUsernameFromUrl(pageUrl),
    )) as POINTER_OBJECT) || {
      paymentPointer: '',
    };
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
