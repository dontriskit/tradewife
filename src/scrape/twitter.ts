import { Scraper, SearchMode } from "agent-twitter-client";
import { Cookie } from "tough-cookie";
import { config } from "dotenv";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

config();

interface SearchParams {
  query: string;
  limit?: number;
  mode?: SearchMode;
}

interface Tweet {
  id: string;
  text: string;
  created_at: string;
  retweets: number;
  likes: number;
  fetch_time: string;
}

export class TwitterScraper {
  private scraper: Scraper;
  private readonly COOKIES_FILE = "twitter_cookies.json";

  constructor() {
    this.scraper = new Scraper();
  }

  private async authenticate(): Promise<boolean> {
    let isLoggedIn = false;

    if (existsSync(this.COOKIES_FILE)) {
      try {
        const savedCookies = JSON.parse(
          readFileSync(this.COOKIES_FILE, "utf-8"),
        );
        const cookieObjects = savedCookies.map((cookieData: any) => {
          return new Cookie({
            key: cookieData.key,
            value: cookieData.value,
            domain: cookieData.domain,
            path: cookieData.path,
            secure: cookieData.secure,
            httpOnly: cookieData.httpOnly,
            expires: cookieData.expires
              ? new Date(cookieData.expires)
              : undefined,
            maxAge: cookieData.maxAge,
            sameSite: cookieData.sameSite,
          });
        });

        await this.scraper.setCookies(cookieObjects);
        isLoggedIn = await this.scraper.isLoggedIn();
      } catch (error) {
        console.error("Failed to authenticate with saved cookies:", error);
      }
    }

    if (!isLoggedIn) {
      const username = process.env.TWITTER_USERNAME;
      const password = process.env.TWITTER_PASSWORD;

      if (!username || !password) {
        throw new Error(
          "Twitter credentials not found in environment variables",
        );
      }

      await this.scraper.login(username, password);

      const cookies = await this.scraper.getCookies();
      const serializableCookies = cookies.map((cookie: any) => ({
        key: cookie.key,
        value: cookie.value,
        domain: cookie.domain,
        path: cookie.path,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        expires: cookie.expires ? cookie.expires.toISOString() : undefined,
        maxAge: cookie.maxAge,
        sameSite: cookie.sameSite,
      }));
      writeFileSync(
        this.COOKIES_FILE,
        JSON.stringify(serializableCookies, null, 2),
      );
    }

    return true;
  }

  public async searchTweets(params: SearchParams): Promise<Tweet[]> {
    await this.authenticate();

    const tweets = this.scraper.searchTweets(
      params.query,
      params.limit || 100,
      params.mode || SearchMode.Latest,
    );

    const fetchedTweets: Tweet[] = [];
    for await (const tweet of tweets) {
      const tweetData: Tweet = {
        id: tweet.id as string,
        text: tweet.text as string,
        created_at: tweet.timestamp?.toString() as string,
        retweets: tweet.retweets as number,
        likes: tweet.likes as number,
        fetch_time: new Date().toISOString(),
      };
      fetchedTweets.push(tweetData);
    }

    return fetchedTweets;
  }
}

export const twitterScraper = new TwitterScraper();
