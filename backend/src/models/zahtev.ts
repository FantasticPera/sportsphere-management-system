import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let Zahtev = new Schema({
    idOglas: mongoose.Schema.Types.ObjectId,
    idKor: mongoose.Schema.Types.ObjectId,
    broj_ljudi: Number,
    status: String
});

export default mongoose.model('Zahtev', Zahtev, 'zahtevi');