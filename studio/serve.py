import http.server, socketserver, os, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # workspace root

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def do_POST(self):
        if self.path != '/upload':
            self.send_error(404)
            return
        length = int(self.headers.get('Content-Length', 0))
        data = self.rfile.read(length)
        os.makedirs(os.path.join(ROOT, 'studio'), exist_ok=True)
        name = time.strftime('studio/demo-loop-%Y%m%d-%H%M%S.webm')
        with open(os.path.join(ROOT, name), 'wb') as f:
            f.write(data)
        self.send_response(200)
        self.send_header('Content-Type', 'text/plain')
        self.end_headers()
        self.wfile.write(name.encode())

socketserver.ThreadingTCPServer.allow_reuse_address = True
with socketserver.ThreadingTCPServer(('127.0.0.1', 8787), Handler) as httpd:
    httpd.serve_forever()
