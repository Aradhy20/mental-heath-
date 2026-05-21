"""
Train Face Emotion Model — Local Dataset
=========================================
Uses the locally installed Mental-Health-Detection dataset:
  data/Mental-Health-Detection--1/

Classes:
  0 = Anxiety
  1 = Depress
  2 = Normal

Model: FaceCNN (3-class variant)
"""

import os
import sys
import torch
import torch.nn as nn
import torch.optim as optim
from torch.optim.lr_scheduler import ReduceLROnPlateau

# ------------------------------------------------------------------ #
# Path setup — make sure backend/ is on sys.path
# ------------------------------------------------------------------ #
current_dir   = os.path.dirname(os.path.abspath(__file__))   # backend/ml/training/
ml_dir        = os.path.dirname(current_dir)                  # backend/ml/
backend_root  = os.path.dirname(ml_dir)                       # backend/
project_root  = os.path.dirname(backend_root)                 # project root

for p in [backend_root, project_root]:
    if p not in sys.path:
        sys.path.insert(0, p)

from ml.dataset.local_face_loader import get_local_dataloaders, CLASSES, NUM_CLASSES
from ml.models.face_cnn import FaceCNN


def train_model():
    # ---------------------------------------------------------- #
    # Device
    # ---------------------------------------------------------- #
    if torch.cuda.is_available():
        device = torch.device("cuda")
    elif torch.backends.mps.is_available():
        device = torch.device("mps")
    else:
        device = torch.device("cpu")
    print(f"🚀 Using device: {device}")

    # ---------------------------------------------------------- #
    # Hyper-parameters
    # ---------------------------------------------------------- #
    EPOCHS              = 20
    BATCH_SIZE          = 32
    LEARNING_RATE       = 0.001
    EARLY_STOP_PATIENCE = 5

    # Point to your local dataset
    data_root = os.path.join(project_root, "data", "Mental-Health-Detection--1")
    print(f"📂 Dataset root: {data_root}")

    # ---------------------------------------------------------- #
    # Data loaders (no limit — use the full local dataset)
    # ---------------------------------------------------------- #
    train_loader, val_loader, test_loader = get_local_dataloaders(
        data_root  = data_root,
        batch_size = BATCH_SIZE,
        num_workers = 0
    )

    if train_loader is None:
        print("❌ Training data loader is None. Aborting.")
        return

    # ---------------------------------------------------------- #
    # Model — 3 classes matching the local dataset
    # ---------------------------------------------------------- #
    model = FaceCNN(num_classes=NUM_CLASSES).to(device)
    print(f"\n🧠 FaceCNN initialised with {NUM_CLASSES} classes: {CLASSES}")

    # ---------------------------------------------------------- #
    # Loss, Optimiser, Scheduler
    # ---------------------------------------------------------- #
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)
    scheduler = ReduceLROnPlateau(optimizer, mode="max", factor=0.5, patience=2)

    # ---------------------------------------------------------- #
    # Weights output directory
    # ---------------------------------------------------------- #
    weights_dir = os.path.join(backend_root, "ml", "weights")
    os.makedirs(weights_dir, exist_ok=True)
    best_model_path = os.path.join(weights_dir, "face_cnn_local_best.pth")

    # ---------------------------------------------------------- #
    # Training loop
    # ---------------------------------------------------------- #
    best_val_acc     = 0.0
    patience_counter = 0

    print(f"\n🔄 Starting training ({EPOCHS} epochs)...\n")

    for epoch in range(1, EPOCHS + 1):
        # --- Train ---
        model.train()
        running_loss   = 0.0
        correct_train  = 0
        total_train    = 0

        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)

            optimizer.zero_grad()
            outputs = model(images)
            loss    = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss  += loss.item() * images.size(0)
            _, predicted   = torch.max(outputs, 1)
            total_train   += labels.size(0)
            correct_train += (predicted == labels).sum().item()

        epoch_loss      = running_loss / total_train
        epoch_train_acc = correct_train / total_train

        # --- Validate ---
        model.eval()
        running_val_loss = 0.0
        correct_val      = 0
        total_val        = 0

        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs        = model(images)
                loss           = criterion(outputs, labels)

                running_val_loss += loss.item() * images.size(0)
                _, predicted      = torch.max(outputs, 1)
                total_val        += labels.size(0)
                correct_val      += (predicted == labels).sum().item()

        val_loss = running_val_loss / total_val if total_val > 0 else 0
        val_acc  = correct_val / total_val      if total_val > 0 else 0

        print(
            f"Epoch {epoch:02d}/{EPOCHS} | "
            f"Train Loss: {epoch_loss:.4f}  Train Acc: {epoch_train_acc:.4f} | "
            f"Val Loss: {val_loss:.4f}  Val Acc: {val_acc:.4f}"
        )

        scheduler.step(val_acc)

        # --- Early stopping & checkpoint ---
        if val_acc > best_val_acc:
            best_val_acc     = val_acc
            patience_counter = 0
            torch.save(model.state_dict(), best_model_path)
            print(f"  ✅ New best model saved (val_acc={val_acc:.4f}) → {best_model_path}")
        else:
            patience_counter += 1
            if patience_counter >= EARLY_STOP_PATIENCE:
                print(f"\n⏹️  Early stopping after {epoch} epochs (no improvement for {EARLY_STOP_PATIENCE} epochs).")
                break

    # ---------------------------------------------------------- #
    # Test evaluation
    # ---------------------------------------------------------- #
    print(f"\n📊 Evaluating best model on test set...")
    if os.path.exists(best_model_path):
        model.load_state_dict(torch.load(best_model_path, map_location=device))
    model.eval()

    correct_test = 0
    total_test   = 0

    with torch.no_grad():
        for images, labels in test_loader:
            images, labels = images.to(device), labels.to(device)
            outputs        = model(images)
            _, predicted   = torch.max(outputs, 1)
            total_test    += labels.size(0)
            correct_test  += (predicted == labels).sum().item()

    test_acc = correct_test / total_test if total_test > 0 else 0
    print(f"\n🎯 Test Set Accuracy: {test_acc:.4f} ({test_acc*100:.1f}%)")
    print(f"🏆 Best Validation Accuracy: {best_val_acc:.4f} ({best_val_acc*100:.1f}%)")
    print(f"\n✅ Training complete! Weights saved to:\n   {best_model_path}")


if __name__ == "__main__":
    train_model()
