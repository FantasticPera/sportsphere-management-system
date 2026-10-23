import express from 'express';
import { AdminController } from '../controllers/admin.controller';

const adminRouter = express.Router();

adminRouter.route('/korisnici-cekanje').get(
    (req, res) => new AdminController().getKorisniciNaCekanju(req, res)
)

adminRouter.route('/korisnici/status').put(
    (req, res) => new AdminController().azurirajStatusKorisnika(req, res)
)

adminRouter.route('/korisnici-aktivni').get(
    (req, res) => new AdminController().getSviAktivniKorisnici(req, res)
)

adminRouter.route('/korisnici/azuriraj').put(
    (req, res) => new AdminController().azurirajKorisnika(req, res)
)

adminRouter.route('/objekti-cekanje').get(
    (req, res) => new AdminController().getObjektiNaCekanju(req, res)
)

adminRouter.route('/objekti/status').put(
    (req, res) => new AdminController().azurirajStatusObjekta(req, res)
)

adminRouter.route('/treneri').get(
    (req, res) => new AdminController().getSviTreneri(req, res)
)

adminRouter.route('/treneri/deaktiviraj').put(
    (req, res) => new AdminController().deaktivirajTrenera(req, res)
)

adminRouter.route('/sport/dodaj').post(
    (req, res) => new AdminController().dodajSport(req, res)
)

export default adminRouter;
