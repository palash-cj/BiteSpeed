import express from 'express';
import { identifyContactController } from './controllers/contact.controller';

const router = express.Router();

router.post('/identify', identifyContactController);

export default router;
