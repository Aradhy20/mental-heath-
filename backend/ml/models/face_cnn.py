import torch
import torch.nn as nn
import torch.nn.functional as F

class FaceCNN(nn.Module):
    def __init__(self, num_classes=5):
        """
        Face Emotion Detection CNN Model.
        
        Args:
            num_classes: Number of target emotion classes (default: 5).
        """
        super(FaceCNN, self).__init__()
        
        # Block 1
        # Input: (1, 48, 48)
        self.conv1 = nn.Conv2d(in_channels=1, out_channels=32, kernel_size=3, padding=1)
        self.bn1 = nn.BatchNorm2d(32)
        self.pool1 = nn.MaxPool2d(kernel_size=2, stride=2) # Output: (32, 24, 24)
        
        # Block 2
        self.conv2 = nn.Conv2d(in_channels=32, out_channels=64, kernel_size=3, padding=1)
        self.bn2 = nn.BatchNorm2d(64)
        self.pool2 = nn.MaxPool2d(kernel_size=2, stride=2) # Output: (64, 12, 12)
        
        # Block 3
        self.conv3 = nn.Conv2d(in_channels=64, out_channels=128, kernel_size=3, padding=1)
        self.bn3 = nn.BatchNorm2d(128)
        self.pool3 = nn.MaxPool2d(kernel_size=2, stride=2) # Output: (128, 6, 6)
        
        # Fully Connected Layers
        self.flatten = nn.Flatten()
        self.fc1 = nn.Linear(128 * 6 * 6, 128)
        self.dropout = nn.Dropout(p=0.5)
        self.fc2 = nn.Linear(128, num_classes)

    def forward(self, x):
        """
        Forward pass.
        Note: In PyTorch, CrossEntropyLoss expects raw logits. We do not apply Softmax here.
        Instead, Softmax is applied during inference.
        """
        # Block 1
        x = self.conv1(x)
        x = F.relu(x)
        x = self.bn1(x)
        x = self.pool1(x)
        
        # Block 2
        x = self.conv2(x)
        x = F.relu(x)
        x = self.bn2(x)
        x = self.pool2(x)
        
        # Block 3
        x = self.conv3(x)
        x = F.relu(x)
        x = self.bn3(x)
        x = self.pool3(x)
        
        # Flatten and Dense
        x = self.flatten(x)
        x = self.fc1(x)
        x = F.relu(x)
        x = self.dropout(x)
        x = self.fc2(x)
        
        return x

if __name__ == "__main__":
    # Test model shape with a random tensor
    model = FaceCNN()
    test_input = torch.randn(2, 1, 48, 48)
    output = model(test_input)
    print(f"Test input shape: {test_input.shape}")
    print(f"Output shape (should be [2, 5]): {output.shape}")
    assert list(output.shape) == [2, 5], "Output shape is incorrect!"
    print("✅ PyTorch FaceCNN model architecture verified successfully.")
