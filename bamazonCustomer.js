var mysql = require("mysql");
require("dotenv").config();
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: process.env.MY_SQL_PASS,
    database: "bamazon_db"
});

connection.connect(function (err) {
    if (err) throw err;
    //   console.log("connected as id " + connection.threadId);
    showItems();
});

function showItems() {
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        console.log("----------------------------------");
        for (var i = 0; i < results.length; i++) {

            console.log("Item #: " + results[i].item_id + " - " + results[i].product_name + " - " + results[i].department_name + " - " + "$" + results[i].price + " - " + "qty: " + results[i].stock_quantity);

        }
        console.log("----------------------------------");
    });
    userPrompt();
}

function userPrompt() {

    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        inquirer
            .prompt([
                {
                    name: "choice",
                    type: "rawlist",
                    message: "What is the ID# of the product you would like to purchace?",
                    choices: function () {
                        var productArr = [];
                        for (var i = 0; i < res.length; i++) {
                            productArr.push(res[i].item_id)
                        }
                        return productArr;
                    }
                }, {
                    name: "qtySelection",
                    message: "How many units of would you like?",
                    type: "input"
                },
            ]);
    });
    connection.end();
}










