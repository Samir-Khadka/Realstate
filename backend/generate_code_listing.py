import os

# --- Configuration ---
# Add any file extensions you want to include in the listing.
INCLUDED_EXTENSIONS = {'.py', '.json', '.md', '.txt', '.yml', '.yaml', '.ini', '.gitignore'}
# Add any folder names you want to exclude.
EXCLUDED_FOLDERS = {'venv', '__pycache__', '.git', '.vscode'}

def generate_code_listing():
    """Generates a single text file containing all code files."""
    
    output_filename = "Code_Listing.txt"
    
    # Get the root directory of the project
    root_dir = os.path.dirname(os.path.abspath(__file__))
    
    with open(output_filename, 'w', encoding='utf-8') as output_file:
        # Walk through the directory tree
        for subdir, dirs, files in os.walk(root_dir):
            # Remove excluded folders from the walk
            dirs[:] = [d for d in dirs if d not in EXCLUDED_FOLDERS]
            
            for file in files:
                file_path = os.path.join(subdir, file)
                file_ext = os.path.splitext(file)[1]
                
                # Check if the file should be included
                if file_ext in INCLUDED_EXTENSIONS:
                    # Get the relative path from the root
                    relative_path = os.path.relpath(file_path, root_dir)
                    
                    # Write a header for the file
                    output_file.write("="*80 + "\n")
                    output_file.write(f"FILE: {relative_path}\n")
                    output_file.write("="*80 + "\n\n")
                    
                    try:
                        # Read and write the file content
                        with open(file_path, 'r', encoding='utf-8') as input_file:
                            content = input_file.read()
                            output_file.write(content)
                    except Exception as e:
                        output_file.write(f"--- ERROR: Could not read file ({e}) ---\n")
                    
                    output_file.write("\n\n") # Add space between files

    print(f"✅ Success! Code listing generated at: {os.path.abspath(output_filename)}")
    print("You can now open this file and use Ctrl+P to print it to a PDF.")

if __name__ == "__main__":
    generate_code_listing()