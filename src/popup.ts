import '../styles/popup.scss';
// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore/lite';
import { getUsernameFromUrl } from './utilities/getUsernameFromUrl';
import { doesUserExist } from './utilities/doesUserExist';
import { getMediumAccountDetails } from './services/medium.service';
import { firebaseConfig } from './constants/firebase.config';

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
 * Go to the options page
 */
const goToOptionsPage = () => {
  chrome.runtime.openOptionsPage();
};

/**
 *
 * @param mediumToken The medium token to set
 * @param paymentPointer The payment pointer to set
 * @returns Promise
 */
const saveMediumAndPointerCredentials = async (
  mediumToken: string,
  paymentPointer: string,
) => {
  const profileData = await getMediumAccountDetails(mediumToken);

  const { id: userId, imageUrl, username, name, url: mediumUrl } = profileData;
  const documentJson = {
    imageUrl,
    mediumToken,
    mediumUrl,
    name,
    paymentPointer,
    userId,
    username,
  };
  console.log(documentJson);
  try {
    const response = await addDoc(collection(db, 'pointers'), documentJson);
    console.log(response);
    return response;
  } catch (error) {
    console.log(error);
  }
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
  if (request.status === 'ready' && request.pageUrl !== null) {
    console.log('ready');
    const username = getUsernameFromUrl(request.pageUrl);
    const pointerObject = await doesUserExist(db, username);
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

window.onload = () => {
  const mediumForm = document.getElementById('medium-form');
  mediumForm.addEventListener('submit', (event) => {
    event.preventDefault();
    console.log('Submitting form');
    const mediumToken = document.getElementById('medium_token')?.value;
    const paymentPointer = document.getElementById('payment_pointer')?.value;
    console.log('mediumToken', mediumToken);
    console.log('paymentPointer', paymentPointer);
    saveMediumAndPointerCredentials(mediumToken, paymentPointer).then(
      (data) => {
        return data;
      },
    );
  });
  const optionsButton = document.getElementById('options-button');
  optionsButton.addEventListener('click', goToOptionsPage);
  chrome.runtime.onMessage.addListener(handleMessage);
};
