import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import netflixData from './data/netflix-titles.json';

// defining a port where the app will run.
const port = process.env.PORT || 8080;
// initialazing new express server
const app = express();

// Add middlewares to enable cors and json body parsing
// Cors makes it easier to use the API, allows API's to say where the requests come from.
// bodyParser allows express to read json in post requests
app.use(cors());
app.use(bodyParser.json());

// Defining routes here
app.get('/', (req, res) => {
  res.send({
    title: 'Welcome to MovieTime API!',
    description: {
      'You can read documentation and view a frontend demo of this API here':
        'https://movietime-api.netlify.app/documentation'
    }
  });
});

app.get('/shows/search', (req, res) => {
  const { title } = req.query;
  const arrayToSendToUser = netflixData.filter(
    (item) => item.title.toLocaleLowerCase().includes(title.toLocaleLowerCase)
    /* eslint-disable func-call-spacing */
  );

  if (arrayToSendToUser.length === 0) {
    res.status(404).json('Sorry, could not this title :(');
  }

  res.json({
    response: arrayToSendToUser,
    success: true
  });
});

app.get('/shows', (req, res) => {
  const { title, country, type, year, page, limit } = req.query;

  let arrayToSendToUser = netflixData;

  if (title) {
    arrayToSendToUser = arrayToSendToUser.filter(
      (item) => item.title.toLowerCase().includes(title.toLowerCase())
      /* eslint-disable func-call-spacing */
    );
  }

  if (country) {
    arrayToSendToUser = arrayToSendToUser.filter(
      (item) => item.country.toLowerCase().includes(country.toLowerCase())
      /* eslint-disable func-call-spacing */
    );
  }

  if (type) {
    arrayToSendToUser = arrayToSendToUser.filter(
      (item) => item.type.toLowerCase().includes(type.toLowerCase())
      /* eslint-disable func-call-spacing */
    );
  }

  if (year) {
    // "+" turns the string in to a number.
    arrayToSendToUser = arrayToSendToUser.filter(
      (item) => item.release_year === +year
    );
  }

  // PAGINATION
  // with limit user setting the limit of items to show per page
  // and page shows first items depends on what limit is
  if (page && limit) {
    // -1 because index starts with 0, multiply 0 so we start at 0
    const startIndex = (page - 1) * limit;
    // here we get the end of an array
    const endIndex = page * limit;
    // slice gives us what in between startIndex and endIndex
    const paginationArray = arrayToSendToUser.slice(startIndex, endIndex);
    // returs an array with pagination
    res.json({
      response: paginationArray,
      success: true
    });
  }

  // ERRORS
  if (arrayToSendToUser.length === 0) {
    res.status(404).json({
      response: 'This array is empty',
      success: false
    });
  }

  res.json({
    response: arrayToSendToUser,
    success: true
  });
});

// SECOND ENDPOINT
// get a specific show based on id, using params, :id is like a placeholder
app.get('/shows/id/:id', (req, res) => {
  // params in this case are :id, params is something that we can get from the request
  // all params comes as strings
  const { id } = req.params;
  // "+" turns a string in to a number.
  const showOnlyOneShow = netflixData.find((show) => show.show_id === +id);

  if (!showOnlyOneShow) {
    res.status(404).json({
      response: 'No show found with that id',
      success: false
    });
  } else {
    // status 200 is by default
    res.json({
      response: showOnlyOneShow,
      success: true
    });
  }
});

// Start the server
// passing port variable that we difined on line 18
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
