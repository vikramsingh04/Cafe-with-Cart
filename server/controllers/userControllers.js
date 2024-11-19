const users = require("../models/userSchema");
const userotp = require("../models/userOtp");
const dish = require("../models/dish");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const SECRECT_KEY = "abcdefghijklmnop";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const tarnsporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

exports.api = async (req, res) => {
  res.status(200).json({ message: "Server is working" });
};

exports.userregister = async (req, res) => {
  const { fname, email, password, isAdmin } = req.body;

  if (!fname || !email || !password) {
    res.status(400).json({ error: "Please Enter All Input Data" });
  }

  try {
    const preuser = await users.findOne({ email: email });

    if (preuser) {
      res.status(400).json({ error: "This User Allready exist in our db" });
    } else {
      const userregister = new users({
        fname,
        email,
        password,
        isAdmin: isAdmin || false,
      });

      const storeData = await userregister.save();
      res.status(200).json(storeData);
    }
  } catch (error) {
    res.status(400).json({ error: "Invalid Details", error });
  }
};

exports.userOtpSend = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ error: "Please Enter Your Email" });
  }

  try {
    const presuer = await users.findOne({ email: email });

    if (presuer) {
      const OTP = Math.floor(100000 + Math.random() * 900000);

      const existEmail = await userotp.findOne({ email: email });

      if (existEmail) {
        const updateData = await userotp.findByIdAndUpdate(
          { _id: existEmail._id },
          {
            otp: OTP,
          },
          { new: true }
        );
        await updateData.save();

        const mailOptions = {
          from: process.env.EMAIL,
          to: email,
          subject: "Sending Email For Otp Validation",
          text: `OTP:- ${OTP}`,
        };

        tarnsporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log("error", error);
            res.status(400).json({ error: "email not send" });
          } else {
            console.log("Email sent", info.response);
            res.status(200).json({ message: "Email sent Successfully" });
          }
        });
      } else {
        const saveOtpData = new userotp({
          email,
          otp: OTP,
        });

        await saveOtpData.save();
        const mailOptions = {
          from: process.env.EMAIL,
          to: email,
          subject: "Sending Eamil For Otp Validation",
          text: `OTP:- ${OTP}`,
        };

        tarnsporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log("error", error);
            res.status(400).json({ error: "email not send" });
          } else {
            console.log("Email sent", info.response);
            res.status(200).json({ message: "Email sent Successfully" });
          }
        });
      }
    } else {
      res.status(400).json({ error: "This User Not Exist In our Db" });
    }
  } catch (error) {
    res.status(400).json({ error: "Invalid Details", error });
  }
};

exports.userLogin = async (req, res) => {
  const { email, otp } = req.body;

  if (!otp || !email) {
    res.status(400).json({ error: "Please Enter Your OTP and email" });
  }

  try {
    const otpverification = await userotp.findOne({ email: email });

    if (otpverification.otp === otp) {
      const preuser = await users.findOne({ email: email });

      const token = await preuser.generateAuthtoken();
      res
        .status(200)
        .json({ message: "User Login Succesfully Done", userToken: token });
    } else {
      res.status(400).json({ error: "Invalid Otp" });
    }
  } catch (error) {
    res.status(400).json({ error: "Invalid Details", error });
  }
};

exports.getPaginateUsers = async (req, res) => {
  const search = req.body.search || "";
  if (search.length === 0) {
    const allUsers = await users.find({});

    const { page, limit } = req.body;

    const startIndex = (page - 1) * limit;
    const lastIndex = page * limit;

    const result = {};

    result.totalUser = allUsers.length;
    result.pageCount = Math.ceil(allUsers.length / limit);

    if (lastIndex < allUsers.length) {
      result.next = {
        page: page + 1,
      };
    }
    if (startIndex > 0) {
      result.prev = {
        page: page - 1,
      };
    }

    result.result = allUsers.slice(startIndex, lastIndex);
    res.status(200).json(result);
  } else {
    const query = {
      fname: { $regex: search, $options: "i" },
    };
    try {
      const userData = await users.find(query);
      res.status(201).json(userData);
    } catch (error) {
      res.status(400).json({ error: "Some Error Occured", error });
    }
  }
};

exports.userData = async (req, res) => {
  const { token } = req.body;
  try {
    const user = jwt.verify(token, SECRECT_KEY);

    const userID = user._id;
    const userData = await users.findOne({ _id: userID });

    res.status(200).json({ data: userData });
  } catch (error) {
    res.status(400).json({ error: "Some Error Occured", error });
  }
};

exports.deleteOneUser = async (req, res) => {
  const { index } = req.body;

  try {
    const userData = await users.findByIdAndDelete(index);

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User's Account Deleted Successfully",
      deletedUser: userData,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Some error occurred", details: error.message });
  }
};

exports.getAllDish = async (req, res) => {
  try {
    const { shop } = req.body;

    let shopData = await dish.findOne({ shop });
    if (!shopData) {
      res.status(400).json({ message: "No such shop exist" });
    } else {
      res
        .status(200)
        .json({ message: "Shop exist", content: shopData.content });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.Dish = async (req, res) => {
  try {
    const { shop, content } = req.body;

    let Dish = await dish.findOne({
      shop,
    });

    if (!Dish) {
      Dish = new dish({
        shop,
        content: [content],
      });
    } else {
      Dish.content.push(content);
    }

    await Dish.save();

    res.status(200).json(Dish);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteDish = async (req, res) => {
  try {
    const { shop, dishId } = req.body;

    let existingShop = await dish.findOne({ shop });

    if (!existingShop) {
      res.status(400).json({ message: "This Shop does not exist" });
    } else {
      existingShop.content.pull({ _id: dishId });

      await existingShop.save();

      res.status(200).json({ message: "Dish Deleted successfully" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updatePrice = async (req, res) => {
  try {
    const { shop, dishId, price } = req.body;

    let existingShop = await dish.findOne({ shop });

    if (!existingShop) {
      return res.status(400).json({ message: "This Shop does not exist" });
    }

    let priceToUpdate = existingShop.content.find(
      (dish) => dish._id.toString() === dishId
    );

    if (!priceToUpdate) {
      return res.status(400).json({ message: "Dish not found" });
    }

    priceToUpdate.price = price;

    await existingShop.save();

    res.status(200).json({ message: "Price updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { userId, dishName, price } = req.body;
    // console.log(userId);

    const user = await users.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.cart.push({ dishName, price });
    user.totalPrice += parseInt(price);
    user.totalItems += 1;

    await user.save();

    res.status(200).json({ message: "Item added to cart successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCartItem = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await users.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.cart);
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteCartItem = async (req, res) => {
  try {
    const { userId, itemId } = req.body;
    // console.log(userId);
    // console.log(itemId);

    const user = await users.findById(userId);
    const cartItem = user.cart.id(itemId);
    console.log(cartItem);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Decrease total price and quantity
    const deletedItemPrice = cartItem.price;
    console.log(deletedItemPrice);
    user.totalPrice -= deletedItemPrice;
    user.totalItems -= 1;
    console.log(user.totalPrice);
    console.log(user.totalItems);

    // Delete item from cart

    cartItem.remove();

    await user.save();

    res.status(200).json({ message: "Item deleted from cart successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
