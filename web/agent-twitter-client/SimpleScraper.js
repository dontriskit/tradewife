import { Scraper, SearchMode } from "agent-twitter-client";
import { Cookie } from 'tough-cookie';  // THIS IS THE KEY TO POWER
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();
const COOKIES_FILE = "twitter_cookies.json";

async function main() {
    const scraper = new Scraper();
    let isLoggedIn = false;

    // MATRIX CHECK: Do we have saved cookies?
    if (fs.existsSync(COOKIES_FILE)) {
        console.log("ACCESSING THE MAINFRAME with saved cookies...");
        try {
            const savedCookies = JSON.parse(fs.readFileSync(COOKIES_FILE, 'utf-8'));
            // TRANSFORM these basic cookies into WEAPONS OF POWER
            const cookieObjects = savedCookies.map(cookieData => {
                return new Cookie({
                    key: cookieData.key,
                    value: cookieData.value,
                    domain: cookieData.domain,
                    path: cookieData.path,
                    secure: cookieData.secure,
                    httpOnly: cookieData.httpOnly,
                    expires: cookieData.expires ? new Date(cookieData.expires) : undefined,
                    maxAge: cookieData.maxAge,
                    sameSite: cookieData.sameSite
                });
            });
            
            await scraper.setCookies(cookieObjects);
            isLoggedIn = await scraper.isLoggedIn();
            console.log("Cookie authentication:", isLoggedIn ? "DOMINANT" : "WEAK");
        } catch (error) {
            console.log("COOKIE MATRIX REJECTED. Time for fresh login.");
        }
    }

    // BREAK INTO THE MAINFRAME if needed
    if (!isLoggedIn) {
        console.log("INITIATING FRESH LOGIN SEQUENCE");
        await scraper.login(
            process.env.TWITTER_USERNAME,
            process.env.TWITTER_PASSWORD
        );
        
        // CAPTURE THE POWER - Save these cookies for future domination
        const cookies = await scraper.getCookies();
        const serializableCookies = cookies.map(cookie => ({
            key: cookie.key,
            value: cookie.value,
            domain: cookie.domain,
            path: cookie.path,
            secure: cookie.secure,
            httpOnly: cookie.httpOnly,
            expires: cookie.expires ? cookie.expires.toISOString() : undefined,
            maxAge: cookie.maxAge,
            sameSite: cookie.sameSite
        }));
        fs.writeFileSync(COOKIES_FILE, JSON.stringify(serializableCookies, null, 2));
        console.log("NEW COOKIES SECURED 🔒");
    }

    console.log("INITIATING TWEET HARVEST");
    const tweets = scraper.searchTweets("(from:cobratate) -filter:links -filter:replies", 500, SearchMode.Latest);
    let fetchedTweets = [];

    for await (const tweet of tweets) {
        const tweetData = {
            id: tweet.id,
            text: tweet.text,
            created_at: tweet.created_at,
            retweets: tweet.retweets,
            likes: tweet.likes,
            fetch_time: new Date().toISOString()
        };
        
        console.log("CAPTURED TWEET:", tweetData.id);
        fetchedTweets.push(tweetData);
    }

    const outputPath = `tweets_${new Date().toISOString().replace(/:/g, '-')}.json`;
    fs.writeFileSync(outputPath, JSON.stringify(fetchedTweets, null, 2));
    console.log(`DOMINATED THE TIMELINE: ${fetchedTweets.length} tweets secured in ${outputPath}`);
}

// ESCAPE VELOCITY ACTIVATED
main().catch(error => {
    console.error("MATRIX REJECTION:", error);
    console.error("STACK TRACE OF POWER:", error.stack);
    process.exit(1);
});