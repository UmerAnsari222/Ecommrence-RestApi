import bcrypt from "bcrypt";
import Joi from "joi";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import JwtService from "../../services/JwtService";
import { User, RefreshToken } from "../../models";
import { REFRESH_SECRET } from "../../config";

const registerController = {
  async register(req, res, next) {
    // validation
    const registerSchema = Joi.object({
      name: Joi.string().min(3).max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string()
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
        .required(),
      repeat_password: Joi.ref("password"),
    });
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    // if user already exists
    try {
      const exist = await User.exists({ email: req.body.email });
      if (exist) {
        return next(
          CustomErrorHandler.alreadyExist("This Email is already exists")
        );
      }
    } catch (error) {
      return next(error);
    }

    // hash Password
    const { name, email, password } = req.body;
    const hashPassword = await bcrypt.hash(password, 10);
    // prepare models
    const user = new User({
      name,
      email,
      password: hashPassword,
    });
    let access_token;
    let refresh_token;

    try {
      const result = await user.save();
      // Token
      access_token = JwtService.sign({ _id: result._id, role: result.role });
      refresh_token = JwtService.sign(
        { _id: result._id, role: result.role },
        "1y",
        REFRESH_SECRET
      );
      // save in database
      await RefreshToken.create({
        token: refresh_token,
      });
    } catch (error) {
      return next(error);
    }

    res.json({ access_token, refresh_token });
  },
};

export default registerController;
