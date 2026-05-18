const express = require('express')
const cors = require('cors')
const cookieparser = require('cookie-parser')
require('dotenv').config()
const connectDB = require('./config/db.js')
const router = require('./routes/index.js')
const { startCronJobs } = require('./helpers/cronJob')

const app = express()

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))

// Important: json() middleware should NOT process file uploads
// Only parse JSON for non-file requests
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(cookieparser())

// Serve static files (logo, etc.) from logo folder
app.use(express.static('logo'))

// Routes (includes multer file handling)
app.use('/api', router)

const PORT = process.env.PORT || 8080

connectDB().then(() => {
    // Start cron jobs for automated order status updates
    startCronJobs();
    
    app.listen(PORT, () => {
        console.log('connected to DB')
        console.log(`server is running at ${PORT}`)
        console.log('Cron jobs started - Running automated order status updates')
    })
})