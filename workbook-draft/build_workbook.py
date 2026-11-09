"""Package Kali’s author-supplied final PDF without re-exporting it.

The approved-source.docx is an earlier manuscript, retained for reference only.
The current author-approved master is approved-source.pdf.
"""
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "workbook-draft" / "approved-source.pdf"
OUTPUT = ROOT / "private-assets" / "discernment-workbook.pdf"

def main():
    if not SOURCE.is_file() or not SOURCE.read_bytes().startswith(b"%PDF-"):
        raise SystemExit("Approved final PDF is missing or invalid; paid asset was not changed.")
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(SOURCE, OUTPUT)
    print(OUTPUT)

if __name__ == "__main__":
    main()
