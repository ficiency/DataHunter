const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;


let items = [];
let newIndex = 1;

//Util functions

async function handleErrors(){
    const errors = [];

    //Check id errors



    //Check pricing errors
    //Some code here...


    //Check color errors
    //Some code here...
}




//Item properties
//id, price, color


//Crud Enpoints

//List all items
app.get('/items', (req, res) => {
    return res.json({
        data: items
    });
});


//Add new item
app.post('items/:id', (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({
            success: false,
            errors: 'Id is required.'
        });
    }

    if (!Number.isInteger(id) || id < 0) {
        return res.status(404).json({
            success: false,
            errors: 'Id must be an integer and also greater than 0.'
        });
    };

    newItem = {
        id: newIndex++,
        price: req.body.price,
        color: req.body.color
    };

    products.push(newItem);

    return res.status(202).json({
        success: true,
        data: newItem
    });
});


app.listen(PORT, () => {
    console.log('Server now running in localhost:3000');
});