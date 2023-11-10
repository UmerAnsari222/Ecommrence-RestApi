import { Product } from "../models";
import multer from "multer";
import path from "path";
import fs from "fs";
import CustomErrorHandler from "../services/CustomErrorHandler";
import Joi from "joi";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    // 3746674586-836534453.png
    cb(null, uniqueName);
  },
});
const handleMultipartData = multer({
  storage,
  limits: { fileSize: 1000000 * 5 },
}).single("image");

const productController = {
  async store(req, res, next) {
    handleMultipartData(req, res, async (err) => {
      if (err) {
        return next(CustomErrorHandler.serverError(err));
      }
      const filePath = req.file.path;
      // Validation
      const productSchema = Joi.object({
        name: Joi.string().required(),
        price: Joi.number().required(),
        size: Joi.string().required(),
      });
      const { error } = productSchema.validate(req.body);
      if (error) {
        fs.unlink(`${appRoot}/${filePath}`, (err) => {
          if (err) {
            return next(CustomErrorHandler.serverError(err));
          }
        });
        return next(error);
      }
      const { name, price, size } = req.body;
      let document;
      try {
        document = await Product.create({ name, price, size, image: filePath });
      } catch (error) {
        return next(error);
      }
      res.status(201).json(document);
    });
  },
  update(req, res, next) {
    handleMultipartData(req, res, async (err) => {
      if (err) {
        return next(CustomErrorHandler.serverError(err));
      }
      let filePath;
      if (req.file) {
        filePath = req.file.path;
      }
      // Validation
      const productSchema = Joi.object({
        name: Joi.string().required(),
        price: Joi.number().required(),
        size: Joi.string().required(),
      });
      const { error } = productSchema.validate(req.body);
      if (error) {
        if (req.file) {
          fs.unlink(`${appRoot}/${filePath}`, (err) => {
            if (err) {
              return next(CustomErrorHandler.serverError(err));
            }
          });
        }

        return next(error);
      }
      const { name, price, size } = req.body;
      let document;
      try {
        document = await Product.findOneAndUpdate(
          { _id: req.params.id },
          {
            name,
            price,
            size,
            ...(req.file && { image: filePath }),
          },
          { new: true }
        );
      } catch (error) {
        return next(error);
      }
      res.status(201).json(document);
    });
  },
  async destroy(req, res, next) {
    let document = await Product.findOneAndRemove({ _id: req.params.id });
    if (!document) {
      return next(new Error("Could\nt find"));
    }
    const imagePath = document._doc.image;
    fs.unlink(`${appRoot}/${imagePath}`, (err) => {
      if (err) {
        return next(CustomErrorHandler.serverError(err));
      }
    });
    res.json(document);
  },
  async index(req, res, next) {
    let document;
    try {
      document = await Product.find()
        .select("-__v -updatedAt")
        .sort({ _id: -1 });
    } catch (error) {
      return next(CustomErrorHandler.serverError(error));
    }
    res.json(document);
  },
  async show(req, res, next) {
    let document;
    try {
      document = await Product.findOne({ _id: req.params.id })
        .select("-__v -updatedAt")
        .sort({ _id: -1 });
    } catch (error) {
      return next(CustomErrorHandler.serverError(error));
    }
    res.json(document);
  },
};

export default productController;
