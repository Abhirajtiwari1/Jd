require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ServerApiVersion } = require('mongodb');

// Get the MongoDB URI from environment variables
const uri = process.env.MONGO_URI;

const app = express();
const port = 3000;

// MongoDB client setup
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Middleware to parse JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB successfully!");
  } catch (error) {
    console.error("Error connecting to MongoDB: ", error);
  }
}

// Call the function to connect to MongoDB
run().catch(console.dir);

// Sample route
app.get('/', (req, res) => {
  res.send('Welcome to the contact form application');
});

// Endpoint to handle contact form submission
app.post('/submit-contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Validate input
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  // Prepare the contact data to be stored in MongoDB
  const contactData = {
    name,
    email,
    subject,
    message,
    submittedAt: new Date()
  };

  try {
    const database = client.db('contactDB'); // Use your database name
    const contactsCollection = database.collection('contacts'); // Use your collection name

    // Insert the contact data into the collection
    await contactsCollection.insertOne(contactData);
    console.log("Contact data saved to MongoDB:", contactData);

    // Send success response
    res.status(200).json({ success: true, message: 'Contact data submitted successfully!' });
  } catch (error) {
    console.error("Error saving contact data to MongoDB:", error);
    res.status(500).json({ success: false, message: 'Error saving contact data' });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
