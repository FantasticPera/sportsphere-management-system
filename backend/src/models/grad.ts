import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let Grad = new Schema({
    naziv: String
});

export default mongoose.model('Grad', Grad, 'gradovi');
