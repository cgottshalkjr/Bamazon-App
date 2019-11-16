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

            console.log("Item #: " + results[i].item_id + " - " + results[i].product_name + " - " + results[i].department_name + " - " + "$" + parseFloat(results[i].price).toFixed(2) + " - " + "qty: " + results[i].stock_quantity);

        }
        console.log("----------------------------------");
    });
    setTimeout(userPurchase, 1000);
}

function userPurchase() {
    inquirer
        .prompt([
            {
                name: "choice",
                type: "input",
                message: "What is the ID# of the product you would like to purchace?",
            }, {
                name: "qtySelection",
                message: "How many units of would you like?",
                type: "input"
            }
        ]).then(function (result) {

            var query = "SELECT * FROM products WHERE item_id = ?";
            connection.query(query, result.choice, function (err, res) {
                if (err) throw err;
                if (!res.length) {
                    console.log("\r\n");
                    console.log("Sorry item not in inventory, please try again.");
                    setTimeout(userPurchase, 1000);
                } else {
                    if (result.qtySelection > res[0].stock_quantity) {
                        console.log("\r\n");
                        console.log("Sorry we do not enough have enough in stock! Please try again!");
                        setTimeout(userPurchase, 1000);
                    } else {

                        var newQty = parseInt(res[0].stock_quantity) - parseInt(result.qtySelection)
                        connection.query("UPDATE products SET stock_quantity = ? WHERE item_id = ?", [newQty, result.choice], function (err, result) {
                            if (err) throw err;
                            console.log("Thank you for purchasing " + result.qtySelection + "of " + result.choice + ". Your total is $" + parseInt(result.qtySelection) * parseFloat(res[0].price).toFixed(2));

                        })
                    }
                    connection.end();
                }
            })
        })
}











