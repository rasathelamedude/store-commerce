import Coupon from "../models/coupon.model.js";

export const getCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({
      userId: req.user._id,
      isActive: true,
    });

    res.status(200).json({
      success: true,
      message: "Fetched all coupons for user!",
      data: {
        coupon: coupon || null,
      },
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;

    const coupon = await Coupon.find({
      code,
      isActive: true,
      userId: req.user._id,
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon code is not valid!",
      });
    }

    // check if it's not expired;
    if (coupon.expirationDate <= new Date()) {
      coupon.isActive = false;
      await coupon.save();

      return res.status(400).json({
        success: false,
        message: "Coupon is expired!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Fetched code for coupon",
      data: {
        code: coupon.code,
        discount: coupon.discountPercentage,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

