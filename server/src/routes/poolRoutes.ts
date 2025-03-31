import { calculate } from '@/controllers/calculateController';
import {
  createPool,
  getPoolSummary,
  getAllPoolsOverview,
} from '@/controllers/poolController';
import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /pools:
 *   post:
 *     tags:
 *       - pool
 *     summary: Creates a pool
 *     security:
 *       - AdminApiKey: []
 *     parameters:
 *       - in: header
 *         name: X-Admin-API-Key
 *         schema:
 *           type: string
 *         required: true
 *         description: Admin API key for authentication
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
 *                 example: 42161 # Example of chainId (Sepolia)
 *             required:
 *               - alloPoolId
 *               - chainId
 *     responses:
 *       201:
 *         description: Pool created successfully
 *       400:
 *         description: Invalid poolId or chainId format
 *       401:
 *         description: Unauthorized - Invalid or missing admin API key
 *       500:
 *         description: Internal server error
 */
router.post('/', createPool);

/**
 * @swagger
 * /pools/calculate:
 *   post:
 *     tags:
 *       - pool
 *     summary: Calculates rewards for a pool based on stakes and projects
 *     security:
 *       - AdminApiKey: []
 *     parameters:
 *       - in: header
 *         name: X-Admin-API-Key
 *         schema:
 *           type: string
 *         required: true
 *         description: Admin API key for authentication
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
 *             required:
 *               - chainId
 *               - alloPoolId
 *               - totalRewardPool
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
 *                 merkleRoot:
 *                   type: string
 *                 rewards:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       recipientId:
 *                         type: string
 *                       amount:
 *                         type: string
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized - Invalid or missing admin API key
 *       500:
 *         description: Internal server error
 */
router.post('/calculate', calculate);

/**
 * @swagger
 * /pools/{chainId}/{alloPoolId}/summary:
 *   get:
 *     tags:
 *       - pool
 *     summary: Retrieves pool application metadata, total stakes per application and all stakes
 *     parameters:
 *       - in: path
 *         name: chainId
 *         required: true
 *         schema:
 *           type: number
 *         description: The chain ID associated with the pool
 *         example: 42161
 *       - in: path
 *         name: alloPoolId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the pool
 *         example: "609"
 *     responses:
 *       200:
 *         description: Successfully retrieved pool stakes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stakes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       chainId:
 *                         type: number
 *                       amount:
 *                         type: string
 *                       poolId:
 *                         type: string
 *                       recipient:
 *                         type: string
 *                       sender:
 *                         type: string
 *                       blockTimestamp:
 *                         type: string
 *                 totalStakesByAnchorAddress:
 *                   type: object
 *                   properties:
 *                     anchorAddress:
 *                       type: string
 *                     amount:
 *                       type: string
 *                 chainId:
 *                   type: number
 *                 id:
 *                   type: string
 *                 roundMetadata:
 *                   type: object
 *                 applications:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Invalid chainId or alloPoolId format
 *       500:
 *         description: Internal server error
 */
router.get('/:chainId/:alloPoolId/summary', getPoolSummary);

/**
 * @swagger
 * /pools/overview:
 *   get:
 *     tags:
 *       - pool
 *     summary: Retrieves all pools overview, approvedProjectCount and total staked
 *     responses:
 *       200:
 *         description: Successfully retrieved all pools overview
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   totalStaked:
 *                     type: number
 *                   approvedProjectCount:
 *                     type: number
 *                   chainId:
 *                     type: number
 *                   roundMetadata:
 *                     type: object
 *                   roundMetadataCid:
 *                     type: string
 *                   donationsStartTime:
 *                     type: string
 *                   donationsEndTime:
 *                     type: string
 */
router.get('/overview', getAllPoolsOverview);

export default router;
