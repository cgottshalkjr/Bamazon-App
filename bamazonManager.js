//Variables holding all of the node packages.
var mysql = require("mysql");
require("dotenv").config();
var inquirer = require("inquirer");
var Table = require("cli-table");
var colors = require("colors");
var figlet = require("figlet");

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

//Making a connection to mysql database, hiding password.
var connection = mysql.createConnection({
    host: "localhost",

    port: 3306,

    user: "root",

    password: process.env.MY_SQL_PASS,
    database: "bamazon_db"
});

//making our intial connection
connection.connect(function (err) {
    if (err) throw err;

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
        initManager();
    });
    //end figlet
});

//
function initManager() {

    inquirer
        .prompt([
            {
                name: "answer",
                type: "rawlist",
                message: "Hello Mr. Manager, What would you like to do?",
                choices: ["View products for sale", "View low inventory", "Add to inventory", "Add new product", "Exit"]
            }
        ]).then(function (result) {

            switch (result.answer) {

                case "View products for sale":
                    viewProducts();
                    break;

                case "View low inventory":
                    lowQty();
                    break;

                case "Add to inventory":
                    addStock();
                    displayTable();
                    break;

                case "Add new product":
                    addItem();
                    break;

                case "Exit":
                    connection.end();
                    break;

            }
        })
}
//End 

//creating function for manager to view products
function viewProducts() {

    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;

        var table = new Table({
            head: ["ID", "Product", "Department", "Price", "Stock"],
            colWidths: [5, 40, 22, 22, 22]
        })
        for (var i = 0; i < results.length; i++) {

            table.push([results[i].item_id, results[i].product_name, results[i].department_name, parseFloat(results[i].price).toFixed(2), results[i].stock_quantity]);

        }

        console.log(table.toString());
        inquirer
            .prompt([

                {
                    name: "answer",
                    message: "Would you like to make another decision?",
                    type: "confirm",
                    default: true

                }
            ])
            .then(function (answer) {
                if (answer.answer === true) {

                    initManager();

                } else {

                    console.log("\r\n");
                    console.log("THANK YOU MR. MANAGER, YOU HAVE DONE SUCH GREAT WORKS!!!".silly);
                    console.log("\r\n");
                    connection.end();
                }
            })
    });
}
//end of viewProducts function.

//Creating a function so manager can view low stock.
function lowQty() {

    var query = "SELECT * FROM products WHERE stock_quantity < 10";

    connection.query(query, function (err, res) {
        if (err) throw err;

        var table = new Table({
            head: ["ID", "Product", "Department", "Price", "Stock"],
            colWidths: [5, 40, 22, 22, 22]
        })

        for (var i = 0; i < res.length; i++) {

            table.push([res[i].item_id, res[i].product_name, res[i].department_name, parseFloat(res[i].price).toFixed(2), parseInt(res[i].stock_quantity)]);

        }

        console.log(table.toString());

        inquirer
            .prompt([
                {
                    name: "answer",
                    message: "Would you like to make another decision?",
                    type: "confirm",
                    default: true

                }
            ])
            .then(function (answer) {
                if (answer.answer === true) {

                    initManager();

                } else {

                    console.log("\r\n");
                    console.log("THANK YOU MR. MANAGER, YOU HAVE DONE SUCH GREAT WORKS!!!".silly);
                    console.log("\r\n");
                    connection.end();
                }
            })
    });
}
//End of lowQty function.

function displayTable() {

    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;

        var table = new Table({
            head: ["ID", "Product", "Department", "Price", "Stock"],
            colWidths: [5, 40, 22, 22, 22]
        })
        for (var i = 0; i < results.length; i++) {

            table.push([results[i].item_id, results[i].product_name, results[i].department_name, parseFloat(results[i].price).toFixed(2), results[i].stock_quantity]);

        }

        console.log(table.toString());

    })
}


//creating function to add stock to low inventory.
function addStock() {

    inquirer
        .prompt([
            {
                name: "answer",
                message: "Which item would you like to add stock to?",
                type: "input",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }

                    console.log("\r\n".bgMagenta);
                    console.log("\r\nPlease enter a number!!".brightWhite.bgMagenta);
                    console.log("\r\n".bgMagenta);
                }

            }, {
                name: "amount",
                message: "And how much would you like to add?",
                type: "input",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }

                    console.log("\r\n".bgMagenta);
                    console.log("\r\nPlease enter a number!!".brightWhite.bgMagenta);
                    console.log("\r\n".bgMagenta);
                }
            }
        ])
        .then(function (ans) {

            connection.query("SELECT * FROM products", function (err, results) {
                if (err) throw err;

                var chosenItem;
                for (var i = 0; i < results.length; i++) {

                    if (results[i].item_id === parseInt(ans.answer)) {
                        chosenItem = results[i];
                        var addedItem = results[i].product_name;

                    }
                }


                var newStockNum = parseInt(chosenItem.stock_quantity) + parseInt(ans.amount);

                console.log("\r\n");
                console.log("You added " + parseInt(ans.amount) +  " " + addedItem.info+ " to the stock!" + " You now have " + newStockNum + " in stock!");
                console.log("\r\n");


                var query = "UPDATE products SET ? WHERE ?";

                connection.query(query, [{ stock_quantity: newStockNum }, { item_id: ans.answer }], function (error) {
                    if (error) throw error;

                    console.log("\r\n");
                    console.log("You've added stock successfully!".silly);
                    console.log("\r\n");

                    initManager();

                })
            })

        })
}
//end of addStock function.

function addItem() {

    inquirer
        .prompt([
            {
                name: "addition",
                message: "What would you like to add?",
                type: "input"

            }, {

                name: "category",
                message: "What department does this belong?",
                type: "input"

            }, {

                name: "cost",
                message: "How much does this cost?",
                type: "input",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    console.log("\r\nPlease enter a number!!\r\n");
                }

            }, {

                name: "stock",
                message: "How much would you like to stock?",
                type: "input",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    console.log("\r\nPlease enter a number!!\r\n");
                }

            }
        ])
        .then(function (answer) {

            connection.query("INSERT INTO products SET ?", {

                product_name: answer.addition,
                department_name: answer.category,
                price: answer.cost,
                stock_quantity: answer.stock

            }, function (err) {
                if (err) throw err;
                console.log("\r\n");
                console.log("You successfully added stock!".silly);
                console.log("\r\n");
                initManager();
            })
        })
}
//end of addItem function.