import json
from flask import Flask, jsonify
from flask import request
from controllers.obj_processor import localize_objects, get_object, draw_object_borders, remove_obj_background, read_img_url, save_to_firebase
import base64
import numpy as np
import cv2
import io
from PIL import Image
from flask_cors import CORS
from controllers.color_identifier import detect_properties

app = Flask(__name__)
CORS(app)

@app.route("/api/color", methods=["POST"])
def main():
    # url = "https://tourismhamilton.com/media/f3de6ad6-d412-435c-81b7-15bae76f209f.jpg"
    base64img = json.loads(request.data)["base64"]
    index = json.loads(request.data)["object_index"]
    # print(f"bas64: {base64img}, index: {index}")

    encoded_data = base64img.split(',')[1]
    nparr = np.fromstring(base64.b64decode(encoded_data), np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    _, encoded_image = cv2.imencode('.png', img)
    content = encoded_image.tobytes()

    objects = localize_objects(content)
    obj_img = get_object(objects[index], img)
    cut_obj = remove_obj_background(obj_img)
    _, encoded_image = cv2.imencode('.png', cut_obj)

    dom_color = detect_properties(encoded_image.tobytes())
    print(dom_color)

    return "Main page"

@app.route('/api/image', methods=['POST'])
def handle_post_img():
    base64img = json.loads(request.data)["base64"]
    encoded_data = base64img.split(',')[1]
    nparr = np.fromstring(base64.b64decode(encoded_data), np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    _, encoded_image = cv2.imencode('.png', img)
    content = encoded_image.tobytes()

    # img = cv2.imdecode(jpg_as_np, flags=1)
    # img = cv2.imread(io.BytesIO(base64.b64decode(base64img)))
    # cv2.imshow("img", img)
    
    objects = localize_objects(content)

    # img = read_img_url(img)
    img = draw_object_borders(objects, img)
    new_url = save_to_firebase(img)
    print(new_url)

    res = {
        "url": new_url,
        "objects": list(map(lambda o: o.name, objects))
    }

    return jsonify(res), 200

if __name__ == "__main__":
    app.run(host='0.0.0.0', port = 8080)
