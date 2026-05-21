"""
=============================================================
  UNIFIED 10-EPOCH TRAINER — All 3 Models
=============================================================
Trains the following models using LOCAL datasets only:

  1. FACE MODEL   — FaceCNN (3 classes)
                    Dataset : data/Mental-Health-Detection--1
                    Classes : Anxiety | Depress | Normal

  2. VOICE MODEL  — AudioCNNModel (5 classes)
                    Dataset : data/archive (3)/TESS...
                    Classes : Angry | Fear | Happy | Neutral | Sad

  3. TEXT MODEL   — HFTextEmotionRiskModel (DistilBERT)
                    Dataset : data/tweet_emotions 2.csv
                    Classes : anger | fear | joy | sadness | neutral

Run from the backend/ directory:
  python3 -m ml.training.train_all_10epochs
=============================================================
"""

import os
import sys
import glob
import time
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader, TensorDataset, random_split

# ─────────────────────────────────────────────
# Path setup
# ─────────────────────────────────────────────
current_dir  = os.path.dirname(os.path.abspath(__file__))   # backend/ml/training/
ml_dir       = os.path.dirname(current_dir)                  # backend/ml/
backend_dir  = os.path.dirname(ml_dir)                       # backend/
project_root = os.path.dirname(backend_dir)                  # project root

for p in [backend_dir, project_root]:
    if p not in sys.path:
        sys.path.insert(0, p)

# ─────────────────────────────────────────────
# Device (prefer MPS > CUDA > CPU)
# ─────────────────────────────────────────────
if torch.backends.mps.is_available():
    DEVICE = torch.device("mps")
elif torch.cuda.is_available():
    DEVICE = torch.device("cuda")
else:
    DEVICE = torch.device("cpu")

EPOCHS         = 10
PATIENCE       = 4          # early-stop patience
WEIGHTS_DIR    = os.path.join(backend_dir, "ml", "weights")
os.makedirs(WEIGHTS_DIR, exist_ok=True)

print("=" * 60)
print("  UNIFIED 10-EPOCH TRAINER")
print("=" * 60)
print(f"  Device  : {DEVICE}")
print(f"  Epochs  : {EPOCHS}")
print(f"  Weights : {WEIGHTS_DIR}")
print("=" * 60)


# ╔══════════════════════════════════════════════════════════╗
# ║              SHARED TRAINING LOOP                        ║
# ╚══════════════════════════════════════════════════════════╝

def run_training(model, train_loader, val_loader, criterion, optimizer,
                 model_name: str, multitask: bool = False):
    """
    Generic training loop with early stopping.
    If multitask=True, criterion must be a dict with keys 'emotion' and 'risk',
    and each batch must have 4 items: (input_ids, attn_mask, emo_label, risk_label).
    """
    model.to(DEVICE)
    best_val_loss    = float("inf")
    patience_counter = 0
    save_path        = os.path.join(WEIGHTS_DIR, f"{model_name}_best.pth")

    for epoch in range(1, EPOCHS + 1):
        # ── TRAIN ──────────────────────────────────────────
        model.train()
        train_loss = 0.0
        train_correct = 0
        train_total   = 0

        for batch in train_loader:
            optimizer.zero_grad()

            if multitask:
                ids, mask, emo_lbl, risk_lbl = [b.to(DEVICE) for b in batch]
                emo_logits, risk_logits = model(ids, mask)
                loss = criterion["emotion"](emo_logits, emo_lbl) \
                     + criterion["risk"](risk_logits, risk_lbl)
                preds = torch.argmax(emo_logits, dim=1)
                train_correct += (preds == emo_lbl).sum().item()
                train_total   += emo_lbl.size(0)
            else:
                feats, labels = batch[0].to(DEVICE).float(), batch[1].to(DEVICE).long()
                logits = model(feats)
                loss   = criterion(logits, labels)
                preds  = torch.argmax(logits, dim=1)
                train_correct += (preds == labels).sum().item()
                train_total   += labels.size(0)

            loss.backward()
            optimizer.step()
            train_loss += loss.item()

        avg_train_loss = train_loss / len(train_loader)
        train_acc      = train_correct / train_total if train_total > 0 else 0

        # ── VALIDATE ───────────────────────────────────────
        model.eval()
        val_loss     = 0.0
        val_correct  = 0
        val_total    = 0

        with torch.no_grad():
            for batch in val_loader:
                if multitask:
                    ids, mask, emo_lbl, risk_lbl = [b.to(DEVICE) for b in batch]
                    emo_logits, risk_logits = model(ids, mask)
                    loss = criterion["emotion"](emo_logits, emo_lbl) \
                         + criterion["risk"](risk_logits, risk_lbl)
                    preds = torch.argmax(emo_logits, dim=1)
                    val_correct += (preds == emo_lbl).sum().item()
                    val_total   += emo_lbl.size(0)
                else:
                    feats, labels = batch[0].to(DEVICE).float(), batch[1].to(DEVICE).long()
                    logits = model(feats)
                    loss   = criterion(logits, labels)
                    preds  = torch.argmax(logits, dim=1)
                    val_correct += (preds == labels).sum().item()
                    val_total   += labels.size(0)

                val_loss += loss.item()

        avg_val_loss = val_loss / len(val_loader)
        val_acc      = val_correct / val_total if val_total > 0 else 0

        print(f"  Epoch {epoch:02d}/{EPOCHS} | "
              f"Train Loss: {avg_train_loss:.4f}  Acc: {train_acc:.4f} | "
              f"Val Loss: {avg_val_loss:.4f}  Acc: {val_acc:.4f}")

        # ── CHECKPOINT & EARLY STOP ────────────────────────
        if avg_val_loss < best_val_loss:
            best_val_loss    = avg_val_loss
            patience_counter = 0
            torch.save(model.state_dict(), save_path)
            print(f"  ✅ Saved best weights → {save_path}")
        else:
            patience_counter += 1
            if patience_counter >= PATIENCE:
                print(f"  ⏹  Early stop at epoch {epoch} (no improvement for {PATIENCE} epochs)")
                break

    print(f"  🏆 Best Val Loss: {best_val_loss:.4f}\n")
    return save_path


# ╔══════════════════════════════════════════════════════════╗
# ║  1. FACE MODEL — Mental-Health-Detection dataset          ║
# ╚══════════════════════════════════════════════════════════╝

def train_face():
    print("\n" + "─" * 60)
    print("  [1/3]  FACE MODEL  (FaceCNN — 3 classes)")
    print("─" * 60)

    import cv2
    from ml.models.face_cnn import FaceCNN

    IMG_SIZE = 48
    FACE_CLASSES = {0: "Anxiety", 1: "Depress", 2: "Normal"}

    class FaceDS(Dataset):
        def __init__(self, images_dir, labels_dir, augment=False):
            self.augment = augment
            self.samples = []
            for img_path in sorted(
                glob.glob(os.path.join(images_dir, "*.jpg")) +
                glob.glob(os.path.join(images_dir, "*.JPG")) +
                glob.glob(os.path.join(images_dir, "*.png"))
            ):
                stem  = os.path.splitext(os.path.basename(img_path))[0]
                lbl_p = os.path.join(labels_dir, stem + ".txt")
                if not os.path.exists(lbl_p):
                    continue
                with open(lbl_p) as f:
                    line = f.readline().strip()
                if not line:
                    continue
                cid = int(line.split()[0])
                if cid in FACE_CLASSES:
                    self.samples.append((img_path, cid))

        def __len__(self): return len(self.samples)

        def _aug(self, img):
            a = np.random.uniform(-15, 15)
            h, w = img.shape
            M = cv2.getRotationMatrix2D((w//2, h//2), a, 1.0)
            img = cv2.warpAffine(img, M, (w,h), borderMode=cv2.BORDER_REFLECT)
            if np.random.rand() > 0.5: img = cv2.flip(img, 1)
            img = np.clip(img * np.random.uniform(0.8, 1.2), 0, 255)
            return img

        def __getitem__(self, idx):
            img_path, cid = self.samples[idx]
            img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
            img = cv2.resize(img, (IMG_SIZE, IMG_SIZE)).astype(np.float32) \
                  if img is not None else np.zeros((IMG_SIZE, IMG_SIZE), np.float32)
            if self.augment: img = self._aug(img)
            img = img / 255.0
            return torch.tensor(img[None], dtype=torch.float32), \
                   torch.tensor(cid, dtype=torch.long)

    data_root = os.path.join(project_root, "data", "Mental-Health-Detection--1")
    if not os.path.exists(data_root):
        print(f"  ⚠️  Dataset not found: {data_root}  — Skipping face model.")
        return

    train_ds = FaceDS(os.path.join(data_root,"train/images"),
                      os.path.join(data_root,"train/labels"), augment=True)
    val_ds   = FaceDS(os.path.join(data_root,"valid/images"),
                      os.path.join(data_root,"valid/labels"), augment=False)
    test_ds  = FaceDS(os.path.join(data_root,"test/images"),
                      os.path.join(data_root,"test/labels"),  augment=False)

    print(f"  Train: {len(train_ds)} | Val: {len(val_ds)} | Test: {len(test_ds)}")

    train_loader = DataLoader(train_ds, batch_size=32, shuffle=True,  num_workers=0)
    val_loader   = DataLoader(val_ds,   batch_size=32, shuffle=False, num_workers=0)
    test_loader  = DataLoader(test_ds,  batch_size=32, shuffle=False, num_workers=0)

    model     = FaceCNN(num_classes=3)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    save_path = run_training(model, train_loader, val_loader,
                             criterion, optimizer, "face_cnn_local")

    # Test evaluation
    model.load_state_dict(torch.load(save_path, map_location=DEVICE))
    model.to(DEVICE).eval()
    correct = total = 0
    with torch.no_grad():
        for imgs, lbls in test_loader:
            imgs, lbls = imgs.to(DEVICE), lbls.to(DEVICE)
            preds = torch.argmax(model(imgs), 1)
            correct += (preds == lbls).sum().item()
            total   += lbls.size(0)
    print(f"  🎯 Face Test Accuracy : {correct/total:.4f} ({correct/total*100:.1f}%)")


# ╔══════════════════════════════════════════════════════════╗
# ║  2. VOICE MODEL — TESS dataset                           ║
# ╚══════════════════════════════════════════════════════════╝

def train_voice():
    print("\n" + "─" * 60)
    print("  [2/3]  VOICE MODEL  (AudioCNNModel — 5 classes)")
    print("─" * 60)

    try:
        import librosa
    except ImportError:
        print("  ⚠️  librosa not installed. Run: pip install librosa")
        return

    from ml.models.audio_model import AudioCNNModel

    # Map TESS folder name substrings → class id
    VOICE_MAP = {
        "angry"   : 0,
        "fear"    : 1,
        "happy"   : 2,
        "neutral" : 3,
        "sad"     : 4,
        "disgust" : 0,   # merge disgust → angry
        "surprise": 2,   # merge surprise → happy
    }
    VOICE_CLASSES = {0:"Angry", 1:"Fear", 2:"Happy", 3:"Neutral", 4:"Sad"}

    tess_root = os.path.join(
        project_root, "data", "archive (3)",
        "TESS Toronto emotional speech set data",
        "TESS Toronto emotional speech set data"
    )

    if not os.path.exists(tess_root):
        print(f"  ⚠️  TESS dataset not found: {tess_root}  — Skipping voice model.")
        return

    # Gather all wav files with labels
    features, labels = [], []
    for folder in sorted(os.listdir(tess_root)):
        folder_lower = folder.lower()
        matched_label = None
        for keyword, cid in VOICE_MAP.items():
            if keyword in folder_lower:
                matched_label = cid
                break
        if matched_label is None:
            continue

        folder_path = os.path.join(tess_root, folder)
        wav_files = glob.glob(os.path.join(folder_path, "*.wav"))
        print(f"    {folder:<35} → class {matched_label} ({VOICE_CLASSES[matched_label]})  [{len(wav_files)} files]")

        for wav in wav_files:
            try:
                y, sr = librosa.load(wav, sr=16000, duration=3.0)
                mfcc  = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
                mfcc_m = np.mean(mfcc.T, axis=0)
                rms_m  = np.mean(librosa.feature.rms(y=y).T, axis=0)
                zcr_m  = np.mean(librosa.feature.zero_crossing_rate(y).T, axis=0)
                ep     = np.sum(librosa.feature.rms(y=y) > 0)
                feat   = np.concatenate([mfcc_m, rms_m, zcr_m, [float(ep)]])  # 16 dims
                features.append(feat.astype(np.float32))
                labels.append(matched_label)
            except Exception:
                pass

    if not features:
        print("  ⚠️  No audio features extracted — Skipping voice model.")
        return

    X = torch.tensor(np.array(features), dtype=torch.float32)
    y = torch.tensor(labels, dtype=torch.long)
    print(f"\n  Total samples extracted: {len(X)}")

    # Train / val / test split  (70 / 15 / 15)
    n       = len(X)
    n_train = int(0.70 * n)
    n_val   = int(0.15 * n)
    n_test  = n - n_train - n_val
    full_ds = TensorDataset(X, y)
    train_ds, val_ds, test_ds = random_split(
        full_ds, [n_train, n_val, n_test],
        generator=torch.Generator().manual_seed(42)
    )

    print(f"  Train: {len(train_ds)} | Val: {len(val_ds)} | Test: {len(test_ds)}")

    train_loader = DataLoader(train_ds, batch_size=32, shuffle=True,  num_workers=0)
    val_loader   = DataLoader(val_ds,   batch_size=32, shuffle=False, num_workers=0)
    test_loader  = DataLoader(test_ds,  batch_size=32, shuffle=False, num_workers=0)

    model     = AudioCNNModel(input_dim=16, num_emotions=5)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    save_path = run_training(model, train_loader, val_loader,
                             criterion, optimizer, "audio_cnn_tess")

    # Test evaluation
    model.load_state_dict(torch.load(save_path, map_location=DEVICE))
    model.to(DEVICE).eval()
    correct = total = 0
    with torch.no_grad():
        for feats, lbls in test_loader:
            feats, lbls = feats.to(DEVICE), lbls.to(DEVICE)
            preds = torch.argmax(model(feats), 1)
            correct += (preds == lbls).sum().item()
            total   += lbls.size(0)
    print(f"  🎯 Voice Test Accuracy : {correct/total:.4f} ({correct/total*100:.1f}%)")


# ╔══════════════════════════════════════════════════════════╗
# ║  3. TEXT MODEL — tweet_emotions CSV                      ║
# ╚══════════════════════════════════════════════════════════╝

def train_text():
    print("\n" + "─" * 60)
    print("  [3/3]  TEXT MODEL  (DistilBERT — 5 emotions + 3 risk levels)")
    print("─" * 60)

    try:
        import pandas as pd
        from transformers import AutoTokenizer
    except ImportError:
        print("  ⚠️  pandas / transformers not installed — Skipping text model.")
        return

    from ml.models.text_model_hf import HFTextEmotionRiskModel

    csv_path = os.path.join(project_root, "data", "tweet_emotions 2.csv")
    if not os.path.exists(csv_path):
        print(f"  ⚠️  CSV not found: {csv_path}  — Skipping text model.")
        return

    df = pd.read_csv(csv_path)
    print(f"  Raw rows: {len(df)}")
    print(f"  Columns : {list(df.columns)}")

    # Auto-detect text and label columns
    text_col  = next((c for c in df.columns if "content" in c.lower() or "text" in c.lower()), df.columns[0])
    label_col = next((c for c in df.columns if "sentiment" in c.lower() or "emotion" in c.lower() or "label" in c.lower()), df.columns[-1])
    print(f"  Using text_col='{text_col}'  label_col='{label_col}'")

    df = df[[text_col, label_col]].dropna()
    df.columns = ["text", "label"]

    # Map emotion strings → int
    EMOTION_MAP = {
        "anger"  : 0, "angry": 0,
        "fear"   : 1, "anxiety": 1, "worry": 1,
        "joy"    : 2, "happy": 2, "happiness": 2, "love": 2,
        "sadness": 3, "sad": 3, "depress": 3,
        "neutral": 4, "normal": 4, "surprise": 4, "boredom": 4,
    }
    df["emo_id"] = df["label"].str.lower().map(EMOTION_MAP)
    df = df.dropna(subset=["emo_id"])
    df["emo_id"] = df["emo_id"].astype(int)

    # Sub-sample to keep training fast (max 3000 rows)
    MAX_ROWS = 3000
    if len(df) > MAX_ROWS:
        df = df.sample(n=MAX_ROWS, random_state=42).reset_index(drop=True)
    print(f"  Using {len(df)} samples after filtering")

    tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")
    enc = tokenizer(
        df["text"].tolist(),
        truncation=True, padding=True, max_length=64, return_tensors="pt"
    )

    emo_ids  = torch.tensor(df["emo_id"].values, dtype=torch.long)
    risk_ids = torch.zeros(len(df), dtype=torch.long)  # mock risk = LOW for all

    full_ds = TensorDataset(enc["input_ids"], enc["attention_mask"], emo_ids, risk_ids)

    n       = len(full_ds)
    n_train = int(0.70 * n)
    n_val   = int(0.15 * n)
    n_test  = n - n_train - n_val
    train_ds, val_ds, test_ds = random_split(
        full_ds, [n_train, n_val, n_test],
        generator=torch.Generator().manual_seed(42)
    )
    print(f"  Train: {len(train_ds)} | Val: {len(val_ds)} | Test: {len(test_ds)}")

    train_loader = DataLoader(train_ds, batch_size=16, shuffle=True,  num_workers=0)
    val_loader   = DataLoader(val_ds,   batch_size=16, shuffle=False, num_workers=0)
    test_loader  = DataLoader(test_ds,  batch_size=16, shuffle=False, num_workers=0)

    model     = HFTextEmotionRiskModel(num_emotions=5, num_risk_levels=3)
    optimizer = optim.AdamW(model.parameters(), lr=2e-5)
    criterion = {
        "emotion": nn.CrossEntropyLoss(),
        "risk"   : nn.CrossEntropyLoss()
    }

    save_path = run_training(model, train_loader, val_loader,
                             criterion, optimizer, "text_distilbert",
                             multitask=True)

    # Test evaluation
    model.load_state_dict(torch.load(save_path, map_location=DEVICE))
    model.to(DEVICE).eval()
    correct = total = 0
    with torch.no_grad():
        for ids, mask, emo_lbl, _ in test_loader:
            ids, mask, emo_lbl = ids.to(DEVICE), mask.to(DEVICE), emo_lbl.to(DEVICE)
            emo_logits, _ = model(ids, mask)
            preds = torch.argmax(emo_logits, 1)
            correct += (preds == emo_lbl).sum().item()
            total   += emo_lbl.size(0)
    print(f"  🎯 Text Test Accuracy  : {correct/total:.4f} ({correct/total*100:.1f}%)")


# ╔══════════════════════════════════════════════════════════╗
# ║  MAIN                                                    ║
# ╚══════════════════════════════════════════════════════════╝

if __name__ == "__main__":
    t0 = time.time()

    train_face()
    train_voice()
    train_text()

    elapsed = time.time() - t0
    mins, secs = divmod(int(elapsed), 60)
    print("\n" + "=" * 60)
    print(f"  ✅ ALL 3 MODELS TRAINED SUCCESSFULLY in {mins}m {secs}s")
    print(f"  Weights saved to: {WEIGHTS_DIR}")
    print("=" * 60)
