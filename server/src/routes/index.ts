import { Router } from 'express';
import poolRoutes from '@/routes/poolRoutes';
import stakerRoutes from '@/routes/stakerRoutes';
import authRoutes from '@/auth/siwe';
const router = Router();

router.use('/pools', poolRoutes);
router.use('/stakers', stakerRoutes);
router.use('/auth', authRoutes);

export default router;
