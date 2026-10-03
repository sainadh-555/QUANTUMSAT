from qiskit_aer import AerSimulator
import os

def get_quantum_backend(use_hardware=False, backend_name=None):
    """
    Returns a Qiskit backend.
    Default is local AerSimulator.
    """
    if use_hardware:
        # User explicitly requested hardware
        token = os.getenv("IBM_QUANTUM_TOKEN")
        if not token or token == "your_token_here":
            raise ValueError("IBM Quantum token not configured. Please set IBM_QUANTUM_TOKEN in .env")
            
        try:
            from qiskit_ibm_provider import IBMProvider
            provider = IBMProvider(token=token)
            
            if backend_name:
                return provider.get_backend(backend_name)
            else:
                # Get least busy backend
                backends = provider.backends(simulator=False, operational=True)
                # Just return a simple one for now if available, normally would filter
                if not backends:
                    raise ValueError("No operational hardware backends found.")
                return backends[0]
                
        except ImportError:
            raise ImportError("qiskit-ibm-provider is required for hardware access. Install it via pip.")
    else:
        # Default to local simulator
        return AerSimulator()
