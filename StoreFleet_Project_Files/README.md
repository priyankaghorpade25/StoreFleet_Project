StoreFleet E-commerce Backend
StoreFleet is a comprehensive e-commerce backend that supports product management, user management, order handling, and more. This repository contains the backend API for managing products, users, orders, and reviews for a complete e-commerce system.

Features
User authentication and authorization (JWT-based)
Product management (CRUD operations)
Order management (Create, Update, Retrieve orders)
Reviews and Ratings for products
Payment information handling
Admin and User roles with access control
Pagination, search, and filter functionality for products
Technologies Used
Node.js: JavaScript runtime for building scalable server-side applications.
Express.js: Web framework for Node.js.
MongoDB: NoSQL database for storing data (with Mongoose for schema modeling).
JWT (JSON Web Tokens): For user authentication.
Bcrypt.js: For hashing passwords.
Mongoose: ODM (Object Data Modeling) library for MongoDB.
Prerequisites
Node.js (v14 or later)
MongoDB (local or cloud instance)
Setup Instructions
1. Clone the repository
bash
Copy code
git clone https://github.com/priyankaghorpade25/StoreFleet_Project.git
cd storefleet
2. Install dependencies
Install the required npm packages.

bash
Copy code
npm install
3. Setup environment variables
Create a .env file in the root directory with the following variables:

makefile
Copy code
PORT=5000
MONGODB_URI=your-mongo-db-connection-string
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=your-stripe-secret-key (Optional)
Replace your-mongo-db-connection-string and your-secret-key with your actual MongoDB connection string and JWT secret key.

4. Start the server
Once you've set up the environment variables, you can start the server:

bash
Copy code
npm run dev
This will run the server on http://localhost:5000.

API Endpoints
User and Admin Routes
User Routes
1. POST /api/users/signup
Register a new user.
2. POST /api/users/login
Log in an existing user and receive a JWT token.
3. POST /api/users/password/forget
Request a password reset link.
4. PUT /api/users/password/reset/:token
Reset the user's password using the token sent to their email.
5. PUT /api/users/password/update
Update the current logged-in user's password.
6. PUT /api/users/profile/update
Update the current logged-in user's profile.
7. GET /api/users/details
Retrieve details of the current logged-in user.
8. GET /api/users/logout
Log out the user by invalidating the JWT token.
Admin Routes
9. GET /api/users/admin/allusers
Retrieve all users (Admin only).
10. GET /api/users/admin/details/:id
Retrieve details of a specific user (Admin only).
11. DELETE /api/users/admin/delete/:id
Delete a specific user (Admin only).
12. PUT /api/users/admin/update/:id
Update the role or profile of a specific user (Admin only).

Product and Review Routes
Product Routes
1. GET /api/products
Retrieve a list of all products.
2. GET /api/products/details/:id
Retrieve details of a specific product by ID.
3. GET /api/products/reviews/:id
Retrieve all reviews for a specific product.
Admin Product Routes
4. POST /api/products/add
Add a new product (Admin only).
5. PUT /api/products/update/:id
Update product details (Admin only).
6. DELETE /api/products/delete/:id
Delete a specific product by ID (Admin only).
User Product Routes
7. PUT /api/products/rate/:id
Rate a product (User only).
8. DELETE /api/products/review/delete
Delete a specific product review (User only).

User Order Routes
1. POST /api/orders/new
Place a new order (User only).
2. GET /api/orders/:id
Retrieve details of a specific order by ID (User only).
3. GET /api/orders/my/orders
Retrieve all orders placed by the logged-in user (User only).
4. PUT /api/orders/update/:id
Update the status of a specific order by ID (Admin only).
Admin Order Routes
5. GET /api/orders/placed
Retrieve all orders placed by users (User only).

Below is the postman Link to test the above api 
https://web.postman.co/workspace/My-Workspace~61f4d3db-bc33-4a58-8c18-7a26e6db241c/collection/38374184-d19cd28f-93c7-4b4a-bab8-2680c963f9ef

Authentication
StoreFleet uses JWT for authenticating API requests.

Example of JWT in Headers:
bash
Copy code
Authorization: Bearer <your-jwt-token>
You need to pass the JWT token in the Authorization header for protected routes.

Database Structure
Users Collection
json
Copy code
{
  "_id": ObjectId,
  "name": String,
  "email": String,
  "password": String (hashed),
  "role": String ("admin" or "user"),
  "createdAt": Date
}
Products Collection
json
Copy code
{
  "_id": ObjectId,
  "name": String,
  "description": String,
  "category": String,
  "price": Number,
  "rating": Number,
  "reviews": [
    {
      "user": ObjectId,
      "name": String,
      "rating": Number,
      "comment": String
    }
  ],
  "image": String,
  "createdBy": ObjectId,
  "createdAt": Date
}
Orders Collection
json
Copy code
{
  "_id": ObjectId,
  "user": ObjectId,
  "shippingInfo": {
    "address": String,
    "city": String,
    "state": String,
    "country": String,
    "pincode": Number,
    "phoneNumber": Number
  },
  "orderedItems": [
    {
      "product": ObjectId,
      "name": String,
      "price": Number,
      "quantity": Number
    }
  ],
  "paymentInfo": {
    "id": String,
    "status": String
  },
  "orderStatus": String ("Processing", "Shipped", "Delivered", "Cancelled"),
  "itemsPrice": Number,
  "taxPrice": Number,
  "shippingPrice": Number,
  "totalPrice": Number,
  "paidAt": Date,
  "deliveredAt": Date,
  "createdAt": Date
}


Notes
Admin Access: Ensure that only admins can create, update, or delete products, and manage orders. You can handle this by checking the user's role using middleware.
