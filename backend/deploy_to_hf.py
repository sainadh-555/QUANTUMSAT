import os
import sys
from huggingface_hub import HfApi

def deploy_to_hf():
    token = os.environ.get("HF_TOKEN")
    if not token:
        print("Error: HF_TOKEN environment variable not set.")
        print("Please set your Hugging Face access token with Write permissions.")
        sys.exit(1)

    api = HfApi(token=token)
    user = api.whoami()["name"]
    repo_id = f"{user}/terra-quantum-api"
    
    print(f"Creating Space: {repo_id}")
    try:
        api.create_repo(
            repo_id=repo_id,
            repo_type="space",
            space_sdk="docker",
            private=False,
            exist_ok=True
        )
        print("Space created or already exists.")
    except Exception as e:
        print(f"Error creating space: {e}")
        sys.exit(1)

    print("Uploading backend files...")
    try:
        # We upload everything in the backend folder EXCEPT .venv, __pycache__, data
        api.upload_folder(
            folder_path=".",
            repo_id=repo_id,
            repo_type="space",
            ignore_patterns=["*.venv*", "*__pycache__*", "*data*", ".env", ".git*"]
        )
        print(f"\n✅ Deployment complete!")
        print(f"Your API is live at: https://{user}-terra-quantum-api.hf.space/api")
        print(f"Dashboard: https://huggingface.co/spaces/{repo_id}")
    except Exception as e:
        print(f"Error uploading files: {e}")
        sys.exit(1)

if __name__ == "__main__":
    deploy_to_hf()
