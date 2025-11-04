from flask import Flask
from flask_cors import CORS

from api.lb_uploadController import lb_uploadController_bp

app = Flask(__name__)

# ✅ Correct CORS config
CORS(
    app,
    origins=["https://cpg-line-balancing.onrender.com"],  # your React dev server
    supports_credentials=True           # allows cookies, sessions
)


# quality upload
app.register_blueprint(lb_uploadController_bp, url_prefix='/api')


if __name__ == '__main__':
    app.run(debug=True)