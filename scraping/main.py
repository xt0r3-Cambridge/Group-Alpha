from time import sleep
from urllib.request import urlopen
from bs4 import BeautifulSoup
import nltk
from selenium import webdriver
from selenium.webdriver.common.by import By
import json
from argparse import ArgumentParser

# Example URLs:
# https://www.technologyreview.com/author/melissa-heikkila/
# https://www.technologyreview.com/author/niall-firth/

# Parsing functionality for command line arguments
parser = ArgumentParser()
parser.add_argument("-f", "--file", dest="filename",
                    help="write scraped data to FILE in JSON format", metavar="FILE", required=False)
parser.add_argument("-u", "--urls", dest="urls",
                    help="The URLs you want to scrape the data from. At the moment, only technologyreview.com is supported.",
                    metavar="url_1,url_2,...,url_n")
parser.add_argument("-v", "--verbose", dest="verbose",
                    help="Provide additional logging information", action='store_true')

args = parser.parse_args()
urls = [line.strip() for line in args.urls.split(",")] if args.urls else None

"""Print text only if the verbose flag is set. 
    Defining the method this way ensures that verbosity won't be changed during the 
    program runtime, even if the verbose flag gets changed somehow.
"""
verboseprint = print if args.verbose else lambda *a, **k: None

def scraping(url):
    """Scraping text from articles.

    Scraping only html text and make them into word tokens.

    Args:
        url: the url of the target webpage

    Returns:
        A dict mapping keys to the corresponding list of tokens and list of list of tokens
        for example:

        {'subheadings': [['Subheading','One'],['Subheading','Two'],['Subheading','Three']],
         'text': ['Hello','World','!','Hi','Python','!']}

    Raises:
        ValueError: An error occurred when a very weird url is given
        URLError: An error occurred when the url can't be opened
        HTTPError: An error occurred when the page is not found
    """
    pass

    html = urlopen(url).read()
    soup = BeautifulSoup(html, features="html.parser")

    # get headlines
    headline_list = []
    heading_tags = ["h1", "h2", "h3"]
    for tags in soup.find_all(heading_tags):
        headline_list.append(nltk.word_tokenize(tags.text.strip()))

    # kill all script and style elements
    for script in soup(['script', 'style', 'h1', 'h2', 'h3', 'title']):
        script.decompose()  # rip it out

    # get text
    text = ' '.join(soup.stripped_strings)

    # break into lines and remove leading and trailing space on each
    lines = (line.strip() for line in text.splitlines())
    # break multi-headlines into a line each
    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
    # drop blank lines
    text = '\n'.join(chunk for chunk in chunks if chunk)

    nltk_tokens = nltk.word_tokenize(text)

    res = {"subheadings": headline_list, "text": nltk_tokens}
    return res


def scraping_urls_from_technology_review(url):
    def scraping_text_from_technology_review(inner_urls):
        html = urlopen(inner_urls).read()
        soup = BeautifulSoup(html, features="html.parser")
        # get text
        ps = soup.find_all("p")
        res = []
        for p in ps:
            res += nltk.word_tokenize(p.text)
        return {"text": res}

    driver = webdriver.Chrome()
    driver.maximize_window()
    driver.implicitly_wait(26)
    driver.get(url)

    while 1:
        try:
            driver.find_element(By.ID, 'content-list__load-more-btn').click()
            verboseprint("Loading news...")
            sleep(0.5)
        except:
            verboseprint("Loaded all news")
            
            urls = []
            headings = []
            h3s = driver.find_elements(By.CLASS_NAME, "teaserItem__title--32O7a")
            
            verboseprint("Extracting headlines...")
            
            for x in h3s:
                urls.append(x.find_element(By.TAG_NAME, "a").get_attribute("href"))
                headings.append(x.text)
                
            verboseprint("Extracting text... This may take a while")

            articles = []
            for i in range(len(urls)):
                articles.append(scraping_text_from_technology_review(urls[i]))
                articles[i]['main_heading'] = headings[i]
                
            return articles


def scraping_urls_from_bbc():

    # scrape 290 articles, but a few of them may not contain text as it is a video

    def scraping_text_from_bbc(inner_urls):
        i_html = urlopen(inner_urls).read()
        i_soup = BeautifulSoup(i_html, features="html.parser")
        # get text
        ps = i_soup.find_all("p")
        res = []
        for p in ps:
            res += nltk.word_tokenize(p.text)
        return {"text": res}

    urls = ["https://www.bbc.co.uk/search?q=AI+Machine+learning+Deep+learning&d=HOMEPAGE_PS"]
    res = []
    verboseprint('scanning URLs')
    for i in range(2, 30):
        verboseprint(f'scanning results on page {i}')
        urls.append("https://www.bbc.co.uk//search?q=AI+Machine+learning+Deep+learning&d=HOMEPAGE_PS&page=" + str(i))
    for url in urls:
        html = urlopen(url).read()
        soup = BeautifulSoup(html, features="html.parser")
        a_tags = soup.find_all("a", class_="ssrcss-rl2iw9-PromoLink e1f5wbog1")
        p_tags = soup.find_all("p", class_="ssrcss-6arcww-PromoHeadline e1f5wbog5")
        for i in range(len(a_tags)):
            temp = scraping_text_from_bbc(a_tags[i]['href'])
            temp['main_heading'] = p_tags[i].text
            res.append(temp)
    verboseprint('Successfully scanned text, writing to file...')

    return res

def scraping_urls_from_guardian():

    # scrape 300 articles

    def scraping_text_from_guardian(inner_urls):
        i_html = urlopen(inner_urls).read()
        i_soup = BeautifulSoup(i_html, features="html.parser")
        # get text
        ps = i_soup.find_all("p")
        res = []
        for p in ps:
            res += nltk.word_tokenize(p.text)
        return {"text": res}

    urls = []
    res = []
    for i in range(1, 16):
        urls.append("https://www.theguardian.com/technology/artificialintelligenceai?page=" + str(i))
    for url in urls:
        html = urlopen(url).read()
        soup = BeautifulSoup(html, features="html.parser")
        a_tags = soup.find_all("a", {"class": "u-faux-block-link__overlay js-headline-text"})
        for i in range(len(a_tags)):
            temp = scraping_text_from_guardian(a_tags[i]['href'])
            temp['main_heading'] = a_tags[i].text
            res.append(temp)
    return res
    
def scraping_urls_from_dailymail(num):

    # num: the input should be a multiple of 50, should be smaller than 9595
    # the number of articles returned won't be exactly as num, because it automatically eliminates videos(roughly 30%)

    def scraping_text_from_dailymail(inner_urls):
        i_html = urlopen(inner_urls).read()
        i_soup = BeautifulSoup(i_html, features="html.parser")
        # get text
        ps = i_soup.find_all("p")
        res = []
        for p in ps:
            res += nltk.word_tokenize(p.text)
        return {"text": res}

    urls = []
    res = []
    for i in range(num//50):
        urls.append("https://www.dailymail.co.uk/home/search.html?offset="+str(i * 50)+"&size=50&sel=site&searchPhrase=AI&sort=relevant&type=article&type=video&type=permabox&days=all")
    print("start")
    for j in range(len(urls)):
        html = urlopen(urls[j]).read()
        soup = BeautifulSoup(html, features="html.parser")
        h3_tags = soup.find_all("h3", class_="sch-res-title")
        spans = soup.find_all("span", class_="ccow icn-text")
        for i in range(len(h3_tags)):
            if spans[i].text == "Article":
                temp = scraping_text_from_dailymail("https://www.dailymail.co.uk" + h3_tags[i].find_next("a")['href'])
                temp['main_heading'] = h3_tags[i].find_next("a").text
                res.append(temp)
        print(str(50 * (j + 1)) + " items are processed")
    print(str(len(res)) + " articles are scraped")
    return res

'''
The return format:
    list of dictionaries, the keys in dictionary are main_heading and text
    [{"main_heading":sth,
      "text":[token1,token2...,token n]},
      {"main_heading":sth,
      "text":[token1,token2...,token n]},
      ...]
'''

results = []

if urls:
    for url in urls:
        verboseprint(f"Processing {url}")
        results.append(scraping_urls_from_technology_review(url))
else:
    results = scraping_urls_from_bbc()

if args.filename:
    with open(args.filename, "w") as f:
        json.dump(results, f)
