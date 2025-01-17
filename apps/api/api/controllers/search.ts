import { type Request, type Response } from "express";
import { SearchMode } from "agent-twitter-client";
import { twitterScraper } from "../../scrape/twitter";
import { z } from "zod";

// Input validation schema
const searchQuerySchema = z.object({
  query: z.string().min(1).max(500),
  limit: z.number().int().min(1).max(500).optional(),
  mode: z.enum(["Latest", "Top"]).optional(),
});

export async function searchTwitter(
  req: Request,
  res: Response,
): Promise<Response> {
  try {
    // Validate and transform query parameters
    const validatedQuery = searchQuerySchema.parse({
      query: req.query.q,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      mode: req.query.mode,
    });

    // Transform the mode string to SearchMode enum
    const searchMode =
      validatedQuery.mode === "Top" ? SearchMode.Top : SearchMode.Latest;

    const tweets = await twitterScraper.searchTweets({
      query: validatedQuery.query,
      limit: validatedQuery.limit,
      mode: searchMode,
    });

    return res.status(200).json({
      success: true,
      data: tweets,
      metadata: {
        query: validatedQuery.query,
        count: tweets.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid input parameters",
        details: error.errors,
      });
    }

    console.error("Search error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
