import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let Oglas = new Schema({
    idKor: mongoose.Schema.Types.ObjectId,
    idRez: mongoose.Schema.Types.ObjectId,
    broj_nedostajucih_igraca: Number,
    status: String
});

export default mongoose.model('Oglas', Oglas, 'oglasi');
