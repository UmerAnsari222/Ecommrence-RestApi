import Joi from "joi";
import { REFRESH_SECRET } from "../../config";
import { RefreshToken, User } from "../../models";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import JwtService from "../../services/JwtService";

const refreshController = {
  async refresh(req, res, next) {
    const refreshTokenSchema = Joi.object({
      refresh_token: Joi.string().required(),
    });
    const { error } = refreshTokenSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    // Check in database
    let refreshToken;
    try {
      refreshToken = await RefreshToken.findOne({
        token: req.body.refresh_token,
      });
      if (!refreshToken) {
        return next(CustomErrorHandler.unAuthorized("Invalid refresh token"));
      }
      let userId;
      try {
        const { _id } = JwtService.verify(refreshToken.token, REFRESH_SECRET);
        userId = _id;
      } catch (error) {
        return next(CustomErrorHandler.unAuthorized("Invalid refresh token"));
      }

      const user = User.findOne({ id: userId });
      if (!user) {
        return next(CustomErrorHandler.unAuthorized("No user found"));
      }

      // Token
      const access_token = JwtService.sign({
        _id: user._id,
        role: user.role,
      });
      const refresh_token = JwtService.sign(
        { _id: user._id, role: user.role },
        "1y",
        REFRESH_SECRET
      );
      // save in database
      await RefreshToken.create({
        token: refresh_token,
      });
      res.json({ access_token, refresh_token });
    } catch (error) {
      return next(new Error("something went wrong " + error.message));
    }
  },
};

export default refreshController;
