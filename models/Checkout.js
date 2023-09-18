import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Checkout = new Schema({
    products: [{
        product_name: { type: String },
        price: { type: Number },
        amount: { type: Number},
    }], 
    status: {type: String, default: 'Pending'},
},
{
    timestamps: true // => create_at, updated_at
})

export default mongoose.model('Checkout', Checkout);
// products_name, price, amount, created_at, updated_at