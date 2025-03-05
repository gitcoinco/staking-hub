import { calculate } from '@/controllers/calculateController';
import { createPool, getPoolRewards, getPoolStakes } from '@/controllers/poolController';
import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /pools:
 *   post:
 *     tags:
 *       - pool
 *     summary: Creates a pool
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
 *                 example: "673"  # Example of poolId
 *               chainId:
 *                 type: number
 *                 description: The chain ID associated with the pool
 *                 example: 11155111 # Example of chainId (Sepolia)
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
 */
router.post('/', createPool);

/**
 * @swagger
 * /pools/calculate:
 *   post:
 *     tags:
 *       - pool
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
 *       500:
 *         description: Internal server error
 */
router.post('/calculate', calculate);

/**
 * @swagger
 * /pools/{chainId}/{poolId}/rewards:
 *   get:
 *     tags:
 *       - pool
 *     summary: Retrieves pool rewards for the given chainId and poolId
 *     parameters:
 *       - in: path
 *         name: chainId
 *         required: true
 *         schema:
 *           type: number
 *         description: The chain ID associated with the pool
 *         example: 42161
 *       - in: path
 *         name: poolId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the pool
 *         example: "609"
 *       - in: query
 *         name: recipientId
 *         required: false
 *         schema:
 *           type: string
 *         description: Optional recipient ID to filter pool rewards
 *         example: "0x5cdb35fADB8262A3f88863254c870c2e6A848CcA"
 *     responses:
 *       200:
 *         description: Successfully retrieved pool rewards
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   recipientId:
 *                     type: string
 *                   amount:
 *                     type: string
 *       400:
 *         description: Invalid poolId, chainId, or recipientId format
 *       404:
 *         description: Pool or recipient not found
 *       500:
 *         description: Internal server error
 */
router.get('/:chainId/:poolId/rewards', getPoolRewards);

/**
 * @swagger
 * /pools/stakes:
 *   get:
 *     tags:
 *       - pool
 *     summary: Retrieves pool stakes for the given chainId and alloPoolId
 *     parameters:
 *       - in: query
 *         name: chainId
 *         required: false
 *         schema:
 *           type: number
 *         description: The chain ID associated with the pool
 *         example: 11155111
 *       - in: query
 *         name: alloPoolId
 *         required: false
 *         schema:
 *           type: string
 *         description: The ID of the pool
 *         example: "673"
 *     responses:
 *       200:
 *         description: Successfully retrieved pool stakes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   stakes:
 *                     type: array
 *                     items:   
 *                       type: object
 *                       properties:
 *                         chainId:
 *                           type: number
 *                         amount:
 *                           type: string
 *                         poolId:
 *                           type: string
 *                         recipient:
 *                           type: string
 *                         sender:
 *                           type: string
 *                         blockTimestamp:
 *                           type: string
 *                   totalStakesByAnchorAddress:
 *                     type: object
 *                     properties:
 *                       anchorAddress:
 *                         type: string
 *                       amount:
 *                         type: string
 *                   chainId:
 *                     type: number
 *                   id:
 *                     type: string
 *                   roundMetadata:
 *                     type: object
 *                   applications:
 *                     type: array
 *                     items:
 *                       type: object
 *       400:
 *         description: Invalid chainId or alloPoolId format
 *       500:
 *         description: Internal server error
 */
router.get('/:chainId/:poolId/stakes', getPoolStakes);

export default router;