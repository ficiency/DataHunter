const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

let products = [];
let nextId = 1;

//Util functions

function validateProduct(data){
    const errors = [];

    if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
        errors.push('Name is required and must be a non-empty string.')
    }

    if (data.price === undefined || data.price === null) {
        errors.push('Price is required.');
    } else if (typeof data.price !== 'number') {
        errors.push('Price must be a number');
    } else if (data.price <= 0) {
        errors.push('Price must be greater than 0.');
    }

    if (data.stock === undefined || data.stock === null) {
        errors.push('Stock is required.');
    } else if (typeof data.stock !== 'number') {
        errors.push('Stock must be a number');
    } else if (!Number.isInteger(data.stock)) {
        errors.push('Stock must be an integer.');
    } else if (data.stock < 0) {
        errors.push('Stock cannot be negative.');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

function findProductById(id){
    return products.find(p => p.id === id) || null;
}

function findProductIndex(id){
    return products.findIndex(p => p.id === id);
}


// CRUD Endpoints

app.get('/products', (req, res) => {
    res.json({ 
        success: true,
        count: products.length,
        data: products
     });
});


app.get('/products/:id', (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid product ID'
        });
    }

    const product = findProductById(id);

    if (!product){
        return res.status(404).json({
            success: false,
            error: 'Product not found.'
        });
    }

    res.json({
        success: true,
        data: product
    });
});


app.post('/products', (req, res) => {
    const validation = validateProduct(req.body);

    if (!validation.isValid) {
        return res.status(400).json({
            success: false,
            errors: validation.errors
        });
    }

    const newProduct = {
        id: nextId++,
        name: req.body.name.trim(),
        price: req.body.price,
        stock: req.body.stock
    };

    products.push(newProduct);

    res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: newProduct
    });
});


app.put('/products/:id', (req, res) => {

    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid product ID'
        });
    }

    const index = findProductIndex(id);

    if (index === -1) {
        return res.status(404).json({
            success: false,
            error: 'Product not found'
        });
    }

    const validation = validateProduct(req.body);

    if (!validation.isValid) {
        return res.status(400).json({
            success: false,
            errors: validation.errors
        });
    }

    products[index] = {
        id: products[index].id,
        name: req.body.name.trim(),
        price: req.body.price,
        stock: req.body.stock
    };

    res.json({
        success: true,
        message: 'Product updated successfully',
        data: products[index]
    });
});


app.delete('/products/:id', (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid product ID'
        });
    }

    const index = findProductIndex(id);

    if (index === -1){
        return res.status(404).json({
            success: false,
            error: 'Product not found'
        });
    }

    const deleteProduct = products[index];

    products.splice(index, 1);

    res.json({
        success: true,
        message: 'Product deleted successfully',
        data: deleteProduct
    });
});


app.listen(PORT, () => {
console.log(`Server now running in ${PORT}!`);
});