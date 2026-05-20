import os
import yaml
from ultralytics import YOLO

# ─── Configuration ───────────────────────────────────────────────────────────
PROJ_ROOT = "/Users/aradhyjain/Library/CloudStorage/GoogleDrive-jainaradhy01@gmail.com/My Drive/project"
DATASET_PATH = os.path.join(PROJ_ROOT, "data", "Mental-Health-Detection--1")
YAML_FILE = os.path.join(DATASET_PATH, "data.yaml")
OUTPUT_MODEL_PATH = os.path.join(PROJ_ROOT, "backend", "ml", "engines", "face", "model", "face_yolo_v1.pt")

def fix_yaml():
    """Ensure data.yaml has absolute paths to avoid training errors."""
    with open(YAML_FILE, 'r') as f:
        data = yaml.safe_load(f)
    
    # Update paths to be absolute
    data['train'] = os.path.join(DATASET_PATH, 'train', 'images')
    data['val'] = os.path.join(DATASET_PATH, 'valid', 'images')
    data['test'] = os.path.join(DATASET_PATH, 'test', 'images')
    
    # Remove any relative 'path' if it exists
    if 'path' in data:
        del data['path']
        
    with open(YAML_FILE, 'w') as f:
        yaml.dump(data, f)
    print(f"✅ Fixed YAML at {YAML_FILE}")

def train_model(epochs=20):
    """Train YOLOv8 on the mental health dataset."""
    os.makedirs(os.path.dirname(OUTPUT_MODEL_PATH), exist_ok=True)
    
    # Load a pretrained YOLOv8n model
    model = YOLO('yolov8n.pt') 
    
    print("Starting YOLOv8 training for 20 epochs (Optimized for speed)...")
    # Training
    results = model.train(
        data=YAML_FILE,
        epochs=epochs,
        imgsz=320,
        batch=32,
        name='mental_health_yolo',
        project=os.path.join(PROJ_ROOT, 'backend', 'ml', 'engines', 'face', 'training', 'runs'),
        exist_ok=True,
        device='cpu',
        workers=0 # Better for stability on some systems
    )
    
    # Save the best model to our central location
    best_model_path = os.path.join(PROJ_ROOT, 'backend', 'ml', 'engines', 'face', 'training', 'runs', 'mental_health_yolo', 'weights', 'best.pt')
    if os.path.exists(best_model_path):
        import shutil
        shutil.copy(best_model_path, OUTPUT_MODEL_PATH)
        print(f"✅ Training complete! Model saved to {OUTPUT_MODEL_PATH}")
    else:
        print("❌ Error: Could not find trained model weights.")
 
if __name__ == "__main__":
    fix_yaml()
    train_model(epochs=20)
