#!/usr/bin/env python
# coding: utf-8

# # Testing words
# This notebook provides some skeleton code for loading the training data and getting the predictions from the model for the different keywords.
# 
# ## Warning: For now, I am still training the models, testing can already be done with the agency model

# ## Imports and setup

# This section of the notebook makes sure you have all the libraries installed that are used by the code.
# It also makes sure that they are updated to the newest version.

# In[1]:


# get_ipython().run_line_magic('pip', 'install transformers -Uqq')
# get_ipython().run_line_magic('pip', 'install nltk -Uqq')
# get_ipython().run_line_magic('pip', 'install matplotlib -Uqq')
# get_ipython().run_line_magic('pip', 'install wordcloud -Uqq')


# In[21]:

from multiprocessing import set_start_method
set_start_method("spawn")

import json
import random
from collections import defaultdict
from functools import partial
from multiprocessing import Pool as ThreadPool

import matplotlib.pyplot as plt
from IPython.display import set_matplotlib_formats
from nltk import word_tokenize
from nltk.corpus import stopwords
from transformers import (
    BertForSequenceClassification,
    BertTokenizer,
    TextClassificationPipeline,
)
from wordcloud import WordCloud


# ## Loading data

# In[4]:


random.seed(42)
dataset = []

with open("data/data.json") as file:
    dataset = list(map(lambda x: x["text"], json.load(file)["data"]))

random.shuffle(dataset)
dataset[0:2]


# ## Loading model for some keyword

# In[5]:

print("Data loaded...")

labels = [
    "agency",
    # "suggestiveImagery",
    "comparisonWithHumanIntelligence",
    "comparisonWithHumanSkills",
    "hyperbole",
    "uncriticalHistoryComparison",
    "unjustifiedClaimsAboutFuture",
    "falseClaimsAboutProgress",
    "incorrectClaimsAboutStudyReport",
    "deepSoundingTermsForBanalities",
    "treatingSpokespeopleAsNeutral",
    "repeatingPRTerms",
    "noDiscussionOfLimitations",
    "deEmphasizingLimitations",
    "limitationsAddressedBySkeptics",
    "downplayingHumanLabour",
    "performanceNumbersWithoutCaveats",
    # "inscrutability",
]

models = {}

for i, label in enumerate(labels):
    models[label] = BertForSequenceClassification.from_pretrained(
        f"xt0r3/aihype_{label}-vs-rest"
    )
    print(f'Loading models {(i+1)/len(labels)} complete...')

print('Models loaded...')
# ## Adding input processing

# In[6]:


tokenizer = BertTokenizer.from_pretrained("bert-base-cased")


# In[7]:


pipes = {
    label: TextClassificationPipeline(
        model=models[label],
        tokenizer=tokenizer,
        top_k=None,
    )
    for label in labels
}

print('Pipes loaded')


# ## Define prediction function

# In[8]:


def get_result(preds):
    for pred in preds:
        if pred["label"] == "LABEL_1":
            return pred["score"] >= 0.5
    return False


def predict(text, label):
    pred_dict = dict()
    preds = pipes[label](text)[0]
    get_result(preds)
    return preds


# ## Playing around with the model

# In[9]:


dataset[0:4]


# ## Tokenization example 
# This chapter shows an example of tokenization so that you can do data classification easier

# In[14]:


freq_nltk = defaultdict(lambda: defaultdict(lambda: 0))
freq_bert = defaultdict(lambda: defaultdict(lambda: 0))


# In[23]:


def process_headline(headline, label):
    if predict(headline, label):
        for word in tokenize_nltk:
            freq_nltk[label][word] += 1
        for word in tokenize_bert:
            freq_bert[label][word] += 1


# In[25]:


for i, headline in enumerate(dataset):
    tokenize_nltk = word_tokenize(headline)
    tokenize_bert = tokenizer.tokenize(headline)

    pool = ThreadPool(4)
    
    func = partial(process_headline, headline)
    pool.map(func, labels)

    if i % 20 == 0:
        print(f"Processing text {(i+1)/len(dataset)} complete...")


# ### Removing stopwords

# In[ ]:


for label in labels:
    freq_nltk[label] = {
        k: v
        for k, v in freq_nltk[label].items()
        if k.lower() not in stopwords.words("english")
    }
    freq_bert[label] = {
        k: v
        for k, v in freq_bert[label].items()
        if k.lower() not in stopwords.words("english")
    }


# ## Plot results

# In[ ]:


set_matplotlib_formats("svg")


# In[ ]:


# Define a function to plot word cloud
def plot_cloud(axs, wordcloud, title, i):
    x = i // 4
    y = i % 4
    # Set figure size
    # Display image
    axs[x, y].imshow(wordcloud)
    # No axis details
    axs[x, y].axis("off")
    axs[x, y].set_title(title, fontdict={"fontsize": 8})


# In[ ]:


# Define plot characteristics
plt.figure(figsize=(44, 36))
fig, axs = plt.subplots(4, 4, figsize=(10, 8))
plt.rcParams["figure.dpi"] = 600
plt.rcParams["savefig.dpi"] = 600


for i, label in enumerate(labels):
    # Generate wordcloud for NLTK text
    wordcloud = WordCloud(
        width=600,
        height=400,
        random_state=1,
        background_color="black",
        colormap="Set2",
        collocations=False,
    ).generate_from_frequencies(freq_nltk[label])
    # Plot
    plot_cloud(axs, wordcloud, label, i)

plt.savefig("nltk.svg")
plt.show()


# In[ ]:


# Define plot characteristics
plt.figure(figsize=(44, 36))
fig, axs = plt.subplots(4, 4, figsize=(10, 8))
plt.rcParams["figure.dpi"] = 300
plt.rcParams["savefig.dpi"] = 300

for i, label in enumerate(labels):
    # Generate wordcloud for BERT text
    wordcloud = WordCloud(
        width=600,
        height=400,
        random_state=1,
        background_color="black",
        colormap="Set2",
        collocations=False,
    ).generate_from_frequencies(freq_bert[label])
    # Plot
    plot_cloud(axs, wordcloud, label, i)

plt.savefig("bert.svg")
plt.show()


# In[ ]:




