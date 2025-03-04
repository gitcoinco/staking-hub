import { Router } from 'express';
import poolRoutes from '@/routes/poolRoutes';
import recipientRoutes from '@/routes/recipientRoutes';
import authRoutes from '@/auth/siwe';
const router = Router();

router.use('/pools', poolRoutes);
router.use('/recipient', recipientRoutes);
router.use('/auth', authRoutes);
export default router;
