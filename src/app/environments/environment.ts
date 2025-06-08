const environments = {
    development: {
        apiUrl: "http://127.0.0.1:3000/api",

  production: false
    },
    production: {
        apiUrl: "https://awellamgh.com/api",

  production: true
    },
    staging: {
        apiUrl: "https://newawellambcckend.onrender.com/api",

  production: false
    }
};





const currentEnvironment = 'production';

export const environment = environments[currentEnvironment];

export const url = {
    apiUrl: environment.apiUrl
};