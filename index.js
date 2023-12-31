const express = require("express");
var cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express()
var jwt = require('jsonwebtoken');
require('dotenv').config()
const port = process.env.PORT||5000

app.use(express.json());
app.use(cors());

const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
      return res.status(401).send({ error: true, message: 'unauthorization token' });
    }
    const token = authorization.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).send({ error: true, message: 'unathorized access' })
      }
      req.decoded = decoded;
      next();
    })
  }

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uld9vql.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
      await client.connect();
      const collegesCollection = client.db("unipath").collection("colleges");

      app.post('/jwt', (req,res) => {
        const user = req.body;
        const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        res.send({token})
    })

      app.get("/colleges", async (req, res) => {
          const result = await collegesCollection.find().toArray();
          res.send(result)
      })
      app.get("/colleges/:id", async (req, res) => {
          const id = req.params.id;
          const query = { _id: new ObjectId(id) };
          const result = await collegesCollection.findOne(query);
          res.send(result)
      })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})