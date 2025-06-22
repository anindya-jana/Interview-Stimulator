import spacy
from sentence_transformers import SentenceTransformer, util
nlp = spacy.load("en_core_web_lg")
print("nlp module loaded")

def scale_accuracy(score):
    if score < 0.5:
        return 0.0
    else:
        scaled_score = (score - 0.5) * 2
        return scaled_score * 100


def accuracy_detector(sentence1,sentence2):

    doc1 = nlp(sentence1)
    doc2 = nlp(sentence2)

    similarity_score = round(doc1.similarity(doc2), 3)*100
    return(similarity_score)