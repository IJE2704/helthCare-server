const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

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
    const userGlucoseCollection = client.db("helthCare").collection("Glucose");
    const userPressureCollection = client
      .db("helthCare")
      .collection("Pressure");
    const userReportsCollection = client.db("helthCare").collection("Reports");
    const userMedicineCollection = client
      .db("helthCare")
      .collection("Medicine");
    const userAppointmentCollection = client
      .db("helthCare")
      .collection("Appointment");





    const existuser = async (req, res, next) => {
      try {
        const data = req.body;
        // console.log(data);
        const existuser = await userCollection.findOne({
          username: data.username
        });

        if(!existuser){
          console.log("user not found");
          return res.status(404).send("user not found");
        }

        req.existuser = existuser;
        next();
      } catch (error) {
        console.error('Error checking user existence:', error);
        return res.status(500).send('Internal Server Error');
      }
    };

    const checkUserExistence = async (req, res, next) => {
      try {
        const userId = req.params.userId;
        console.log(userId)
        const user = await userCollection.findOne({ userId });
    
        if (!user) {
          console.log("User not found");
          return res.status(404).send("User not found");
        }
    
        // Attach the found user to the request for later use
        req.user = user;
        next();
      } catch (error) {
        console.error('Error checking user existence:', error);
        return res.status(500).send('Internal Server Error');
      }
    };


    const realuser = async (req, res, next) => {
      try {
        const data = req.body;
        // console.log(userId);
        console.log(data)
        const existuser = await userCollection.findOne({
          userId: data.userId
        });
        console.log(existuser);
        if(!existuser){
          console.log("user not found");
          return res.status(404).send("user not found");
        }

        req.existuser = existuser;
        next();
      } catch (error) {
        console.error('Error checking user existence:', error);
        return res.status(500).send('Internal Server Error');
      }
    };





    app.get("/users", async (req, res) => {
      console.log("get user");
      const users = userCollection.find();
      const result = await users.toArray();
      res.send(result);
    });




    app.post("/registration", async (req, res) => {
      const data = req.body;
      const existuser = await userCollection.findOne({
        username : data.username
      })
      if (existuser) {
        console.log("username already exist");
        return res.send("User already exist");
      }
      const users = userCollection.find();
      const totalUserLength = (await users.toArray()).length;
      // console.log(totalUserLength);
      const userId = (totalUserLength+1).toString();
      const user = {
        userId: userId,
        ...data,
      };
      const result = await userCollection.insertOne(user);
      console.log("user registerd successfully");
      res.status(200).json({
        result,
        user,
      });
    });






    app.post("/login", existuser, async (req, res) => {
      const data = req.body;
      const user = req.existuser;
      if (user.password === data.password) {
        console.log("Successfully logged in");
        return res.status(200).json(user);
      } else {
        console.log("Password does not match");
        return res.status(401).send("Password does not match");
      }
    });




    
    app.post("/addo2",realuser, async (req, res) => {
      const o2 = req.body;
      const result = await userO2Collection.insertOne(o2);
      // res.send(result)
      return res.status(200).send(result);
    });






    app.get("/o2/:userId",checkUserExistence, async (req, res) => {
      console.log("first");
      const userId = req.params.userId;
      const userO2Data = await userO2Collection.find({ userId }).toArray();
      return res.status(200).json(userO2Data);
    });





    app.post("/addglucose",realuser, async (req, res) => {
      const glucose = req.body;
      const result = await userGlucoseCollection.insertOne(glucose);
      // res.send(result)
      return res.status(200).send(result);
    });





    app.get("/glucose/:userId",checkUserExistence, async (req, res) => {
      console.log("first");
      const userId = req.params.userId;
      const userGlucoseData = await userGlucoseCollection
        .find({ userId })
        .toArray();
      return res.status(200).json(userGlucoseData);
    });





    app.post("/addpressure",realuser, async (req, res) => {
      const pressure = req.body;
      const result = await userPressureCollection.insertOne(pressure);
      // res.send(result)
      return res.status(200).send(result);
    });






    app.get("/pressure/:userId",checkUserExistence, async (req, res) => {
      console.log("first");
      const userId = req.params.userId;
      const userPressureData = await userPressureCollection
        .find({ userId })
        .toArray();
      return res.status(200).json(userPressureData);
    });






    app.post("/addreport",realuser, async (req, res) => {
      const report = req.body;
      const result = await userReportsCollection.insertOne(report);
      // res.send(result)
      return res.status(200).send(result);
    });





    app.get("/report/:username",checkUserExistence, async (req, res) => {
      console.log("first");
      const username = req.params.username;
      const userReportsData = await userReportsCollection
        .find({ username })
        .toArray();
      return res.status(200).json(userReportsData);
    });





    app.post("/addmedicine",realuser, async (req, res) => {
      const medicine = req.body;
      const result = await userMedicineCollection.insertOne(medicine);
      // res.send(result)
      return res.status(200).send(result);
    });





    app.get("/medicine/:userId",checkUserExistence, async (req, res) => {
      console.log("first");
      const userId = req.params.userId;
      const userMedicineData = await userMedicineCollection
        .find({ userId })
        .toArray();
      return res.status(200).json(userMedicineData);
    });




    app.post("/addappointment",realuser, async (req, res) => {
      const appointment = req.body;
      const result = await userAppointmentCollection.insertOne(appointment);
      // res.send(result)
      return res.status(200).send(result);
    });

    




    app.get("/appointment/:userId",checkUserExistence, async (req, res) => {
      console.log("first");
      const userId = req.params.userId;
      const appointmentData = await userAppointmentCollection
        .find({ userId })
        .toArray();
      return res.status(200).json(appointmentData);
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

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log(`server is running on port: ${port}`);
});
