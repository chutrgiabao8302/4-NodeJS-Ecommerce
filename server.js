import express from 'express';
import dotenv from 'dotenv';
import stripe from 'stripe';
import db from './config/db/index.js';
import Checkout from './models/Checkout.js';
import Account from './models/Account.js';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import flash from 'express-flash';
const PORT = 3000;

// Load variables
dotenv.config();

// start server
const app = express();

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser('SUD'));
app.use(session({ cookie: { maxAge: 30000000 } })); // Save data on website on next visits
db.connect();

// Home route
app.use('/', (req, res) => {
    if (!req.session.username) {
        return res.redirect('/login');
    }
    return res.sendFile('./views/index.html', {root: "public"});
});

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
})

// Login route
app.get('/login', (req, res) => {
    return res.sendFile('./views/login.html', {root: "public"});
});

// Login method
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    let myAccount = await Account.findOne({
        username: username
    }).lean();

    // return res.json(myAccount);
    if (myAccount) {
        if (myAccount.password == password) {
            req.session.username = username;
            return res.redirect('/');
        } else {
            return res.json({
                success: false,
                msg: `Incorrect password`,
            })
        }
    } else {
        return res.json({
            success: false,
            msg: `This account doesn't exist`,
        });
    }
})

// Register route
app.get('/register', (req, res) => {
    return res.sendFile('./views/register.html', {root: "public"});
});

// Register method
app.post('/register', async (req, res) => {
    // const username = req.body.username
    // const password = req.body.password
    const { username, password, address, age } = req.body;
    let account = {
        username: username,
        password: password,
        address: address,
        age: age
    }
    console.log(req.body);
    await new Account(account).save();

    return res.redirect('/login');
})

// Logout method
app.get('/logout', (req, res) => {
    req.session.destroy();
    return res.redirect('/login');
})


// Forgot password page
app.get('/forgot_password', (req, res) => {
    return res.sendFile('./views/forgot_password.html', {root: "public"});
})

// Success
app.get('/success', (req, res) => {
    return res.sendFile('./views/success.html', {root: "public"});
});

// Cancel
app.get('/cancel', (req, res) => {
    return res.sendFile('./views/cancel.html', {root: "public"});
});

// Forgot password method
app.post('/forgot_password' , async (req, res) => {
    const { username, address } = req.body;
    
    let myAccount = await Account.findOne({
        $and: [{username: username}, {address: address}]
    })
    if (myAccount) {
        return res.json(myAccount.password);
    } else {
        return res.json({
            success: false,
            msg: `Invalid username or address`,
        })
    }
})

// Stripe
let stripeGateway = stripe(process.env.stripe_api);
let DOMAIN = process.env.DOMAIN;

app.post('/stripe-checkout', async (req, res) => {
    const lineItems = req.body.items.map((item) => {
        const unitAmount = parseInt(item.price.replace(/[^0-9.-]+/g, "") * 100);
        console.log("item-price:", item.price);
        console.log("unitAmount:", unitAmount);
        return {
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.title,
                    images: [item.productImg]
                },
                unit_amount: unitAmount, 
            },
            quantity: item.quantity,
        };
    });
    console.log('lineItems:', lineItems);

    // Looking like filling data into cell of the schema
    let checkout = {
        products: [],
    };

    for (let i = 0; i < lineItems.length; i++) {
        let product = {
            product_name: lineItems[i].price_data.product_data.name,
            price: parseInt(lineItems[i].price_data.unit_amount),
            amount: parseInt(lineItems[i].quantity)
        }

        checkout.products.push(product);
    }
    console.log(checkout);

    new Checkout(checkout).save();
    // End DB

    // Create checkout session
    const session = await stripeGateway.checkout.sessions.create({
        payment_method_types: ['card'], 
        mode: 'payment',
        success_url: `${DOMAIN}/success`,
        cancel_url: `${DOMAIN}/cancel`,
        line_items: lineItems,
        //  Asking address in Stripe
        billing_address_collection: 'required'
    });
    res.json(session.url);
});








