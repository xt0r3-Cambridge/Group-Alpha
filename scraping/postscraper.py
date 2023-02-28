import snscrape.modules.twitter as sntwitter
import pandas as pd
import json
import os


def twitter_read(query, num, name):
    # run ONLY once to get the raw content

    if os.path.exists(name + ".csv"):

        os.remove(name + ".csv")
        tmp = name + ".csv"
        print(f"The repeated file {tmp} has been deleted.")

    if os.path.exists(name + ".json"):

        os.remove(name + ".json")
        tmp = name + ".json"
        print(f"The repeated file {tmp} has been deleted.")

    tweets = []

    for i, tweet in enumerate(sntwitter.TwitterSearchScraper(query).get_items()):
        if num <= 0:
            break
        else:
            if tweet.lang == 'en':
                tweets.append([tweet.date, tweet.id, tweet.url, tweet.user.username, tweet.sourceLabel, tweet.user.location, tweet.rawContent, tweet.likeCount, tweet.retweetCount])
                num -= 1

    df = pd.DataFrame(tweets, columns=['Data', 'ID', 'url', 'username', 'source', 'location', 'content', 'num_of_likes', 'num_of_retweet'])
    df.to_csv(name + ".csv", mode='a')


def twitter_preprocessing(text):
    # eliminating emojis

    text = text.encode('ascii', 'ignore').decode()

    return text


def twitter_scraper(query, num, name):
    """
        the method allows you to type any keyword and any time range you want from twitter

        query: if you want to search by keyword, using a string, for example query = "keyword1 AND keyword2",
        if you want to add a time range, the example is query = "(keyword1 AND keyword2) since:2022-07-01 until: 2022-07-02"

        num: number of post text

        name: the name of json file and csv file, the output file would be name.csv and name.json

        the method returns both a json file("text": "content") and a csv file(this file contains more information about post text)
    """
    # query: if you want to search by keyword, using a string, for example query = "keyword1 AND keyword2",
    # if you want to add a time range, the example is query = "(keyword1 AND keyword2) since:2022-07-01 until: 2022-07-02"

    twitter_read(query, num, name)
    df = pd.read_csv(name + ".csv", encoding='unicode_escape')
    df['location'] = df['location'].fillna('Unknown')
    df['processed_content'] = df['content'].apply(twitter_preprocessing)
    df.to_csv(name + ".csv", mode='w')
    data = {'text': df['processed_content'].to_string()}
    with open(name + ".json", 'w') as f:
        json.dump(data, f)


twitter_scraper("AI", 1000, "twitter")
