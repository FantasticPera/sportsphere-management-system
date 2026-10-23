import express from 'express';

export class AdminController {

    getKorisniciNaCekanju = async (req: express.Request, res: express.Response) => {
        try {
            const User = require('../models/user').default;
            // Sportisti i radnici na cekanju
            let korisnici = await User.find({ status: "na_cekanju" });
            res.json(korisnici);
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Greska" });
        }
    }

    azurirajStatusKorisnika = async (req: express.Request, res: express.Response) => {
        let { id, status } = req.body;
        try {
            const User = require('../models/user').default;
            await User.updateOne({ _id: id }, { $set: { status: status } });
            res.json({ message: "Status azuriran!" });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Greska" });
        }
    }

    getSviAktivniKorisnici = async (req: express.Request, res: express.Response) => {
        try {
            const User = require('../models/user').default;
            // Svi koji nisu obrisani i nisu na_cekanju. Mozda i admina ne prikazujemo.
            let korisnici = await User.find({ 
                status: { $nin: ["obrisan", "na_cekanju", "odbijen"] },
                tip: { $ne: "admin" } 
            });
            res.json(korisnici);
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Greska" });
        }
    }

    azurirajKorisnika = async (req: express.Request, res: express.Response) => {
        let korisnik = req.body;
        try {
            const User = require('../models/user').default;
            await User.updateOne({ _id: korisnik._id }, { $set: korisnik });
            res.json({ message: "Korisnik uspesno azuriran!" });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Greska" });
        }
    }

    getObjektiNaCekanju = async (req: express.Request, res: express.Response) => {
        try {
            const Objekat = require('../models/objekat').default;
            let objekti = await Objekat.find({ status: { $in: ["neaktivan", "na_cekanju"] } });
            res.json(objekti);
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Greska" });
        }
    }

    azurirajStatusObjekta = async (req: express.Request, res: express.Response) => {
        let { id, status } = req.body;
        try {
            const Objekat = require('../models/objekat').default;
            await Objekat.updateOne({ _id: id }, { $set: { status: status } });
            res.json({ message: "Status objekta azuriran!" });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Greska" });
        }
    }

    getSviTreneri = async (req: express.Request, res: express.Response) => {
        try {
            const Trener = require('../models/trener').default;
            let treneri = await Trener.find({ status: { $ne: "neaktivan" } });
            res.json(treneri);
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Greska" });
        }
    }

    deaktivirajTrenera = async (req: express.Request, res: express.Response) => {
        let { id } = req.body;
        try {
            const Trener = require('../models/trener').default;
            await Trener.updateOne({ _id: id }, { $set: { status: "neaktivan" } });
            res.json({ message: "Trener deaktiviran!" });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Greska" });
        }
    }

    dodajSport = async (req: express.Request, res: express.Response) => {
        let { vrsta } = req.body;
        try {
            const Sport = require('../models/sport').default;
            // Provera da li vec postoji
            let postoji = await Sport.findOne({ vrsta: vrsta });
            if (postoji) {
                return res.status(400).json({ error: "Taj sport vec postoji." });
            }
            let s = new Sport({ vrsta });
            await s.save();
            res.json({ message: "Sport uspesno dodat!" });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Greska" });
        }
    }
}
