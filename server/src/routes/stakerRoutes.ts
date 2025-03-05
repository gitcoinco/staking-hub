import { getRewardsForStaker, getStakerOverview } from "@/controllers/stakerController";
import { Router } from "express";

const router = Router();

/**
 * @swagger
 * /stakers/{staker}/rewards:
 *   post:
 *     tags:
 *       - staker
 *     summary: Retrieves rewards for a staker
 *     parameters:
 *       - in: path
 *         name: staker
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the staker
 *         example: "0xE7eB5D2b5b188777df902e89c54570E7Ef4F59CE"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               signature:
 *                 type: string
 *                 description: Signature of the sender which should be a manager of the pool
 *                 example: "0xdeadbeef"
 *               alloPoolId:
 *                 type: string
 *                 description: Optional allo pool ID to filter rewards
 *                 example: "609"
 *                 nullable: true
 *               chainId:
 *                 type: number
 *                 description: Optional chain ID to filter rewards
 *                 example: 42161
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Successfully retrieved rewards for staker
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   stakerId:
 *                     type: string
 *                   amount:
 *                     type: string
 *                   proof:
 *                     type: array
 *                     items:
 *                       type: string
 *       400:
 *         description: Invalid request parameters
 *       500:
 *         description: Internal server error
 */
router.post('/:staker/rewards', getRewardsForStaker);

/**
 * @swagger
 * /stakers/{staker}/overview:
 *   get:
 *     tags:
 *       - staker
 *     summary: Returns currently staked pools, the actual staked amount and the rewards earned for a staker
 *     parameters:  
 *       - in: path
 *         name: staker
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the staker
 *         example: "0xE7eB5D2b5b188777df902e89c54570E7Ef4F59CE"
 *     responses:
 *       200:
 *         description: Successfully retrieved overview for staker
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentlyStaked:
 *                   type: number
 *                 poolsOverview:
 *                   type: array
 *                   items:
 *                     type: object
 *                 stakes:
 *                   type: array
 *                   items:
 *                     type: object
 *                 rewards:
 *                   type: array
 *                   items:
 *                     type: object
 *                 claims:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Invalid request parameters
 *       500:
 *         description: Internal server error
 */
router.get('/:staker/overview', getStakerOverview);

export default router;
