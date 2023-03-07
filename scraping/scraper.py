import json
from time import sleep
from urllib.request import urlopen
from bs4 import BeautifulSoup
import nltk
from selenium import webdriver
from selenium.webdriver.common.by import By


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


def scraping_urls_from_technology_review(url="https://www.technologyreview.com/author/karen-hao/"):

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
            sleep(0.5)
        except:
            urls = []
            headings = []
            h3s = driver.find_elements(By.CLASS_NAME, "teaserItem__title--32O7a")
            for x in h3s:
                urls.append(x.find_element(By.TAG_NAME, "a").get_attribute("href"))
                headings.append(x.text)

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
    for i in range(2, 30):
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


def scraping_urls_from_digital_trends(url="https://www.digitaltrends.com/?s=AI"):

    def scraping_text_from_digital_trends(inner_urls):
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

    driver.find_element(By.ID, 'onetrust-accept-btn-handler').click()
    sleep(5)
    driver.find_element(By.CLASS_NAME, "b-adhesion__close").click()
    i = 50
    while i > 0:
        driver.find_element(By.XPATH, '/html/body/div[3]/div/div[2]/section/div[2]/button').click()
        sleep(2)
        i -= 1

    urls = []
    headings = []
    divs = driver.find_elements(By.CLASS_NAME, "b-meta__title.dt-clamp.dt-clamp-2")
    for x in divs:
        urls.append(x.find_element(By.TAG_NAME, "a").get_attribute("href"))
        headings.append(x.text)

    articles = []
    for i in range(len(urls)):
        articles.append(scraping_text_from_digital_trends(urls[i]))
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


def choose_website(website):
    if website == 'guardian':
        with open('guardian.json', 'w') as f:
            json.dump(scraping_urls_from_guardian(), f)

    elif website == 'dailymail':
        with open('dailymail.json', 'w') as f:
            json.dump(scraping_urls_from_dailymail(9550), f)

    elif website == 'digitaltrends':
        with open('digitaltrends.json', 'w') as f:
            json.dump(scraping_urls_from_digital_trends(), f)

    elif website == 'bbc':
        with open('bbc.json', 'w') as f:
            json.dump(scraping_urls_from_bbc(), f)

    elif website == 'technologyreview_karen-hao':
        with open('karen-hao.json', 'w') as f:
            json.dump(scraping_urls_from_technology_review("https://www.technologyreview.com/author/karen-hao/"), f)

    elif website == 'technologyreview_melissa_heikkila':
        with open('melissa_heikkila.json', 'w') as f:
            json.dump(scraping_urls_from_technology_review("https://www.technologyreview.com/author/melissa_heikkila/"), f)
