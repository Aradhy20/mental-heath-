import numpy as np
import cv2
import torch
from torch.utils.data import Dataset, DataLoader
from datasets import load_dataset
from PIL import Image

# Class mapping:
# Original fer2013 labels:
# 0: Angry, 1: Disgust, 2: Fear, 3: Happy, 4: Sad, 5: Surprise, 6: Neutral
# Our 5 Target Labels:
# 0: Happy, 1: Sad, 2: Angry, 3: Neutral, 4: Surprise
# Filter out: 1 (Disgust) and 2 (Fear)
LABEL_MAPPING = {
    3: 0, # Happy
    4: 1, # Sad
    0: 2, # Angry
    6: 3, # Neutral
    5: 4  # Surprise
}

class FER2013Dataset(Dataset):
    def __init__(self, hf_dataset, augment=False):
        """
        PyTorch wrapper for Hugging Face FER2013 dataset.
        
        Args:
            hf_dataset: The Hugging Face dataset split (train/validation/test).
            augment: Whether to apply NumPy-based data augmentations.
        """
        # Filter out labels 1 and 2
        self.samples = [
            item for item in hf_dataset 
            if item['label'] in LABEL_MAPPING
        ]
        self.augment = augment

    def __len__(self):
        return len(self.samples)

    def _apply_augmentation(self, img):
        """
        Applies rotation, horizontal flip, brightness variation, and zoom using OpenCV/NumPy.
        """
        # 1. Random Rotation (-15 to +15 degrees)
        angle = np.random.uniform(-15, 15)
        h, w = img.shape[:2]
        M = cv2.getRotationMatrix2D((w // 2, h // 2), angle, 1.0)
        img = cv2.warpAffine(img, M, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)

        # 2. Horizontal Flip (50% probability)
        if np.random.rand() > 0.5:
            img = cv2.flip(img, 1)

        # 3. Brightness Variation (±20%)
        brightness = np.random.uniform(0.8, 1.2)
        img = np.clip(img * brightness, 0, 255)

        # 4. Slight Zoom (crop up to 10% and resize back)
        if np.random.rand() > 0.5:
            zoom_factor = np.random.uniform(0.9, 1.0)
            new_h, new_w = int(h * zoom_factor), int(w * zoom_factor)
            dy = np.random.randint(0, h - new_h + 1)
            dx = np.random.randint(0, w - new_w + 1)
            img_cropped = img[dy:dy+new_h, dx:dx+new_w]
            img = cv2.resize(img_cropped, (w, h), interpolation=cv2.INTER_LINEAR)

        return img

    def __getitem__(self, idx):
        sample = self.samples[idx]
        image_pil = sample['image']
        label_orig = sample['label']
        
        # Convert PIL image to Grayscale NumPy array
        img = np.array(image_pil.convert('L'), dtype=np.float32)

        # Apply augmentation if requested
        if self.augment:
            img = self._apply_augmentation(img)

        # Normalize to (0, 1)
        img = img / 255.0

        # Reshape to (1, 48, 48) for PyTorch Conv2D channel dimension
        img = np.expand_dims(img, axis=0)

        # Map to target label
        label = LABEL_MAPPING[label_orig]

        return torch.tensor(img, dtype=torch.float32), torch.tensor(label, dtype=torch.long)

def get_dataloaders(batch_size=32):
    """
    Downloads AutumnQiu/fer2013 and returns train, validation, and test PyTorch DataLoaders.
    """
    print("Loading AutumnQiu/fer2013 dataset from Hugging Face...")
    dataset = load_dataset("AutumnQiu/fer2013")
    
    train_ds = FER2013Dataset(dataset['train'], augment=True)
    val_ds = FER2013Dataset(dataset['valid'], augment=False)
    test_ds = FER2013Dataset(dataset['test'], augment=False)
    
    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=0)
    test_loader = DataLoader(test_ds, batch_size=batch_size, shuffle=False, num_workers=0)
    
    print(f"Dataset Loaded:")
    print(f" - Train samples: {len(train_ds)}")
    print(f" - Validation samples: {len(val_ds)}")
    print(f" - Test samples: {len(test_ds)}")
    
    return train_loader, val_loader, test_loader

if __name__ == "__main__":
    # Small test block
    train_loader, val_loader, test_loader = get_dataloaders(batch_size=4)
    x, y = next(iter(train_loader))
    print(f"Batch X shape: {x.shape}, dtype: {x.dtype}")
    print(f"Batch Y shape: {y.shape}, dtype: {y.dtype}")
    print(f"Sample values (min/max): {x.min().item():.3f} / {x.max().item():.3f}")
