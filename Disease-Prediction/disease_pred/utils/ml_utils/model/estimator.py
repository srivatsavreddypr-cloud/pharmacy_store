from disease_pred.constant.training_pipeline import SAVED_MODEL_DIR,MODEL_FILE_NAME

import os
import sys
import numpy as np

from disease_pred.exception.exception import DiseasePredException
from disease_pred.logging.logger import logging

class DiseaseModel:
    def __init__(self,preprocessor,model,label_encoder=None):
        try:
            self.preprocessor = preprocessor
            self.model = model
            self.label_encoder=label_encoder
        except Exception as e:
            raise DiseasePredException(e,sys)
    
    def predict(self,x):
        try:
            x_transform=self.preprocessor.transform(x)
            y_hat=self.model.predict(x_transform)

            if self.label_encoder is not None:
                y_hat=self.label_encoder.inverse_transform(y_hat.astype(int))

            return y_hat
        except Exception as e:
            raise DiseasePredException(e,sys)