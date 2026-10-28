"""Local test origin with byte ranges, matching the media behavior of Vercel."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os
import re

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(Path(__file__).resolve().parents[1]), **kwargs)

    def log_message(self, *args):
        pass

    def send_head(self):
        self.remaining = None
        path = self.translate_path(self.path)
        if not path.endswith('.mp4') or not os.path.isfile(path):
            return super().send_head()
        source = open(path, 'rb')
        size = os.fstat(source.fileno()).st_size
        start, end = 0, size - 1
        requested = self.headers.get('Range')
        if requested:
            match = re.fullmatch(r'bytes=(\d*)-(\d*)', requested.strip())
            if match and any(match.groups()):
                first, last = match.groups()
                if first:
                    start = int(first)
                    if last: end = min(int(last), end)
                else:
                    start = max(0, size - int(last))
            else:
                start = size
            if start >= size or start > end:
                source.close()
                self.send_response(416)
                self.send_header('Content-Range', f'bytes */{size}')
                self.send_header('Content-Length', '0')
                self.end_headers()
                return None
        self.send_response(206 if requested else 200)
        self.send_header('Content-Type', 'video/mp4')
        self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Content-Length', str(end - start + 1))
        if requested: self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
        self.end_headers()
        source.seek(start)
        self.remaining = end - start + 1
        return source

    def copyfile(self, source, output):
        try:
            if self.remaining is None:
                return super().copyfile(source, output)
            while self.remaining:
                chunk = source.read(min(65536, self.remaining))
                if not chunk: break
                output.write(chunk)
                self.remaining -= len(chunk)
        except (BrokenPipeError, ConnectionResetError):
            pass  # Browsers cancel media reads when navigating or seeking.

if __name__ == '__main__':
    ThreadingHTTPServer(('127.0.0.1', 4177), Handler).serve_forever()
