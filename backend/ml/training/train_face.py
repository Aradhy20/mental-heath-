import os
import sys
import torch
import torch.nn as nn
import torch.optim as optim
from torch.optim.lr_scheduler import ReduceLROnPlateau

# Add backend root to path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_root = os.path.dirname(os.path.dirname(current_dir)) # backend/
if backend_root not in sys.path:
    sys.path.append(backend_root)

from ml.dataset.fer2013_loader import get_dataloaders
from ml.models.face_cnn import FaceCNN

def train_model():
    # Setup device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")
    
    # Parameters
    epochs = 5
    batch_size = 64
    learning_rate = 0.001
    early_stopping_patience = 3
    
    # Load loaders
    train_loader, val_loader, test_loader = get_dataloaders(
        batch_size=batch_size,
        limit_train=2000,
        limit_val=400,
        limit_test=400
    )
    
    # Load Model
    model = FaceCNN(num_classes=5).to(device)
    
    # Loss & Optimizer
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)
    scheduler = ReduceLROnPlateau(optimizer, mode='max', factor=0.5, patience=1)
    
    # Tracker for Early Stopping
    best_val_acc = 0.0
    patience_counter = 0
    weights_dir = os.path.join(backend_root, "ml", "weights")
    os.makedirs(weights_dir, exist_ok=True)
    best_model_path = os.path.join(weights_dir, "face_cnn_best.pth")
    
    print("\nStarting Training (10 Epochs)...")
    
    for epoch in range(1, epochs + 1):
        # Training Phase
        model.train()
        running_loss = 0.0
        correct_train = 0
        total_train = 0
        
        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item() * images.size(0)
            _, predicted = torch.max(outputs, 1)
            total_train += labels.size(0)
            correct_train += (predicted == labels).sum().item()
            
        epoch_loss = running_loss / len(train_loader.dataset)
        epoch_train_acc = correct_train / total_train
        
        # Validation Phase
        model.eval()
        running_val_loss = 0.0
        correct_val = 0
        total_val = 0
        
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)
                
                running_val_loss += loss.item() * images.size(0)
                _, predicted = torch.max(outputs, 1)
                total_val += labels.size(0)
                correct_val += (predicted == labels).sum().item()
                
        val_loss = running_val_loss / len(val_loader.dataset)
        val_acc = correct_val / total_val
        
        print(f"Epoch {epoch:02d}/{epochs:02d} | "
              f"Train Loss: {epoch_loss:.4f} - Train Acc: {epoch_train_acc:.4f} | "
              f"Val Loss: {val_loss:.4f} - Val Acc: {val_acc:.4f}")
        
        # Scheduler Step
        scheduler.step(val_acc)
        
        # Check if validation accuracy improved
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            patience_counter = 0
            # Save weights
            torch.save(model.state_dict(), best_model_path)
            print(f" -> Best model updated! Saved to: {best_model_path}")
        else:
            patience_counter += 1
            if patience_counter >= early_stopping_patience:
                print(f"Early stopping triggered after {epoch} epochs.")
                break
                
    # Load best model for evaluation on test set
    print("\nEvaluating best model on Test Set...")
    if os.path.exists(best_model_path):
        model.load_state_dict(torch.load(best_model_path))
    model.eval()
    
    correct_test = 0
    total_test = 0
    with torch.no_grad():
        for images, labels in test_loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            _, predicted = torch.max(outputs, 1)
            total_test += labels.size(0)
            correct_test += (predicted == labels).sum().item()
            
    test_acc = correct_test / total_test
    print(f"Test Set Accuracy: {test_acc:.4f}")
    print("Training process finished.")

if __name__ == "__main__":
    train_model()
