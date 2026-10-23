import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let Trening = new Schema({
    idTrener: mongoose.Schema.Types.ObjectId,
    idKor: mongoose.Schema.Types.ObjectId,
    idObj: mongoose.Schema.Types.ObjectId,
    datum: String,
    od: String,
    do: String,
    status: String
});

export default mongoose.model('Trening', Trening, 'treninzi');
