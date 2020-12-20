#!/usr/bin/env python
# coding: utf-8

#
# General comments about the ML model:
#  - We use pandas to load the symptoms from a CSV that is also provided.
#  - We use random sampling, and due to this, sometimes the model gets stuck and doesn't learn
#    This will be solved with more data, but meanwhile just run it again if the accuracy has
#    stuck at 60%. If you're annoyed by this, you can restore the ratio of positives to negatives
#    to be 50/50. It gets stuck because of the imbalance we tolerate.
#

# In[1]:


import tensorflow as tf
import numpy as np
import pandas as pd
from tensorflow.keras import layers
from tensorflow.keras.layers.experimental import preprocessing


# In[2]:


test = pd.read_csv("~/sintomas.csv")


# In[3]:


is_symtom = (test['symptoms_binary'] == 1)
symptomatics = test[is_symtom]
has_final_outcome = symptomatics['final_diagnosis_code'].isin([1, 3])
ds = symptomatics[has_final_outcome]
ds = ds.sample(frac=1)

def pcr_prio(pcr_type):
    if (pcr_type == 5):
        return -1
    if (pcr_type == 4):
        return 2
    return 1

colsToNormalize = ['sympt_epi', 'home_confirmed',
        'school_symptoms', 'school_confirmed', 'fever',
        'tos', 'crup', 'dysphonia', 'resp',
        'wheezing', 'nasal_congestion', 'fatiga', 'crackles',
        'headache', 'vomiting', 'dyarrea', 'ausc_resp', 'odynophagia', 'taste_smell',
        'smokers_home', 'sex', 'sports', 'bus' ]

for col in colsToNormalize:
    ds = ds.replace({col: 2}, {col: 0.5})

ds['priority'] = np.vectorize(pcr_prio)(ds['pcr_type'])
#ds = ds.replace({"resp": 2}, {"resp": 0.5})
ds['taste_smell'] = ds['taste_smell'].fillna(0.5)

positivos = ds[ds['final_diagnosis_code'] == 1]
negativos = ds[ds['final_diagnosis_code'] == 3].sort_values(by='priority')[:(positivos.shape[0]*3)]
other_negs = ds[ds['final_diagnosis_code'] == 3].sort_values(by='priority')[(positivos.shape[0]*3):]

ds = pd.concat([negativos, positivos, positivos])
ds = ds.sample(frac=1)
labels = ds.pop('final_diagnosis_code')
labels = labels.replace(3, 0)
other_negs_labels = other_negs.pop('final_diagnosis_code')
other_negs_labels = other_negs_labels.replace(3, 0)



# Let's normalize some of the data
#for col in colsToNormalize:
#    ds = ds.replace({col: 2}, {col: 0.5})


# In[4]:


cols = ['persons_home', 'sympt_epi', 'home_confirmed',
        'school_symptoms', 'school_confirmed', 'fever',
        'highest_fever', 'tos', 'crup', 'dysphonia', 'resp']

other_symp = ['wheezing', 'nasal_congestion', 'fatiga', 'crackles',
              'headache', 'vomiting', 'dyarrea', 'ausc_resp', 'odynophagia', 'taste_smell']

extra_symp = ['tachypnea', 'conjuntivitis', 'ocular_pain', 'gi_symptoms', 'abdominal_pain', 'dermatologic', 'irritability']

first_symp = ['cough_first', 'crup_first', 'dyspnea_first', 'auscult_first', 'odynophagia_first', 'disfonia_first',
              'tachypnea_first', 'nasal_first', 'fatigue_first', 'headache_first', 'gi_first']

amb_factors = [ 'smokers_home', 'sex', 'rooms', 'sports', 'bus', 'm2' ]

all_cols = cols + other_symp + amb_factors

ds_filter = ds[all_cols]
other_negs_filter = other_negs[all_cols]
ds_filter


# In[5]:


ds_filter = np.array(ds_filter)
other_negs_filter = np.array(other_negs_filter)
cols = ds_filter.shape[1]


# In[6]:


from tensorflow.keras.utils import to_categorical
from tensorflow.keras import Sequential
from tensorflow.keras.layers import Dense
from tensorflow.keras.layers.experimental.preprocessing import Normalization
from tensorflow import keras

#labels = to_categorical(labels, num_classes=2)


# In[7]:


model = Sequential()
normalize = Normalization(input_shape=(cols,))
normalize.adapt(ds_filter)

model.add(normalize)
model.add(Dense(128, activation='relu'))
model.add(Dense(256, activation='relu'))
model.add(Dense(32, activation='relu'))
model.add(Dense(1, activation='sigmoid'))
model.summary()


# In[8]:


test_sample_size = 30

l_test = np.concatenate([labels[:test_sample_size], other_negs_labels])
d_test = np.concatenate([ds_filter[:test_sample_size], other_negs_filter])

l_train = labels[test_sample_size:]
d_train = ds_filter[test_sample_size:]


# In[9]:


model.compile(loss="binary_crossentropy",
              optimizer="adam",
              metrics = ['accuracy'])
model.fit(d_train, l_train, epochs=10, validation_data=(d_test, l_test))


# In[10]:


l_pred = model.predict(d_test)
#l_pred


# In[11]:


#for i in range(0, cols):
#    arr = np.zeros(cols).astype(np.float32)
#    arr[i] = 0.5
#    t = model.predict(np.array([arr]))
#    print(str(all_cols[i]) + " " + str(t))


# In[12]:


get_ipython().run_line_magic('matplotlib', 'inline')

# This was stolen from somewhere on the net :)

from sklearn.metrics import roc_curve
y_pred_keras = model.predict(d_test).ravel()
fpr_keras, tpr_keras, thresholds_keras = roc_curve(l_test, y_pred_keras)
from sklearn.metrics import auc

import matplotlib.pyplot as plt

auc_keras = auc(fpr_keras, tpr_keras)
plt.figure(1)
plt.plot([0, 1], [0, 1], 'k--')
plt.plot(fpr_keras, tpr_keras, label='Keras (area = {:.3f})'.format(auc_keras))
#plt.plot(fpr_rf, tpr_rf, label='RF (area = {:.3f})'.format(auc_rf))
plt.xlabel('False positive rate')
plt.ylabel('True positive rate')
plt.title('ROC curve')
plt.legend(loc='best')
plt.show()

# Zoom in view of the upper left corner.
plt.figure(2)
plt.xlim(0, 0.2)
plt.ylim(0.8, 1)
plt.plot([0, 1], [0, 1], 'k--')
plt.plot(fpr_keras, tpr_keras, label='Keras (area = {:.3f})'.format(auc_keras))
#plt.plot(fpr_rf, tpr_rf, label='RF (area = {:.3f})'.format(auc_rf))
plt.xlabel('False positive rate')
plt.ylabel('True positive rate')
plt.title('ROC curve (zoomed in at top left)')
plt.legend(loc='best')
plt.show()


# In[ ]:





# In[ ]:




