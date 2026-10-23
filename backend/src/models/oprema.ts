import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let Oprema = new Schema({
    idObj: mongoose.Schema.Types.ObjectId,
    naziv: String,
    cena: Number,
    zalihe: Number,
    slika: String,
    vrsta_sporta: String
});

export default mongoose.model('Oprema', Oprema, 'oprema');
