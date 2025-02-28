import { Router } from 'express';
import poolRoutes from '@/routes/poolRoutes';
import recipientRoutes from '@/routes/recipientRoutes';
const router = Router();

router.use('/pools', poolRoutes);
router.use('/recipient', recipientRoutes);

export default router;
