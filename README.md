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
appName=CS308ClusterappName = CS308Cluster
JWTSecret = our_secret

Seed database (optional)
node seed/seedProducts.js
Run server
node server.js


Notes:

- Do not commit .env 
- node_modules are ignored
- API base route: /api/products
- Product popularity is calculated from paid orders by summing sold item quantities per product
- Product responses include a `popularity` field and `GET /api/products?sort=popularity` sorts by that value

See API.md for endpoint details.


## Frontend Description

This project is a full-stack web application where users can browse through a list of products and view detailed information for each product. The application includes a product browsing interface as well as an admin panel where products can be added, edited, and deleted.

The frontend is built using Vue.js (Vite) and styled with Tailwind CSS.

---

## Running the Application

You must run BOTH backend and frontend in separate terminals.

### Terminal 1 — Backend

cd cs308-backend  
node server.js  

→ Server runs on http://localhost:5001  

---

### Terminal 2 — Frontend

cd cs308-frontend  
npm install  
npm run dev  

→ Open: http://localhost:5173  

---

# The project is being tested for further developments, under certain (so far 15) cases.
