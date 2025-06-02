from model import create_model
from data_loader import load_data

def train_model():
    # Load the data
    X_train, y_train = load_data('edf_files', 'tsv_files')

    print(f"X_train shape: {X_train.shape}")
    print(f"y_train shape: {y_train.shape}")

    # Create the model
    model = create_model()

    # Compile the model
    model.compile(optimizer='adam', loss='mean_squared_error')

    # Train the model
    model.fit(X_train, y_train, epochs=20, batch_size=2)

    # Save the model after training
    model.save('trained_model.keras')
    print("Model saved as trained_model.h5")

    return model
