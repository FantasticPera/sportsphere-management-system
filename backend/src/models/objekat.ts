import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let Objekat = new Schema({
    naziv: String,
    adresa: String,
    mesto: String,
    lat: Number,
    lng: Number,
    pib: String,
    radnici: [mongoose.Schema.Types.ObjectId],
    broj_radnika: Number,
    lajkovi: [mongoose.Schema.Types.ObjectId],
    dislajkovi: [mongoose.Schema.Types.ObjectId],
    komentari: [{
        idKor: mongoose.Schema.Types.ObjectId,
        tekst: String
    }],
    promocije: [{
        naziv: String,
        period_vazenja_od: String,
        period_vazenja_do: String,
        procenat: Number,
        fiksni_popust: Number,
        vrsta_sporta: String
    }],
    status: String,
    radno_vreme_od: String,
    radno_vreme_do: String,
    vrsta_sporta: [String],
    opis: String,
    max_kazni_korisnika: Number,
    tereni: [{
        naziv: String,
        tip_terena: String,
        kapacitet: Number,
        dostupni_tereni: Number,
        cena: Number,
        opis_opreme: String,
        galerija_slika: [String]
    }]
});

export default mongoose.model('Objekat', Objekat, 'objekti');
