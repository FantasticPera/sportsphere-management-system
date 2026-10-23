import express from 'express';
import { UserController } from '../controllers/user.controller';
import multer from 'multer';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
});
const upload = multer({ storage: storage });

const userRouter = express.Router();
const controller = new UserController();

// ==========================================
// AUTH I PROFIL
// ==========================================
userRouter.route('/login').post((req, res) => controller.login(req, res));
userRouter.route('/register').post(upload.single('slika'), (req, res) => controller.register(req, res));
userRouter.route('/generateResetToken').post((req, res) => controller.generateResetToken(req, res));
userRouter.route('/resetPassword').post((req, res) => controller.resetPassword(req, res));
userRouter.route('/clearToken').post((req, res) => controller.clearToken(req, res));
userRouter.route('/checkToken').post((req, res) => controller.checkToken(req, res));
userRouter.route('/getUserByUsername').get((req, res) => controller.getUserByUsername(req, res));
userRouter.route('/updateProfile').post(upload.single('slika'), (req, res) => controller.updateProfile(req, res));
userRouter.route('/changePassword').post((req, res) => controller.changePassword(req, res));

// ==========================================
// OBJEKTI, TERENI I SPORTOVI
// ==========================================
userRouter.route('/pocetna-info').get((req, res) => controller.getPocetnaInfo(req, res));
userRouter.route('/getAllSports').get((req, res) => controller.getAllSports(req, res));
userRouter.route('/gradovi').get((req, res) => controller.getGradovi(req, res));
userRouter.route('/search').post((req, res) => controller.searchObjekti(req, res));
userRouter.route('/objekat').get((req, res) => controller.getObjekat(req, res));
userRouter.route('/objekti/dodaj').post((req, res) => controller.kreirajObjekat(req, res));
userRouter.route('/tereni/dodaj').post((req, res) => controller.dodajTeren(req, res));
userRouter.route('/objekti/dodaj-json').post((req, res) => controller.dodajObjekteIzJsona(req, res));

// ==========================================
// TRENERI
// ==========================================
userRouter.route('/treneri/pretraga').get((req, res) => controller.pretragaTrenera(req, res));
userRouter.route('/treneri/trener').get((req, res) => controller.getTrener(req, res));

// ==========================================
// REZERVACIJE I TRENINZI
// ==========================================
userRouter.route('/getUserReservations').get((req, res) => controller.getUserReservations(req, res));
userRouter.route('/getKalendarZauzeca').get((req, res) => controller.getKalendarZauzeca(req, res));
userRouter.route('/rezervisi').post((req, res) => controller.rezervisiTeren(req, res));
userRouter.route('/otkaziRezervaciju').post((req, res) => controller.otkaziRezervaciju(req, res));
userRouter.route('/treninzi/korisnik').get((req, res) => controller.getUserTreninzi(req, res));
userRouter.route('/treninzi/zakazi').post((req, res) => controller.zakaziTrening(req, res));

// ==========================================
// OGLASI I ZAHTEVI
// ==========================================
userRouter.route('/oglasi/aktivni').get((req, res) => controller.dohvatiOglase(req, res));
userRouter.route('/oglasi/kreiraj').post((req, res) => controller.kreirajOglas(req, res));
userRouter.route('/rezervacije/dostupne-za-oglas').get((req, res) => controller.rezervacijeZaOglas(req, res));
userRouter.route('/zahtevi/posalji').post((req, res) => controller.posaljiZahtevOglas(req, res));
userRouter.route('/zahtevi/moji').get((req, res) => controller.mojiZahtevi(req, res));
userRouter.route('/zahtevi/za-oglas').get((req, res) => controller.zahteviZaOglas(req, res));
userRouter.route('/zahtevi/obradi').post((req, res) => controller.obradiZahtev(req, res));

// ==========================================
// OPREMA I NARUDZBINE (KUPAC)
// ==========================================
userRouter.route('/oprema').get((req, res) => controller.getOprema(req, res));
userRouter.route('/narudzbine/kreiraj').post((req, res) => controller.kreirajNarudzbinu(req, res));
userRouter.route('/narudzbine/korisnik').get((req, res) => controller.getNarudzbineKor(req, res));
userRouter.route('/narudzbine/otkazi').post((req, res) => controller.otkaziNarudzbinu(req, res));

// ==========================================
// RADNIK (UPRAVLJANJE)
// ==========================================
userRouter.route('/objekti/radnik').get((req, res) => controller.getObjektiRadnika(req, res));
userRouter.route('/radnik/rezervacije').get((req, res) => controller.getRezervacijeRadnika(req, res));
userRouter.route('/radnik/rezervacija/potvrdi').post((req, res) => controller.potvrdiDolazak(req, res));
userRouter.route('/radnik/rezervacija/odjavi').post((req, res) => controller.odjaviDolazak(req, res));
userRouter.route('/radnik/oprema/:idObj').get((req, res) => controller.getOpremaZaObjekat(req, res));
userRouter.route('/radnik/oprema/dodaj').post((req, res) => controller.dodajOpremu(req, res));
userRouter.route('/radnik/oprema/azuriraj').put((req, res) => controller.azurirajOpremu(req, res));
userRouter.route('/radnik/promocija/dodaj').post((req, res) => controller.dodajPromociju(req, res));
userRouter.route('/radnik/promocija/azuriraj').put((req, res) => controller.azurirajPromociju(req, res));
userRouter.route('/radnik/narudzbine/:idObj').get((req, res) => controller.getNarudzbineZaObjekat(req, res));
userRouter.route('/radnik/narudzbine/status').put((req, res) => controller.promeniStatusNarudzbine(req, res));
userRouter.route('/radnik/izvestaj/:idObj/:godina/:mesec').get((req, res) => controller.generisiIzvestajPodatke(req, res));

export default userRouter;