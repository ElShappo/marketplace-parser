import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import fetch from "node-fetch";
import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";

dotenv.config();

const app: Express = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

const port = process.env.PORT || 3001;

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.post("/proxy", async (req: Request, res: Response) => {
  const { targetUrl }: { targetUrl: string } = req.body;
  console.log(targetUrl);

  try {
    const result = await axios.get(targetUrl, {
      method: "GET",
      proxy: {
        host: "proxy-server.scraperapi.com",
        port: 8001,
        auth: {
          username: process.env.USERNAME,
          password: process.env.PASSWORD,
        },
        protocol: "http",
      },
    });
    const { data } = result;
    console.log(data);
    res.send(data);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
