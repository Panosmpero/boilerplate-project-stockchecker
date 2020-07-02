/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

// Uncaught TypeError: assert.hasAllKeys is not a function????????

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const { suite, test } = require("mocha");
const server = require('../server');
const Stock = require("../models/stockModel");

chai.use(chaiHttp);

suite('Functional Tests', function() {
    
    suite('GET /api/stock-prices => stockData object', function() {
      
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'ads'})
        .end(function(err, res){
          const { stockData } = res.body;
          // console.log(stockData)
          // assert.hasAllKeys(stockData, ["stock", "price", "likes"]);
          assert.isString(stockData.stock, "Stock should be a string");
          assert.equal(stockData.stock, "ADS", "Stock should be ADS");
          assert.isString(stockData.price, "Price should be a string");
          assert.isNumber(stockData.likes, "Likes should be a number");
          done();
        });
      });
      
      test('1 stock with like', function(done) {
        chai.request(server)
          .get("/api/stock-prices")
          .query({ stock: "ads", like: true })
          .end((err, res) => {
            const { stockData } = res.body;
            // assert.hasAllKeys(stockData, ["stock", "price", "likes"]);
            assert.isString(stockData.stock, "Stock should be a string");
            assert.equal(stockData.stock, "ADS", "Stock should be ADS");
            assert.isString(stockData.price, "Price should be a string");
            assert.isNumber(stockData.likes, "Likes should be a number");
            assert.equal(stockData.likes, 1, "Likes should be 1");
            done();
          });        
      });
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        chai.request(server)
          .get("/api/stock-prices")
          .query({ stock: "ads", like: true })
          .end((err, res) => {
            const { stockData } = res.body;
            // assert.hasAllKeys(stockData, ["stock", "price", "likes"]);
            assert.isString(stockData.stock, "Stock should be a string");
            assert.equal(stockData.stock, "ADS", "Stock should be ADS");
            assert.isString(stockData.price, "Price should be a string");
            assert.isNumber(stockData.likes, "Likes should be a number");
            assert.equal(stockData.likes, 1, "Likes should be 1");
            done();
          }); 
      });
      
      test('2 stocks', function(done) {
        chai.request(server)
          .get("/api/stock-prices")
          .query({ stock: ["ads", "amzn"] })
          .end((err, res) => {
            const stock1 = res.body.stockData[0];
            const stock2 = res.body.stockData[1];

            // assert.hasAllKeys(stock1, ["stock", "price", "rel_likes"]);
            assert.isString(stock1.stock, "Stock1 should be a string");
            assert.equal(stock1.stock, "ADS", "Stock1 should be ADS");
            assert.isString(stock1.price, "Price1 should be a string");
            assert.isNumber(stock1.rel_likes, "Likes1 should be a number");
            
            // assert.hasAllKeys(stock2, ["stock", "price", "rel_likes"]);
            assert.isString(stock2.stock, "Stock2 should be a string");
            assert.equal(stock2.stock, "AMZN", "Stock2 should be AMZN");
            assert.isString(stock2.price, "Price2 should be a string");
            assert.isNumber(stock2.rel_likes, "Likes2 should be a number");

            done();
          }); 
      });
      
      test('2 stocks with like', function(done) {
        chai.request(server)
          .get("/api/stock-prices")
          .query({ stock: ["ads", "amzn"], like: true })
          .end((err, res) => {
            const stock1 = res.body.stockData[0];
            const stock2 = res.body.stockData[1];

            // assert.hasAllKeys(stock1, ["stock", "price", "rel_likes"]);
            assert.isString(stock1.stock, "Stock should be a string");
            assert.equal(stock1.stock, "ADS", "Stock should be ADS");
            assert.isString(stock1.price, "Price should be a string");
            assert.equal(stock1.rel_likes, 0, "rel_ikes should be 0");
            
            // assert.hasAllKeys(stock2, ["stock", "price", "rel_likes"]);
            assert.isString(stock2.stock, "Stock should be a string");
            assert.equal(stock2.stock, "AMZN", "Stock should be AMZN");
            assert.isString(stock2.price, "Price should be a string");
            assert.equal(stock2.rel_likes, 0, "rel_ikes should be 0");

            done();
          });
      });

      const clearTests = async (done) => {
        try {
          let a = await Stock.findOneAndDelete({ stock: "ADS" });
          let b = await Stock.findOneAndDelete({ stock: "AMZN" });
          console.log("Stocks deleted successfully.");
          done();

        } catch (error) {
          console.log("Stocks deletion failure.")
          done();
        }
      }

      after((done) => {
        clearTests(done)        
      })
      
    });

});
