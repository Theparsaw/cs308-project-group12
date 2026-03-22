### CS308 Project

This project includes a backend (Node.js + Express + MongoDB) and a frontend.

Project Structure

cs308/
- ├── cs308-backend/
- ├── cs308-frontend/

# Backend Setup

1. Go to backend folder: cd cs308-backend
2. Install dependencies: npm install
3. Create .env file inside cs308-backend/
Add:
PORT=5001
MONGO_URI=your_mongodb_connection_string

Seed database (optional)
node seed/seedProducts.js
Run server
node server.js


Notes:

- Do not commit .env 
- node_modules are ignored
- API base route: /api/products

See API.md for endpoint details.


# Frontend Features

 Product Browsing (SCRUM-64)
- Initialized Vue.js frontend using Vite
- Configured Tailwind CSS for styling
- Implemented routing with Vue Router
- Created product listing page (responsive grid layout)
- Created product detail page with dynamic routing
- Connected frontend to backend API (/api/products)
- Implemented loading and error states
- Added navigation between pages

 Admin Panel (SCRUM-74)
- Created admin product list page (table view)
- Implemented Add Product form with validation
- Implemented Edit Product functionality with pre-filled data
- Added Delete product functionality
- Connected admin UI to backend API
- Added form validation for all required fields
- Implemented category selection dropdown
- Disabled productId editing in update mode
