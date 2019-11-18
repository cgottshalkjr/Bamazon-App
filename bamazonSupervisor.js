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
    figlet.text('BAMAZON SUPERVISOR VIEW', {
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
    
    });
    //end figlet
});