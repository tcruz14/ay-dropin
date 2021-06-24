const express = require('express');
const path = require("path");
const handlebars = require("express-handlebars");
const {Client, Config, CheckoutAPI} = require('@adyen/api-library');
const uuid = require('uuid');
// localhost 8080
// const port = 8080;
const appUrl = "https://murmuring-meadow-96083.herokuapp.com/";
const app = express();

// layout structure using handlebars
app.use(express.static(path.join(__dirname, "/public")));
app.engine("hbs",
  handlebars({
    extname: 'hbs',
    defaultLayout: "main",
    layoutsDir: __dirname + "/views/layouts",
    partialsDir: __dirname + '/views/partials/'
  })
);
app.set("view engine", "hbs");
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// configuration setup - setup api and client keys
const config = new Config();
config.apiKey = 'AQEyhmfxLYrPYxFBw0m/n3Q5qf3VaY9UCJ14XWZE03G/k2NFirjoDrGpfu+3TSOoUIjDafcQwV1bDb7kfNy1WIxIIkxgBw==-DUBiq75bnCW08T/6/CZ+nHTsXCF4iAmAKfA6PB4L6oY=-Th2>j[WG,rDB{&Gy';
config.merchantAccount = 'AdyenRecruitment_SF2';
config.clientKey = "test_RIHQNHOD4NDQVKAU5Z3PUZGNLQQ52DSH";
const client = new Client({ config });
client.setEnvironment("TEST");
const checkout = new CheckoutAPI(client);

// requesting server for payment methods
app.get('/', (req, res) => {
  checkout.paymentMethods({
    merchantAccount: config.merchantAccount,
    countryCode: "US",
    shopperLocale: "en-US",
    amount: {currency: "USD", value: 1000},
    channel: "Web"
  })
  .catch(err => console.error(err))
  // sends payment methods to client to display
  .then(resp => res.render("payments", {
      response: JSON.stringify(resp),
      clientKey: config.clientKey
  }));
});

// sends payment info to server
app.post('/payments', (req, res) => {
  const uid = uuid.v4();

  checkout.payments({
    merchantAccount: config.merchantAccount,
    paymentMethod: req.body.paymentMethod,
    amount: {currency: "USD", value: 1000},
    channel: "Web",
    additionalData: {allow3DS2: true},
    browserInfo: req.body.browserInfo,
    reference: uid,
    //returnUrl: "http://localhost:8080/payments/redirect?orderRef=" + uid
    returnUrl: appUrl + "/payments/redirect?orderRef=" + uid
  })
  .catch(err => console.error(err))
  // sends result of payment to client 
  .then(resp => {
    const resultCode = resp.resultCode;
    const refusalReason = resp.refusalReason;
    const action = resp.action;
    res.json({resultCode, action, refusalReason, uid});
  });
});

app.post('/payments/details', (req, res) => {
// To-do not implemented
});

app.all('/payments/redirect', (req, res) => {
// To-do not implemented
});

app.listen(process.env.PORT, () => {
  // console.log(`Listening at http://localhost:${port}`)
  console.log('Listening at ' + process.env.PORT)
});

