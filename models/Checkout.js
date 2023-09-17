import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Checkout = new Schema({
    products: [{
        product_name: { type: String },
        price: { type: Number },
        amount: { type: Number }
    }],
    status: { type: String, default: 'Pending' },
    // created_at: { type: Date, default: Date.now() }
},
{
    timestamps: true // => created_at , updated_at
})

export default mongoose.model('Checkout', Checkout);
// products_name, price, amount, created_at, status