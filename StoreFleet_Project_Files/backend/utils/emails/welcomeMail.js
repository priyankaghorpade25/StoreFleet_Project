// Import the necessary modules here
import nodemailer from "nodemailer";

export const sendWelcomeEmail = async (user) => {
  // Write your code her
   try{
    console.log("Inside sendWelcomeEmail",user.email);
    console.log("Email",process.env.STORFLEET_SMPT_MAIL)
    console.log("Password",process.env.STORFLEET_SMPT_MAIL_PASSWORD)

    const transporter=nodemailer.createTransport(
      
      {
      
      service:process.env.SMPT_SERVICE,
      auth:{
        user:process.env.STORFLEET_SMPT_MAIL,
        pass:process.env.STORFLEET_SMPT_MAIL_PASSWORD
      }
  
    })

    const htmlContent = `
    <img src="C:\Users\Rushikesh\Downloads\logo1-32230.png">
    <h1>Welcome to StoreFleet!</h1>
    <p>Hello ${user.name}<p>
    <p>Thank you for registering with us. We're excited to have you as a new member of our community.</p>
     <p>
        <a href="http://example.com/login" style="
          background-color: #4CAF50; 
          color: white; 
          padding: 14px 20px; 
          text-align: center; 
          text-decoration: none; 
          display: inline-block; 
          border-radius: 5px; 
          font-size: 16px;">
          Get Started
        </a>
      </p>
    
    <p>Best regards, <br> The StoreFleet Team</p>
  `;
  
    const mailOptions={
      from:process.env.STORFLEET_SMPT_MAIL,
      to:user.email,
      subject:"Registration confirmation email",
      html:htmlContent
    }
  
    const info =await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.response);
  
  
    }
    catch(err){
      console.log("Error message",err.message);
      throw new Error("Failed sending email");
    }
  
  };
