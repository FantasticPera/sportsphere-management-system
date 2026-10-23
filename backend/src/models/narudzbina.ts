import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let Narudzbina = new Schema({
    idKor: mongoose.Schema.Types.ObjectId,
    idObj: mongoose.Schema.Types.ObjectId,
    proizvodi: [{
        idOpreme: mongoose.Schema.Types.ObjectId,
        kolicina: Number
    }],
    racun: Number,
    status: String,
    datum: String
});

export default mongoose.model('Narudzbina', Narudzbina, 'narudzbine');
