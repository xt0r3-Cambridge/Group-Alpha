from time import sleep
from urllib.request import urlopen
from bs4 import BeautifulSoup
import nltk
from selenium import webdriver
from selenium.webdriver.common.by import By
import json
from argparse import ArgumentParser


# Parsing functionality for command line arguments
parser = ArgumentParser()
parser.add_argument("-f", "--file", dest="filename",
                    help="write scraped data to FILE in JSON format", metavar="FILE", required=False)

args = parser.parse_args()

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
            print("Loading news...")
            sleep(0.5)
        except:
            print("Loaded all news")
            
            urls = []
            headings = []
            h3s = driver.find_elements(By.CLASS_NAME, "teaserItem__title--32O7a")
            
            print("Extracting headlines...")
            
            for x in h3s:
                urls.append(x.find_element(By.TAG_NAME, "a").get_attribute("href"))
                headings.append(x.text)
                
            print("Extracting text... This may take a while")

            articles = []
            for i in range(len(urls)):
                articles.append(scraping_text_from_technology_review(urls[i]))
                articles[i]['main_heading'] = headings[i]
                
            return articles


'''
The return format:
    list of dictionaries, the keys in dictionary are main_heading and text
    [{"main_heading":sth,
      "text":[token1,token2...,token n]},
      {"main_heading":sth,
      "text":[token1,token2...,token n]},
      ...]
'''

# results = scraping_urls_from_technology_review("https://www.technologyreview.com/author/karen-hao/")
results = scraping_urls_from_technology_review("https://www.technologyreview.com/author/melissa-heikkila/")

if args.filename:
    with open(args.filename, "w") as f:
        json.dump(results, f)