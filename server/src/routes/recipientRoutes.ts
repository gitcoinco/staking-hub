import { getRewardsForRecipient } from "@/controllers/recipientController";
import { Router } from "express";

const router = Router();

/**
 * @swagger
 * /recipient/{recipientId}/rewards:
 *   post:
 *     tags:
 *       - recipient
 *     summary: Retrieves rewards for a recipient
 *     parameters:
 *       - in: path
 *         name: recipientId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the recipient
 *         example: "0x5cdb35fADB8262A3f88863254c870c2e6A848CcA"
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
 *         description: Successfully retrieved rewards for recipient
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
 *                   proof:
 *                     type: array
 *                     items:
 *                       type: string
 *       400:
 *         description: Invalid request parameters
 *       500:
 *         description: Internal server error
 */
router.post('/rewards', getRewardsForRecipient);

export default router;
