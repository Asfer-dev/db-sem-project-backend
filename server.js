import express from 'express'
import mongoose from 'mongoose'
import { passengers } from './models/passengersModel.js'
import { configDotenv } from 'dotenv'

configDotenv();

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

//routes
app.get('/', (req, res) => {
    res.send('Hello Bus Management muthafuckas!')
})

app.get('/terminal', (req, res) => {
    res.send('This is terminals!!!')
})

app.get('/routes', (req, res) => {
    res.send('This is routes!!!')
})

app.get('/buses', (req, res) => {
    res.send('This is buses!!!')
})

//Setting up /passengers route
//Get for passengers
app.get('/passengers', async (req, res) => {
    try {
        const Passengers = await passengers.find({});
        res.status(200).json(Passengers);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

app.get('/passengers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const Passenger = await passengers.findById(id);
        res.status(200).json(Passenger);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

//Post for passengers
app.post('/passengers', async (req, res) => {
    try {
        const Passenger = await passengers.create(req.body)
        res.status(200).json(Passenger)
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: error.message })
    }
})

//Put for passengers
app.put('/passengers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const Passenger = await passengers.findByIdAndUpdate(id, req.body);
        if (!Passenger) {
            return res.status(404).json({ message: 'Cannot find this passenger with ID ${id}' })
        }
        const UpdatedPassenger = await passengers.findById(id)
        res.status(200).json(UpdatedPassenger)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

//Delete for passengers
app.delete('/passengers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const Passenger = await passengers.findByIdAndDelete(id);
        if (!Passenger) {
            return res.status(404).json({ message: 'Cannot find this passenger with ID ${id}' })
        }
        res.status(200).json(Passenger)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

//Connecting MongoDB
mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log('connected to MongoDB')
        app.listen(process.env.PORT, () => {
            console.log('Bus Management is running!!!')
        })
    }).catch((error) =>
        console.log(error)
    )