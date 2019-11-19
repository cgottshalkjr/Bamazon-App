//Setting variables for 
var mysql = require("mysql");
require("dotenv").config();
var inquirer = require("inquirer");
var Table = require("cli-table");
var colors = require("colors");
var figlet = require("figlet");
var recordKeeping = [];
var databaseUpdate = [];
var total = 0;

//setting themes for colors
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

//creating connection from the database
var connection = mysql.createConnection({
    host: "localhost",

    port: 3306,

    user: "root",

    password: process.env.MY_SQL_PASS,
    database: "bamazon_db"
});

//When connecting we throw the first function up.
connection.connect(function (err) {
    if (err) throw err;

    initQuest();
});

//function that holds first question to get to the next step.
function initQuest() {
    inquirer
        .prompt([
            {
                name: "answer",
                type: "confirm",
                message: "Welcome to Bamazon! Would you like to see what we have for purchase?",
                default: true,
                validate: function (value) {
                    if (!isNaN(value)) {
                        return true;
                    }
                    console.log("\r\n".bgMagenta);
                    console.log("\r\nPlease enter a number!!".brightWhite.bgMagenta);
                    console.log("\r\n".bgMagenta);
                }

            }
        ]).then(function (ans) {

            if (ans.answer) {

                //figlet 
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
                    console.log(data.silly);
                    //if user selects yes we move on to next function
                    showItems();
                });
                //end figlet

                //Or we close out the game and tell them never to come back!
            } else {

                console.log("\r\n".bgMagenta);
                console.log("Well please leave and never come back!!!\n".brightWhite.bgMagenta);
                console.log("\r\n".bgMagenta);
                console.log("We don't need your business anyway!\n".brightWhite.bgMagenta);
                console.log("\r\n".bgMagenta);

                figlet("KICK ROCKS!!!", function (err, data) {
                    if (err) {
                        console.log('Something went wrong...'.brightWhite.bgMagenta);
                        console.dir(err);
                        return;
                    }
                    console.log(data.warn)
                });

                //connection will end if user selects no.
                connection.end();
            }
        })
}

//creating function to display table and what is available.
function showItems() {

    //connecting our query, selecting all columns from table
    connection.query("SELECT * FROM products", function (err, results) {

        if (err) throw err;



        //creating table to display our inventory
        var table = new Table({
            head: ["ID", "Product", "Department", "Price", "Stock"],
            colWidths: [5, 40, 22, 22, 22]
        })

        //looping through our results and displaying them in the table
        for (var i = 0; i < results.length; i++) {

            table.push([results[i].item_id, results[i].product_name, results[i].department_name, parseFloat(results[i].price).toFixed(2), results[i].stock_quantity]);

        }

        //prints table to the terminal
        console.log("\r\n");
        console.log(table.toString().help);
        console.log("\r\n");

    });

    //putting in user purchase function after customer gets look at table
    setTimeout(userPurchase, 1000);

}
//end of showItems function.

//function creating prompts to see what user would like to purchase
function userPurchase() {

    //
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

                    console.log("\r\n");
                    console.log("\r\nPlease enter a number!!".brightWhite.bgMagenta);
                    console.log("\r\n");
                }

            }, {
                name: "qtySelection",
                message: "How many units would you like?",
                type: "input",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }

                    console.log("\r\n");
                    console.log("\r\nPlease enter a number!!".brightWhite.bgMagenta);
                    console.log("\r\n");
                }
            }

        ]).then(function (result) {

            var query = "SELECT * FROM products WHERE item_id = ?";
            connection.query(query, result.choice, function (err, res) {

                if (err) throw err;

                if (!res.length) {
                    console.log("\r\n");
                    console.log("Sorry item not in inventory, please try again.".brightWhite.bgMagenta);
                    console.log("\r\n");
                    setTimeout(userPurchase, 1000);

                } else {

                    if (result.qtySelection > res[0].stock_quantity) {
                        console.log("\r\n");
                        console.log("Sorry we do not enough have enough in stock! Please try again!".brightWhite.bgMagenta);
                        console.log("\r\n");
                        setTimeout(userPurchase, 1000);

                    } else {
                        //shopping cart
                        recordKeeping.push(res, parseInt(result.qtySelection))
                        databaseUpdate.push(res[0].item_id, (parseInt(res[0].stock_quantity) - parseInt(result.qtySelection)));

                        // var answer = result.choice;
                        // var selection = result.qtySelection;
                        // var newQty = parseInt(res[0].stock_quantity) - parseInt(selection);
                        // var purchPrice = parseInt(selection) * parseFloat(res[0].price);

                        // connection.query("UPDATE products SET stock_quantity = ? WHERE item_id = ?", [newQty, answer], function (err) {

                        // if (err) throw err;

                        console.log("\r\n");

                        var table = new Table({
                            head: ["ID", "Product", "Price", "Quantity"],
                            colWidths: [5, 40, 22, 22]
                        });
                        for (var i = 0; i < recordKeeping.length; i += 2) {
                            table.push(
                                [recordKeeping[i][0].item_id, recordKeeping[i][0].product_name, recordKeeping[i][0].price, recordKeeping[i + 1]]
                            );
                            total += (recordKeeping[i][0].price * recordKeeping[i + 1]);
                        }

                        table.push(["", "", "", ""], ["", "", "TOTAL:", total])
                        console.log(table.toString());
                        // console.log("Thank you for purchasing " + selection + " " + res[0].product_name + ". Your total is $" + purchPrice.toFixed(2));

                        checkout();

                        // });
                    }
                }
            })
        })
}
//end of function for userPurchase

//function asking if the user would like to make more purchases
function checkout() {
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
                for (let i = 0; i < databaseUpdate.length; i++) {
                    var query2 = "UPDATE products SET stock_quantity = ? WHERE item_id = ?";
                    connection.query(query2, [databaseUpdate[i + 1], databaseUpdate[i]], function (error, result) {
                        
                    })
                }
                console.log("\r\n");
                console.log("Thank you!!! Come back any time!!!".brightWhite.bgMagenta);
                console.log("\r\n");

                connection.end();
            }
        })
}
//end anotherPurchase function












