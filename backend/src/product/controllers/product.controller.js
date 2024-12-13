// Please don't change the pre-written code
// Import the necessary modules here
import UserModel from "../../user/models/user.schema.js";
import mongoose from "mongoose"

import { ErrorHandler } from "../../../utils/errorHandler.js";
import {
  addNewProductRepo,
  deleProductRepo,
  findProductRepo,
  getAllProductsRepo,
  getProductDetailsRepo,
  getTotalCountsOfProduct,
  updateProductRepo,
} from "../model/product.repository.js";
import ProductModel from "../model/product.schema.js";

export const addNewProduct = async (req, res, next) => {
  try {
    const product = await addNewProductRepo({
      ...req.body,
      createdBy: req.user._id,
    });
    if (product) {
      res.status(201).json({ success: true, product });
    } else {
      return next(new ErrorHandler(400, "some error occured!"));
    }
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};



export const getAllProducts = async (req, res, next) => {
  // Implement the functionality for search, filter and pagination this function.

  //pagination functionality

  try{
    const { page = 1, limit = 10 ,keyword,category,rating} = req.query;


    // search functionality
    const query={}; //will all filtering condinds in this query and then pass this query to the find 

    const currentPage = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const skipPage = (currentPage - 1) * pageSize;
    

    if(keyword){
      const regex = new RegExp(keyword, "i"); // "i" makes it case-insensitive
      query.name=regex;

    }
    if(category){
      query.category=category;
    }
    if (req.query['price[gte]'] || req.query['price[lte]']) {
      const minPrice = req.query['price[gte]'] ? Number(req.query['price[gte]']) : 0;
      const maxPrice = req.query['price[lte]'] ? Number(req.query['price[lte]']) : Infinity;

      query.price = { $gte: minPrice, $lte: maxPrice }; // Add price range to query
    }
   
    if (req.query['rating[gte]'] || req.query['rating[lte]']) {
      const minRating = req.query['rating[gte]'] ? Number(req.query['rating[gte]']) : 0;
      const maxRating = req.query['rating[lte]'] ? Number(req.query['rating[lte]']) : 5;

      query.rating = { $gte: minRating, $lte: maxRating }; // Add price range to query
    }

   console.log("Query conditions",query); 
   const users = await ProductModel.find(query).skip(skipPage).limit(limit);
   console.log("Users after query",users);

   const AllDocuments=await ProductModel.countDocuments(query);
   console.log(AllDocuments);

   



    

    res.status(200).json({
      success: true,
      message: "Required number of documents displayed",
      AllDocuments,
      currentPage,
      totalPages: Math.ceil(AllDocuments / pageSize),
      data: users,
    });

  }
  catch(err){
    console.log(err);
    return next(new ErrorHandler(400,err));
  }
  




};

export const updateProduct = async (req, res, next) => {
  try {
    const updatedProduct = await updateProductRepo(req.params.id, req.body);
    if (updatedProduct) {
      res.status(200).json({ success: true, updatedProduct });
    } else {
      return next(new ErrorHandler(400, "Product not found!"));
    }
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const deletedProduct = await deleProductRepo(req.params.id);
    if (deletedProduct) {
      res.status(200).json({ success: true, deletedProduct });
    } else {
      return next(new ErrorHandler(400, "Product not found!"));
    }
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const getProductDetails = async (req, res, next) => {
  try {
    const productDetails = await getProductDetailsRepo(req.params.id);
    if (productDetails) {
      res.status(200).json({ success: true, productDetails });
    } else {
      return next(new ErrorHandler(400, "Product not found!"));
    }
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const rateProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const { rating, comment } = req.body;
    const user = req.user._id;
    const name = req.user.name;
    const review = {
      user,
      name,
      rating: Number(rating),
      comment,
    };
    if (!rating) {
      return next(new ErrorHandler(400, "rating can't be empty"));
    }
    const product = await findProductRepo(productId);
    if (!product) {
      return next(new ErrorHandler(400, "Product not found!"));
    }
    const findRevieweIndex = product.reviews.findIndex((rev) => {
      return rev.user.toString() === user.toString();
    });
    if (findRevieweIndex >= 0) {
      product.reviews.splice(findRevieweIndex, 1, review);
    } else {
      product.reviews.push(review);
    }
    let avgRating = 0;
    product.reviews.forEach((rev) => {
      avgRating += rev.rating;
    });
    const updatedRatingOfProduct = avgRating / product.reviews.length;
    product.rating = updatedRatingOfProduct;
    await product.save({ validateBeforeSave: false });
    res
      .status(201)
      .json({ success: true, msg: "thx for rating the product", product });
  } catch (error) {
    return next(new ErrorHandler(500, error));
  }
};

export const getAllReviewsOfAProduct = async (req, res, next) => {
  try {
    const product = await findProductRepo(req.params.id);
    if (!product) {
      return next(new ErrorHandler(400, "Product not found!"));
    }
    res.status(200).json({ success: true, reviews: product.reviews });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const deleteReview = async (req, res, next) => {
  // Insert the essential code into this controller wherever necessary to resolve issues related to removing reviews and updating product ratings.
  try {
    const { productId, reviewId } = req.query;
    if (!productId || !reviewId) {
      return next(
        new ErrorHandler(
          400,
          "pls provide productId and reviewId as query params"
        )
      );
    }
    const product = await findProductRepo(productId);
    if (!product) {
      return next(new ErrorHandler(400, "Product not found!"));
    }
    const reviews = product.reviews;
    console.log(reviews),
    //console.log("User id in review",reviews[0].user);
    console.log("Current user",req.user._id);

    if(reviews.length==0){
      return next(new ErrorHandler(400, "review doesn't exist"));

    }

    if(new mongoose.Types.ObjectId(reviews[0].user).equals(req.user._id)){
      const isReviewExistIndex = reviews.findIndex((rev) => {
        return rev._id.toString() === reviewId.toString();
      });
  
      console.log(isReviewExistIndex);
      if (isReviewExistIndex < 0) {
        return next(new ErrorHandler(400, "review doesn't exist"));
      }
  
      const reviewToBeDeleted = reviews[isReviewExistIndex];
      reviews.splice(isReviewExistIndex, 1);
  
      await product.save({ validateBeforeSave: false });
      res.status(200).json({
        success: true,
        msg: "review deleted successfully",
        deletedReview: reviewToBeDeleted,
        product,
      });

    }
    else{
      res.status(400).json({success:false,msg:"You can not delete this review only person who has added can delete"})

    }
    
    

    
  } catch (error) {
    return next(new ErrorHandler(500, error));
  }
};
