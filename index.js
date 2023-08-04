const express = require('express');

const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u4rhioo.mongodb.net/?retryWrites=true&w=majority`;

console.log(uri);

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

    const taskCollection = client.db('taskDB').collection('task');


    // Read all tasks
    app.get('/task', async (req, res) => {
      try {
        const tasks = await taskCollection.find().toArray();
        res.json(tasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });


    // Read a single task by ID
    app.get('/task/:id', async (req, res) => {
      const taskId = req.params.id
      const query = { _id: new ObjectId(taskId) }
      const result = await taskCollection.findOne(query);
      res.send(result);
    })



    // Create a new task
    app.post('/task', async (req, res) => {
      const newTask = req.body;
      newTask.status = 'Todo';
      console.log(newTask);
      const result = await taskCollection.insertOne(newTask);
      res.send(result);
    });



    // Update task status
    app.put('/task/:id', async (req, res) => {
        const taskId = req.params.id;
        const { status } = req.body;
        const result = await taskCollection.updateOne({ _id: new ObjectId(taskId) }, { $set: { status } });
        res.send(result);
    });

    // Delete task
    app.delete('/task/:id', async (req, res) => {
      const taskId = req.params.id;
      const query = { _id: new ObjectId(taskId) }
      const result = await taskCollection.deleteOne(query);
      res.send(result);
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
  res.send('task management server is runnig')
})

app.listen(port, () => {
  console.log(`task management server is running on port: ${port}`)
})