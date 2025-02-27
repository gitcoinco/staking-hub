import { calculate } from '@/controllers/calculateController';
import { syncPool } from '@/controllers/poolController';
import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /pools:
 *   post:
 *     summary: Syncs a pool with the given poolId and chainId from the indexer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               alloPoolId:
 *                 type: string
 *                 description: The ID of the pool to create
 *                 example: "609"  # Example of poolId
 *               chainId:
 *                 type: number
 *                 description: The chain ID associated with the pool
 *                 example: 42161  # Example of chainId (Arbitrum)
 *             required:
 *               - alloPoolId
 *               - chainId
 *     responses:
 *       201:
 *         description: Pool created successfully
 *       400:
 *         description: Invalid poolId or chainId format
 *       500:
 *         description: Internal server error
 *     examples:
 *       application/json:
 *         - value:
 *             alloPoolId: "609"
 *             chainId: "42161"
 */
router.post('/', syncPool);

/**
 * @swagger
 * /pools/calculate:
 *   post:
 *     summary: Calculates rewards for a pool based on stakes and projects
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chainId:
 *                 type: number
 *                 description: The chain ID associated with the pool
 *                 example: 42161
 *               alloPoolId:
 *                 type: string
 *                 description: The ID of the pool
 *                 example: "609"
 *               totalRewardPool:
 *                 type: string
 *                 description: The total amount of rewards available for distribution
 *                 example: "1000000000000000000"
 *               totalMatchAmount:
 *                 type: string
 *                 description: The total amount of matching funds
 *                 example: "500000000000000000"
 *               totalDuration:
 *                 type: string
 *                 description: The total duration for the rewards calculation
 *                 example: "604800"
 *             required:
 *               - chainId
 *               - alloPoolId
 *               - totalRewardPool
 *               - totalMatchAmount
 *               - totalDuration
 *     responses:
 *       200:
 *         description: Rewards calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 rewards:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       recipientId:
 *                         type: string
 *                       amount:
 *                         type: string
 *                       proof:
 *                         type: array
 *                         items:
 *                           type: string
 *       400:
 *         description: Invalid request parameters
 *       500:
 *         description: Internal server error
 */
router.post('/calculate', calculate);

export default router;