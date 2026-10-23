import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let User = new Schema({
    kor_ime: String,
    lozinka: String,
    ime: String,
    prezime: String,
    telefon: String,
    profilna: String,
    omiljeni_sportovi: [String],
    mejl: String,
    tip: String,
    maticni_broj: String,
    status: String,
    kazne: [{
        idObj: mongoose.Schema.Types.ObjectId,
        broj_nedolazaka: Number
    }],
    reset_token: String,
    reset_token_istice: Date
});

export default mongoose.model('User', User, 'korisnici');