/*
#### 🔴 Reto 1.1: Async/Await Básico
Crea un programa que:
- Haga 3 peticiones HTTP a diferentes APIs públicas (ejemplo: JSONPlaceholder, OpenWeather, etc.)
- Use async/await correctamente
- Maneje errores con try/catch
- Muestre los resultados en consola
*/

//We import axios to enable HTTP petitions
const axios = require('axios');

async function makePetitions(){
    try{
        const response_A = await axios.get('https://jsonplaceholder.typicode.com/users/1');
        const response_B = await axios.get('https://restcountries.com/v3.1/name/mexico');
        const response_C = await axios.get('https://dog.ceo/api/breeds/image/random');

        console.log('JSONPlaceholder response: ', response_A);
        console.log('RestCountries response: ', response_B);
        console.log('DOG response: ', response_C);

    } catch (error) {
        console.log('Error');
    }
}

makePetitions();