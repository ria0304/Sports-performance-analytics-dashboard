import os
import sys
import shutil
import subprocess

def install_kagglehub():
    try:
        import kagglehub
    except ImportError:
        print("Installing kagglehub...")
        subprocess.run([sys.executable, "-m", "pip", "install", "kagglehub"], check=True)

def main():
    install_kagglehub()
    import kagglehub

    datasets = [
        "rohanrao/formula-1-world-championship-1950-2020",
        "vshreekamalesh/comprehensive-formula-1-dataset-2020-2025",
        "adamgbor/club-football-match-data-2000-2025"
    ]

    # We will copy the cached files into the project's raw data folder
    dest_dir = os.path.join(os.getcwd(), "src", "data", "raw")
    os.makedirs(dest_dir, exist_ok=True)

    for dataset in datasets:
        print(f"\nDownloading {dataset}...")
        
        # Download latest version using kagglehub
        path = kagglehub.dataset_download(dataset)
        print(f"Path to dataset files (cache): {path}")
        
        # Copy to project directory for easy access
        dataset_name = dataset.split("/")[-1]
        target_path = os.path.join(dest_dir, dataset_name)
        
        if os.path.exists(target_path):
            shutil.rmtree(target_path)
            
        shutil.copytree(path, target_path)
        print(f"✅ Copied to project folder: {target_path}")

    print(f"\n🎉 All downloads finished! Files are ready in ./{dest_dir}")

if __name__ == "__main__":
    main()
