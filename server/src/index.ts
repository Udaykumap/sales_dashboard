import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes  from './modules/users/users.route';
import ordersRouter from './modules/orders/orders.route';
import customersRouter from './modules/customers/customers.route';

import productRoutes from './modules/products/products.route';
import categoryRoutes from './modules/category/category.route';
import authRoutes from './modules/auth/auth.route';
import inventoryRoutes from './modules/inventory/inventory.route';
import reportsRoutes from './modules/reports/reports.route';
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg"; // or whichever adapter
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),          // direct‑db connection
  // – or –                             
  // accelerateUrl: process.env.ACCELERATE_URL,  // if you use Accelerate
});
dotenv.config();

const app = express();
app.use(cors());

const port = 8080;
app.use(express.json());

app.get('/', (req, res) => {
  res.send({'message': 'TypeScript + Node.js + Express!'});
});

app.get('/ping', (req, res) => {
  res.send("pong");
});

// Orders Routes
app.use('/api/orders', ordersRouter);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reports', reportsRoutes);


// Customers Routes
app.use('/api/customers', customersRouter);
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});