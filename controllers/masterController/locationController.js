const { Country, State, City } = require("country-state-city");


const getCountries = async (req, res) => {
    try {
        const countries = Country.getAllCountries();
        const formattedCountries = countries.map((country) => ({
            id: country.isoCode,
            name: country.name,
            iso2: country.isoCode,
            iso3: country.iso3,
            phonecode: country.phonecode,
        }));
        res.status(200).json(formattedCountries);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}


const getStates = async (req, res) => {
    try {
        const { countryCode } = req.params;
        const states = State.getStatesOfCountry(countryCode.toUpperCase());
        if (!states.length) {
            return res.status(404).json({ message: "No states found for the given country code." });
        }
        const formattedStates = states.map((state) => ({
            id: state.isoCode,
            name: state.name,
            state_code: state.isoCode,
        }));
        res.status(200).json(states);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error ' });
    }
}

const getCities = async (req, res) => {
    try {
        const { countryCode, stateCode } = req.params;
        const cities = City.getCitiesOfState(countryCode.toUpperCase(), stateCode.toUpperCase());
        if (!cities.length) {
            return res.status(404).json({ message: "No cities found for the given state code." });
        }
        // const formattedCities = cities.map((city) => ({
        //     id: city.id,
        //     name: city.name,
        // }));
        res.status(200).json(cities);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}


module.exports = {
    getCountries,
    getStates,
    getCities
}