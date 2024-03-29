const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fyh6bpe.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const productsCollection = client.db('emaJohn').collection('products');

        app.get('/services', async (req, res) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 12;
            const skip = (page - 1) * limit;

            const result = await productsCollection.find().skip(skip).limit(limit).toArray();
            res.send(result);
        });

        app.get('/totalProducts', async (req, res) => {
            const result = await productsCollection.estimatedDocumentCount();
            res.send({ totalProducts: result });
        });

        app.post('/productsByIds', async (req, res) => {
            const ids = req.body;
            const objectIds = ids.map((id) => new ObjectId(id));
            const query = { _id: { $in: objectIds } };
            const result = await productsCollection.find(query).toArray();
            res.send(result);
        });

        // Send a ping to confirm a successful connection
        await client.db('admin').command({ ping: 1 });
        console.log('Pinged your deployment. You successfully connected to MongoDB!');
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Ema John Server is Running');
});

app.listen(port, () => {
    console.log(`Ema John running on port: ${port}`);
});
