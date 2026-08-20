import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { create, getBanners, updateBanner, deleteBanner } from '../controllers/banner.controller.js';

const router = express.Router();

router.post('/create', verifyToken, create);
router.get('/getbanners', getBanners);
router.put('/update/:bannerId', verifyToken, updateBanner);
router.delete('/delete/:bannerId', verifyToken, deleteBanner);

export default router;
