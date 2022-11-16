/**
 *
 * @param paymentPointer The payment pointer to set
 */
const addMetaTagToHeader = (paymentPointer: string) => {
  console.log('addMetaTagToHeader');
  console.log('payment pointer', paymentPointer);
  const metaTag = document.createElement('meta');
  metaTag.setAttribute('name', 'monetization');
  metaTag.setAttribute('content', paymentPointer);
  console.log(metaTag);
  // setTimeout(() => {
  document.head.appendChild(metaTag);
  // document.body.appendChild(metaTag);
  // document.getElementsByTagName('head')[0].appendChild(metaTag);
  // // }, 3000);
  // const p = document.createElement('p');
  // p.textContent = 'This paragraph was added by a page script.';
  // p.setAttribute('id', 'page-script-para');
  // document.body.appendChild(p);
};

const handleMessage = (
  request: { type: string; paymentPointer: string },
  sender,
  sendResponse: any,
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

window.addEventListener('load', () => {
  console.log('on load');
  chrome.runtime.sendMessage({
    status: 'ready',
    pageUrl: window.location.href,
  });
  chrome.runtime.onMessage.addListener(handleMessage);
});
