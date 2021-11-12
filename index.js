const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

require('dotenv').config()
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

//middleWare
app.use(cors())
app.use(express.json())

//DB_USER=phonecorners
//DB_PASS=y39GpPQ549NBlRc1



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oewpu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

console.log(uri);

async function run() {
    try {
        await client.connect();
        console.log('database connected successfully');
        const database = client.db('PhonesDelivery');
        const itemsCollection = database.collection('phones');
        const orderCollection = database.collection('order');
        const usersCollection = database.collection('users');

        //Get Products Api
        app.get('/items', async (req, res) => {
            const cursor = itemsCollection.find({});
            const items = await cursor.limit(6).toArray();
            res.send(items)
        })
        //Get Explore Api
        app.get('/explore', async (req, res) => {
            const cursor = itemsCollection.find({});
            const items = await cursor.toArray();
            res.send(items)
        })
        //POST additems API
        app.post('/items', async (req, res) => {
            const item = req.body;
            console.log(item);
            const result = await itemsCollection.insertOne(item)
            console.log(result);
            res.json(result)
        })

        //Get single services
        app.get('/items/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const item = await itemsCollection.findOne(query);
            res.json(item)
        })

        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order)
            console.log('order', result);
            res.json(result)
        })

        //my order
        app.get('/myorders', async (req, res) => {
            const query = { email: req.query.email }
            const cursor = await orderCollection.find(query).toArray()
            res.json(cursor)

        })
        app.put('/myorders', async (req, res) => {
            const filter = { _id: ObjectId(req.query.id) }
            const options = { upsert: true }
            const updateDocument = {
                $set: {
                    status: 'Shipped'
                }
            }
            const result = await orderCollection.updateOne(filter, updateDocument, options)
            res.send(result)
        })
        app.delete('/allOrders/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.json(result)
        })

        //ManageAllorders
        app.get("/allOrders", async (req, res) => {
            const result = await orderCollection.find({}).toArray();
            res.json(result);
        });

        app.put('/allorders', async (req, res) => {
            const filter = { _id: ObjectId(req.query.id) }
            const options = { upsert: true }
            const updateDocument = {
                $set: {
                    status: 'Approved'
                }
            }
            const result = await orderCollection.updateOne(filter, updateDocument, options)
            res.send(result)
        })
        app.delete('/items/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const result = await itemsCollection.deleteOne(query);
            res.json(result)
        })

        //User && Admin api
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const user = await usersCollection.findOne(query)
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true
            }
            res.json({ admin: isAdmin })
        })
        app.post('/users', async (req, res) => {
            const user = req.body
            const result = await usersCollection.insertOne(user)
            console.log(result);
            res.json(result)

        })

        app.put('/users/admin', async (req, res) => {
            const user = req.body
            console.log('put', user);
            const filter = { email: user.email }
            const updateDoc = { $set: { role: 'admin' } }
            const result = await usersCollection.updateOne(filter, updateDoc)
            res.json(result)
        })


    }
    finally {
        // await client.close()
    }
}
run().catch(console.dir)



app.get('/', (req, res) => {
    res.send('Running phone corners server')

});
app.listen(port, () => {
    console.log('Running in port', port);
});