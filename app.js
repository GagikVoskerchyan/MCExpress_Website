// Import necessary packages
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const Quote = require('./models/Quote'); //Import the quote model
const Feedback = require('./models/Feedback'); //Import the Feedback model
require('dotenv').config(); // Load environment variables

// Initialize the app
const app = express();

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files from 'public' directory
app.use(bodyParser.json());

// View engine setup (EJS)
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views'); // Set the views directory

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('Error connecting to MongoDB Atlas:', err));

mongoose.connection.on('connected', () => {
    console.log(`Connected to the database: ${mongoose.connection.name}`);
});

// Routes

// Home page route - dynamically rendered
app.get('/', (req, res) => {
    res.render('home'); 
});

// Dashboard route - protected page
app.get('/dashboard', (req, res) => {
        res.render('home');
});

// Existing route for 'Get a Quote'
app.get('/get-quote', (req, res) => {
    res.render('get-quote');
});

// Optional alias for 'Schedule'
app.get('/schedule', (req, res) => {
    res.redirect('/get-quote'); // Redirect to keep the code DRY
});

app.get('/prices', (req, res) => {
    res.render('prices'); // Render the login page
});

// Feedback page route
app.get('/feedback', (req, res) => {
    res.render('feedback'); // Render the feedback page
});

// About us page route
app.get('/about-us', (req, res) => {
    res.render('about-us'); // Render the feedback page
});

// About us page route
app.get('/services', (req, res) => {
    res.render('services'); // Render the feedback page
});

app.get('/rating', async (req, res) => {
    try {
        const feedbacks = await Feedback.find({});

        const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

        const totalRatings = feedbacks.reduce((sum, feedback) => {
            ratingCounts[feedback.rating]++;
            return sum + feedback.rating;
        }, 0);

        const averageRating = feedbacks.length > 0 ? totalRatings / feedbacks.length : 0;

        const recentFeedbacks = feedbacks
            .sort((a, b) => b.date - a.date)
            .slice(0, 20); // 👈 20 most recent

        res.render('rating', {
            averageRating,
            ratingCounts,
            feedbacks: recentFeedbacks
        });
    } catch (err) {
        console.error('Error fetching feedback:', err);
        res.status(500).send('Internal Server Error');
    }
});



// Handle feedback form submission
app.post('/submit-feedback', async (req, res) => {
    const { name, rating, comments } = req.body;

    try {
        const feedback = new Feedback({ name, rating, comments });
        await feedback.save();
        res.status(200).send('Feedback submitted successfully');
    } catch (err) {
        console.error('Error saving feedback:', err);
        res.status(500).send('Failed to submit feedback');
    }
});

// Handle quote form submission
app.post('/submit-quote', async (req, res) => {
    const { name, phone, email, estimated_date, departing_address, destination_address, type_of_house, property_size, extra_details } = req.body;

    try {
        // Create a new quote entry
        const newQuote = new Quote({
            name,
            phone,
            email,
            estimated_date,
            departing_address,
            destination_address,
            type_of_house,
            property_size,
            extra_details
        });

        // Save to the database
        await newQuote.save();

        // Send email notification (explained below)
        sendQuoteEmail(name, phone, email, estimated_date, departing_address, destination_address, type_of_house, property_size, extra_details);

        // Instead of redirecting, render the success message
        res.render('quote-thank-you', { message: 'Thank you for submitting your quote! Our team will contact you very soon.' });
    } catch (err) {
        console.error('Error saving quote:', err);
        res.status(500).send('An error occurred while processing your quote.');
    }
});

// Create a transporter for sending email using nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use any email service provider
    auth: {
        user: process.env.EMAIL, // Use environment variables for security
        pass: process.env.EMAIL_PASSWORD // Use environment variables for security
    }
});

// Function to send an email with quote details
const sendQuoteEmail = (name, phone, email, estimated_date, departing_address, destination_address, type_of_house, property_size, extra_details) => {
    const mailOptions = {
        from: process.env.EMAIL, // Sender address
        to: 'Mcexpress@mail.com', // Replace with the email address where you want to receive the quote
        subject: 'New Quote Submitted',
        text: `
            A new quote has been submitted:

            Name: ${name}
            Phone: ${phone}
            Email: ${email}
            Estimated Moving Date: ${estimated_date}
            Departing Address: ${departing_address}
            Destination Address: ${destination_address}
            Type of House: ${type_of_house}
            Property Size: ${property_size}
            Extra Details: ${extra_details}
        `
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error('Error sending email:', err);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};

// Error handling middleware (this should come last)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
