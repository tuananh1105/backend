const calculateShippingFee = (weight, address, orderValue = 0, coupon = null) => {
  let shippingFee = 0;

  const shippingZones = {
    urban: {
      districts: [
        "Quận Ba Đình", "Quận Hoàn Kiếm", "Quận Đống Đa", "Quận Hai Bà Trưng",
        "Quận Tây Hồ", "Quận Cầu Giấy", "Quận Thanh Xuân", "Quận Hoàng Mai", "Quận Long Biên"
      ],
      baseFees: [10000, 11000, 12000, 14000, 16000, 18000], 
      extraFeePer500g: 2000
    },
    suburban: {
      districts: [
        "Huyện Gia Lâm", "Huyện Đông Anh", "Huyện Sóc Sơn", "Huyện Thanh Trì", "Huyện Thường Tín",
        "Huyện Phú Xuyên", "Huyện Ba Vì", "Huyện Phúc Thọ", "Huyện Thạch Thất", "Huyện Quốc Oai",
        "Huyện Đan Phượng", "Huyện Hoài Đức", "Huyện Chương Mỹ", "Huyện Thanh Oai", "Huyện Mỹ Đức",
        "Huyện Ứng Hòa"
      ],    
      baseFees: [15000, 19000, 20000, 26000, 29000, 30000],
      extraFeePer500g: 3000
    },
    rural: {
      districts: [], 
      baseFees: [22000, 22000, 25000, 29000, 31000, 38000],
      extraFeePer500g: 5000
    }
  };

  let zone = 'rural'; 
  if (shippingZones.urban.districts.includes(address.district)) {
    zone = 'urban';
  } else if (shippingZones.suburban.districts.includes(address.district)) {
    zone = 'suburban';
  }

  const zoneData = shippingZones[zone];
  
  if (weight <= 500) {
    shippingFee = zoneData.baseFees[0];
  } else if (weight <= 1000) {
    shippingFee = zoneData.baseFees[1];
  } else if (weight <= 1500) {
    shippingFee = zoneData.baseFees[2]; 
  } else if (weight <= 2000) {
    shippingFee = zoneData.baseFees[3];
  } else if (weight <= 2500) {
    shippingFee = zoneData.baseFees[4];
  } else if (weight <= 3000) {
    shippingFee = zoneData.baseFees[5];
  } else {
    shippingFee = zoneData.baseFees[5] + Math.ceil((weight - 3000) / 500) * zoneData.extraFeePer500g;
  }
  if (coupon && coupon.isFreeShipping) {
    shippingFee = 0;
  } else if (orderValue > 1000000) {
    shippingFee = 0;
  }

  return shippingFee;
};

module.exports = { calculateShippingFee };
