import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let Sport = new Schema({
    vrsta: String
});

export default mongoose.model('Sport', Sport, 'sportovi');
