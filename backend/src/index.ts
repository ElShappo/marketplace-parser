import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import db from './db';
import { IProductExtended } from "./types";
import cors from 'cors';

dotenv.config();

const app: Express = express();
app.use(express.json());
app.use(cors())

const port = process.env.PORT || 3001;

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.get('/getProducts', (req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM Products').all() as IProductExtended[];
  console.log(rows);
  res.send(rows);
});

app.put('/deleteProducts', (req: Request, res: Response) => {
  try {
    const delete_ = db.prepare('DELETE FROM Products WHERE intrinsicId = ?');
    const products = [req.body] as IProductExtended[];
    
    const delete_Many = db.transaction((products: IProductExtended[]) => {
      for (const product of products) delete_.run(product.intrinsicId);
    });
    
    delete_Many(products);
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.put('/updateProducts', (req: Request, res: Response) => {
  try {
    const update = db.prepare('UPDATE Products SET id = ?, name = ?, marketplaces = ? WHERE intrinsicId = ?');
    const products = [req.body] as IProductExtended[];
    console.log(products);
    
    const updateMany = db.transaction((products: IProductExtended[]) => {
      for (const product of products) update.run(product.id, product.name, JSON.stringify(product.marketplaces), product.intrinsicId);
    });
    
    updateMany(products);
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.post('/addProducts', (req: Request, res: Response) => {
  try {
    const insert = db.prepare('INSERT INTO Products (intrinsicId, id, name, marketplaces) VALUES (@intrinsicId, @id, @name, @marketplaces)');
    const products = [req.body] as IProductExtended[];
    console.log(products);
    
    const insertMany = db.transaction((products: IProductExtended[]) => {
      for (const product of products) insert.run({
        intrinsicId: product.intrinsicId,
        id: String(product.id),
        name: product.name,
        marketplaces: JSON.stringify(product.marketplaces),
      });
    });
    
    insertMany(products);
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
