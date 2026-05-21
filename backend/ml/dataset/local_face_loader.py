"""
Local Face Dataset Loader
=========================
Loads the Mental-Health-Detection dataset stored locally at:
  data/Mental-Health-Detection--1/

Dataset format: YOLO (images/ + labels/ folders)
Classes (from data.yaml):
  0 = Anxiety
  1 = Depress
  2 = Normal

Maps to our 3-class face model:
  0 = Anxiety
  1 = Depress (Sad)
  2 = Normal (Neutral)
"""

import os
import glob
import cv2
import numpy as np
import torch
from torch.utils.data import Dataset, DataLoader
from PIL import Image

# ------------------------------------------------------------------ #
# Class mapping — 3 classes from the local dataset
# ------------------------------------------------------------------ #
CLASSES = {0: "Anxiety", 1: "Depress", 2: "Normal"}
NUM_CLASSES = 3
IMG_SIZE = 48   # Resize to 48x48 to match FaceCNN architecture


class LocalFaceDataset(Dataset):
    """
    PyTorch Dataset that reads YOLO-format face images and their class labels.

    Label extraction:
      - Each .txt label file contains one or more rows: <class_id> <x> <y> <w> <h> ...
      - We take the class_id from the FIRST detection in the label file.
      - Images with no label file are skipped.
    """

    def __init__(self, images_dir: str, labels_dir: str, augment: bool = False, limit: int = None):
        self.augment = augment
        self.samples = []  # list of (image_path, class_id)

        img_paths = sorted(
            glob.glob(os.path.join(images_dir, "*.jpg")) +
            glob.glob(os.path.join(images_dir, "*.JPG")) +
            glob.glob(os.path.join(images_dir, "*.png")) +
            glob.glob(os.path.join(images_dir, "*.jpeg"))
        )

        for img_path in img_paths:
            # Derive the corresponding label file path
            stem = os.path.splitext(os.path.basename(img_path))[0]
            label_path = os.path.join(labels_dir, stem + ".txt")

            if not os.path.exists(label_path):
                continue  # skip unannotated images

            with open(label_path, "r") as f:
                first_line = f.readline().strip()

            if not first_line:
                continue  # empty label file

            class_id = int(first_line.split()[0])
            if class_id not in CLASSES:
                continue  # skip unknown classes

            self.samples.append((img_path, class_id))

        if limit is not None:
            self.samples = self.samples[:limit]

        print(f"  Loaded {len(self.samples)} samples from {images_dir}")

    def __len__(self):
        return len(self.samples)

    def _augment(self, img: np.ndarray) -> np.ndarray:
        """Simple augmentations: rotation, flip, brightness."""
        # Random rotation ±15°
        angle = np.random.uniform(-15, 15)
        h, w = img.shape[:2]
        M = cv2.getRotationMatrix2D((w // 2, h // 2), angle, 1.0)
        img = cv2.warpAffine(img, M, (w, h), borderMode=cv2.BORDER_REFLECT)

        # Horizontal flip 50%
        if np.random.rand() > 0.5:
            img = cv2.flip(img, 1)

        # Brightness ±20%
        brightness = np.random.uniform(0.8, 1.2)
        img = np.clip(img * brightness, 0, 255).astype(np.float32)

        return img

    def __getitem__(self, idx):
        img_path, class_id = self.samples[idx]

        # Load image as grayscale
        img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
        if img is None:
            # Fallback: return black image
            img = np.zeros((IMG_SIZE, IMG_SIZE), dtype=np.float32)
        else:
            img = cv2.resize(img, (IMG_SIZE, IMG_SIZE)).astype(np.float32)

        if self.augment:
            img = self._augment(img)

        # Normalize to [0, 1]
        img = img / 255.0

        # Add channel dimension → (1, 48, 48)
        img = np.expand_dims(img, axis=0)

        return (
            torch.tensor(img, dtype=torch.float32),
            torch.tensor(class_id, dtype=torch.long)
        )


def get_local_dataloaders(
    data_root: str = None,
    batch_size: int = 32,
    limit_train: int = None,
    limit_val: int = None,
    limit_test: int = None,
    num_workers: int = 0
):
    """
    Build train / val / test DataLoaders from the local Mental-Health-Detection dataset.

    Args:
        data_root: Absolute path to the Mental-Health-Detection--1 folder.
                   Defaults to <project_root>/data/Mental-Health-Detection--1
        batch_size: Batch size for the DataLoaders.
        limit_*: Optional caps on dataset size (useful for fast debugging).
        num_workers: Number of DataLoader worker processes.

    Returns:
        train_loader, val_loader, test_loader
    """
    if data_root is None:
        # Auto-detect: walk up from this file to find the project root
        this_file = os.path.abspath(__file__)
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(this_file)))
        project_root = os.path.dirname(backend_dir)
        data_root = os.path.join(project_root, "data", "Mental-Health-Detection--1")

    if not os.path.exists(data_root):
        raise FileNotFoundError(
            f"Local dataset not found at: {data_root}\n"
            f"Please make sure the 'data/Mental-Health-Detection--1' folder exists."
        )

    print(f"\n📁 Loading local face dataset from:\n   {data_root}\n")

    splits = {
        "train": ("train/images", "train/labels", True,  limit_train),
        "val":   ("valid/images", "valid/labels", False, limit_val),
        "test":  ("test/images",  "test/labels",  False, limit_test),
    }

    loaders = []
    for split_name, (img_sub, lbl_sub, aug, lim) in splits.items():
        img_dir = os.path.join(data_root, img_sub)
        lbl_dir = os.path.join(data_root, lbl_sub)

        if not os.path.exists(img_dir):
            print(f"  ⚠️  {split_name} images dir not found: {img_dir}")
            loaders.append(None)
            continue

        ds = LocalFaceDataset(img_dir, lbl_dir, augment=aug, limit=lim)
        shuffle = (split_name == "train")
        loader = DataLoader(ds, batch_size=batch_size, shuffle=shuffle, num_workers=num_workers)
        loaders.append(loader)

    train_loader, val_loader, test_loader = loaders
    print(f"\n✅ Dataset ready — Classes: {CLASSES}")
    return train_loader, val_loader, test_loader


# ------------------------------------------------------------------ #
# Quick test
# ------------------------------------------------------------------ #
if __name__ == "__main__":
    train_loader, val_loader, test_loader = get_local_dataloaders(batch_size=4)
    x, y = next(iter(train_loader))
    print(f"Batch X shape : {x.shape}")
    print(f"Batch Y shape : {y.shape}")
    print(f"Labels in batch: {y.tolist()}")
    print(f"Pixel range   : min={x.min():.3f}  max={x.max():.3f}")
    print("✅ local_face_loader works correctly!")
