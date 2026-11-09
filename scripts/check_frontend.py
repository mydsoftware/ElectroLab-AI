"""اعتبارسنجی نحوی اسکریپت تعبیه‌شده در صفحه GitHub Pages."""
from html.parser import HTMLParser
from pathlib import Path
import shutil
import subprocess
import tempfile

PAGE = Path(__file__).resolve().parents[1] / "docs" / "index.html"

class ScriptExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_script = False
        self.parts = []
        self.scripts = []

    def handle_starttag(self, tag, attrs):
        if tag.lower() == "script":
            self.in_script = True
            self.parts = []

    def handle_data(self, data):
        if self.in_script:
            self.parts.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "script" and self.in_script:
            self.scripts.append("".join(self.parts))
            self.in_script = False

def main():
    parser = ScriptExtractor()
    parser.feed(PAGE.read_text(encoding="utf-8"))
    if not parser.scripts:
        raise SystemExit("هیچ اسکریپت JavaScript در صفحه پیدا نشد.")
    node = shutil.which("node")
    if not node:
        raise SystemExit("Node.js برای بررسی نحو JavaScript نصب نیست.")
    with tempfile.NamedTemporaryFile("w", suffix=".js", encoding="utf-8") as temp:
        temp.write("\n".join(parser.scripts))
        temp.flush()
        result = subprocess.run([node, "--check", temp.name], check=False)
    if result.returncode:
        raise SystemExit(result.returncode)
    print(f"JavaScript syntax OK ({len(parser.scripts)} script block(s)).")

if __name__ == "__main__":
    main()
