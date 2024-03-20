const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5004;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.NAME}:${process.env.PASS}@cluster0.oenz0rl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    const userCollection = client.db("helthCare").collection("user");
    const userO2Collection = client.db("helthCare").collection("O2");
    

    app.get('/users', async(req,res)=>{
      console.log("get user")
      const users =  userCollection.find();
      const result = await users.toArray();
      res.send(result);
    })

    app.post("/registration", async (req, res) => {
      const data = req.body;
      console.log(data);
      const existuser = await userCollection.findOne({
        username: data.username,
      });

      if (existuser) {
        console.log("username already exist");
        return res.send("Username already exist");
      }
      const result = await userCollection.insertOne(data);
      console.log("user registerd successfully");
      res.send(result);
    });


    app.post('/login', async(req, res) => {
      const data = req.body;
      const user = await userCollection.findOne({ username: data.username });
    
      if (!user) {
        console.log('User not found');
        return res.status(404).send('User not found');
      }
    
      if (user.password === data.password) {
        console.log('Successfully logged in');
        return res.status(200).json(user);
      } else {
        console.log('Password does not match');
        return res.status(401).send('Password does not match');
      }
    });
    

    app.post('/addo2', async(req,res)=>{
      const o2 = req.body;
      const result = await userO2Collection.insertOne(o2);
      // res.send(result)
      return res.status(200).json({message:"Successfully added O2"})
    })

    app.get('/o2/:username', async(req,res)=>{
      console.log("first")
      const username = req.params.username;
      const userO2Data = await userO2Collection.find({username}).toArray();
      return res.status(200).json(userO2Data);
    })


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

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log(`server is running on port: ${port}`);
});
