import time
import os
import hashlib
import sys

# Optional: for .docx file support, install python-docx with pip:
# pip install python-docx
try:
    from docx import Document
except ImportError:
    Document = None

# Variable to hold the intention being processed
process_intention = ''

# Timer function to format the elapsed time
def format_time(seconds):
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    seconds = seconds % 60
    return f'{hours:02}:{minutes:02}:{seconds:02}'

# Function to start processing the intention
def start_intention(intention_text):
    global process_intention
    process_intention = intention_text
    print(f"Intention started:\n{process_intention}")

# Function to stop processing the intention
def stop_intention():
    global process_intention
    process_intention = ''
    print("\nIntention stopped.")

# Function to hash a file
def hash_file(file_path):
    sha512 = hashlib.sha512()
    try:
        with open(file_path, 'rb') as file:
            while chunk := file.read(8192):
                sha512.update(chunk)
        return sha512.hexdigest()
    except FileNotFoundError:
        print(f"File not found: {file_path}")
        return None

# Function to load a .txt file (with UTF-8 encoding)
def load_txt_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    except FileNotFoundError:
        print(f"File not found: {file_path}")
        return None

# Function to load a .docx file (requires python-docx)
def load_docx_file(file_path):
    if Document is None:
        print("python-docx is not installed. Install it using 'pip install python-docx'.")
        return None

    try:
        doc = Document(file_path)
        return "\n".join([para.text for para in doc.paragraphs])
    except Exception as e:
        print(f"Error loading docx file: {e}")
        return None

# Main function to control the flow
def main():
    global process_intention

    # Prompt for intention or file name
    user_input = input("Intention or Filename: ")

    # Check if it's a file (by looking at the last 3 or 4 characters for a period)
    if len(user_input) > 4 and user_input[-4] == ".":
        file_path = user_input
        _, file_extension = os.path.splitext(file_path)

        if file_extension == '.txt':
            intention = load_txt_file(file_path)
        elif file_extension == '.docx':
            intention = load_docx_file(file_path)
        else:
            print(f"Unsupported file format: {file_extension}")
            return

        if intention is None:
            print("Failed to load the intention from the file.")
            return
    else:
        # Otherwise treat it as the direct intention
        intention = user_input

    # Optionally hash a file and append its hash to the intention
    load_file = input("Do you want to load a file to hash and append? (yes/no): ").lower()
    if load_file == 'yes':
        file_path = input("Enter the file path to hash: ")
        file_hash = hash_file(file_path)
        if file_hash:
            intention += f"\n{file_hash}"

    # Option to repost every hour
    repost = input("Repost every hour? (yes/no): ").lower() == 'yes'

    # Start processing the intention
    start_intention(intention)

    # Start timer
    start_time = time.time()
    last_repost_time = start_time

    try:
        while True:
            elapsed_time = time.time() - start_time
            sys.stdout.write(f"\rElapsed time: {format_time(int(elapsed_time))}")
            sys.stdout.flush()

            # Repost every hour
            if repost and time.time() - last_repost_time >= 3600:
                last_repost_time = time.time()
                process_intention = intention
                print(f"\n{format_time(int(elapsed_time))}: Intention reposted.")

            time.sleep(1)

    except KeyboardInterrupt:
        stop_intention()

if __name__ == "__main__":
    main()
