import os
import sys
import json
import warnings

# Suppress warnings and logs
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
warnings.filterwarnings("ignore")

# Redirect low-level OS file descriptor stdout to suppress unwanted print statements
stdout_fd = sys.stdout.fileno()
saved_stdout_fd = os.dup(stdout_fd)
devnull = os.open(os.devnull, os.O_WRONLY)
os.dup2(devnull, stdout_fd)
os.close(devnull)

# Fix relative imports
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

import pandas as pd


def restore_stdout():
    """Restore standard output so we can return the clean JSON."""
    sys.stdout.flush()
    os.dup2(saved_stdout_fd, stdout_fd)
    os.close(saved_stdout_fd)


def main():
    try:
        if len(sys.argv) < 2:
            restore_stdout()
            print(json.dumps({"error": "No symptoms provided"}))
            sys.exit(1)

        raw_input = sys.argv[1]

        try:
            symptoms_list = json.loads(raw_input)
        except Exception:
            symptoms_list = [raw_input]

        if isinstance(symptoms_list, str):
            symptoms_list = [symptoms_list]

        user_symptoms = [str(s).strip().lower() for s in symptoms_list]

        # Import helper utilities
        from disease_pred.utils.main_utils.utils import load_object

        MODEL_PATH = os.path.join(CURRENT_DIR, "final_model", "model.pkl")

        if not os.path.exists(MODEL_PATH):
            restore_stdout()
            raise FileNotFoundError(f"Model file not found at: {MODEL_PATH}")

        # Load trained wrapper object
        disease_model = load_object(file_path=MODEL_PATH)

        # Retrieve feature list
        preprocessor = getattr(disease_model, "preprocessor", None)

        if hasattr(preprocessor, "feature_names_in_"):
            feature_names = list(preprocessor.feature_names_in_)
        elif hasattr(preprocessor, "get_feature_names_out"):
            feature_names = list(preprocessor.get_feature_names_out())
        else:
            feature_names = user_symptoms

        # Create binary row DataFrame
        input_dict = {}
        matched_symptoms = []

        for feature in feature_names:
            clean_feat = str(feature).strip().lower()
            if clean_feat in user_symptoms:
                input_dict[feature] = [1]
                matched_symptoms.append(feature)
            else:
                input_dict[feature] = [0]

        input_df = pd.DataFrame(input_dict)

        # Model inference
        predictions = disease_model.predict(input_df)
        predicted_disease = str(predictions[0])

        response = {
            "disease": predicted_disease,
            "recognizedSymptoms": matched_symptoms if matched_symptoms else user_symptoms
        }

        # Restore stdout and print final JSON
        restore_stdout()
        print(json.dumps(response))

    except Exception as e:
        restore_stdout()
        error_response = {
            "error": str(e),
            "disease": None,
            "recognizedSymptoms": []
        }
        print(json.dumps(error_response))
        sys.exit(1)


if __name__ == "__main__":
    main()