//Variables holding all of the node packages.
var mysql = require("mysql");
require("dotenv").config();
var inquirer = require("inquirer");
var Table = require("cli-table");
var colors = require("colors");
var figlet = require("figlet");

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

    initManager();
});


function initManager() {

    inquirer
        .prompt([
            {
                name: "answer",
                type: "rawlist",
                message: "Hello Mr. Manager, What would you like to do?",
                choices: ["View products for sale", "View low inventory", "Add to invetory", "Add new product"]
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
                    func2();
                    break;

                case "Add new product":
                    func3();
                    break;

            }

        })
}

//creating function for manager to view products
function viewProducts() {

    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;

        figlet('BAMAZON MANAGERIAL VIEW', function (err, data) {
            if (err) {
                console.log('Something went wrong...');
                console.dir(err);
                return;
            }
            console.log(data)
        });


        var table = new Table({
            head: ["ID", "Product", "Department", "Price", "Stock"],
            colWidths: [5, 40, 22, 22, 22]
        })
        for (var i = 0; i < results.length; i++) {

            table.push([results[i].item_id, results[i].product_name, results[i].department_name, parseFloat(results[i].price).toFixed(2), results[i].stock_quantity]);

        }

        console.log(table.toString());
    });

    setTimeout(initManager, 1000);

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
            // console.log(res[i].item_id);
            // console.log(res[i].product_name);
            // console.log(res[i].department_name);
            // console.log(res[i].price);
            // console.log(res[i].stock_quantity);

        }
        // console.log(res);
        console.log(table.toString());
    });

}
//End of lowQty function.