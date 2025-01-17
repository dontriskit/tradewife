import { Router } from "express";
import { searchTwitter } from "../controllers/search";

const router = Router();

/**
 * @route GET /api/search
 * @query {string} q - Search query
 * @query {number} [limit] - Maximum number of tweets to fetch (1-500)
 * @query {string} [mode] - Search mode ('Latest' or 'Top')
 * @returns {Object} JSON response with tweets
 */
router.get("/", searchTwitter);

export default router;
