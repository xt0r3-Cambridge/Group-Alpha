from urllib.request import urlopen
from bs4 import BeautifulSoup
import requests
import nltk


def scraping(url):
    """Scraping text from articles.

    Scraping only html text and make them into word tokens.

    Args:
        url: the url of the target webpage

    Returns:
        A dict mapping keys to the corresponding list of tokens and list of list of tokens
        for example:

        {'headlines': [['Headline','One'],['Headline','Two'],['Headline','Three']],
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

    res = {"headlines": headline_list, "text": nltk_tokens}
    return res


def scraping_more(urls):
    res = []
    for url in urls:
        res.append(scraping(url))
    return res


objective_article_urls = ["https://www.technologyreview.com/2022/04/22/1050394/artificial-intelligence-for-the-people/",
                "https://www.technologyreview.com/2022/04/21/1050381/the-gig-workers-fighting-back-against-the-algorithms/",
                "https://www.technologyreview.com/2022/04/20/1050392/ai-industry-appen-scale-data-labels/",
                "https://www.technologyreview.com/2022/04/19/1049592/artificial-intelligence-colonialism/",
                "https://www.technologyreview.com/2022/04/19/1049996/south-africa-ai-surveillance-digital-apartheid/",
                "https://www.technologyreview.com/2021/12/02/1039397/china-initiative-database-doj/",
                "https://www.technologyreview.com/2021/12/02/1040656/china-initative-us-justice-department/",
                "https://www.technologyreview.com/2021/11/20/1039076/facebook-google-disinformation-clickbait/",
                "https://www.technologyreview.com/2021/09/16/1035851/facebook-troll-farms-report-us-2020-election/",
                "https://www.technologyreview.com/2021/10/05/1036519/facebook-whistleblower-frances-haugen-algorithms/",
                "https://www.technologyreview.com/2021/09/13/1035449/ai-deepfake-app-face-swaps-women-into-porn/",
                "https://www.technologyreview.com/2021/08/13/1031836/ai-ethics-responsible-data-stewardship/",
                "https://www.technologyreview.com/2021/08/06/1030802/ai-robots-take-over-warehouses/",
                "https://www.technologyreview.com/2021/07/29/1030260/facebook-whistleblower-sophie-zhang-global-political-manipulation/",
                "https://www.technologyreview.com/2021/07/21/1029818/facebook-ugly-truth-frenkel-kang-nyt/",
                "https://www.technologyreview.com/2021/07/09/1028140/ai-voice-actors-sound-human/",
                "https://www.technologyreview.com/2021/06/27/1027350/anming-hu-china-initiative-research-espionage-spying/",
                "https://www.technologyreview.com/2021/06/14/1026148/ai-big-tech-timnit-gebru-paper-ethics/",
                "https://www.technologyreview.com/2021/06/11/1026135/ai-synthetic-data/",
                "https://www.technologyreview.com/2021/06/04/1025742/ai-hate-speech-moderation/",
                "https://www.technologyreview.com/2023/02/03/1067786/ai-models-spit-out-photos-of-real-people-and-copyrighted-images/",
                "https://www.technologyreview.com/2023/01/31/1067436/could-chatgpt-do-my-job/",
                "https://www.technologyreview.com/2023/01/27/1067338/a-watermark-for-chatbots-can-spot-text-written-by-an-ai/",
                "https://www.technologyreview.com/2023/01/24/1067232/the-economy-is-down-but-ai-is-hot-where-do-we-go-from-here/",
                "https://www.technologyreview.com/2023/01/17/1067014/heres-how-microsoft-could-use-chatgpt/",
                "https://www.technologyreview.com/2023/01/10/1066538/the-eu-wants-to-regulate-your-favorite-ai-tools/",
                "https://www.technologyreview.com/2022/12/23/1065852/whats-next-for-ai/",
                "https://www.technologyreview.com/2022/12/20/1065667/how-ai-generated-text-is-poisoning-the-internet/",
                "https://www.technologyreview.com/2022/12/19/1065596/how-to-spot-ai-generated-text/",
                "https://www.technologyreview.com/2022/12/16/1065247/artists-can-now-opt-out-of-the-next-version-of-stable-diffusion/"]

print(scraping_more(objective_article_urls))
