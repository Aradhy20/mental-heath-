"""
Face Emotion CNN Training Script
Trains a CNN on FER-2013 format data (48x48 grayscale images).
If no real dataset is found, generates a structured dummy dataset
with synthetic images per emotion class to validate the full training pipeline.
"""

import os
import sys
import numpy as np

# ---- macOS / Apple Silicon TF thread compatibility fix ----
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"
os.environ["OBJC_DISABLE_INITIALIZE_FORK_SAFETY"] = "YES"
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["TF_NUM_INTEROP_THREADS"] = "1"
os.environ["TF_NUM_INTRAOP_THREADS"] = "1"

# Resolve paths
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(current_dir))))
sys.path.append(backend_root)

try:
    from tensorflow.keras.preprocessing.image import ImageDataGenerator
    from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau
    from ai.face_service.emotion_cnn import EmotionCNN
    HAS_TF = True
except ImportError as e:
    print(f"Import failed: {e}. Cannot train face model.")
    HAS_TF = False

# Supported emotion classes (FER-2013 format)
EMOTIONS = ['angry', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise']


def generate_dummy_dataset(base_dir, samples_per_class=50):
    """
    Generate synthetic 48x48 grayscale images organised by class folder.
    Each emotion class gets images with a unique mean pixel intensity
    so the CNN can converge during training.
    """
    from PIL import Image

    print(f"Generating dummy dataset at {base_dir} ...")
    for split in ['train', 'val']:
        for idx, emotion in enumerate(EMOTIONS):
            class_dir = os.path.join(base_dir, split, emotion)
            os.makedirs(class_dir, exist_ok=True)
            n = samples_per_class if split == 'train' else max(samples_per_class // 5, 5)
            for i in range(n):
                # Each class gets a distinct mean intensity → separable signal for the CNN
                intensity_mean = 30 + idx * 25  # ranges ~30–180
                pixel_data = np.clip(
                    np.random.normal(loc=intensity_mean, scale=10, size=(48, 48)),
                    0, 255
                ).astype(np.uint8)
                img = Image.fromarray(pixel_data, mode='L')
                img.save(os.path.join(class_dir, f"{emotion}_{i:04d}.png"))

    print(f"Dummy dataset generated: {samples_per_class} train + {max(samples_per_class//5,5)} val per class.")


def train_face_model(
    train_dir=None,
    val_dir=None,
    output_dir=None,
    epochs=10
):
    """Train the facial emotion CNN."""
    if not HAS_TF:
        print("TensorFlow not available. Skipping face model training.")
        return

    # Resolve default paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    default_dataset_base = os.path.join(script_dir, 'dataset')
    if train_dir is None:
        train_dir = os.path.join(default_dataset_base, 'train')
    if val_dir is None:
        val_dir = os.path.join(default_dataset_base, 'val')
    if output_dir is None:
        output_dir = os.path.join(script_dir, '..', 'model')
        output_dir = os.path.normpath(output_dir)

    # Generate dummy dataset if no real one exists
    if not os.path.exists(train_dir):
        generate_dummy_dataset(default_dataset_base, samples_per_class=50)

    print("Initializing Face Model Training...")
    emotion_cnn = EmotionCNN()
    model = emotion_cnn.model
    if model is None:
        print("Failed to build CNN model. Exiting.")
        return

    # Data augmentation
    train_datagen = ImageDataGenerator(
        rescale=1.0 / 255,
        rotation_range=10,
        width_shift_range=0.1,
        height_shift_range=0.1,
        shear_range=0.1,
        zoom_range=0.1,
        horizontal_flip=True,
        fill_mode='nearest'
    )
    val_datagen = ImageDataGenerator(rescale=1.0 / 255)

    print(f"Loading training data from {train_dir} ...")
    train_generator = train_datagen.flow_from_directory(
        train_dir,
        target_size=(48, 48),
        color_mode='grayscale',
        batch_size=32,
        class_mode='categorical',
        shuffle=True
    )

    print(f"Loading validation data from {val_dir} ...")
    validation_generator = val_datagen.flow_from_directory(
        val_dir,
        target_size=(48, 48),
        color_mode='grayscale',
        batch_size=32,
        class_mode='categorical',
        shuffle=False
    )

    # Callbacks
    os.makedirs(output_dir, exist_ok=True)
    model_save_path = os.path.join(output_dir, 'face_model.h5')

    checkpoint = ModelCheckpoint(
        model_save_path,
        monitor='val_accuracy',
        save_best_only=True,
        mode='max',
        verbose=1
    )
    early_stop = EarlyStopping(
        monitor='val_loss',
        patience=5,
        restore_best_weights=True,
        verbose=1
    )
    reduce_lr = ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.2,
        patience=3,
        min_lr=1e-6,
        verbose=1
    )

    steps_per_epoch = max(train_generator.samples // 32, 1)
    validation_steps = max(validation_generator.samples // 32, 1)

    print(f"Starting training ({epochs} epochs, {steps_per_epoch} steps/epoch)...")
    model.fit(
        train_generator,
        steps_per_epoch=steps_per_epoch,
        epochs=epochs,
        validation_data=validation_generator,
        validation_steps=validation_steps,
        callbacks=[checkpoint, early_stop, reduce_lr]
    )

    print(f"Training complete. Best model saved to {model_save_path}")


if __name__ == "__main__":
    train_face_model()
