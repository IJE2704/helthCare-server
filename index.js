const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    const userMeasurementCollection = client
      .db("helthCare")
      .collection("Measurement");
    const userNotificationCollection = client
      .db("helthCare")
      .collection("Notification");

    // =========================================
    // ********** Midlware to check user *******
    // =========================================
    const existuser = async (req, res, next) => {
      try {
        const data = req.body;
        // console.log(data);
        const existuser = await userCollection.findOne({
          username: data.username,
        });

        if (!existuser) {
          console.log("user not found");
          return res.status(404).send("user not found");
        }

        req.existuser = existuser;
        next();
      } catch (error) {
        console.error("Error checking user existence:", error);
        return res.status(500).send("Internal Server Error");
      }
    };
    // =========================================
    // ********** Midlware to check user *******
    // =========================================
    const checkUserExistence = async (req, res, next) => {
      try {
        const userId = req.params.userId;
        console.log(userId);
        const user = await userCollection.findOne({ userId });

        if (!user) {
          console.log("User not found");
          return res.status(404).send("User not found");
        }

        // Attach the found user to the request for later use
        req.user = user;
        next();
      } catch (error) {
        console.error("Error checking user existence:", error);
        return res.status(500).send("Internal Server Error");
      }
    };
    // =========================================
    // ********** Midlware to check user *******
    // =========================================
    const realuser = async (req, res, next) => {
      try {
        const data = req.body;
        // console.log(userId);
        console.log(data);
        const existuser = await userCollection.findOne({
          userId: data.userId,
        });
        console.log(existuser);
        if (!existuser) {
          console.log("user not found");
          return res.status(404).send("user not found");
        }

        req.existuser = existuser;
        next();
      } catch (error) {
        console.error("Error checking user existence:", error);
        return res.status(500).send("Internal Server Error");
      }
    };

    const sendNotification = async (notification) => {
      const result = await userNotificationCollection.insertOne(notification);
    };

    // =========================================
    // **********    User route         *******
    // =========================================
    app.get("/users", async (req, res) => {
      console.log("get user");
      const users = userCollection.find();
      const result = await users.toArray();
      res.send(result);
    });

    // =========================================
    // **********    sign up route         *******
    // =========================================

    app.post("/registration", async (req, res) => {
      console.log(req.body);
      const data = req.body;
      const existuser = await userCollection.findOne({
        username: data.username,
      });
      if (existuser) {
        console.log("username already exist");
        return res.send("User already exist");
      }
      const users = userCollection.find();
      const totalUserLength = (await users.toArray()).length;
      // console.log(totalUserLength);
      const userId = (totalUserLength + 1).toString();
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

    // =========================================
    // **********    Login route         *******
    // =========================================

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

    // =========================================
    // **********    add o2 route         *******
    // =========================================

    app.post("/addo2", realuser, async (req, res) => {
      const o2 = req.body;
      console.log(o2.userId);
      const oxygen = parseInt(o2.bloodO2);
      let condition = "";
      if (oxygen > 90 && oxygen < 101) {
        condition = "Normal";
      } else if (oxygen >= 101) {
        condition = "High";
        sendNotification({
          userId: o2.userId,
          message: "High oxygen level detected.",
        });
      } else {
        condition = "Low";
        sendNotification({
          userId: o2.userId,
          message: "Low oxygen level detected.",
        });
      }
      const newO2 = {
        ...o2,
        condition: condition,
      };

      const result = await userO2Collection.insertOne(newO2);
      // res.send(result)
      return res.status(200).send(result);
    });

    // =========================================
    // **********    Get o2 route         *******
    // =========================================

    app.get("/o2/:userId", checkUserExistence, async (req, res) => {
      console.log("first");
      const userId = req.params.userId;
      const userO2Data = await userO2Collection.find({ userId }).toArray();
      return res.status(200).json(userO2Data);
    });
    // =========================================
    // **********    ADD Gluecose route         *******
    // =========================================
    app.post("/addglucose", realuser, async (req, res) => {
      const glucose = req.body;
      console.log("hello");
      const sugar = parseFloat(glucose.bloodSugar);
      let condition = "";
      if (sugar > 5.5 && sugar < 6.9) {
        condition = "Normal";
      } else if (sugar >= 6.9) {
        condition = "High";
        const userId = glucose.userId;
        console.log(userId);
        sendNotification("High Sugar level detected");
      } else {
        condition = "Low";
        sendNotification("Low Sugar level detected");
      }
      const newGluecose = {
        ...glucose,
        condition: condition,
      };
      const result = await userGlucoseCollection.insertOne(newGluecose);
      // res.send(result)
      return res.status(200).send(result);
    });

    // =========================================
    // **********    get route         *******
    // =========================================

    app.get("/glucose/:userId", checkUserExistence, async (req, res) => {
      console.log("first");
      const userId = req.params.userId;
      const userGlucoseData = await userGlucoseCollection
        .find({ userId })
        .toArray();
      return res.status(200).json(userGlucoseData);
    });
    // =========================================
    // **********    add pressure route         *******
    // =========================================
    app.post("/addpressure", realuser, async (req, res) => {
      const pressure = req.body;
      const highPressure = parseInt(pressure.bloodHighPressure);
      const lowPressure = parseInt(pressure.bloodLowPressure);
      if (highPressure < 90 && lowPressure < 60) {
        condition = "Low";
        sendNotification("Low pressure level detected");
      } else if (highPressure > 140 && lowPressure > 90) {
        condition = "High";
        sendNotification("High pressure level detected");
      } else {
        condition = "Normal";
      }
      const newPressure = {
        ...pressure,
        condition: condition,
      };
      const result = await userPressureCollection.insertOne(newPressure);
      // res.send(result)
      return res.status(200).send(result);
    });

    // =========================================
    // **********    Get pressure route         *******
    // =========================================

    app.get("/pressure/:userId", checkUserExistence, async (req, res) => {
      console.log("first");
      const userId = req.params.userId;
      const userPressureData = await userPressureCollection
        .find({ userId })
        .toArray();
      return res.status(200).json(userPressureData);
    });

    // =========================================
    // **********    add report route         *******
    // =========================================

    app.post("/addreport", realuser, async (req, res) => {
      const report = req.body;
      const result = await userReportsCollection.insertOne(report);
      // res.send(result)
      return res.status(200).send(result);
    });

    // =========================================
    // **********    get report route         *******
    // =========================================

    app.get("/report/:userId", checkUserExistence, async (req, res) => {
      console.log("first");
      const userId = req.params.userId;
      const userReportsData = await userReportsCollection
        .find({ userId })
        .toArray();
      return res.status(200).json(userReportsData);
    });

    // =========================================
    // **********    delete report route         *******
    // =========================================

    app.delete("/report/delete/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id)
      try {
        const query = { _id: new ObjectId(id) };
        const result = await userReportsCollection.deleteOne(query);
        console.log(result);
        return res.send(result);
      } catch (error) {
        console.error(error);
        return res.status(500).send("Internal server error");
      }
    });

    // =========================================
    // **********    add medicines route         *******
    // =========================================

    app.post("/addmedicine", realuser, async (req, res) => {
      const medicine = req.body;
      const result = await userMedicineCollection.insertOne(medicine);
      // res.send(result)
      return res.status(200).send(result);
    });

    // =========================================
    // **********    Get medicines route         *******
    // =========================================

    app.get("/medicine/:userId", checkUserExistence, async (req, res) => {
      console.log("first");
      const userId = req.params.userId;
      const userMedicineData = await userMedicineCollection
        .find({ userId })
        .toArray();
      return res.status(200).json(userMedicineData);
    });

    // =========================================
    // **********    remove medicines route         *******
    // =========================================

    app.delete("/medicine/delete/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id)
      try {
        const query = { _id: new ObjectId(id) };
        const result = await userMedicineCollection.deleteOne(query);
        console.log(result);
        return res.send(result);
      } catch (error) {
        console.error(error);
        return res.status(500).send("Internal server error");
      }
    });

    // =========================================
    // **********    add appointments route         *******
    // =========================================

    app.post("/addappointment", realuser, async (req, res) => {
      const appointment = req.body;
      const result = await userAppointmentCollection.insertOne(appointment);
      // res.send(result)
      return res.status(200).send(result);
    });

    // =========================================
    // **********    get appointments route         *******
    // =========================================

    app.get("/appointment/:userId", checkUserExistence, async (req, res) => {
      console.log("first");
      const userId = req.params.userId;
      const appointmentData = await userAppointmentCollection
        .find({ userId })
        .toArray();
      return res.status(200).json(appointmentData);
    });

    // =========================================
    // **********    remove appointments route         *******
    // =========================================

    app.delete("/appointment/delete/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id)
      try {
        const query = { _id: new ObjectId(id) };
        const result = await userAppointmentCollection.deleteOne(query);
        console.log(result);
        return res.send(result);
      } catch (error) {
        console.error(error);
        return res.status(500).send("Internal server error");
      }
    });

    // =========================================
    // **********    add mesurements route         *******
    // =========================================

    app.post("/addmeasurements", realuser, async (req, res) => {
      const measurements = req.body;
      console.log(measurements);
      let condition = "";
      const height = parseFloat(measurements.height) * 0.3048;
      console.log(height);
      console.log(measurements.weight);
      const bmi = (parseInt(measurements.weight) / (height * height)).toFixed(
        2
      );
      if (bmi > 18.4 && bmi < 30.0) {
        condition = "Healthy";
      } else {
        condition = "Unhealthy";
      }
      const newMeasurements = {
        ...measurements,
        condition: condition,
        bmi: bmi,
      };
      console.log(newMeasurements);
      const result = await userMeasurementCollection.insertOne(newMeasurements);
      // res.send(result)
      return res.status(200).send(result);
    });

    // =========================================
    // **********    get measurements route         *******
    // =========================================

    app.get("/measurements/:userId", checkUserExistence, async (req, res) => {
      console.log("first");
      const userId = req.params.userId;
      const measurementsData = await userMeasurementCollection
        .find({ userId })
        .toArray();
      return res.status(200).json(measurementsData);
    });

    // =========================================
    // **********    get notifications route         *******
    // =========================================

    app.get("/notification/:userId", checkUserExistence, async (req, res) => {
      const userId = req.params.userId;
      const notificationData = await userNotificationCollection
        .find({ userId })
        .toArray();
      return res.status(200).json(notificationData);
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
