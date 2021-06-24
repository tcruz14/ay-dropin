const paymentsResponse = JSON.parse(
  document.getElementById("paymentsResponse").innerHTML
);
const clientKey = document.getElementById("clientKey").innerHTML;

// configure drop in behavior attributes on client side
const configuration = {
  paymentMethodsResponse: paymentsResponse,
  clientKey: clientKey,
  locale: "en-US",
  environment: "test",
  onSubmit: (state, dropin) => {
    fetch("/payments", {
      method: "POST",
      body: JSON.stringify(state.data),
      headers: {"Content-Type": "application/json"}
    })
    .catch(error => console.error(error))
    .then(res => {
      const resJson = res.json();
      resJson.then(json => {
        if (json.action) {
          dropin.handleAction(json.action);
        } else {
          const resultCode = json.resultCode;
          if (resultCode === 'Authorised') {
            //window.confirm('Payment Authorized. Your order number is ' + json.uid );
            dropin.setStatus('success', { message: 'Payment successful!' });
          } else if (resultCode === 'Refused') {
            //window.confirm('Payment Refused: ' + json.refusalReason);
            dropin.setStatus('error', { message: 'There\'s an error in your payment.' });
          }
        }
      });
    });
  },
  // to-do not implemented
  onAdditionalDetails: (state, dropin) => {
    fetch("/payments/details", {
      method: "POST",
      body: JSON.stringify(state.data),
      headers: {"Content-Type": "application/json"}
    })
    .catch(error => console.error(error))
    .then(res => {});
  },
  paymentMethodsConfiguration: {
    card: {
      showPayButton: true,
      openFirstPaymentMethod: true,
      enableStoreDetails: true,
      hasHolderName: true,
      name: 'Credit or debit card'
    }
  },
  //set a default amount on the pay button
  amount: {value: 10000, currency: 'USD'}
};

const ayCheckout = new AdyenCheckout(configuration);
const dropin = ayCheckout
  .create('dropin')
  .mount('#dropin-container');