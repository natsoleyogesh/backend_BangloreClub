const { getCountries, getStates, getCities } = require("../../controllers/masterController/locationController");

module.exports = (router) => {
    router.get("/countries", getCountries);
    router.get("/countries/:countryCode/states", getStates);
    router.get("/countries/:countryCode/states/:stateCode/cities", getCities);
};
