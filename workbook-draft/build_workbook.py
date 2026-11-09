"""Rebuild the paid PDF from Kali's approved, proofread Word manuscript.

Run locally with LibreOffice installed. Firebase ships the prebuilt private PDF;
this script is never part of checkout or the production build.
"""
from pathlib import Path
import shutil
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "workbook-draft" / "approved-source.docx"
OUTPUT = ROOT / "private-assets" / "discernment-workbook.pdf"

def main():
    office = shutil.which("libreoffice")
    if not office:
        raise SystemExit("LibreOffice is required to rebuild the approved workbook PDF.")
    if not SOURCE.is_file():
        raise SystemExit("Approved workbook manuscript is missing.")
    with tempfile.TemporaryDirectory(prefix="kali-workbook-") as folder:
        temp = Path(folder)
        subprocess.run([
            office, "-env:UserInstallation=" + (temp / "profile").as_uri(),
            "--headless", "--convert-to", "pdf", "--outdir", str(temp), str(SOURCE),
        ], check=True, timeout=120)
        pdf = temp / "approved-source.pdf"
        if not pdf.is_file() or not pdf.read_bytes().startswith(b"%PDF-"):
            raise SystemExit("Workbook PDF conversion failed; existing asset was not replaced.")
        OUTPUT.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(pdf, OUTPUT)
    print(OUTPUT)

if __name__ == "__main__":
    main()
