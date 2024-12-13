import OrderModel from "./order.schema.js";
import mongoose from "mongoose";

export const createNewOrderRepo = async (data) => {
  // Write your code here for placing a new order
  
  console.log("Inside neworder Repo");
  console.log(data);
  const newOrder= new OrderModel(data);
  await newOrder.save();
  return newOrder;
};

export const getSingleOrderRepo=async(id)=>{

  const Order= await OrderModel.findById(id);
  return Order;
}

export const myOrderRepo=async(userId)=>{

  const myOrderDetails=await OrderModel.find(
    {
      user:userId
    }
  )

  return myOrderDetails;

}

export const getAllPlacedOrder=async()=>{
  return await OrderModel.find();
}

export const updateOrderRepo=async(id,data)=>{
  const updatedOrder=await OrderModel.findByIdAndUpdate(new mongoose.Types.ObjectId(id),
  {$set:data},
  {
    new: true,
    runValidators: true,
    useFindAndModify: true,
  });
  return updatedOrder;
}
