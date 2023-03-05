import json
from flask import Flask, jsonify
from flask import request
from controllers.obj_processor import localize_objects, get_object, draw_object_borders, remove_obj_background, read_img_url, save_to_firebase

app = Flask(__name__)

@app.route("/api/color", methods=["GET"])
def main():
    url = "https://tourismhamilton.com/media/f3de6ad6-d412-435c-81b7-15bae76f209f.jpg"
    objects = localize_objects(url)
    img = get_object(objects[0], read_img_url(url))
    remove_obj_background(img)

    img = read_img_url(url)
    img = draw_object_borders(objects, img)
    save_to_firebase(img)
    return "Main page"

@app.route('/api/image', methods=['POST'])
def handle_post_img():
    url = json.loads(request.data)["url"]
    objects = localize_objects(url)

    img = read_img_url(url)
    img = draw_object_borders(objects, img)
    new_url = save_to_firebase(img)

    res = {
        "url": new_url,
        "objects": list(map(lambda o: o.name, objects))
    }
    print(res)

    return jsonify(res), 201

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
