if ( process.env.NODE_ENV !== 'production'){
  require ('dotenv').config()
}

// Libraries
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')

const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const initializePassport = require('./passport-config')
initializePassport(
    passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

// don't forget to add database bellow
const users = [ ]

// Define the profiles array at the top of your server file
const profiles = [];

                                        // Routes
app.set('View engine', 'ejs')
app.use(express.urlencoded({ extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

// Password 
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

// Check Authentication
function checkAuthenticated( req, res, next){
    if (req.isAuthenticated()) {
        return next()
    }
    
    res.redirect('/login')
}


function checkNotAuthenticated( req, res, next){
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    return next()
}

                                        //GET
// Guest
app.get('/guest', (req, res) => {
    // Handle the request for /guest
    res.render('guest.ejs');
});

// Login
app.get('/', checkAuthenticated, ( req, res) => {
    res.render('index.ejs', { name: req.user.firstName }) 
})

app.get('/login', checkNotAuthenticated, ( req, res) => {
    res.render('login.ejs')
})

// Register
app.get('/register', checkNotAuthenticated, ( req, res) => {
    res.render('register.ejs')
}) 

// User information
app.get('/userProfile', (req, res) => {
    res.render('userProfile.ejs');
});

// Contact
app.get('/contact', (req, res) => {
    res.render('contact.ejs');
});

// About Us
app.get('/about', (req, res) => {
    res.render('about.ejs'); 
});

                                        // DELETE
// Logout
app.delete('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/login');
    });
});

                                        // POST
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login', 
    failureFlash: true     
})) 


app.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    }   catch {
        res.redirect('/register')
    }
    console.log(users)
})

// Calculate
app.post('/calculate', (req, res) => {
    // Retrieve form data from the request
    const { heightFeet, heightInches, weight, age, goals } = req.body;

    // Perform calculations (you can replace this with your actual logic)
    const calories = calculateCalories(heightFeet, heightInches, weight, age, goals);
    const macronutrients = calculateMacronutrients(goals); // Replace with your logic

    // Render the result in a response or send it as JSON
    res.render('result.ejs', { calories, macronutrients });
});

//contact 
app.post('/contact', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const message = req.body.message;

    console.log("Gmail User:", process.env.GMAIL_USER); // Log Gmail User
    console.log("Gmail Pass:", process.env.GMAIL_PASS); // Log Gmail Pass

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: 'darwing.delva@gmail.com',
        subject: 'New Contact Form Submission',
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        } else {
            console.log('Email sent:', info.response);
            res.send('Message received! We will get back to you soon. <a href="/">Home Page</a> ')
            //res.redirect('/');;
        }
    });
});


// User information
app.post('/userProfile', (req, res) => {
    // Retrieve information from the form
    const height = req.body.height;
    const weight = req.body.weight;
    const age = req.body.age;
    const sex = req.body.sex;
    const goals = req.body.goals;



// Save the information to a database (replace this with your database logic)
// might use MongoDB/Dbbeaver/Sqllite

//const Profile = require('./models/profile'); // Import your Profile model
//const newProfile = new Profile({ height, weight, age, sex, goals });
//newProfile.save();

// Send a response back to the client side
//res.send('Profile saved successfully!');

// Save the information to a database (NEED TO replace this with OUR database)
// For demonstration purposes, we will assume we have a profiles array to store the information
const profile = { height, weight, age, sex, goals };
profiles.push(profile);

// Send a response back to the client side
res.send('Profile saved successfully! <a href="/">Home Page</a> ');
});

// Output saved profile information
app.get('/userProfile/output', (req, res) => {
// Retrieve the last saved profile (assuming it's the latest one)
const savedProfile = profiles[profiles.length - 1];

// Render a template to display the saved profile information
res.render('savedProfile.ejs', { profile: savedProfile });
});
 
app.listen(process.env.Port || 3000)