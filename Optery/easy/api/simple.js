// 1. Imports y setup
const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// 2. Data storage (array in memory)
let products = [];
let nextId = 1;

// 3. CRUD Endpoints

//List all products
app.get('/products', (req, res) => {
    res.status(200).json(products);
});

//Add new product
app.post('/products', (req, res) => {

    const newProduct = {
        id: nextId++,
        name: req.body.name,
        price: req.body.price,
        stock: req.body.stock
    };

    products.push(newProduct);

    res.status(201).json(newProduct);
});


//Modify existing product
app.put('/products/:id', (req, res) => {
    const id = Number(req.params.id);

    const index = products.findIndex(p => p.id === id);

    if (index === -1){
        return res.status(404).json({ error: "Product doesn't exist" });
    }

    products[index] = {
        id: products[index].id,
        name: req.body.name,
        price: req.body.price,
        stock: req.body.stock
    };

    res.json(products[index]);
});


//Remove existing product
app.delete('/products/:id', (req, res) => {
    const id = Number(req.params.id);

    const index = products.findIndex(p => p.id === id);

    if (index === -1){
        return res.status(404).json({ error: "Product doesn't exist" });
    }

    products.splice(index, 1);

    res.json({ message: "Product succesfuly removed." });

});


app.listen(PORT, () => {
    console.log('Server in http://localhost:3000');
});