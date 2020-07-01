/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

const expect = require("chai").expect;
const axios = require("axios");
const publicIp = require("public-ip");
const Stock = require("../models/stockModel");

/*
================================================================== 
========================= HELPER FUNCTION ======================== 
================================================================== 
*/
const checkStock = async (stock, like, res) => {
        
  // Get from FCC's custom API the stock stats
  let stockRawData = await axios.get(
    `https://repeated-alpaca.glitch.me/v1/stock/${stock}/quote`
  );
  
  if (stockRawData.data !== "Invalid symbol") {
    console.log("Axios get success");
    let { data } = stockRawData;

    // Get client's IP in v6
    let ip = await publicIp.v6();

    // If user clicked "like" we add IP, if IP already in stock then nothing gets added
    let update = like 
      ? { price: data.latestPrice.toFixed(2), $addToSet: { likes: ip } } 
      : { price: data.latestPrice.toFixed(2) };

    let stockInDB = await Stock.findOneAndUpdate(
      { stock: data.symbol },
      update,
      {
        new: true,
        upsert: true,
      }
    );

    if (stockInDB) {
      console.log("New / Updated Stock: " + stockInDB)
      return {
        stock: stockInDB.stock,
        price: stockInDB.price,
        likes: stockInDB.likes.length
      }
    } else {
      console.log("Stock DB failed");
      return { message: "Stock DB failed." }
    }

  } else if (stockRawData.data === "Invalid symbol") {
    console.log("Invalid stock name");
    return { message: `Invalid Stock Name: ${stock}` }

  } else {
    console.log("Axios failed");
    return { message: "Error getting data." }
  }
};

/*
================================================================== 
========================== MAIN FUNCTION ========================= 
================================================================== 
*/
module.exports = function (app) {
  app.route("/api/stock-prices").get(async function (req, res) {
    try {
      let { stock, like } = req.query;
      let stockData;

      if (typeof stock === "object") {
        let firstStock = await checkStock(stock[0], like, res);
        let secondStock = await checkStock(stock[1], like, res);

        // If there is a message, return error message and quit
        if (firstStock.message) return res.json({ stockData: firstStock });
        if (secondStock.message) return res.json({ stockData: secondStock });

        stockData = [
          {
            stock: firstStock.stock,
            price: firstStock.price,
            rel_likes: firstStock.likes - secondStock.likes
          },
          {
            stock: secondStock.stock,
            price: secondStock.price,
            rel_likes: secondStock.likes - firstStock.likes
          }
        ];

        res.status(200).json({ stockData })

      } else {
        stockData = await checkStock(stock, like, res);
        
        // Need to fix this, status(400) doesnt send json data
        stockData.message
          ? res.json({ stockData }) // res.status(400).json({ stockData })
          : res.status(200).json({ stockData })    
      }

    } catch (error) {
      console.log(`Error getting data: ${error}`);
      res.status(400).send("Error getting data");
    }
  });
};
