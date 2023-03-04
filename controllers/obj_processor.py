import cv2
import numpy as np
import urllib.request
import random
from firebase_admin import credentials, initialize_app, storage
from google.cloud import vision
import uuid


def localize_objects(url):
    """Localize objects in the local image.

    Args:
    path: The path to the local file.
    """
    client = vision.ImageAnnotatorClient()

    # with open(path, 'rb') as image_file:
    #     content = image_file.read()
    
    # print(content)
    image = vision.Image(source=vision.ImageSource(image_uri=url))

    objects = client.object_localization(image=image).localized_object_annotations

    return objects

# objects = localize_objects(url)

def get_object(object):
    url = "https://images.squarespace-cdn.com/content/59c91be812abd9f4e102f2e4/1526881274908-1N59Z1SRBDV35I2HAJKW/Hanoi-18.jpg?format=1500w&content-type=image%2Fjpeg"
    url_response = urllib.request.urlopen(url)
    img = cv2.imdecode(np.array(bytearray(url_response.read()), dtype=np.uint8), -1)

    r, c, _ = img.shape

    bounded_vertices = list(map(lambda v: [v.x * c, v.y * r], object.bounding_poly.normalized_vertices))
    pts = np.rint(np.array(bounded_vertices)).astype(int)
    rect = cv2.boundingRect(pts)
    x,y,w,h = rect

    croped = img[y:y+h, x:x+w].copy()

    ## (2) make mask
    pts = pts - pts.min(axis=0)

    mask = np.zeros(croped.shape[:2], np.uint8)
    cv2.drawContours(mask, [pts], -1, (255, 255, 255), -1, cv2.LINE_AA)

    ## (3) do bit-op
    dst = cv2.bitwise_and(croped, croped, mask=mask)

    ## (4) add the white background
    bg = np.ones_like(croped, np.uint8)*255
    cv2.bitwise_not(bg,bg, mask=mask)
    dst2 = bg + dst

    # cv2.imshow("dst1", img)
    # cv2.imshow("dst2", dst2)
    cv2.waitKey(0)


def draw_object_borders(objects, img):
    r, c, _ = img.shape

    for object in objects:
        color = random.choice([(0, 0, 255), (0, 255, 0), (255, 0, 0)])
        bounded_vertices = list(map(lambda v: [v.x * c, v.y * r], object.bounding_poly.normalized_vertices))
        pts = np.rint(np.array(bounded_vertices)).astype(int)
        contour = img.copy()
        cv2.drawContours(contour, [pts], -1, color, 2)
        cv2.fillPoly(img, [pts], color)
    
        alpha = 0.70
        img = cv2.addWeighted(img, 1-alpha, contour, alpha, 0)

        cv2.putText(img, object.name, (pts[0][0], pts[0][1] - 10), cv2.FONT_HERSHEY_SIMPLEX, 1.5, color, 2, 2)

    # r = 1000.0 / img.shape[1]
    # dim = (1000, int(img.shape[0] * r))
    # resized = cv2.resize(img, dim, interpolation=cv2.INTER_AREA)

    # cv2.imshow("Border added", resized)
    # cv2.waitKey(0)
    return img


def save_to_firebase(img):
    # Init firebase with your credentials
    cred = credentials.Certificate("firebase-littleeye.json")
    initialize_app(cred, {'storageBucket': 'little-eye-fceb4.appspot.com'})

    # Put your local file path 
    bucket = storage.bucket()
    _, JPEG = cv2.imencode('.jpg', img)
    blob = bucket.blob(str(uuid.uuid4()) + ".jpg")
    blob.upload_from_string(JPEG.tobytes(), content_type='image/jpeg')

    # Opt : if you want to make public access from the URL
    blob.make_public()
    print("your file url", blob.public_url)

# print(objects)
# for object in objects:
#     get_object(object, img_path)

# img = draw_object_borders(objects, img)
# save_to_firebase(img)