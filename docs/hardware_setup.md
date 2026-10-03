# Hardware Setup Guide

## IBM Quantum Execution

This project supports running quantum circuits on real IBM Quantum hardware.

### Configuration
1. Register for an account at [IBM Quantum Platform](https://quantum.ibm.com/).
2. Copy your API token from your dashboard.
3. Add the token to the `.env` file in the root directory:
   ```
   IBM_QUANTUM_TOKEN=your_token_here
   ```

### Execution
In the **Quantum Laboratory** module, check the "Run on IBM Quantum Hardware" checkbox before clicking "Train Quantum Model". 

> **Warning:** Hardware queues can take a long time, and free quotas are limited. It is highly recommended to prototype and test using the local simulator first before executing on real hardware.
