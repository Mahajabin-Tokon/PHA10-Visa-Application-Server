const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5001;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.85wcl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const visaCollection = client.db("visaDB").collection("allVisas");
    const visaAppliedCollection = client.db("visaDB").collection("allAppliedVisas");

    app.get("/latestVisas", async (req, res) => {
      const cursor = visaCollection.find().sort({ _id: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/visas", async (req, res) => {
      const cursor = visaCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/visaDetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await visaCollection.findOne(query);
      res.send(result);
    });

    app.get("/myAddedVisas", async (req, res) => {
      const { email } = req.query;
      const query = { userEmail: email };
      const result = await visaCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/visas", async (req, res) => {
      const newVisa = req.body;
      const result = await visaCollection.insertOne(newVisa);
      res.send(result);
    });

    app.put("/myAddedVisas/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedVisa = req.body;

      const visa = {
        $set: {
          countryImage: updatedVisa.countryImage,
          countryName: updatedVisa.countryName,
          visaType: updatedVisa.visaType,
          processingTime: updatedVisa.processingTime,
          requiredDoc: updatedVisa.requiredDoc,
          description: updatedVisa.description,
          age: updatedVisa.age,
          fee: updatedVisa.fee,
          validity: updatedVisa.validity,
          applicationMethod: updatedVisa.applicationMethod,
          applied: updatedVisa.applied,
        },
      };
      const result = await visaCollection.updateOne(filter, visa, options);
      res.send(result);
    });

    app.delete("/myAddedVisas/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await visaCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/myAppliedVisas/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedVisa = req.body;

      const visa = {
        $set: {
          email: updatedVisa.email,
          firstName: updatedVisa.firstName,
          lastName: updatedVisa.lastName,
          date: updatedVisa.date,
          fee: updatedVisa.fee,
        },
      };
      const result = await visaAppliedCollection.updateOne(filter, visa, options);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Visa server is running on port: ${port}`);
});
