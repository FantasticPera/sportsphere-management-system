import * as express from 'express';
import User from '../models/user';
import Sport from '../models/sport';
import Objekat from '../models/objekat';
import Rezervacija from '../models/rezervacija';
import * as crypto from 'crypto';

export class UserController {
    // ==========================================
    // AUTH I PROFIL
    // ==========================================

    login = (req: express.Request, res: express.Response) => {
        let username = req.body.kor_ime;
        let password = req.body.lozinka;

        let hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

        User.findOne({ 'kor_ime': username, 'lozinka': hashedPassword }).then(user => {
            res.json(user)
        }).catch(err => {
            console.log(err)
        })
    }

        register = (req: express.Request, res: express.Response) => {
            let bodyData = { ...req.body };
            if (typeof bodyData.omiljeni_sportovi === 'string') {
                try {
                    bodyData.omiljeni_sportovi = JSON.parse(bodyData.omiljeni_sportovi);
                } catch (e) {
                    bodyData.omiljeni_sportovi = [];
                }
            }

            let newUser = new User(bodyData);

            if (req.file) {
                newUser.profilna = req.file.filename;
            } else {
                newUser.profilna = "default.png";
            }

            let queryChecks: any[] = [{ kor_ime: newUser.kor_ime }, { mejl: newUser.mejl }];
            if (newUser.tip === 'radnik' && newUser.maticni_broj) {
                queryChecks.push({ maticni_broj: newUser.maticni_broj });
            }

            // Provera da li postoji kor_ime, mejl ili maticni_broj
            User.findOne({ $or: queryChecks }).then(user => {
                if (user) {
                    if (user.kor_ime === newUser.kor_ime) {
                        return res.json({ message: "Korisnicko ime vec postoji!" });
                    } else if (user.mejl === newUser.mejl) {
                        return res.json({ message: "E-mail adresa vec postoji!" });
                    } else {
                        return res.json({ message: "Maticni broj vec postoji!" });
                    }
                }

                // Ako je radnik, prvo proveravamo objekat
                if (newUser.tip === 'radnik') {
                    Objekat.findOne({ pib: req.body.pib }).then(obj => {
                        if (!obj) {
                            return res.json({ message: "Sportski objekat sa unetim PIB-om ne postoji u bazi!" });
                        }
                        // Proveravamo da li se naziv i adresa poklapaju
                        if (obj.naziv !== req.body.nazivObjekta || obj.adresa !== req.body.adresaObjekta) {
                            return res.json({ message: "Naziv ili adresa sportskog objekta se ne poklapaju sa bazom!" });
                        }
                        if (obj.radnici.length >= 2) {
                            return res.json({ message: "Ovaj sportski objekat vec ima maksimalan broj zaposlenih (2)!" });
                        }
                        this.saveUserAndObject(newUser, obj, req, res);
                    }).catch(err => {
                        console.log(err);
                        res.json({ message: "Greska prilikom provere objekta" });
                    });
                } else {
                    this.saveUserAndObject(newUser, null, req, res);
                }
            }).catch(err => {
                console.log(err);
                res.json({ message: "Greska" });
            });
        }

    private saveUserAndObject(newUser: any, obj: any, req: express.Request, res: express.Response) {
        // Hesiranje lozinke
        newUser.lozinka = crypto.createHash('sha256').update(newUser.lozinka).digest('hex');
        newUser.status = "na_cekanju";

        newUser.save().then((savedUser: any) => {
            if (newUser.tip === 'radnik' && obj) {
                obj.radnici.push(savedUser._id);
                obj.broj_radnika = (obj.broj_radnika || 0) + 1;
                obj.save().then(() => {
                    res.json({ message: "Uspesna registracija!" });
                });
            } else {
                res.json({ message: "Uspesna registracija!" });
            }
        }).catch((err: any) => {
            console.log(err);
            res.json({ message: "Greska prilikom cuvanja" });
        });
    }

        generateResetToken = (req: express.Request, res: express.Response) => {
            let identifier = req.body.identifier;

            User.findOne({ $or: [{ kor_ime: identifier }, { mejl: identifier }] }).then(user => {
                if (!user) {
                    return res.json({ message: "Korisnik nije pronadjen" });
                }
                if (user.tip === 'admin') {
                    return res.json({ message: "Admin ne moze koristiti ovu opciju" });
                }

                let token = crypto.randomBytes(20).toString('hex');
                user.reset_token = token;
                user.reset_token_istice = new Date(Date.now() + 30 * 60000); // 30 minuta

                user.save().then(() => {
                    res.json({ token: token });
                }).catch(err => {
                    console.log(err);
                    res.json({ message: "Greska prilikom cuvanja" });
                });
            }).catch(err => {
                console.log(err);
                res.json({ message: "Greska" });
            });
        }

        resetPassword = (req: express.Request, res: express.Response) => {
            let token = req.body.token;
            let newPassword = req.body.password;

            User.findOne({ reset_token: token, reset_token_istice: { $gt: new Date() } }).then(user => {
                if (!user) {
                    return res.json({ message: "Link je istekao ili je nevazeci" });
                }

                user.lozinka = crypto.createHash('sha256').update(newPassword).digest('hex');
                user.reset_token = "";
                user.reset_token_istice = null;

                user.save().then(() => {
                    res.json({ message: "Lozinka uspesno promenjena!" });
                }).catch(err => {
                    console.log(err);
                    res.json({ message: "Greska prilikom cuvanja" });
                });
            }).catch(err => {
                console.log(err);
                res.json({ message: "Greska" });
            });
        }

        clearToken = (req: express.Request, res: express.Response) => {
            let token = req.body.token;
            User.findOne({ reset_token: token }).then(user => {
                if (user) {
                    user.reset_token = "";
                    user.reset_token_istice = null;
                    user.save().then(() => res.json({ message: "ok" }));
                } else {
                    res.json({ message: "ok" });
                }
            }).catch(err => {
                console.log(err);
                res.json({ message: "ok" });
            });
        }

        checkToken = (req: express.Request, res: express.Response) => {
            let token = req.body.token;
            User.findOne({ reset_token: token, reset_token_istice: { $gt: new Date() } }).then(user => {
                if (user) {
                    res.json({ valid: true });
                } else {
                    res.json({ valid: false });
                }
            }).catch(err => {
                console.log(err);
                res.json({ valid: false });
            });
        }

    getUserByUsername = (req: express.Request, res: express.Response) => {
        let username = req.query.username;
        User.findOne({ kor_ime: username }).then(user => {
            res.json(user);
        }).catch(err => {
            console.log(err);
            res.status(500).json({ error: "Greska" });
        });
    }

    updateProfile = (req: express.Request, res: express.Response) => {
        let userData = req.body;

        let omiljeni = [];
        if (userData.omiljeni_sportovi) {
            try {
                omiljeni = JSON.parse(userData.omiljeni_sportovi);
            } catch (e) {
                omiljeni = userData.omiljeni_sportovi;
            }
        }

        let updateData: any = {
            ime: userData.ime,
            prezime: userData.prezime,
            mejl: userData.mejl,
            telefon: userData.telefon,
            omiljeni_sportovi: omiljeni
        };

        if (req.file) {
            updateData.profilna = req.file.filename;
        }

        User.findOneAndUpdate(
            { kor_ime: userData.kor_ime },
            updateData,
            { new: true } // Vraca azurirani dokument
        ).then(updatedUser => {
            res.json(updatedUser);
        }).catch(err => {
            console.log(err);
            res.status(500).json({ error: "Greska prilikom azuriranja" });
        });
    }

    changePassword = (req: express.Request, res: express.Response) => {
        let { kor_ime, nova_lozinka } = req.body;

        let hashedPassword = crypto.createHash('sha256').update(nova_lozinka).digest('hex');

        User.updateOne({ kor_ime: kor_ime }, { lozinka: hashedPassword }).then(result => {
            res.json({ message: "Lozinka uspesno promenjena" });
        }).catch(err => {
            console.log(err);
            res.status(500).json({ error: "Greska pri promeni lozinke" });
        });
    }
    // ==========================================
    // OBJEKTI, TERENI I SPORTOVI
    // ==========================================


    getPocetnaInfo = (req: express.Request, res: express.Response) => {
        Objekat.find({ status: 'aktivan' }).then(objekti => {
            let ukupanBroj = objekti.length;

            // Top 3 po broju lajkova
            let top3Objekti = [...objekti].sort((a, b) => (b.lajkovi?.length || 0) - (a.lajkovi?.length || 0)).slice(0, 3);

            // Sve aktuelne promocije
            let danas = new Date().toISOString().split('T')[0];
            let svePromocije: any[] = [];

            objekti.forEach(obj => {
                if (obj.promocije && obj.promocije.length > 0) {
                    obj.promocije.forEach((p: any) => {
                        // Provera vazenja (pretpostavka da su u formatu YYYY-MM-DD)
                        if (p.period_vazenja_od <= danas && p.period_vazenja_do >= danas) {
                            svePromocije.push({
                                naziv: p.naziv,
                                naziv_objekta: obj.naziv, // dodajemo naziv objekta
                                period_vazenja_od: p.period_vazenja_od,
                                period_vazenja_do: p.period_vazenja_do,
                                procenat: p.procenat,
                                fiksni_popust: p.fiksni_popust
                            });
                        }
                    });
                }
            });

            // Uzimamo najvise 3 promocije
            let aktuelnePromocije = svePromocije.slice(0, 3);

            res.json({
                ukupanBrojAktivnih: ukupanBroj,
                top3Objekti: top3Objekti,
                aktuelnePromocije: aktuelnePromocije
            });
        }).catch(err => {
            console.log(err);
            res.status(500).json({ error: "Greska prilikom dohvatanja podataka" });
        });
    }
    getAllSports = (req: express.Request, res: express.Response) => {
        Sport.find().then(sports => {
            res.json(sports);
        }).catch(err => {
            console.log(err);
            res.json([]);
        });
    }

    getGradovi = (req: express.Request, res: express.Response) => {
        Objekat.distinct('mesto', { status: 'aktivan' }).then(gradovi => {
            res.json(gradovi);
        }).catch(err => {
            console.log(err);
            res.status(500).json({ error: "Greska" });
        });
    }

    searchObjekti = async (req: express.Request, res: express.Response) => {
        let { naziv, gradovi, sport, tip_terena, samoSlobodni } = req.body;

        let query: any = { status: 'aktivan' };

        if (naziv) {
            query.naziv = { $regex: naziv, $options: 'i' };
        }
        if (gradovi && gradovi.length > 0) {
            query.mesto = { $in: gradovi };
        }
        if (sport) {
            query.vrsta_sporta = sport;
        }
        if (tip_terena) {
            query['tereni.tip_terena'] = tip_terena;
        }

        try {
            let objekti = await Objekat.find(query);

            if (samoSlobodni) {
                let today = new Date().toISOString().split('T')[0];
                let rezervacije = await Rezervacija.find({
                    datum: today,
                    status: { $in: ['aktuelna', 'podneta'] }
                });

                objekti = objekti.filter(obj => {
                    if (!obj.tereni || obj.tereni.length === 0) return false;

                    let radnoOd = obj.radno_vreme_od ? parseInt(obj.radno_vreme_od.split(':')[0]) : 8;
                    let radnoDo = obj.radno_vreme_do ? parseInt(obj.radno_vreme_do.split(':')[0]) : 22;
                    let totalHours = (radnoDo > radnoOd) ? (radnoDo - radnoOd) : 0;

                    for (let t of obj.tereni) {
                        let availableCount = t.dostupni_tereni || 1;
                        let maxCapacity = totalHours * availableCount;

                        let rezForTeren = rezervacije.filter(r =>
                            r.idObj?.toString() === obj._id.toString() &&
                            r.idTeren?.toString() === (t as any)._id.toString()
                        );

                        let bookedHours = 0;
                        for (let r of rezForTeren) {
                            if (r.od && r.do) {
                                let odH = parseInt(r.od.split(':')[0]);
                                let doH = parseInt(r.do.split(':')[0]);
                                bookedHours += (doH - odH);
                            }
                        }

                        if (bookedHours < maxCapacity) {
                            return true;
                        }
                    }
                    return false;
                });
            }

            res.json(objekti);
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Greska pri pretrazi" });
        }
    }

    getObjekat = (req: express.Request, res: express.Response) => {
        let id = req.query.id;
        Objekat.findById(id).then(obj => {
            res.json(obj);
        }).catch(err => {
            console.log(err);
            res.status(500).json({ error: "Greska" });
        });
    }

    getObjektiRadnika = async (req: express.Request, res: express.Response) => {
        let idRadnika = req.query.idRadnika;
        try {
            const Objekat = require('../models/objekat').default;
            // Pretrazuje objekte gde se idRadnika nalazi unutar niza radnici
            const objekti = await Objekat.find({ radnici: idRadnika });
            res.json(objekti);
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Greska pri dohvatanju objekata radnika." });
        }
    }

    kreirajObjekat = async (req: express.Request, res: express.Response) => {
        let { idRadnika, naziv, mesto, adresa, vrsta_sporta, radno_vreme_od, radno_vreme_do, dozvoljena_kaznena_nepojavljivanja } = req.body;
        try {
            const Objekat = require('../models/objekat').default;
            const User = require('../models/user').default;

            let noviObj = new Objekat({
                naziv,
                mesto,
                adresa,
                vrsta_sporta, // array of strings
                radno_vreme_od,
                radno_vreme_do,
                max_kazni_korisnika: dozvoljena_kaznena_nepojavljivanja,
                status: 'aktivan',
                radnici: [idRadnika],
                broj_radnika: 1,
                tereni: [],
                lajkovi: [],
                dislajkovi: [],
                komentari: [],
                promocije: []
            });

            await noviObj.save();
            res.json({ message: "Objekat je uspesno kreiran!" });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Greska pri kreiranju objekta." });
        }
    }

    dodajTeren = async (req: express.Request, res: express.Response) => {
        let { idObjekta, naziv, tip_terena, kapacitet, opis_opreme, cena } = req.body;
        try {
            const Objekat = require('../models/objekat').default;
            
            let obj = await Objekat.findById(idObjekta);
            if (!obj) {
                return res.status(404).json({ error: "Objekat nije pronadjen." });
            }

            // Provera jedinstvenosti naziva terena u okviru objekta
            let postoji = obj.tereni.find((t: any) => t.naziv === naziv);
            if (postoji) {
                return res.status(400).json({ error: "Teren sa tim nazivom vec postoji u ovom objektu!" });
            }

            let noviTeren = {
                naziv,
                tip_terena,
                kapacitet,
                opis_opreme,
                dostupni_tereni: 1, // default
                cena: cena || 0, // cena terena

                galerija_slika: []
            };

            obj.tereni.push(noviTeren);
            await obj.save();
            res.json({ message: "Teren je uspesno dodat!" });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Greska pri dodavanju terena." });
        }
    }

    dodajObjekteIzJsona = async (req: express.Request, res: express.Response) => {
        let { objekti } = req.body;
        try {
            const Objekat = require('../models/objekat').default;

            // Iteriramo i kreiramo validne mongoose objekte
            let docsToInsert = objekti.map((o: any) => {
                let objData: any = { ...o };
                // Ako nismo dobili neki konkretan status iz JSON-a, postavi neaktivan
                if (!objData.status) objData.status = 'neaktivan';
                return objData;
            });

            // insertMany vraca niz unetih objekata
            await Objekat.insertMany(docsToInsert);
            res.json({ message: "Svi objekti iz fajla su uspesno uvezeni!" });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Greska pri upisu objekata iz JSON-a u bazu." });
        }
    }
    // ==========================================
    // TRENERI
    // ==========================================


    pretragaTrenera = async (req: express.Request, res: express.Response) => {
        let { sport, objekat } = req.query;
        try {
            const Trener = require('../models/trener').default;
            const Objekat = require('../models/objekat').default;

            const sviTreneri = await Trener.find({});
            const filtrirani = [];

            for (let tr of sviTreneri) {
                const obj = await Objekat.findById(tr.idObj);

                let objNaziv = obj ? obj.naziv : 'Nepoznat';
                let trSport = tr.specijalizacija || '';

                let matchSport = true;
                if (sport && typeof sport === 'string' && sport.trim() !== '') {
                    if (!trSport.toLowerCase().includes(sport.trim().toLowerCase())) {
                        matchSport = false;
                    }
                }

                let matchObj = true;
                if (objekat && typeof objekat === 'string' && objekat.trim() !== '') {
                    if (!objNaziv.toLowerCase().includes(objekat.trim().toLowerCase())) {
                        matchObj = false;
                    }
                }

                if (matchSport && matchObj) {
                    filtrirani.push({
                        _id: tr._id,
                        ime: tr.ime,
                        specijalizacija: tr.specijalizacija,
                        prosecna_ocena: tr.prosecna_ocena,
                        cena: tr.cena,
                        naziv_objekta: objNaziv
                    });
                }
            }
            res.json(filtrirani);
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Greska pri pretrazi trenera." });
        }
    }
    getTrener = async (req: express.Request, res: express.Response) => {
        let { id } = req.query;
        try {
            const Trener = require('../models/trener').default;
            const Objekat = require('../models/objekat').default;

            const tr = await Trener.findById(id);
            if (!tr) return res.status(404).json({ error: "Trener nije pronadjen." });

            const obj = await Objekat.findById(tr.idObj);
            res.json({
                _id: tr._id,
                ime: tr.ime,
                specijalizacija: tr.specijalizacija,
                prosecna_ocena: tr.prosecna_ocena,
                cena: tr.cena,
                idObj: tr.idObj,
                naziv_objekta: obj ? obj.naziv : 'Nepoznat'
            });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Greska." });
        }
    }
    // ==========================================
    // REZERVACIJE I TRENINZI
    // ==========================================


    getUserReservations = async (req: express.Request, res: express.Response) => {
        let idKor = req.query.idKor;
        try {
            let rezervacije = await Rezervacija.find({ idKor: idKor });
            let objektiIds = rezervacije.map(r => r.idObj);
            let objekti = await Objekat.find({ _id: { $in: objektiIds } });

            let now = new Date();
            let currentDateStr = now.toISOString().split('T')[0];
            let currentTimeStr = now.toTimeString().split(' ')[0].substring(0, 5); // "HH:mm"

            let result = rezervacije.map(r => {
                let obj = objekti.find(o => o._id.toString() === r.idObj?.toString());
                let teren = obj?.tereni?.find((t: any) => t._id.toString() === r.idTeren?.toString());

                let displayStatus = r.status || 'podneta';
                if (displayStatus === 'otkazano' || displayStatus === 'otkazana') {
                    displayStatus = 'otkazana';
                } else if (displayStatus === 'zavrsena' || displayStatus === 'zavrsena') {
                    displayStatus = 'zavrsena';
                } else {
                    if (r.datum && r.datum < currentDateStr) {
                        displayStatus = 'zavrsena';
                        Rezervacija.updateOne({ _id: r._id }, { status: 'zavrsena' }).exec();
                    } else if (r.datum === currentDateStr && r.do && r.do <= currentTimeStr) {
                        displayStatus = 'zavrsena';
                        Rezervacija.updateOne({ _id: r._id }, { status: 'zavrsena' }).exec();
                    }
                }

                let resStart = new Date(`${r.datum}T${r.od}:00`);
                let diffHours = (resStart.getTime() - now.getTime()) / (1000 * 60 * 60);
                let mozeOtkazati = false;

                if (diffHours >= 12) {
                    if (displayStatus === 'podneta' || displayStatus === 'aktuelna') {
                        mozeOtkazati = true;
                    }
                }

                return {
                    _id: r._id,
                    naziv_objekta: obj?.naziv || 'Nepoznat',
                    grad: obj?.mesto || 'Nepoznat',
                    teren_hala: teren?.naziv || 'Nepoznat',
                    sport: obj?.vrsta_sporta?.join(', ') || 'Nepoznat',
                    datum: r.datum,
                    interval_od: r.od,
                    interval_do: r.do,
                    status: displayStatus,
                    mozeOtkazati: mozeOtkazati
                };
            });
            res.json(result);
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Greska pri dohvatanju rezervacija." });
        }
    }

    getKalendarZauzeca = async (req: express.Request, res: express.Response) => {
        let { idObj, datumOd, datumDo } = req.query;
        try {
            const rezQuery: any = {
                idObj: idObj,
                datum: { $gte: datumOd, $lte: datumDo },
                status: { $in: ['podneta', 'aktuelna'] }
            };
            const rezervacije = await Rezervacija.find(rezQuery);

            // Assuming Trening model has idObj, datum, od, do.
            const Trening = require('../models/trening').default;
            const trenQuery: any = {
                idObj: idObj,
                datum: { $gte: datumOd, $lte: datumDo }
            };
            const treninzi = await Trening.find(trenQuery);

            res.json({ rezervacije, treninzi });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Greska pri dohvatanju kalendara" });
        }
    }

    rezervisiTeren = async (req: express.Request, res: express.Response) => {
        let { idKor, idObj, idTeren, datum, od, do: doVreme } = req.body;

        try {
            // Provera za treninge (ceo objekat)
            const Trening = require('../models/trening').default;
            const treningPreklapanje = await Trening.findOne({
                idObj: idObj,
                datum: datum,
                $and: [
                    { od: { $lt: doVreme } },
                    { do: { $gt: od } }
                ]
            });

            if (treningPreklapanje) {
                return res.status(400).json({ error: "Odabrani termin se preklapa sa treningom u objektu." });
            }

            // Provera za rezervacije (konkretan teren)
            const rezervacijaPreklapanje = await Rezervacija.findOne({
                idTeren: idTeren,
                datum: datum,
                status: { $in: ['podneta', 'aktuelna'] },
                $and: [
                    { od: { $lt: doVreme } },
                    { do: { $gt: od } }
                ]
            });

            if (rezervacijaPreklapanje) {
                return res.status(400).json({ error: "Odabrani termin je vec rezervisan na ovom terenu." });
            }

            let novaRez = new Rezervacija({
                idKor,
                idObj,
                idTeren,
                datum,
                od,
                do: doVreme,
                status: 'podneta'
            });

            await novaRez.save();
            res.json({ message: "Rezervacija je uspesno kreirana!" });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Greska pri rezervisanju terena." });
        }
    }

    otkaziRezervaciju = (req: express.Request, res: express.Response) => {
        let idRez = req.body.idRez;
        Rezervacija.updateOne({ _id: idRez }, { status: 'otkazana' }).then(result => {
            res.json({ message: "Rezervacija je uspesno otkazana" });
        }).catch(err => {
            console.log(err);
            res.status(500).json({ error: "Greska pri otkazivanju rezervacije" });
        });
    }

    getUserTreninzi = async (req: express.Request, res: express.Response) => {
        let idKor = req.query.idKor;
        try {
            const Trening = require('../models/trening').default;
            const Trener = require('../models/trener').default;
            const Objekat = require('../models/objekat').default;

            let treninzi = await Trening.find({ idKor: idKor });

            let now = new Date();
            let currentDateStr = now.toISOString().split('T')[0];
            let currentTimeStr = now.toTimeString().split(' ')[0].substring(0, 5);

            let result = [];
            for (let t of treninzi) {
                let tr = await Trener.findById(t.idTrener);
                let obj = await Objekat.findById(t.idObj);

                let displayStatus = t.status || 'zakazan';
                if (displayStatus === 'otkazano' || displayStatus === 'otkazan') {
                    displayStatus = 'otkazan';
                } else if (displayStatus === 'zavrseno' || displayStatus === 'zavrsen' || displayStatus === 'odrzan') {
                    displayStatus = 'odrzan';
                } else {
                    if (t.datum && t.datum < currentDateStr) {
                        displayStatus = 'odrzan';
                        Trening.updateOne({ _id: t._id }, { status: 'odrzan' }).exec();
                    } else if (t.datum === currentDateStr && t.do && t.do <= currentTimeStr) {
                        displayStatus = 'odrzan';
                        Trening.updateOne({ _id: t._id }, { status: 'odrzan' }).exec();
                    }
                }

                let tStart = new Date(`${t.datum}T${t.od}:00`);
                let diffHours = (tStart.getTime() - now.getTime()) / (1000 * 60 * 60);
                let mozeOtkazati = (diffHours >= 12 && displayStatus === 'zakazan');

                result.push({
                    _id: t._id,
                    datum: t.datum,
                    od: t.od,
                    do: t.do,
                    status: displayStatus,
                    ime_trenera: tr ? tr.ime : 'Nepoznat trener',
                    specijalizacija: tr ? tr.specijalizacija : '',
                    naziv_objekta: obj ? obj.naziv : 'Nepoznat',
                    mozeOtkazati: mozeOtkazati
                });
            }

            res.json(result);
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Greska pri dohvatanju treninga." });
        }
    }

    zakaziTrening = async (req: express.Request, res: express.Response) => {
        let { idKor, idTrener, datum, od, doVreme } = req.body;
        try {
            const Trener = require('../models/trener').default;
            const Objekat = require('../models/objekat').default;
            const Trening = require('../models/trening').default;
            const Rezervacija = require('../models/rezervacija').default;

            // Provera trajanja
            const hOd = parseInt(od.split(':')[0]);
            const mOd = parseInt(od.split(':')[1]);
            const hDo = parseInt(doVreme.split(':')[0]);
            const mDo = parseInt(doVreme.split(':')[1]);
            const trajanje = (hDo * 60 + mDo) - (hOd * 60 + mOd);
            if (trajanje < 60) {
                return res.status(400).json({ error: "Trening mora trajati barem sat vremena." });
            }

            const tr = await Trener.findById(idTrener);
            if (!tr) return res.status(404).json({ error: "Trener nije pronadjen." });

            const obj = await Objekat.findById(tr.idObj);
            if (!obj) return res.status(404).json({ error: "Objekat nije pronadjen." });

            // Provera radnog vremena
            const rvOd = parseInt(obj.radno_vreme_od.split(':')[0]);
            const rvDo = parseInt(obj.radno_vreme_do.split(':')[0]);
            if (hOd < rvOd || hDo > rvDo) {
                return res.status(400).json({ error: `Radno vreme objekta je od ${obj.radno_vreme_od} do ${obj.radno_vreme_do}.` });
            }

            // Provera da li trener vec ima trening u to vreme (preklapanje)
            const treninziTrenera = await Trening.find({
                idTrener: idTrener,
                datum: datum,
                status: { $nin: ['otkazano', 'zavrseno'] }
            });
            for (let t of treninziTrenera) {
                if ((od >= t.od && od < t.do) || (doVreme > t.od && doVreme <= t.do) || (od <= t.od && doVreme >= t.do)) {
                    return res.status(400).json({ error: "Trener je zauzet u izabranom terminu." });
                }
            }

            // Provera korisnika
            const treninziKor = await Trening.find({
                idKor: idKor,
                datum: datum,
                status: { $nin: ['otkazano', 'zavrseno'] }
            });
            for (let t of treninziKor) {
                if ((od >= t.od && od < t.do) || (doVreme > t.od && doVreme <= t.do) || (od <= t.od && doVreme >= t.do)) {
                    return res.status(400).json({ error: "Vec imate zakazan trening u tom terminu." });
                }
            }

            const rezKor = await Rezervacija.find({
                idKor: idKor,
                datum: datum,
                status: { $nin: ['otkazano', 'zavrseno'] }
            });
            for (let r of rezKor) {
                if ((od >= r.od && od < r.do) || (doVreme > r.od && doVreme <= r.do) || (od <= r.od && doVreme >= r.do)) {
                    return res.status(400).json({ error: "Vec imate zakazanu rezervaciju terena u tom terminu." });
                }
            }

            // Zakazi
            let noviTrening = new Trening({
                idTrener,
                idKor,
                idObj: tr.idObj,
                datum,
                od,
                do: doVreme,
                status: 'zakazan'
            });

            await noviTrening.save();
            res.json({ message: "Trening je uspesno zakazan!" });

        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Greska pri zakazivanju treninga." });
        }
    }

    getRezervacijeRadnika = async (req: express.Request, res: express.Response) => {
        let idRadnika = req.query.idRadnika;
        try {
            const Objekat = require('../models/objekat').default;
            const Rezervacija = require('../models/rezervacija').default;
            const Trening = require('../models/trening').default;
            const User = require('../models/user').default;

            let objekti = await Objekat.find({ radnici: idRadnika });
            let idObjekata = objekti.map((o: any) => o._id);

            let rezervacije = await Rezervacija.find({ idObj: { $in: idObjekata } });
            let treninzi = await Trening.find({ idObj: { $in: idObjekata } });

            let sve = [];

            for (let r of rezervacije) {
                let obj = objekti.find((o: any) => o._id.toString() === r.idObj.toString());
                let korisnik = await User.findById(r.idKor);
                sve.push({
                    _id: r._id,
                    tip: 'rezervacija',
                    datum: r.datum,
                    interval_od: r.od,
                    interval_do: r.do,
                    status: r.status,
                    objekat: obj ? obj.naziv : '',
                    idObjekta: r.idObj,
                    korisnik: korisnik ? korisnik.kor_ime : '',
                    idKor: r.idKor
                });
            }

            for (let t of treninzi) {
                let obj = objekti.find((o: any) => o._id.toString() === t.idObj.toString());
                let korisnik = await User.findById(t.idKor);
                sve.push({
                    _id: t._id,
                    tip: 'trening',
                    datum: t.datum,
                    interval_od: t.od,
                    interval_do: t.do,
                    status: t.status,
                    objekat: obj ? obj.naziv : '',
                    idObjekta: t.idObj,
                    korisnik: korisnik ? korisnik.kor_ime : '',
                    idKor: t.idKor
                });
            }

            // Sortirati po datumu (opciono)
            sve.sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime());
            res.json(sve);
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Greska pri dohvatanju rezervacija." });
        }
    }

    potvrdiDolazak = async (req: express.Request, res: express.Response) => {
        let { tip, idZapisa } = req.body;
        try {
            if (tip === 'rezervacija') {
                const Rezervacija = require('../models/rezervacija').default;
                await Rezervacija.updateOne({ _id: idZapisa }, { $set: { status: 'odrzano' } });
            } else if (tip === 'trening') {
                const Trening = require('../models/trening').default;
                await Trening.updateOne({ _id: idZapisa }, { $set: { status: 'odrzano' } });
            }
            res.json({ message: "Uspesno potvrdjen dolazak." });
        } catch (err) {
            res.status(500).json({ error: "Greska pri potvrdjivanju." });
        }
    }

    odjaviDolazak = async (req: express.Request, res: express.Response) => {
        let { tip, idZapisa, idKor, idObjekta } = req.body;
        try {
            if (tip === 'rezervacija') {
                const Rezervacija = require('../models/rezervacija').default;
                await Rezervacija.updateOne({ _id: idZapisa }, { $set: { status: 'nije_dosao' } });
            } else if (tip === 'trening') {
                const Trening = require('../models/trening').default;
                await Trening.updateOne({ _id: idZapisa }, { $set: { status: 'nije_dosao' } });
            }

            res.json({ message: "Korisnik odjavljen." });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Greska pri odjavi." });
        }
    }
    // ==========================================
    // OGLASI I ZAHTEVI
    // ==========================================


    dohvatiOglase = async (req: express.Request, res: express.Response) => {
        let { idKor } = req.query; // ulogovani korisnik
        try {
            const Oglas = require('../models/oglas').default;
            const oglasi = await Oglas.find({ status: 'aktivan' });

            // Popunjavamo sa rezervacijom, objektom, terenom
            const populated = [];
            for (let o of oglasi) {
                const rez = await Rezervacija.findById(o.idRez);
                if (rez) {
                    const obj = await Objekat.findById(rez.idObj);
                    const teren = obj ? obj.tereni.find((t: any) => t._id.toString() === rez.idTeren?.toString()) : null;

                    populated.push({
                        _id: o._id,
                        idKor: o.idKor,
                        broj_nedostajucih_igraca: o.broj_nedostajucih_igraca,
                        sport: obj ? obj.vrsta_sporta.join(', ') : '',
                        grad: obj ? obj.mesto : '',
                        datum: rez.datum,
                        termin: `${rez.od} - ${rez.do}`,
                        objekat_naziv: obj ? obj.naziv : '',
                        teren_naziv: teren ? teren.naziv : ''
                    });
                }
            }

            // Delimo na "moji" i "tudji"
            const moji = populated.filter(p => p.idKor.toString() === idKor);
            const tudji = populated.filter(p => p.idKor.toString() !== idKor);

            res.json({ moji, tudji });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Greska pri dohvatanju oglasa." });
        }
    }

    kreirajOglas = async (req: express.Request, res: express.Response) => {
        let { idKor, idRez, broj_nedostajucih_igraca } = req.body;
        try {
            const Oglas = require('../models/oglas').default;
            let noviOglas = new Oglas({
                idKor,
                idRez,
                broj_nedostajucih_igraca,
                status: 'aktivan'
            });
            await noviOglas.save();
            res.json({ message: "Oglas je uspesno kreiran!" });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Greska pri kreiranju oglasa." });
        }
    }

    rezervacijeZaOglas = async (req: express.Request, res: express.Response) => {
        let { idKor } = req.query;
        try {
            const Oglas = require('../models/oglas').default;

            // Buduce rezervacije, koje nisu otkazana ni zavrsena
            // Za jednostavnost ovde dohvatamo sve podnete/aktuelne
            const rezervacije = await Rezervacija.find({
                idKor: idKor,
                status: { $in: ['podneta', 'aktuelna'] }
            });

            const dostupne = [];
            for (let r of rezervacije) {
                // Da li vec postoji oglas za ovu rez?
                const vecIma = await Oglas.findOne({ idRez: r._id, status: 'aktivan' });
                if (!vecIma) {
                    const obj = await Objekat.findById(r.idObj);
                    const teren = obj ? obj.tereni.find((t: any) => t._id.toString() === r.idTeren?.toString()) : null;
                    dostupne.push({
                        _id: r._id,
                        datum: r.datum,
                        termin: `${r.od} - ${r.do}`,
                        objekat_naziv: obj ? obj.naziv : '',
                        teren_naziv: teren ? teren.naziv : ''
                    });
                }
            }
            res.json(dostupne);
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Greska pri dohvatanju rezervacija za oglas." });
        }
    }

    posaljiZahtevOglas = async (req: express.Request, res: express.Response) => {
        let { idKor, idOglas, broj_ljudi } = req.body;
        try {
            const Zahtev = require('../models/zahtev').default;
            const Oglas = require('../models/oglas').default;

            const oglas = await Oglas.findById(idOglas);
            if (!oglas) {
                return res.status(404).json({ error: "Oglas nije pronadjen." });
            }
            if (broj_ljudi > oglas.broj_nedostajucih_igraca) {
                return res.status(400).json({ error: "Broj ljudi premasuje trazeni broj." });
            }

            const postojeci = await Zahtev.findOne({ idKor, idOglas });
            if (postojeci) {
                return res.status(400).json({ error: "Vec ste poslali zahtev za ovaj oglas." });
            }

            let noviZahtev = new Zahtev({
                idKor,
                idOglas,
                broj_ljudi,
                status: 'na cekanju'
            });

            await noviZahtev.save();
            res.json({ message: "Zahtev je uspesno poslat!" });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Greska pri slanju zahteva." });
        }
    }

    mojiZahtevi = async (req: express.Request, res: express.Response) => {
        let { idKor } = req.query;
        try {
            const Zahtev = require('../models/zahtev').default;
            const zahtevi = await Zahtev.find({ idKor: idKor });
            const oglasIds = zahtevi.map((z: any) => z.idOglas.toString());
            res.json(oglasIds);
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Greska pri dohvatanju poslatih zahteva." });
        }
    }

    zahteviZaOglas = async (req: express.Request, res: express.Response) => {
        let { idOglas } = req.query;
        try {
            const Zahtev = require('../models/zahtev').default;
            const User = require('../models/user').default;

            const zahtevi = await Zahtev.find({ idOglas: idOglas });

            // Populate user data
            const populated = [];
            for (let z of zahtevi) {
                const user = await User.findById(z.idKor);
                populated.push({
                    _id: z._id,
                    idOglas: z.idOglas,
                    broj_ljudi: z.broj_ljudi,
                    status: z.status,
                    ime_prezime: user ? `${user.ime} ${user.prezime}` : 'Nepoznat'
                });
            }

            res.json(populated);
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Greska pri dohvatanju zahteva za oglas." });
        }
    }

    obradiZahtev = async (req: express.Request, res: express.Response) => {
        let { idZahtev, idOglas, akcija } = req.body;
        try {
            const Zahtev = require('../models/zahtev').default;
            const Oglas = require('../models/oglas').default;

            const zahtev = await Zahtev.findById(idZahtev);
            const oglas = await Oglas.findById(idOglas);

            if (!zahtev || !oglas) {
                return res.status(404).json({ error: "Zahtev ili oglas nisu pronadjeni." });
            }

            if (akcija === 'odbij') {
                zahtev.status = 'odbijen';
                await zahtev.save();
                return res.json({ message: "Zahtev je odbijen." });
            } else if (akcija === 'prihvati') {
                if (zahtev.broj_ljudi > oglas.broj_nedostajucih_igraca) {
                    return res.status(400).json({ error: "Broj ljudi u zahtevu premasuje broj slobodnih mesta." });
                }

                zahtev.status = 'prihvacen';
                await zahtev.save();

                oglas.broj_nedostajucih_igraca -= zahtev.broj_ljudi;
                if (oglas.broj_nedostajucih_igraca <= 0) {
                    oglas.status = 'neaktivan';
                }
                await oglas.save();

                return res.json({ message: "Zahtev je uspesno prihvacen!" });
            } else {
                return res.status(400).json({ error: "Nepoznata akcija." });
            }

        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Greska pri obradi zahteva." });
        }
    }
    // ==========================================
    // OPREMA, PROMOCIJE I NARUDZBINE
    // ==========================================

    getOprema = async (req: express.Request, res: express.Response) => {
            let idObj = req.query.idObj;
            try {
                const Oprema = require('../models/oprema').default;
                const oprema = await Oprema.find({ idObj: idObj });
                res.json(oprema);
            } catch (err) {
                console.log(err);
                res.status(500).json({ error: "Greska." });
            }
        }

        kreirajNarudzbinu = async (req: express.Request, res: express.Response) => {
            let { idKor, idObj, proizvodi, racun } = req.body;
            try {
                const Narudzbina = require('../models/narudzbina').default;
                const Oprema = require('../models/oprema').default;

                for (let p of proizvodi) {
                    let oprema = await Oprema.findById(p.idOpreme);
                    if (oprema.zalihe < p.kolicina) {
                        return res.status(400).json({ error: `Nema dovoljno na stanju za ${oprema.naziv}` });
                    }
                }

                for (let p of proizvodi) {
                    await Oprema.updateOne(
                        { _id: p.idOpreme },
                        { $inc: { zalihe: -p.kolicina } }
                    );
                }

                let nova = new Narudzbina({
                    idKor,
                    idObj,
                    proizvodi,
                    racun,
                    status: 'naruceno'
                });

                await nova.save();
                res.json({ message: "Narudzbina uspesna!" });
            } catch (err) {
                console.log(err);
                res.status(500).json({ error: "Greska pri kreiranju narudzbine." });
            }
        }

        getNarudzbineKor = async (req: express.Request, res: express.Response) => {
            let idKor = req.query.idKor;
            try {
                const Narudzbina = require('../models/narudzbina').default;
                const Objekat = require('../models/objekat').default;
                const Oprema = require('../models/oprema').default;

                let narudzbine = await Narudzbina.find({ idKor: idKor });
                let result = [];

                for (let n of narudzbine) {
                    let obj = await Objekat.findById(n.idObj);
                    let detaljiProizvoda = [];
                    for (let p of n.proizvodi) {
                        let oprema = await Oprema.findById(p.idOpreme);
                        detaljiProizvoda.push({
                            naziv: oprema ? oprema.naziv : 'Nepoznat proizvod',
                            kolicina: p.kolicina
                        });
                    }

                    result.push({
                        _id: n._id,
                        naziv_objekta: obj ? obj.naziv : 'Nepoznat',
                        racun: n.racun,
                        status: n.status,
                        proizvodi: detaljiProizvoda
                    });
                }
                res.json(result);
            } catch (err) {
                console.log(err);
                res.status(500).json({ error: "Greska." });
            }
        }

        otkaziNarudzbinu = async (req: express.Request, res: express.Response) => {
            let { idNar } = req.body;
            try {
                const Narudzbina = require('../models/narudzbina').default;
                const Oprema = require('../models/oprema').default;

                let n = await Narudzbina.findById(idNar);
                if (!n || n.status !== 'naruceno') {
                    return res.status(400).json({ error: "Nije moguce otkazati narudzbinu." });
                }

                for (let p of n.proizvodi) {
                    await Oprema.updateOne(
                        { _id: p.idOpreme },
                        { $inc: { zalihe: p.kolicina } }
                    );
                }

                n.status = 'otkazano';
                await n.save();
                res.json({ message: "Narudzbina je otkazana." });
            } catch (err) {
                console.log(err);
                res.status(500).json({ error: "Greska." });
            }
        }

    getOpremaZaObjekat = async (req: express.Request, res: express.Response) => {
        let idObj = req.params.idObj;
        try {
            const Oprema = require('../models/oprema').default;
            let oprema = await Oprema.find({ idObj: idObj });
            res.json(oprema);
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Greska pri dohvatanju opreme." });
        }
    }

    dodajOpremu = async (req: express.Request, res: express.Response) => {
        let { idObj, naziv, cena, zalihe, slika, vrsta_sporta } = req.body;
        try {
            const Oprema = require('../models/oprema').default;
            let nova = new Oprema({
                idObj, naziv, cena, zalihe, slika, vrsta_sporta
            });
            await nova.save();
            res.json({ message: "Oprema je uspesno dodata!", oprema: nova });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Greska pri dodavanju opreme." });
        }
    }

    azurirajOpremu = async (req: express.Request, res: express.Response) => {
        let { _id, cena, zalihe } = req.body;
        try {
            const Oprema = require('../models/oprema').default;
            await Oprema.updateOne({ _id: _id }, { $set: { cena: cena, zalihe: zalihe } });
            res.json({ message: "Oprema uspesno azurirana!" });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Greska pri azuriranju opreme." });
        }
    }

    dodajPromociju = async (req: express.Request, res: express.Response) => {
        let { idObj, naziv, period_vazenja_od, period_vazenja_do, procenat, fiksni_popust, vrsta_sporta } = req.body;
        try {
            const Objekat = require('../models/objekat').default;
            let novaPromocija = {
                naziv, period_vazenja_od, period_vazenja_do, procenat, fiksni_popust, vrsta_sporta
            };
            await Objekat.updateOne({ _id: idObj }, { $push: { promocije: novaPromocija } });
            res.json({ message: "Promocija uspesno dodata!" });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Greska pri dodavanju promocije." });
        }
    }

    azurirajPromociju = async (req: express.Request, res: express.Response) => {
        let { idObj, idPromocije, naziv, period_vazenja_od, period_vazenja_do, procenat, fiksni_popust, vrsta_sporta } = req.body;
        try {
            const Objekat = require('../models/objekat').default;
            await Objekat.updateOne(
                { _id: idObj, "promocije._id": idPromocije },
                { $set: { 
                    "promocije.$.naziv": naziv,
                    "promocije.$.period_vazenja_od": period_vazenja_od,
                    "promocije.$.period_vazenja_do": period_vazenja_do,
                    "promocije.$.procenat": procenat,
                    "promocije.$.fiksni_popust": fiksni_popust,
                    "promocije.$.vrsta_sporta": vrsta_sporta
                  } 
                }
            );
            res.json({ message: "Promocija uspesno azurirana!" });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Greska pri azuriranju promocije." });
        }
    }

    getNarudzbineZaObjekat = async (req: express.Request, res: express.Response) => {
        let idObj = req.params.idObj;
        try {
            const Narudzbina = require('../models/narudzbina').default;
            const User = require('../models/user').default;
            let narudzbine = await Narudzbina.find({ idObj: idObj }).lean();
            
            // Popunjavanje podataka o kupcu (sportisti)
            for (let n of narudzbine) {
                let kupac = await User.findById(n.idKor);
                if (kupac) {
                    n.kupacInfo = { ime: kupac.ime, prezime: kupac.prezime, email: kupac.email };
                }
            }
            res.json(narudzbine);
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Greska pri dohvatanju narudzbina." });
        }
    }

    promeniStatusNarudzbine = async (req: express.Request, res: express.Response) => {
        let { idNarudzbine, status } = req.body;
        try {
            const Narudzbina = require('../models/narudzbina').default;
            const Oprema = require('../models/oprema').default;
            
            await Narudzbina.updateOne({ _id: idNarudzbine }, { $set: { status: status } });
            
            // Ako je status otkazano, vracamo zalihe
            if (status === 'otkazano') {
                let narudzbina = await Narudzbina.findById(idNarudzbine);
                if (narudzbina && narudzbina.proizvodi) {
                    for (let p of narudzbina.proizvodi) {
                        await Oprema.updateOne(
                            { _id: p.idOpreme }, 
                            { $inc: { zalihe: p.kolicina } }
                        );
                    }
                }
            }
            
            res.json({ message: "Status narudzbine uspesno promenjen!" });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Greska pri promeni statusa." });
        }
    }
    // ==========================================
    // IZVESTAJI
    // ==========================================


    generisiIzvestajPodatke = async (req: express.Request, res: express.Response) => {
        let idObj = req.params.idObj as string;
        let godinaStr = req.params.godina as string;
        let mesecStr = req.params.mesec as string;
        try {
            const Objekat = require('../models/objekat').default;
            const Rezervacija = require('../models/rezervacija').default;
            const Narudzbina = require('../models/narudzbina').default;
            const Oprema = require('../models/oprema').default;

            let m = parseInt(mesecStr) < 10 ? '0' + parseInt(mesecStr) : mesecStr;
            let regexDatum = new RegExp(`^${godinaStr}-${m}`);

            let objekat = await Objekat.findById(idObj);
            if (!objekat) return res.status(404).json({ error: "Objekat nije nadjen" });

            // 1. Popunjenost terena
            let daniUMesecu = new Date(parseInt(godinaStr), parseInt(mesecStr), 0).getDate();
            let radnoOdSati = parseInt(objekat.radno_vreme_od.split(':')[0]);
            let radnoDoSati = parseInt(objekat.radno_vreme_do.split(':')[0]);
            let satiDnevno = radnoDoSati - radnoOdSati;
            if (satiDnevno <= 0) satiDnevno = 12; // fallback

            let ukupnoRadnihSatiMesec = satiDnevno * daniUMesecu;
            
            // Ispravljeno na idObj i od/do
            let rezervacije = await Rezervacija.find({ 
                idObj: idObj, 
                status: { $ne: 'otkazano' }
            });

            // Fallback filtriranje po datumu (za stare zapise bez datuma ili sa drugacijim formatom)
            rezervacije = rezervacije.filter((r: any) => {
                if (r.datum && typeof r.datum === 'string') {
                    return regexDatum.test(r.datum);
                }
                return true; // ako nema datum pretpostavljamo da ulazi za sad
            });

            let popunjenostPoTerenu: any = {};
            for (let t of objekat.tereni) {
                popunjenostPoTerenu[t.naziv] = 0;
            }

            for (let r of rezervacije) {
                let rOd = parseInt(r.od.split(':')[0]);
                let rDo = parseInt(r.do.split(':')[0]);
                let trajanje = rDo - rOd;
                
                // Moramo naci ime terena preko idTeren
                let terenIdStr = r.idTeren.toString();
                let nadjeniTeren = objekat.tereni.find((t: any) => t._id.toString() === terenIdStr);
                if (nadjeniTeren && popunjenostPoTerenu[nadjeniTeren.naziv] !== undefined) {
                    popunjenostPoTerenu[nadjeniTeren.naziv] += trajanje;
                }
            }

            let rezultatiPopunjenost = [];
            for (let nazivTerena in popunjenostPoTerenu) {
                let sati = popunjenostPoTerenu[nazivTerena];
                let procenat = (sati / ukupnoRadnihSatiMesec) * 100;
                rezultatiPopunjenost.push({
                    teren: nazivTerena,
                    sati: sati,
                    procenat: procenat.toFixed(2)
                });
            }

            // 2. Promet opreme
            let narudzbine = await Narudzbina.find({ 
                idObj: idObj, 
                status: 'preuzeto'
            });

            narudzbine = narudzbine.filter((n: any) => {
                if (n.datum && typeof n.datum === 'string') {
                    return regexDatum.test(n.datum);
                }
                return true; // ako nema datum, prikazace se
            });

            let prometPoOpremi: any = {};
            for (let n of narudzbine) {
                for (let p of n.proizvodi) {
                    if (!prometPoOpremi[p.idOpreme]) {
                        prometPoOpremi[p.idOpreme] = { kolicina: 0, prihod: 0 };
                    }
                    prometPoOpremi[p.idOpreme].kolicina += p.kolicina;
                }
            }

            let rezultatiPromet = [];
            for (let idOpreme in prometPoOpremi) {
                let oprema = await Oprema.findById(idOpreme);
                if (oprema) {
                    let kolicina = prometPoOpremi[idOpreme].kolicina;
                    let prihod = kolicina * oprema.cena;
                    rezultatiPromet.push({
                        naziv: oprema.naziv,
                        kolicina: kolicina,
                        prihod: prihod
                    });
                }
            }

            res.json({
                popunjenost: rezultatiPopunjenost,
                promet: rezultatiPromet
            });

        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Greska pri generisanju izvestaja." });
        }
    }

    // ==========================================
    // OSTALE METODE
    // ==========================================


    getObjekti = async (req: express.Request, res: express.Response) => {
        try {
            const Objekat = require('../models/objekat').default;
            const objekti = await Objekat.find({});
            res.json(objekti);
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Greska pri dohvatanju objekata" });
        }
    }}