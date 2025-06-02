# from flask import Flask, request, render_template, jsonify
# import tensorflow as tf
# import os
# import json
# import numpy as np
# import mne
# from tensorflow.keras.models import Sequential
# from tensorflow.keras.layers import Dense, LSTM

# # Initialize Flask app
# app = Flask(__name__)

# # File paths (use raw strings or forward slashes)
# config_path = r'model\final_seizure_model\config.json'
# weights_path = r'model\final_seizure_model\model.weights.h5'
# metadata_path = r'model\final_seizure_model\metadata.json'

# # Load the config file to reconstruct the model
# with open(config_path, 'r') as config_file:
#     config = json.load(config_file)

# # Reconstruct the model based on the config data
# model = Sequential()

# for layer in config['layers']:
#     if layer['type'] == 'LSTM':
#         model.add(LSTM(layer['units'], activation=layer['activation'], input_shape=(layer['input_shape'][0], layer['input_shape'][1])))
#     elif layer['type'] == 'Dense':
#         model.add(Dense(layer['units'], activation=layer['activation']))

# # Load the model weights
# model.load_weights(weights_path)

# # Load metadata (this could be useful for logging or debugging)
# with open(metadata_path, 'r') as metadata_file:
#     metadata = json.load(metadata_file)

# # Print metadata to check
# print(metadata)

# # Folder to save uploaded files
# UPLOAD_FOLDER = 'uploads'
# os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# # Home route to display the upload page
# @app.route('/')
# def index():
#     return render_template('index.html')

# # Route to handle file upload and prediction
# @app.route('/upload', methods=['POST'])
# def upload_file():
#     if 'file' not in request.files:
#         return jsonify({'error': 'No file part'}), 400

#     file = request.files['file']
#     if file.filename == '':
#         return jsonify({'error': 'No selected file'}), 400

#     if file:
#         # Save the uploaded file
#         file_path = os.path.join(UPLOAD_FOLDER, file.filename)
#         file.save(file_path)

#         # Process the EEG file and get predictions
#         predictions = process_eeg_file(file_path)  # Process using mne and model

#         # Return predictions (you can extend this to return graphs, etc.)
#         return jsonify({'predictions': predictions.tolist()})

# def process_eeg_file(file_path):
#     # Load the EEG file using mne (for .edf format)
#     raw = mne.io.read_raw_edf(file_path, preload=True)

#     # Apply any necessary preprocessing here (filtering, epoching, etc.)
#     # For example, let's apply a bandpass filter (you can adjust these values)
#     raw.filter(1, 50, fir_design='firwin')

#     # Convert data to a numpy array for prediction (this is just an example)
#     # Here we assume the EEG data has the shape (n_channels, n_samples)
#     eeg_data = raw.get_data()

#     # You might need to reshape the data depending on your model input shape.
#     # Assuming your model expects data of shape (batch_size, timesteps, features)
#     # For example, reshape data to match model's input shape (1, time_steps, features)
#     eeg_data = eeg_data.reshape(1, eeg_data.shape[1], eeg_data.shape[0])  # Adjust as needed

#     # Run the model to make predictions
#     predictions = model.predict(eeg_data)

#     # Return the predictions
#     return predictions

# if __name__ == '__main__':
from train import train_model

if __name__ == "__main__":
    model = train_model()

