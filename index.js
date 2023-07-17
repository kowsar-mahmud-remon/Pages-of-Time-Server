require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

const cors = require('cors');

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eluedpr.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
  try {

    const productCollection = client.db('pages-of-time').collection('product');
    const userCollection = client.db('pages-of-time').collection('user');

    const bookCollection = client.db('pages-of-time').collection('book');

    app.get('/books', async (req, res) => {
      const cursor = bookCollection.find({});
      const books = await cursor.toArray();

      res.send({ status: true, data: books });
    });

    app.post('/book', async (req, res) => {
      const book = req.body;

      const result = await bookCollection.insertOne(book);

      res.send(result);
    });

    app.get('/books/:id', async (req, res) => {
      const id = req.params.id;

      const result = await bookCollection.findOne({ _id: ObjectId(id) });
      console.log(result);
      res.send(result);
    });

    app.delete('/book', async (req, res) => {
      const { id, userEmail } = req.body;

      const userBooks = await bookCollection.findOne({ _id: ObjectId(id) });
      console.log({ userBooks });
      console.log(userBooks.userEmail);

      if (userBooks.userEmail === userEmail) {
        const result = await bookCollection.deleteOne({ _id: ObjectId(id) });
        console.log(result);
        res.send(result);
      } else {
        return res.status(404).json({ message: 'Deleted Failed' });

      }
    });


  } finally {
  }
};

run().catch((err) => console.log(err));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
