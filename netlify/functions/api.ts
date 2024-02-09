import express, { Router } from "express";
import serverless from "serverless-http";
import axios from "axios";

const api = express();

api.use(express.json({ limit: "5mb" }));
api.use(express.urlencoded({ limit: "5mb", extended: true }));

const router = Router();
router.get("/hello", (req, res) => {
  res.send(process.env.USERNAME!);
});

router.post("/proxy", async (req, res) => {
  const { targetUrl }: { targetUrl: string } = req.body;
  console.log(targetUrl);

  try {
    const result = await axios.get(targetUrl, {
      method: "GET",
      proxy: {
        host: "proxy-server.scraperapi.com",
        port: 8001,
        auth: {
          username: "scraperapi",
          password: "28853040141d7e45fe6b72af841e9496",
        },
        protocol: "http",
      },
    });
    const { data } = result;
    // console.log(data);
    res.send(data);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

api.use("/api/", router);

export const handler = serverless(api);
