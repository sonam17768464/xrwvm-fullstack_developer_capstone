const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const  cors = require('cors')
const app = express()
const port = 3030;

app.use(cors())
app.use(require('body-parser').urlencoded({ extended: false }));

const reviews_data = JSON.parse(fs.readFileSync("./data/reviews.json", 'utf8'));
const dealerships_data = JSON.parse(fs.readFileSync("./data/dealerships.json", 'utf8'));


const Reviews = require('./review');

const Dealerships = require('./dealership');
// "mongodb://mongo_db:27017/"
mongoose.connect("mongodb+srv://sonam17768464:sonam123@cluster0.nsexzeh.mongodb.net/?retryWrites=true&w=majority",{'dbName':'dealershipsDB'})
  .then(result => {
    console.log('connected to MongoDB')
    try {
      Reviews.deleteMany({}, { timeout: 100000 }).then(()=>{
        Reviews.insertMany(reviews_data['reviews']).then(()=>{
        console.log('Reviews')
      })
      });
      Dealerships.deleteMany({}).then(()=>{
        Dealerships.insertMany(dealerships_data['dealerships']).then(()=>{
        console.log('Dealerships')
        })
      });
      
    } catch (error) {
      res.status(500).json({ error: 'Error fetching documents' });
    }
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })


// Express route to home
app.get('/', async (req, res) => {
    res.send("Welcome to the Mongoose API")
});

// Express route to fetch all reviews
app.get('/fetchReviews', async (req, res) => {
  try {
    const documents = await Reviews.find();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Express route to fetch reviews by a particular dealer
app.get('/fetchReviews/dealer/:id', async (req, res) => {
  try {
    const documents = await Reviews.find({dealership: req.params.id});
    console.log(documents)
    return res.json(documents);
  } catch (error) {
    return res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Express route to fetch all dealerships
app.get('/fetchDealers', async (req, res) => {
//Write your code here
try {
  const documents = await Dealerships.find();
  return res.json(documents);
} catch (error) {
  return res.status(500).json({ error: 'Error fetching documents' });
}
});

// Express route to fetch Dealers by a particular state
app.get('/fetchDealers/:state', async (req, res) => {
//Write your code here
try {
  const documents = await  Dealerships.find({state: req.params.state});
  res.json(documents);
} catch (error) {
  res.status(500).json({ error: 'Error fetching documents' });
}
});

// Express route to fetch dealer by a particular id
app.get('/fetchDealer/:id', async (req, res) => {
//Write your code here
try {
  const documents = await  Dealerships.find({id: req.params.id});
  res.json(documents);
} catch (error) {
  res.status(500).json({ error: 'Error fetching documents' });
}
});

//Express route to insert review
app.post('/insert_review', express.raw({ type: '*/*' }), async (req, res) => {
  data = JSON.parse(req.body);
  const documents = await Reviews.find().sort( { id: -1 } )
  let new_id = documents[0]['id']+1

  const review = new Reviews({
		"id": new_id,
		"name": data['name'],
		"dealership": data['dealership'],
		"review": data['review'],
		"purchase": data['purchase'],
		"purchase_date": data['purchase_date'],
		"car_make": data['car_make'],
		"car_model": data['car_model'],
		"car_year": data['car_year'],
	});

  try {
    const savedReview = await review.save();
    console.log(savedReview)
    res.json(savedReview);
  } catch (error) {
		console.log(error);
    res.status(500).json({ error: 'Error inserting review' });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
