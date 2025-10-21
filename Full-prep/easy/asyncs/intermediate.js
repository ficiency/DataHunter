const axios = require('axios');


async function getUser(){
    try{
        const response = await axios.get('https://jsonplaceholder.typicode.com/users/1');
        console.log('getUser Response: ', response)
        
        return {
            name: response.data.name,
            email: response.data.email,
            company: response.data.company.name
        };

    } catch(error) {
        console.log('Error in getUser: ', error);
        return {
            success: false,
            error: error.message
        };
    }
}


async function getCountry(){
    try{
        const response = await axios.get('https://restcountries.com/v3.1/name/mexico');
        const country = response.data[0]

        console.log('getCountry Response: ', response)
        
        return {
            name: country.name.common,
            capital: country.capital[0],
            population: country.population.toLocaleString()
        };
        
    } catch(error) {
        console.log('Error in getCountry: ', error);
        return {
            success: false,
            error: error.message
        };
    }
}

async function getDogImage(){
    try{
        const response = await axios.get('https://dog.ceo/api/breeds/image/random')
        console.log('getDogImage Result: ', response)
        return {
            url: response.data.message,
            state: response.data.status
        }

    } catch (error) {
        console.log('Error in getDogImage: ', error);
        return {
            success: false,
            error: error.message
        };
    }
}

async function main() {
    try{
        console.log('Initializing main execution thread..')

        const user = await getUser();
        console.log('getUser Result: ', user);

        const country = await getCountry();
        console.log('getCountry Result: ', country);

        const dog = await getDogImage();
        console.log('getDogImage Result: ', dog);

        console.log('Execution finished...')

    } catch (error) {
        console.log('Error in main function: ', error);
    }
}

main();


