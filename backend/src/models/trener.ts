import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let Trener = new Schema({
    idObj: mongoose.Schema.Types.ObjectId,
    ime: String,
    specijalizacija: String,
    prosecna_ocena: Number,
    cena: Number,
    status: String
});

export default mongoose.model('Trener', Trener, 'treneri');
