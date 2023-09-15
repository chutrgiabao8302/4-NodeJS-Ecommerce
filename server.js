import express from 'express';
import dotenv from 'dotenv';
import stripe from 'stripe';
const PORT = 3000;

// Load variables
dotenv.config();

// start server
const app = express();

app.use(express.static('public'));
app.use(express.json());

// Home route
app.get('/', (req, res) => {
    return res.sendFile('index.html', {root: "public"});
});

// Success
app.get('/success', (req, res) => {
    return res.sendFile('success.html', {root: "public"});
});

// Cancel
app.get('/cancel', (req, res) => {
    return res.sendFile('cancel.html', {root: "public"});
});

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

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
})

