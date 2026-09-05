import os
import sys

from disease_pred.exception.exception import DiseasePredException
from disease_pred.logging.logger import logging

from disease_pred.entity.artifact_entity import DataTransformationArtifact,ModelTrainerArtifact
from disease_pred.entity.config_entity import ModelTrainerConfig



from disease_pred.utils.ml_utils.model.estimator import DiseaseModel
from disease_pred.utils.main_utils.utils import save_object,load_object
from disease_pred.utils.main_utils.utils import load_numpy_array_data,evaluate_models
from disease_pred.utils.ml_utils.metric.classification_metric import get_classification_score

from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import BernoulliNB, MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import r2_score
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import (
    AdaBoostClassifier,
    GradientBoostingClassifier,
    RandomForestClassifier,
)
import mlflow
from urllib.parse import urlparse

#import dagshub
#dagshub.init(repo_owner='srivatsavreddy.pr', repo_name='networksecurity', mlflow=True)

'''os.environ["MLFLOW_TRACKING_URI"]="https://dagshub.com/srivatsavreddy.pr/networksecurity.mlflow"
os.environ["MLFLOW_TRACKING_USERNAME"]="krishnaik06"
os.environ["MLFLOW_TRACKING_PASSWORD"]="7104284f1bb44ece21e0e2adb4e36a250ae3251f"
'''




class ModelTrainer:
    def __init__(self,model_trainer_config:ModelTrainerConfig,data_transformation_artifact:DataTransformationArtifact):
        try:
            self.model_trainer_config=model_trainer_config
            self.data_transformation_artifact=data_transformation_artifact
        except Exception as e:
            raise DiseasePredException(e,sys)
        
    def track_mlflow(self,best_model,classificationmetric):
       # mlflow.set_registry_uri("https://dagshub.com/srivatsavreddy.pr/networksecurity.mlflow")
       # tracking_url_type_store = urlparse(mlflow.get_tracking_uri()).scheme
        with mlflow.start_run():
            f1_score=classificationmetric.f1_score
            precision_score=classificationmetric.precision_score
            recall_score=classificationmetric.recall_score

            

            mlflow.log_metric("f1_score",f1_score)
            mlflow.log_metric("precision",precision_score)
            mlflow.log_metric("recall_score",recall_score)
            mlflow.sklearn.log_model(sk_model=best_model,name="model")
            # Model registry does not work with file store
            #if tracking_url_type_store != "file":

                # Register the model
                # There are other ways to use the Model Registry, which depends on the use case,
                # please refer to the doc for more information:
                # https://mlflow.org/docs/latest/model-registry.html#api-workflow
                #mlflow.sklearn.log_model(best_model, "model", registered_model_name=best_model)
            #else:
               # mlflow.sklearn.log_model(best_model, "model")

      
        
    def train_model(self,X_train,y_train,x_test,y_test):
        models = {
            "Bernoulli Naive Bayes": BernoulliNB(),
            "Random Forest":RandomForestClassifier(),
            "K-Nearest Neighbors": KNeighborsClassifier(n_neighbors=1, metric='cosine'),
            "Decision Tree": DecisionTreeClassifier(random_state=42),
            "Logistic Regression": LogisticRegression()
        }

        params = {
            "Bernoulli Naive Bayes": {
                'alpha': [0.1, 0.5, 1.0]
            },
            "Random Forest": {
                'n_estimators': [16,32,64,128]
            },
            "K-Nearest Neighbors": {
                'n_neighbors': [1],
                'metric': ['cosine', 'euclidean', 'jaccard']
            },
            "Decision Tree": {
                'criterion': ['gini', 'entropy']
            },
            "Logistic Regression": {}
        }
        model_report:dict=evaluate_models(X_train=X_train,y_train=y_train,X_test=x_test,y_test=y_test,
                                          models=models,param=params)
        
        ## To get best model score from dict
        best_model_score = max(sorted(model_report.values()))

        ## To get best model name from dict

        best_model_name = list(model_report.keys())[
            list(model_report.values()).index(best_model_score)
        ]
        best_model = models[best_model_name]
        y_train_pred=best_model.predict(X_train)

        classification_train_metric=get_classification_score(y_true=y_train,y_pred=y_train_pred)
        
        ## Track the experiements with mlflow
        self.track_mlflow(best_model,classification_train_metric)

        y_test_pred=best_model.predict(x_test)
        classification_test_metric=get_classification_score(y_true=y_test,y_pred=y_test_pred)

        self.track_mlflow(best_model,classification_test_metric)

        preprocessor = load_object(file_path=self.data_transformation_artifact.transformed_object_file_path)
        label_encoder=load_object("final_model/label_encoder.pkl")
            
        model_dir_path = os.path.dirname(self.model_trainer_config.trained_model_file_path)
        os.makedirs(model_dir_path,exist_ok=True)

        Disease_Model=DiseaseModel(preprocessor=preprocessor,model=best_model,label_encoder=label_encoder)
        save_object(self.model_trainer_config.trained_model_file_path,obj=Disease_Model)
        #model pusher
        save_object("final_model/model.pkl",Disease_Model)
        

        ## Model Trainer Artifact
        model_trainer_artifact=ModelTrainerArtifact(trained_model_file_path=self.model_trainer_config.trained_model_file_path,
                             train_metric_artifact=classification_train_metric,
                             test_metric_artifact=classification_test_metric
                             )
        logging.info(f"Model trainer artifact: {model_trainer_artifact}")
        return model_trainer_artifact

        
    def initiate_model_trainer(self)->ModelTrainerArtifact:
        try:
            train_file_path = self.data_transformation_artifact.transformed_train_file_path
            test_file_path = self.data_transformation_artifact.transformed_test_file_path

            #loading training array and testing array
            train_arr = load_numpy_array_data(train_file_path)
            test_arr = load_numpy_array_data(test_file_path)

            x_train, y_train, x_test, y_test = (
                train_arr[:,:-1],
                train_arr[:, -1],
                test_arr[:,:-1],
                test_arr[:, -1],
            )

            model_trainer_artifact=self.train_model(x_train,y_train,x_test,y_test)
            return model_trainer_artifact

            
        except Exception as e:
            raise DiseasePredException(e,sys)