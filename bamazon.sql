CREATE TABLE products (
    item_id INT NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(100) NOT NULL,
    department_name VARCHAR(100) NOT NULL,
    price DECIMAL(7,2) NOT NULL,
    stock_quantity INTEGER(10)
)

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("mustache comb", "grooming", 19.99, 125);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("really cool shirt", "clothing", 10.00, 250);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("laser disc player", "electronics", 250.00, 10);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("sandal socks", "clothing", 10.75, 75);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("shelbo's jug of mountain dew code red ", "food", 3.99, 5);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("adult bibs", "clothing", 5.99, 700);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("kathryn's toe cream", "healthcare", 34.75, 200);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("toejam and earl(sega genesis)", "electronics", 40.00, 55);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("baha men cd", "electronics", 150.00, 999);

