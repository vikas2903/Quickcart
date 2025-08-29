import express from "express";
import { config } from "dotenv";

config();

export async function startExpressServer(port = process.env.PORT || 3000) {
  const express = express();

  app.get("/api/store-credentia", (req, res) => {
    res.status(200).json({ message: "successful" });
  });

  return new Promise((resolve) =>{
    const server = app.listen(port, () =>{
        console.log(`Express server running on port ${port}`);
        resolve(server);
    })
  })
}

export default startExpressServer;
