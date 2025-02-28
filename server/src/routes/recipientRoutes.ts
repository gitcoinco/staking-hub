import { getRewardsForRecipient } from "@/controllers/recipientController";
import { Router } from "express";

const router = Router();

/**
 * @swagger
 * /recipient/rewards:
 *   post:
 *     tags:
 *       - recipient
 *     summary: Retrieves rewards for a recipient
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
 *               recipientId:
 *                 type: string
 *                 description: The recipient ID to filter rewards
 *                 example: "0x5cdb35fADB8262A3f88863254c870c2e6A848CcA"
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
 *         description: Successfully retrieved rewards for recipient
 *       400:
 *         description: Invalid request parameters
 *       500:
 *         description: Internal server error
 */
router.post('/rewards', getRewardsForRecipient);

export default router;
