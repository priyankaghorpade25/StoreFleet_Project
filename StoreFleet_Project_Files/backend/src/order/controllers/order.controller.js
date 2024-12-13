// Please don't change the pre-written code
// Import the necessary modules here

import { createNewOrderRepo, getAllPlacedOrder, getSingleOrderRepo,myOrderRepo,updateOrderRepo } from "../model/order.repository.js";
import { ErrorHandler } from "../../../utils/errorHandler.js";

export const createNewOrder = async (req, res, next) => {
  // Write your code here for placing a new order
  try{
    console.log(req.body);
    

    const newOrder = {
      shippingInfo: {
        address: req.body.shippingInfo.address,
        city: req.body.shippingInfo.city,
        state: req.body.shippingInfo.state,
        country: req.body.shippingInfo.country,
        pincode: Number(req.body.shippingInfo.pincode), // Ensure correct type
        phoneNumber: Number(req.body.shippingInfo.phoneNumber),
      },
      orderedItems: req.body.orderedItems.map((item) => ({
        product: item.product,
        name: item.name,
        price: Number(item.price), // Ensure correct type
        image: item.image,
        quantity: Number(item.quantity),
      })),
      paymentInfo: {
        id:req.body.paymentInfo.id,
        status: req.body.paymentInfo.status,
      },
      itemsPrice: Number(req.body.itemsPrice),
      taxPrice: Number(req.body.taxPrice),
      shippingPrice: Number(req.body.shippingPrice),
      totalPrice: Number(req.body.totalPrice),
      user: req.user._id, // Added by auth middleware
      paidAt: Date.now(),
      deliveredAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // Example: delivery after 7 days
    };
    

    
    const result=await createNewOrderRepo(newOrder);
    console.log(result);

    res.status(201).json({
      success:true,
      msg:"Order placed successfully",
      result
    })

  }
  catch(err){
    console.log(err);
    return next(new ErrorHandler(400,err));
  }
 
};

export const getSingleOrder=async(req,res,next)=>{
  try{
    const {id}=req.params;
    console.log(id);

    const Order=await getSingleOrderRepo(id);
    res.status(200).json({
      success:true,
      msg:"Order details retrived by id successfully",
      Order
    })

  }
  catch(err){
    console.log(err);
    return next(new ErrorHandler(400,err.msg));
  }
}
export const myOrder=async(req,res,next)=>{
  try{

    const myOrders=await myOrderRepo(req.user.id);
    res.status(200).json({
      success:true,
      msg:"Your orders data",
      myOrders
      
    })

  }
  catch(err){
    console.log(err);
    return next(new ErrorHandler(400,err.msg));

  }
}

export const placedOrder=async(req,res,next)=>{
  try{

    const placedOrder=await getAllPlacedOrder();
    res.status(200).json({
      success:true,
      msg:"All placed orders retreived successfully",
      placedOrder,

    })


  }
  catch(err){
    console.log(err);
    return next(new ErrorHandler(400,err.msg));
  }
}

export const updateOrder=async(req,res,next)=>{
  try{
    const{id}=req.params;
    // const UpdateOrder={
    //   shippingInfo: {
    //     address: req.body.shippingInfo.address,
    //     city: req.body.shippingInfo.city,
    //     state: req.body.shippingInfo.state,
    //     country: req.body.shippingInfo.country,
    //     pincode: Number(req.body.shippingInfo.pincode), // Ensure correct type
    //     phoneNumber: Number(req.body.shippingInfo.phoneNumber),
    //   },
    //   orderedItems: req.body.orderedItems.map((item) => ({
    //     product: item.product,
    //     name: item.name,
    //     price: Number(item.price), // Ensure correct type
    //     image: item.image,
    //     quantity: Number(item.quantity),
    //   })),
    //   paymentInfo: {
    //     id:req.body.paymentInfo.id,
    //     status: req.body.paymentInfo.status,
    //   },
    //   itemsPrice: Number(req.body.itemsPrice),
    //   taxPrice: Number(req.body.taxPrice),
    //   shippingPrice: Number(req.body.shippingPrice),
    //   totalPrice: Number(req.body.totalPrice),
    //   user: req.user._id, // Added by auth middleware
    //   paidAt: Date.now(),
    //   deliveredAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  
    // }
  
  
    const UpdatedOrder=await updateOrderRepo(id,req.body);

    res.status(200).json({
      success:true,
      msg:"Order updated successfully",
      UpdatedOrder,
    })

  }
  catch(err){
    console.log(err);
    return next(new ErrorHandler(400,err.msg));
  }

  


}