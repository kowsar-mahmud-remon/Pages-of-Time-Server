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
    const bookCollection = client.db('pages-of-time').collection('book');
    const wishlistCollection = client.db('pages-of-time').collection('wishlist');

    app.get('/books', async (req, res) => {
      const cursor = bookCollection.find({});
      const books = await cursor.toArray();

      res.send({ status: true, data: books });
    });

    app.get('/wishlist/:email', async (req, res) => {

      const userEmail = req.params.email;

      const cursor = wishlistCollection.find({ userEmail: userEmail });
      const books = await cursor.toArray();

      res.send({ status: true, data: books });
    });

    app.post('/book', async (req, res) => {
      const book = req.body;

      const result = await bookCollection.insertOne(book);

      res.send(result);
    });

    app.get('/book/:id', async (req, res) => {
      const id = req.params.id;

      const result = await bookCollection.findOne({ _id: ObjectId(id) });
      res.send(result);
    });

    app.post('/wishlist', async (req, res) => {
      const book = req.body;
      console.log({ book });

      const oldBook = await wishlistCollection.findOne({ _id: ObjectId(book?.id) });


      if (!oldBook) {
        const result = await wishlistCollection.insertOne(book);
        res.send(result);
      } else {
        console.log("failed");
      }

    });

    app.delete('/delete-book', async (req, res) => {
      const { id, userEmail } = req.body;
      console.log(id, userEmail);

      const userBooks = await bookCollection.findOne({ _id: ObjectId(id) });
      console.log({ userBooks });
      // console.log(userBooks.userEmail);

      if (userBooks?.userEmail === userEmail) {
        const result = await bookCollection.deleteOne({ _id: ObjectId(id) });
        console.log("delete success");
        res.send(result);
      } else {
        return res.status(404).json({ message: 'Deleted Failed' });
      }
    });




    app.put('/update-book', async (req, res) => {
      const { id, userEmail, data } = req.body;

      const userBooks = await bookCollection.findOne({ _id: ObjectId(id) });

      if (userBooks?.userEmail === userEmail) {
        const result = await bookCollection.updateOne(
          { _id: ObjectId(id) },
          { $set: data }
        );

        res.send(result);
      } else {
        return res.status(404).json({ message: 'Deleted Failed' });
      }


    });






    app.get('/search/books', async (req, res) => {
      const { title, author, genre } = req.query;

      const searchFilter = {};
      if (title) {
        searchFilter.title = { $regex: title, $options: 'i' };
      }
      if (author) {
        searchFilter.author = { $regex: author, $options: 'i' };
      }
      if (genre) {
        searchFilter.genre = { $regex: genre, $options: 'i' };
      }

      console.log({ searchFilter });

      const cursor = bookCollection.find(searchFilter);
      const books = await cursor.toArray();
      console.log({ books });

      res.send({ status: true, data: books });
    });

    app.get('/books/genre/:genre', async (req, res) => {
      const genre = req.params.genre;
      const cursor = bookCollection.find({ genre });
      const books = await cursor.toArray();

      res.send({ status: true, data: books });
    });

    app.get('/books/publication-year/:year', async (req, res) => {
      const year = req.params.year;
      const cursor = bookCollection.find({ publicationYear: parseInt(year) });
      const books = await cursor.toArray();

      res.send({ status: true, data: books });
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
