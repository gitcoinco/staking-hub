import { Router } from 'express';
import poolRoutes from '@/routes/poolRoutes';
import stakerRoutes from '@/routes/stakerRoutes';
const router = Router();

router.use('/pools', poolRoutes);
router.use('/stakers', stakerRoutes);

export default router;
