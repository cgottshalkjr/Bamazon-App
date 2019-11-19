//Setting variables for 
var mysql = require("mysql");
require("dotenv").config();
var inquirer = require("inquirer");
var Table = require("cli-table");
var colors = require("colors");
var figlet = require("figlet");

//setting variables for creating a shopping cart and updating it to database.
var shopcartUpdate = [];
var dbUpdate = [];
var total = 0;

//setting themes for node colors package
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
                message: "\r\nWelcome to Bamazon! Would you like to see what we have for purchase?".info,
                default: true,
                validate: function (value) {
                    if (!isNaN(value)) {
                        return true;
                    }
                    console.log("\r\n");
                    console.log("\r\nPlease enter a number!!".info);
                    console.log("\r\n");
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

                console.log("\r\n");
                console.log("Well please leave and never come back!!!\n".info);
                console.log("\r\n");

                console.log("\r\n");
                console.log("We don't need your business anyway!\n".info);
                console.log("\r\n");

                //figlet
                figlet("KICK ROCKS!!!", function (err, data) {
                    if (err) {
                        console.log('Something went wrong...'.brightWhite.bgCyan);
                        console.dir(err);
                        return;
                    }
                    console.log(data.silly)
                });
                //end figlet

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

    inquirer
        .prompt([
            {
                name: "choice",
                type: "input",
                message: "\r\nWhat is the ID# of the product you would like to purchace?\r\n".info,
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }

                    console.log("\r\n");
                    console.log("\r\nPlease enter a number!!".info);
                    console.log("\r\n");
                }

            }, {
                name: "qtySelection",
                message: "\r\nHow many units would you like?\r\n".info,
                type: "input",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    console.log("\r\n");
                    console.log("\r\nPlease enter a number!!".info);
                    console.log("\r\n");
                }
            }
        ]).then(function (result) {

            //Selecting all columns from table where item_id is equal to user "choice".
            var query = "SELECT * FROM products WHERE item_id = ?";
            connection.query(query, result.choice, function (err, res) {

                if (err) throw err;

                //if user picks a number not in table...
                if (!res.length) {
                    console.log("\r\n");
                    console.log("Sorry item not in inventory, please try again.".help);
                    console.log("\r\n");

                    //run user purchase again
                    setTimeout(userPurchase, 1000);

                } else {

                    //if user amount of item selected is more than in stock...
                    if (result.qtySelection > res[0].stock_quantity) {
                        console.log("\r\n");
                        console.log("Sorry we do not enough have enough in stock! Please try again!".help);
                        console.log("\r\n");

                        //runs user purchase again
                        setTimeout(userPurchase, 1000);

                    } else {

                        // creating our shopping cart with empty arrays from above
                        shopcartUpdate.push(res, parseInt(result.qtySelection));

                        //pushing item_id and new quantity number to db array
                        dbUpdate.push(res[0].item_id, (parseInt(res[0].stock_quantity) - parseInt(result.qtySelection)));

                        console.log("\r\n");

                        //creating new table for shopping cart.
                        var table = new Table({
                            head: ["ID", "Product", "Price", "Quantity"],
                            colWidths: [5, 40, 22, 22]
                        });
                        total = 0;
                        for (var i = 0; i < shopcartUpdate.length; i += 2) {
                            table.push(
                                [shopcartUpdate[i][0].item_id, shopcartUpdate[i][0].product_name, shopcartUpdate[i][0].price, shopcartUpdate[i + 1]]
                            );
                            total += (shopcartUpdate[i][0].price * shopcartUpdate[i + 1]);
                        }

                        table.push(["", "", "", ""], ["", "", "TOTAL:", total]);
                        console.log(table.toString().help);

                        checkout();
                    }
                }
            });
        });
}
//end of function for userPurchase

//function asking if the user would like to make more purchases
function checkout() {
    inquirer
        .prompt([
            {
                name: "answer",
                type: "confirm",
                message: "\r\nWould you like to make another purchase???\r\n".help,
                default: false
            }

        ]).then(function (user) {

            if (user.answer === true) {

                userPurchase();

            } else {

                for (var i = 0; i < dbUpdate.length; i += 2) {
                    //updating database 
                    var query2 = "UPDATE products SET stock_quantity = ? WHERE item_id = ?";
                    connection.query(query2, [dbUpdate[i + 1], dbUpdate[i]], function (error) {
                        if (error) throw error;
                    })
                }

                console.log("\r\n");
                console.log("Thank you!!! Come back any time!!!".help);
                console.log("\r\n");

                connection.end();
            }
        })
}
//end anotherPurchase function












