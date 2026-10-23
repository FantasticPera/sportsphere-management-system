import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let Rezervacija = new Schema({
    idKor: mongoose.Schema.Types.ObjectId,
    idObj: mongoose.Schema.Types.ObjectId,
    idTeren: mongoose.Schema.Types.ObjectId,
    datum: String,
    od: String,
    do: String,
    status: String
});

export default mongoose.model('Rezervacija', Rezervacija, 'rezervacije');
