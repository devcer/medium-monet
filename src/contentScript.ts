// const paymentPointer = "$ilp.uphold.com/wypi4eKYYYJw";
// const mediumToken =
//   "2882f8aa6a3615e291e3472ba845ceee855aa5780e33b7786a58a141607edb87c";

const addMetaTagToHeader = (paymentPointer: string) => {
  console.log('addMetaTagToHeader');
  const metaTag = document.createElement('meta');
  metaTag.setAttribute('name', 'monetization');
  metaTag.setAttribute('content', paymentPointer);
  document.head.appendChild(metaTag);
};

// getMediumAccountDetails(mediumToken).then((data) => {
//   console.log(data);
//   if (data.url && window.location.href.includes(data.url)) {
//     addMetaTagToHeader();
//   }
// });

const handleMessage = (
  request: { type: any; paymentPointer: any },
  sender: any,
  sendResponse: (arg0: { response: string }) => void,
) => {
  console.log('handleMessage');
  const { type, paymentPointer } = request;
  switch (type) {
    case 'setPaymentPointer':
      console.log('setPaymentPointer');
      sendResponse({
        response: 'paymentPointer received successfully',
      });
      if (paymentPointer !== null) {
        addMetaTagToHeader(paymentPointer);
      }
      break;
    default:
      break;
  }
};

chrome.runtime.onMessage.addListener(handleMessage);

window.addEventListener('load', () => {
  console.log('on load');
  chrome.runtime.sendMessage({
    status: 'ready',
    pageUrl: window.location.href,
  });
});
