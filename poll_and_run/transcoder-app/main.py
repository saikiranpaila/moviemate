import boto3
import os
import subprocess
# from pymongo import MongoClient

# # Connect to the MongoDB server (local MongoDB instance)
# client = MongoClient('mongodb://localhost:27017/')

# # Select the database and collection
# db = client['moviemate_test']
# collection = db['movies']

# # Define the document's ID and the new field to add
# movie_id = "f3a02cef4b63dc17b99ce4a01b5098fe"
# new_field = {"director": "Christopher Nolan"}

# # Find and update the document by its ID, adding the new field
# update_result = collection.update_one(
#     {'id': movie_id},  # Find by ID
#     {'$set': new_field}  # Add the new field
# )

# Environment variables
AWS_REGION = os.getenv("AWS_REGION") if os.getenv("AWS_REGION") else "us-east-1"
SOURCE_BUCKET = os.getenv("SOURCE_BUCKET") if os.getenv("SOURCE_BUCKET") else 'src.22122024.bucket'
TARGET_BUCKET = os.getenv("TARGET_BUCKET") if os.getenv("TARGET_BUCKET") else 'dest.22122024.bucket'
SOURCE_KEY=os.getenv("SOURCE_KEY") if os.getenv("SOURCE_KEY") else 'f3a02cef4b63dc17b99ce4a01b5098fe/input.mp4'

# AWS S3 client
s3 = boto3.client('s3', region_name=AWS_REGION)

TEMP_DIR = "/tmp"

# Define resolutions and bitrates
RESOLUTIONS = [
    # {"name": "1080p", "width": 1920, "height": 1080, "bitrate": "5000k"},
    # {"name": "720p", "width": 1280, "height": 720, "bitrate": "3000k"},
    {"name": "480p", "width": 854, "height": 480, "bitrate": "1500k"},
]

def download_file(bucket_name, key, local_path):
    print(f"Downloading {key} from {bucket_name}...")
    s3.download_file(bucket_name, key, local_path)

def upload_file(bucket_name, local_path, key):
    print(f"Uploading {local_path} to {bucket_name}/{key}...")
    s3.upload_file(local_path, bucket_name, key)

def create_hls_with_master(input_file, output_dir, resolutions):
    """Create HLS streams and a master playlist."""
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    variant_playlists = []
    for res in resolutions:
        variant_path = os.path.join(output_dir, f"{res['name']}_playlist.m3u8")
        command = [
            "ffmpeg",
            "-i", input_file,
            "-vf", f"scale=w={res['width']}:h={res['height']}",
            "-b:v", res["bitrate"],
            "-hls_time", "10",
            "-hls_list_size", "0",
            "-hls_segment_filename", os.path.join(output_dir, f"{res['name']}_%03d.ts"),
            "-f", "hls",
            variant_path
        ]
        print(f"Running FFmpeg for {res['name']}: {' '.join(command)}")
        subprocess.run(command, check=True)
        variant_playlists.append({
            "name": res["name"],
            "bitrate": res["bitrate"],
            "width": res["width"],
            "height": res["height"],
            "path": f"{res['name']}_playlist.m3u8"
        })

    # Create a master playlist
    master_playlist_path = os.path.join(output_dir, "master.m3u8")
    with open(master_playlist_path, "w") as master:
        master.write("#EXTM3U\n")
        for variant in variant_playlists:
            master.write(f"#EXT-X-STREAM-INF:BANDWIDTH={int(variant['bitrate'].replace('k', '')) * 1000},RESOLUTION={variant['width']}x{variant['height']}\n")
            master.write(f"{variant['path']}\n")
    print(f"Master playlist created at {master_playlist_path}")

def process_hls(input_file, hls_output_dir):
    """Wrapper for creating HLS streams with a master playlist."""
    try:
        create_hls_with_master(input_file, hls_output_dir, RESOLUTIONS)
    except Exception as e:
        print(f"Error processing HLS: {e}")

def main():
    source_key = SOURCE_KEY
    movie_id = source_key.split('/')[0]
    file_name = source_key.split('/')[1]
    local_file = os.path.join(TEMP_DIR, file_name)
    hls_output_dir = os.path.join(TEMP_DIR, "hls_output")

    try:
        # Step 1: Download video
        download_file(SOURCE_BUCKET, source_key, local_file)

        # Step 2: Create HLS streams with adaptive bitrate
        process_hls(local_file, hls_output_dir)

        # Step 3: Upload all files to S3
        for root, _, files in os.walk(hls_output_dir):
            for file in files:
                local_path = os.path.join(root, file)
                s3_key = f"{movie_id}/{file}"
                upload_file(TARGET_BUCKET, local_path, s3_key)

        print("Adaptive bitrate HLS processing completed!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()