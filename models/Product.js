import mongoose from "mongoose";
const Schema = mongoose.Schema;

const Product = new Schema({
    product_name: { type: String, required: true, unique: true },
    price: { type: Number, default: 0 },
    brand: {type: String},
    desc: { type: String},
    origin: { type: String }
},
{
    timestamps: true
}
) 

export default mongoose.model('Product', Product);