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
