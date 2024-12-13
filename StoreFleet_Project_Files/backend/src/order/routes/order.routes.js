import express from "express";
import { createNewOrder, 
    getSingleOrder, 
    myOrder,
    placedOrder,
    updateOrder
 } from "../controllers/order.controller.js";
import { auth ,authByUserRole} from "../../../middlewares/auth.js";

const router = express.Router();

router.route("/new").post(auth, createNewOrder);
router.route("/:id").get(auth,getSingleOrder);
router.route("/my/orders").get(auth,myOrder);
router.route("/orders/placed").get(auth,authByUserRole("admin"),placedOrder);
router.route("/update/:id").put(auth,updateOrder);

export default router;
