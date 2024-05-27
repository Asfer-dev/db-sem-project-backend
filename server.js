import express from 'express'
import mongoose from 'mongoose'
import { users } from './models/usersModel.js'
import { terminals } from './models/terminalsModel.js'
import { credentials } from './models/credentialsModel.js'
import { routes } from './models/routesModel.js'
import { configDotenv } from 'dotenv'
//const bcrypt = require('bcrypt')

configDotenv();

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/', (req, res) => {
    res.send('Hello Bus Management muthafuckas!')
})

//Signing up new user
app.post('/signup', async (req, res) => {
    try {
        const User = await users.create({ cnic: req.body.cnic, name: req.body.name, contact_no: req.body.contact_no, gender: req.body.gender });
        const Credential = await credentials.create({ email: req.body.email, password: req.body.password, user: User });
        res.status(200).json(Credential)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// Loging in user
app.get('/login', async (req, res) => {
    try {
        const Credential = await credentials.findOne({ email: req.body.email })
        if (Credential == null) {
            return res.status(400).send("Cannot find this user!!!")
        }
        const matching = Credential.password === req.body.password
        if (!matching) {
            return res.status(400).send("Cannot match credentials!!!")
        }
        return res.status(500).json(Credential)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

//Setting up /terminals route
//Get for terminals
app.get('/terminals', async (req, res) => {
    try {
        const Terminals = await terminals.find({});
        res.status(200).json(Terminals)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

app.get('/terminals/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const Terminal = await terminals.findById(id);
        res.status(200).json(Terminal);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

//Post for terminals
app.post('/terminals', async (req, res) => {
    try {
        const Terminal = await terminals.create(req.body)
        res.status(200).json(Terminal)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

//Put for terminals
app.put('/terminals/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const Terminal = await terminals.findByIdAndUpdate(id, req.body);
        if (!Terminal) {
            return res.status(404).json({ message: 'Cannot find this passenger with ID ${id}' })
        }
        const UpdatedTerminal = await terminals.findById(id)
        res.status(200).json(UpdatedTerminal)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

//Delete for terminals
app.delete('/terminals/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const Terminal = await terminals.findByIdAndDelete(id);
        if (!Terminal) {
            return res.status(404).json({ message: 'Cannot find this terminal with ID ${id}' })
        }
        res.status(200).json(Terminal)
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