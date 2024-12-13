// Please don't change the pre-written code
// Import the necessary modules here

import { sendPasswordResetEmail } from "../../../utils/emails/passwordReset.js";
import { sendWelcomeEmail } from "../../../utils/emails/welcomeMail.js";
import { ErrorHandler } from "../../../utils/errorHandler.js";
import { sendToken } from "../../../utils/sendToken.js";

import {
  createNewUserRepo,
  deleteUserRepo,
  findUserForPasswordResetRepo,
  findUserRepo,
  getAllUsersRepo,
  updateUserProfileRepo,
  updateUserRoleAndProfileRepo,
} from "../models/user.repository.js";
import crypto from "crypto";

export const createNewUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    const newUser = await createNewUserRepo(req.body);
    await sendToken(newUser, res, 200);

    // Implement sendWelcomeEmail function to send welcome message
    console.log("Before sending Email");
    await sendWelcomeEmail(newUser);
    console.log("After sending Email");
  } catch (err) {
    //  handle error for duplicate email
    return next(
      new ErrorHandler(
        400,
        "You have already registered with this email please register with different email"
      )
    );
  }
};

export const userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    if (!email || !password) {
      return next(new ErrorHandler(400, "please enter email/password"));
    }
    const user = await findUserRepo({ email }, true);
    console.log(user);
    if (!user) {
      return next(
        new ErrorHandler(401, "user not found! register yourself now!!")
      );
    }
    const passwordMatch = await user.comparePassword(password);
    console.log(passwordMatch);
    if (!passwordMatch) {
      return next(new ErrorHandler(401, "Invalid email or passswor!"));
    }
    await sendToken(user, res, 200);
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const logoutUser = async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({ success: true, msg: "logout successful" });
};

export const forgetPassword = async (req, res, next) => {
  try {
    const { email, token, password, confirmPassword } = req.body;

    if (!token) {
      // If no token is provided, initiate the password reset process
      if (!email) {
        return next(new ErrorHandler(400, "Please provide an email address."));
      }

      // Delegate to requestPasswordReset to handle email reset token logic
      await requestPasswordReset(req, res, next);
    }

    // If a token is provided, handle the password reset logic
    if (!password || !confirmPassword || !token) {
      return next(
        new ErrorHandler(
          400,
          "Password ,token and confirm password are required."
        )
      );
    }

    // Set up the request object for resetUserPassword
    req.params.token = token; // Simulate route params
    req.body.password = password;
    req.body.confirmPassword = confirmPassword;

    // Delegate to resetUserPassword to handle the actual reset logic
    return await resetUserPassword(req, res, next);
  } catch (err) {
    console.error(err);
    return next(new ErrorHandler(500, "Internal Server Error"));
  }
};

export const requestPasswordReset = async (req, res, next) => {
  // Implement feature for reset password
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return next(new ErrorHandler(400, "Please provide email and password"));
    }

    // Find the user by email
    const user = await findUserRepo({ email }, true);
    if (!user) {
      return next(new ErrorHandler(404, "User not found! Please register."));
    }

    // Generate reset token
    const resetToken = await user.getResetPasswordToken();

    // Save the token and expiration on the user object
    await user.save(); // Ensure changes are persisted in the database

    // Construct the reset password URL
    const resetPasswordURL = `${req.protocol}://${req.get(
      "host"
    )}/reset/${resetToken}`;

    // Send password reset email
    await sendPasswordResetEmail(user, resetPasswordURL, resetToken);

    // return res.status(200).json({
    //   success: true,
    //   message: "Token for password reset has been sent to your email.",
    // });
  } catch (err) {
    console.log(err);
    return next(new ErrorHandler(400, err));
  }
};
export const resetUserPassword = async (req, res, next) => {
  try {
    //const { email, password } = req.body;
    const token = req.params.token;
    console.log(typeof token);
    const { email, password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return next(
        new ErrorHandler(400, "Please provide password and confirmpassword")
      );
    }

    // Hash the token to match the stored token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find the user by the reset token and ensure it's not expired
    const user = await findUserForPasswordResetRepo(hashedToken);

    if (!user) {
      return next(new ErrorHandler(400, "Invalid or expired reset token"));
    }

    // Update the user's password
    user.password = password; // Hashing is handled in the pre-save middleware
    user.resetPasswordToken = undefined; // Clear the reset token
    user.resetPasswordExpire = undefined; // Clear the expiration

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error(error);
    return next(new ErrorHandler(500, "Internal Server Error"));
  }
};

export const getUserDetails = async (req, res, next) => {
  try {
    const userDetails = await findUserRepo({ _id: req.user._id });
    res.status(200).json({ success: true, userDetails });
  } catch (error) {
    return next(new ErrorHandler(500, error));
  }
};

export const updatePassword = async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  try {
    if (!currentPassword) {
      return next(new ErrorHandler(401, "pls enter current password"));
    }

    const user = await findUserRepo({ _id: req.user._id }, true);
    const passwordMatch = await user.comparePassword(currentPassword);
    if (!passwordMatch) {
      return next(new ErrorHandler(401, "Incorrect current password!"));
    }

    if (!newPassword || newPassword !== confirmPassword) {
      return next(
        new ErrorHandler(401, "mismatch new password and confirm password!")
      );
    }

    user.password = newPassword;
    await user.save();
    await sendToken(user, res, 200);
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const updateUserProfile = async (req, res, next) => {
  const { name, email } = req.body;
  try {
    const updatedUserDetails = await updateUserProfileRepo(req.user._id, {
      name,
      email,
    });
    res.status(201).json({ success: true, updatedUserDetails });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

// admin controllers
export const getAllUsers = async (req, res, next) => {
  try {
    const allUsers = await getAllUsersRepo();
    res.status(200).json({ success: true, allUsers });
  } catch (error) {
    return next(new ErrorHandler(500, error));
  }
};

export const getUserDetailsForAdmin = async (req, res, next) => {
  try {
    const userDetails = await findUserRepo({ _id: req.params.id });
    if (!userDetails) {
      return res
        .status(400)
        .json({ success: false, msg: "no user found with provided id" });
    }
    res.status(200).json({ success: true, userDetails });
  } catch (error) {
    return next(new ErrorHandler(500, error));
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const deletedUser = await deleteUserRepo(req.params.id);
    if (!deletedUser) {
      return res
        .status(400)
        .json({ success: false, msg: "no user found with provided id" });
    }

    res
      .status(200)
      .json({ success: true, msg: "user deleted successfully", deletedUser });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const updateUserProfileAndRole = async (req, res, next) => {
  try{
    const{role}=req.body;
    const {id}=req.params.id;

    const updatedUserRoleDetails=await updateUserRoleAndProfileRepo(id,req.body);
    res.status(200).json({success:true,msg:"User profile or  role updated successfully",updatedUserRoleDetails})

  }
  catch(err){
    console.log(err);
    return next(new ErrorHandler(400,err));
  }
};
