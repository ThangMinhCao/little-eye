from scipy.spatial import KDTree
from webcolors import CSS3_HEX_TO_NAMES, hex_to_rgb
from google.cloud import vision
from .obj_processor import read_img_url
import cv2


def detect_properties(image_in_bytes):
    """Detects image properties in the file."""
    client = vision.ImageAnnotatorClient()

    # image = vision.Image(source=vision.ImageSource(image_uri=url))
    image = vision.Image(content=image_in_bytes)

    response = client.image_properties(image=image)
    props = response.image_properties_annotation
    print('Properties:')
    
    arr = []
    iteration = 0
    for color in props.dominant_colors.colors:
        arr.append([])
        arr[iteration].append(color.pixel_fraction)
        arr[iteration].append(convert_rgb_to_names((color.color.red, color.color.green, color.color.blue)))
        iteration = iteration + 1
    
    colors = sorted(props.dominant_colors.colors, key=lambda x: x.pixel_fraction, reverse=True)
    color = colors[0]
    dom_color = convert_rgb_to_names((color.color.red, color.color.green, color.color.blue))
        
    # print(arr)
    if response.error.message:
        raise Exception(
            '{}\nFor more info on error messages, check: '
            'https://cloud.google.com/apis/design/errors'.format(
                response.error.message))
    return dom_color


def convert_rgb_to_names(rgb_tuple):
    
    # a dictionary of all the hex and their respective names in css3
    css3_db = CSS3_HEX_TO_NAMES
    names = []
    rgb_values = []
    for color_hex, color_name in css3_db.items():
        names.append(color_name)
        rgb_values.append(hex_to_rgb(color_hex))
    
    kdt_db = KDTree(rgb_values)
    distance, index = kdt_db.query(rgb_tuple)
    return f'closest match: {names[index]}'


if __name__ == "__main__":
    url = "https://htmlcolorcodes.com/assets/images/colors/red-color-solid-background-1920x1080.png"
    _, img = cv2.imencode(".png", read_img_url(url))
    detect_properties(img.tobytes())