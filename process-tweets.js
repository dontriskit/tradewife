import { readFileSync, writeFileSync } from 'fs';

const processTweets = () => {
  try {
    const rawData = readFileSync('tweets_2025-01-17T06-21-18.624Z.json');
    const tweets = JSON.parse(rawData);
    
    const textTweets = tweets.map(tweet => ({
      text: tweet.text,
      retweets: tweet.retweets,
      likes: tweet.likes
    }));

    writeFileSync('processed_tweets3.json', JSON.stringify(textTweets, null, 2));
    
    console.log('Successfully processed tweets and saved to processed_tweets3.json');
    return textTweets;
  } catch (error) {
    console.log('Error processing tweets:', error);
    return [];
  }
};

processTweets();
