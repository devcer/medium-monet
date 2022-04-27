import '../styles/popup.scss';
// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  addDoc,
} from 'firebase/firestore/lite';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.FIREBASE_apiKey,
  authDomain: process.env.FIREBASE_authDomain,
  projectId: process.env.FIREBASE_projectId,
  storageBucket: process.env.FIREBASE_storageBucket,
  messagingSenderId: process.env.FIREBASE_messagingSenderId,
  appId: process.env.FIREBASE_appId,
  measurementId: process.env.FIREBASE_measurementId,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

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

const getMediumAccountDetails = async (mediumToken: string) => {
  const myHeaders = new Headers();
  myHeaders.append('Authorization', `Bearer ${mediumToken}`);

  const requestOptions = {
    method: 'GET',
    headers: myHeaders,
  };
  try {
    const response = await fetch(
      'https://api.medium.com/v1/me',
      requestOptions,
    );
    const responseJson = await response.json();
    //{
    //   "data": {
    //     "id": "1c3b18d7ca15ed491c69815841fb686485fbf1383382c98c89d3f179fb48bd459",
    //     "username": "isantoshv",
    //     "name": "Santosh Viswanatham",
    //     "url": "https://medium.com/@isantoshv",
    //     "imageUrl": "https://cdn-images-1.medium.com/fit/c/400/400/1*0BIgfC-AxZeDeGSo9G3A3Q.jpeg"
    //   }
    // }
    return responseJson && responseJson.data;
  } catch (error) {
    console.log(error);
    console.log('Error');
  }
};

const saveMediumAndPointerCredentials = async (
  mediumToken: string,
  paymentPointer: string,
) => {
  const profileData = await getMediumAccountDetails(mediumToken);

  const { id: userId, imageUrl, username, name, url: mediumUrl } = profileData;
  const documentJson = {
    imageUrl,
    mediumToken: '',
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
    console.error(error);
  }
};

const doesDataExist = async (mediumUrl = '') => {
  const pointersRef = collection(db, 'pointers');
  const pointerQuery = query(pointersRef, where('mediumUrl', '==', mediumUrl));
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

window.onload = async () => {
  const mediumForm = document.getElementById('medium-form');
  mediumForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    console.log('Submitting form');
    const mediumToken = document.getElementById('medium_token').value;
    const paymentPointer = document.getElementById('payment_pointer').value;
    console.log('mediumToken', mediumToken);
    console.log('paymentPointer', paymentPointer);
    saveMediumAndPointerCredentials(mediumToken, paymentPointer);
    // const isValidProfile = await validateMediumURLWithToken(
    //   profileUrl,
    //   mediumToken,
    // );
    // if (isValidProfile) {
    //   // add meta data to the header
    // }
  });
  // const statusText = document.getElementById("status");
  // const pointerObject = await doesDataExist("https://medium.com/@isantoshv");
  // if (pointerObject === null) {
  //   // no pointer exists for the Url
  //   statusText.textContent = "No pointer exists for the Url yet";
  // } else {
  //   // pointer exists for the url
  //   // add meta data to the header
  //   setPaymentPointer(pointerObject.paymentPointer);
  // }
  // chrome.tabs.query(tabQuery, callback);
};

const handleMessage = async (request, sender, sendResponse) => {
  if (request.status === 'ready' && request.pageUrl !== null) {
    console.log('ready');
    const pageUrlObject = new URL(request.pageUrl);
    const urlOrigin = pageUrlObject.origin;
    const authorName =
      urlOrigin !== 'https://medium.com'
        ? pageUrlObject.host.split('.medium.com')[0]
        : pageUrlObject.pathname.split('/')[1];
    const pointerObject = await doesDataExist(
      `https://medium.com/@${authorName}`,
    );
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
