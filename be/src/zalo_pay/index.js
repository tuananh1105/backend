const { default: axios } = require("axios");
const express = require("express");
const { config, order } = require("./config");
const app = express();
const port = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("<p>Hello</p>");
});

app.post("/payment", async (req, res) => {
  try {
    const result = await axios.post(config.endpoint, null, {
      params: order,
    });
    res.status(200).json(result.data);
  } catch (error) {
    console.log("có lỗi :" + error.message);
  }
});

// dùng ngrok mở 1 cổng trên máy ra "ngrok http port back end đang chạy"
app.post("/callback", (req, res) => {
  let result = {};

  try {
    let dataStr = req.body.data;
    let reqMac = req.body.mac;

    let mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();
    console.log("mac =", mac);

    // kiểm tra callback hợp lệ (đến từ ZaloPay server)
    if (reqMac !== mac) {
      // callback không hợp lệ
      result.return_code = -1;
      result.return_message = "mac not equal";
    } else {
      // thanh toán thành công
      // merchant cập nhật trạng thái cho đơn hàng
      let dataJson = JSON.parse(dataStr, config.key2);
      console.log(
        "update order's status = success where app_trans_id =",
        dataJson["app_trans_id"]
      );

      result.return_code = 1;
      result.return_message = "success";
    }
  } catch (ex) {
    result.return_code = 0; // ZaloPay server sẽ callback lại (tối đa 3 lần)
    result.return_message = ex.message;
  }

  console.log(result);
  // thông báo kết quả cho ZaloPay server
  res.json(result);
});

app.listen(4000, () => {
  console.log(`Payment with Zalo Pay ${port}`);
});
