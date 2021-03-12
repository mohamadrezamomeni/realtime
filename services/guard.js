const axios = require('axios');

module.exports = (token) => {
    let options = {
        headers: {
            Authorization: `${token}`
        }
    };
    return axios.get(`http://${process.env.API_GATEWAY_HOST}:${process.env.API_GATEWAY_PORT}` +
        `/api/${process.env.API_GATEWAY_VERSION}/auth/rbac`, options)
};