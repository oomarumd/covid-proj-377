const supabaseClient = require('@supabase/supabase-js');
const express = require('express');
const axios = require('axios');
const cors = require('cors');  // Add this line

const app = express();
const port = 3000;
app.use(cors());  // Add this line
app.use(express.static(__dirname + '/public'));

const supabaseURL = 'https://pdtpmcjysibwzwyyhnpm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkdHBtY2p5c2lid3p3eXlobnBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYxNTk2MTQsImV4cCI6MjAzMTczNTYxNH0.zs-ZNRPKB7GMULaiCx3UyP8qmeDDl_jB17oS-vf7xPE';
const supabase = supabaseClient.createClient(supabaseURL, supabaseKey);

const fetchAndStoreCovidData = async () => {
    try {
        console.log('Fetching data from API...');
        const response = await axios.get('https://disease.sh/v3/covid-19/countries/');
        const countriesData = response.data;
        console.log('Data fetched successfully from API.');

        const { data, error } = await supabase
            .from('Covid')
            .insert(countriesData.map(country => ({
                country: country.country,
                num_of_cases: country.cases,
                recovered: country.recovered
            })));

        if (error) {
            console.error('Error inserting data:', error);
        } else {
            console.log('Data inserted successfully:', data);
        }
    } catch (error) {
        console.error('Error fetching data from API:', error);
    }
};

// Fetch and store data every 24 hours
setInterval(fetchAndStoreCovidData, 24 * 60 * 60 * 1000);

// Initial fetch and store
fetchAndStoreCovidData();

app.get('/api/covid-stats', async (req, res) => {
    try {
        console.log('Fetching data from Supabase...');
        const { data, error } = await supabase
            .from('Covid')
            .select('num_of_cases, recovered');

        if (error) {
            console.error('Error fetching data from Supabase:', error);
            res.status(500).json({ error: error.message });
        } else {
            const totalCases = data.reduce((acc, country) => acc + country.num_of_cases, 0);
            const totalRecovered = data.reduce((acc, country) => acc + country.recovered, 0);
            console.log('Data fetched successfully from Supabase.');
            res.json({ totalCases, totalRecovered });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`App is ALIVE and listening on port ${port}`);
});
