import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import db from "./db";
import { IProductRecord } from "./types";
import cors from "cors";
import bodyParser from "body-parser";

dotenv.config();

const app: Express = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json({ limit: "500mb" }));
app.use(bodyParser.urlencoded({ limit: "500mb", extended: true }));

const port = process.env.PORT || 3001;

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.get("/getProducts", (req: Request, res: Response) => {
  const rows = db.prepare("SELECT * FROM Products").all() as IProductRecord[];
  console.log(rows);
  res.send(rows);
});

app.put("/deleteAll", (req: Request, res: Response) => {
  try {
    const delete_ = db.prepare("DELETE FROM Products");
    delete_.run();
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.put("/deleteProducts", (req: Request, res: Response) => {
  try {
    const delete_ = db.prepare("DELETE FROM Products WHERE recordId = ?");
    let products = req.body as IProductRecord[] | IProductRecord;

    if (!Array.isArray(products)) {
      products = [products];
    }

    const delete_Many = db.transaction((products: IProductRecord[]) => {
      for (const product of products) delete_.run(product.recordId);
    });

    delete_Many(products);
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.put("/updateProducts", (req: Request, res: Response) => {
  try {
    const update = db.prepare(
      "UPDATE Products SET productId = ?, searchedName = ?, marketplaces = ? WHERE recordId = ?"
    );
    let products = req.body as IProductRecord[] | IProductRecord;

    if (!Array.isArray(products)) {
      products = [products];
    }

    console.log(products);

    const updateMany = db.transaction((products: IProductRecord[]) => {
      for (const product of products)
        update.run(
          product.productId,
          product.searchedName,
          JSON.stringify(product.marketplaces),
          product.recordId
        );
    });

    updateMany(products);
    console.log("success!");
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.post("/addProducts", (req: Request, res: Response) => {
  try {
    const insert = db.prepare(
      "INSERT INTO Products (recordId, productId, searchedName, marketplaces) VALUES (@recordId, @productId, @searchedName, @marketplaces)"
    );
    let products = req.body as IProductRecord[] | IProductRecord;

    if (!Array.isArray(products)) {
      products = [products];
    }

    console.log(products);

    const insertMany = db.transaction((products: IProductRecord[]) => {
      for (const product of products) {
        insert.run({
          recordId: String(product.recordId),
          productId: product.productId,
          searchedName: product.searchedName,
          marketplaces: JSON.stringify(product.marketplaces),
        });
      }
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
