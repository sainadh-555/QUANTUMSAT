# Methodology

## Land Cover Classification

### Dataset
We use the EuroSAT dataset, containing 27,000 labeled satellite images across 10 classes. The images are processed in RGB format.

### Data Splitting
Train/Validation/Test splits are generated strictly before any feature normalization to prevent data leakage. 

### Classical Baseline
- **RBF-SVM**: A standard Support Vector Machine with a Radial Basis Function kernel.
- **Random Forest**: An ensemble method using 100 trees.

### Quantum Approach
We utilize a Quantum Support Vector Machine (QSVM). 
- **Feature Map**: `ZZFeatureMap` is employed to encode classical data into quantum states. 
- **Kernel Calculation**: `FidelityQuantumKernel` estimates the overlap (fidelity) between quantum states to form the kernel matrix.
- **Classification**: The computed kernel matrix is passed to a classical SVM solver.

## Change Detection
Patch-based analysis is performed by breaking down image pairs. Features are extracted per patch, and the difference is calculated. Currently, simple thresholding serves as the baseline, with the architecture built to support quantum patch-classification in the future.
