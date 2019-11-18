var mysql = require("mysql");
require("dotenv").config();
var inquirer = require("inquirer");
var Table = require("cli-table");
var colors = require("colors");
var figlet = require("figlet");

colors.setTheme({
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
  });

var connection = mysql.createConnection({
    host: "localhost",

    port: 3306,

    user: "root",

    password: process.env.MY_SQL_PASS,
    database: "bamazon_db"
});

connection.connect(function (err) {
    if (err) throw err;

    initQuest();
});

function initQuest() {
    inquirer
        .prompt([
            {
                name: "answer",
                type: "confirm",
                message: "Welcome to Bamazon! Would you like to see what we have for purchase?",
                default: true
            }
        ]).then(function (ans) {


            if (ans.answer === true) {

                showItems();
            } else {
                console.log("Well please leave and never come back!!!\n");
                console.log("We don't need your business anyway!\n");
                figlet("KICK ROCKS!!!", function (err, data) {
                    if (err) {
                        console.log('Something went wrong...');
                        console.dir(err);
                        return;
                    }
                    console.log(data.warn)
                });
                connection.end();
            }
        })
}

function showItems() {

    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;


        figlet.text('BAMAZON...BUY OUR STUFF', {
            font: 'Doom',
            horizontalLayout: 'default',
            verticalLayout: 'default'
        }, function (err, data) {
            if (err) {
                console.log('Something went wrong...');
                console.dir(err);
                return;
            }
            console.log(data.warn);
        });

        var table = new Table({
            head: ["ID", "Product", "Department", "Price", "Stock"],
            colWidths: [5, 40, 22, 22, 22]
        })
        for (var i = 0; i < results.length; i++) {

            table.push([results[i].item_id, results[i].product_name, results[i].department_name, parseFloat(results[i].price).toFixed(2), results[i].stock_quantity]);

        }

        console.log(table.toString().help);
    });

    setTimeout(userPurchase, 1000);
}

//function creating prompts to see what user would like to purchase
function userPurchase() {
    inquirer
        .prompt([
            {
                name: "choice",
                type: "input",
                message: "What is the ID# of the product you would like to purchace?",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    console.log("\r\nPlease enter a number!!".brightWhite.bgMagenta);
                }

            }, {
                name: "qtySelection",
                message: "How many units of would you like?",
                type: "input",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    console.log("\r\nPlease enter a number!!".brightWhite.bgMagenta);
                }
            }

        ]).then(function (result) {

            var query = "SELECT * FROM products WHERE item_id = ?";
            connection.query(query, result.choice, function (err, res) {

                if (err) throw err;

                if (!res.length) {
                    console.log("\r\n");
                    console.log("Sorry item not in inventory, please try again.".brightWhite.bgMagenta);
                    setTimeout(userPurchase, 1000);

                } else {

                    if (result.qtySelection > res[0].stock_quantity) {
                        console.log("\r\n");
                        console.log("Sorry we do not enough have enough in stock! Please try again!".brightWhite.bgMagenta);
                        setTimeout(userPurchase, 1000);

                    } else {

                        var answer = result.choice;
                        var selection = result.qtySelection;
                        var newQty = parseInt(res[0].stock_quantity) - parseInt(selection);
                        var fixedPrice = res[0].price;

                        connection.query("UPDATE products SET stock_quantity = ? WHERE item_id = ?", [newQty, answer], function (err) {
                            if (err) throw err;
                            console.log("Thank you for purchasing " + selection + " of Item # " + answer + ". Your total is $" + parseInt(selection) * parseFloat(fixedPrice).toFixed(2).brightWhite.bgMagenta);

                            anotherPurchase();
                        });
                    }
                }
            })
        })
}
//end of function for userPurchase

//function asking if the user would like to make more purchases
function anotherPurchase() {
    inquirer
        .prompt([
            {
                name: "answer",
                type: "confirm",
                message: "Would you like to make another purchase???",
                default: false
            }

        ]).then(function (user) {

            if (user.answer === true) {
                userPurchase();
            } else {
                console.log("Thank you!!! Come back any time!!!".brightWhite.bgMagenta);
                connection.end();
            }
        })
}
//end anotherPurchase function












