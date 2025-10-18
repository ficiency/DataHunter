/**
 * Reto 1.1: Async/Await - Versión Profesional
 * 
 * Características:
 * - Ejecución paralela con Promise.all()
 * - Manejo robusto de errores
 * - Validación de respuestas
 * - Timeouts configurables
 * - Logging profesional
 * - Métricas de performance
 * - Status code handling
 * - Código modular y reutilizable
 */

const axios = require('axios');

const CONFIG = {
    TIMEOUT: 5000,
    RETRY_ATTEMPTS: 2, 
};

const URLS = {
    USER: 'https://jsonplaceholder.typicode.com/users/1',
    COUNTRY: 'https://restcountries.com/v3.1/name/mexico',
    DOG: 'https://dog.ceo/api/breeds/image/random'
};

const httpClient = axios.create({
    timeout: CONFIG.TIMEOUT,
    headers: {
        'User-agent': 'Optery/Practice/1.0',
        'Accept': 'application/json'
    }
});

//Utils

function handleError(error, functionName) {
    const errorResponse = {
        success: false,
        error: {
            function: functionName,
            message: error.message
        }
    };

    if (error.response) {
        errorResponse.error.status = error.response.status;
        errorResponse.error.type = 'API_ERROR';
    } else if (error.request) {
        errorResponse.error.type = 'NETWORK_ERROR';
    } else {
        errorResponse.error.type = 'UNKNOWN_ERROR';
    }

    return errorResponse;
}


//Petitions

async function getUser(){
    try {
        const response = await httpClient.get(URLS.USER)
        
        if (!response.data?.name) {
            throw new Error('Invalid user data structure');
        };

        return {
            success: true,
            data: {
                name: response.data.name,
                email: response.data.email,
                company: response.data.company.name
            }
        };

    } catch(error) {
        return handleError(error, 'getUser');
    }
};

async function getCountry(){
    try{   
        const response = await httpClient.get(URLS.COUNTRY);

        if (!response.data[0]){
            throw new Error('Invalid country data structure');
        }

        const country = response.data[0]

        return {
            success: true,
            data: {
                name: country.name.common,
                capital: country.capital[0],
                population: country.population.toLocaleString()
            }
        };

    } catch (error) {
        return handleError(error, 'getCountry');
    } 
};


async function getDogImage(){
    try{
        const response = await httpClient.get(URLS.DOG);
        
        if (response.data.status !== 'success'){
            throw new Error('Invalid dog image structure');
        };

        return {
            success: true,
            data: {
                message: response.data.message,
                state: response.data.status
            }
        };

    } catch(error) {
        return handleError(error, 'getDogImage');
    }
}


async function main(){
    console.log('Initializing parallel petitions...');

    const startTime = Date.now();

    try {
        const [userResult, countryResult, dogResult] = await Promise.all([
            getUser(),
            getCountry(),
            getDogImage()
        ]);

        const allSuccess = userResult.success && countryResult.success && dogResult.success;

        if (!allSuccess) {
            console.log('One or multiple petitions have failed.');
            if (!userResult.success) console.error('User: ', userResult.error.message);
            if (!countryResult.success) console.error('Country: ', countryResult.error.message);
            if (!dogResult.success) console.error('Dog: ', dogResult.error.message);
            process.exit(1);
        };

        console.log('Users: ', userResult.data);
        console.log('Country: ', countryResult.data);
        console.log('Dog: ', dogResult.data);

        const elapsed = Date.now() - startTime;
        console.log(`Completed in ${elapsed}ms`);

    } catch (error) {
        console.log('Error; ', error.message);
        process.exit(1);
    }

};


main();