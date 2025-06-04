import os
import numpy as np
import pandas as pd
import mne
from sklearn.preprocessing import LabelEncoder

def load_data(edf_dir, tsv_dir):
    edf_files = sorted([os.path.join(edf_dir, f) for f in os.listdir(edf_dir) if f.endswith('.edf')])
    tsv_files = sorted([os.path.join(tsv_dir, f) for f in os.listdir(tsv_dir) if f.endswith('.tsv')])

    X = []
    y = []

    label_encoder = LabelEncoder()

    all_labels = []
    for tsv_file in tsv_files:
        labels = pd.read_csv(tsv_file, sep='\t').values.flatten()
        all_labels.extend(labels)

    # Fit encoder on all labels
    label_encoder.fit(all_labels)

    for edf_file, tsv_file in zip(edf_files, tsv_files):
        # Load EDF signal
        raw = mne.io.read_raw_edf(edf_file, preload=True, verbose=False)
        signal = raw.get_data().T  # (n_times, n_channels)

        # Keep only first 1024 samples and first 19 channels
        signal = signal[:1024, :19]
        X.append(signal)

        # Load TSV labels
        labels = pd.read_csv(tsv_file, sep='\t').values.flatten()
        labels = labels[:16]  # Take first 16 labels

        # Encode string labels into numbers
        encoded_labels = label_encoder.transform(labels)
        y.append(encoded_labels)

    X = np.array(X, dtype=np.float32)  # Shape: (num_samples, 1024, 19)
    y = np.array(y, dtype=np.float32)  # Shape: (num_samples, 16)

    return X, y
