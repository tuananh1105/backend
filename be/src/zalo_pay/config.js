// Node v10.15.3

const CryptoJS = require("crypto-js"); // npm install crypto-js
const moment = require("moment"); // npm install moment

// APP INFO
const config = {
  app_id: "2554",
  key1: "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn",
  key2: "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf",
  endpoint: "https://sb-openapi.zalopay.vn/v2/create",
};

const embed_data = {
  redirecturl: "http://localhost:4000",
};

const items = [
  [
    {
      itemid: "knb",
      itename: "kim nguyen bao",
      itemprice: 198400,
      itemquantity: 1,
    },
    {
      itemid: "knn",
      itename: "kim nguyen bao",
      itemprice: 198400,
      itemquantity: 2,
    },             
  ],
];
const transID = Math.floor(Math.random() * 1000000);
const order = {
  app_id: config.app_id,
  app_trans_id: `${moment().format("YYMMDD")}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
  app_user: "user123",
  app_time: Date.now(), // miliseconds
  item: JSON.stringify(items),
  embed_data: JSON.stringify(embed_data),
  amount: 50000,
  description: `test order #${transID}`,
  bank_code: "CC",
  callback_url: "https://635a-116-111-17-240.ngrok-free.app/callback",
};

// appid|app_trans_id|appuser|amount|apptime|embeddata|item
const data =
  config.app_id +
  "|" +
  order.app_trans_id +
  "|" +
  order.app_user +
  "|" +
  order.amount +
  "|" +
  order.app_time +
  "|" +
  order.embed_data +
  "|" +
  order.item;   
order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

module.exports = {
  config,
  order2: order,
};
