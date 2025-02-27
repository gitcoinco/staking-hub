import { Router } from 'express';
import poolRoutes from '@/routes/poolRoutes';

const router = Router();

router.use('/pools', poolRoutes);

export default router;
