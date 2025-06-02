import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import InputLayer, Conv1D, BatchNormalization, MaxPooling1D, Dropout, LSTM, Dense, Input


def create_model():
    model = Sequential()
    model.add(Input(shape=(1024, 19)))
    model.add(LSTM(64, return_sequences=True))
    model.add(LSTM(32))
    model.add(Dense(7, activation='softmax'))  # OUTPUT layer must match number of labels
    return model

def build_model(input_shape=(1024, 19)):
    model = Sequential()
    
    # Input Layer
    model.add(InputLayer(input_shape=input_shape))
    
    # Cast Layer
    model.add(tf.keras.layers.Lambda(lambda x: tf.cast(x, tf.float16)))
    
    # First Convolutional Layer
    model.add(Conv1D(filters=8, kernel_size=3, activation='relu'))
    model.add(BatchNormalization())
    model.add(MaxPooling1D(pool_size=4, strides=4))
    model.add(Dropout(0.2))

    # Second Convolutional Layer
    model.add(Conv1D(filters=16, kernel_size=3, activation='relu'))
    model.add(BatchNormalization())
    model.add(MaxPooling1D(pool_size=2, strides=2))
    model.add(Dropout(0.2))

    # LSTM Layer
    model.add(LSTM(16))

    # Dense Layer
    model.add(Dense(7, activation='relu'))

    return model
