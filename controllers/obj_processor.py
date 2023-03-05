import cv2
import numpy as np
import urllib.request
import random
from firebase_admin import credentials, initialize_app, storage
from google.cloud import vision
import uuid
from rembg import remove


cred = credentials.Certificate("firebase-littleeye.json")
initialize_app(cred, {'storageBucket': 'little-eye-fceb4.appspot.com'})


def localize_objects(url):
    """Localize objects in the local image.

    Args:
    path: The path to the local file.
    """
    client = vision.ImageAnnotatorClient()

    # with open(path, 'rb') as image_file:
    #     content = image_file.read()
    
    # print(content)
    # image = vision.Image(source=vision.ImageSource(image_uri=url))
    image = vision.Image(content=url)
    objects = client.object_localization(image=image).localized_object_annotations

    return objects


def get_object(object, img):
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
    # cv2.waitKey(0)
    # return base64.b64encode(cv2.imencode('.jpg', dst2)[1].tobytes())
    return dst2


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
    # Put your local file path 
    bucket = storage.bucket()
    _, JPEG = cv2.imencode('.jpg', img)
    blob = bucket.blob(str(uuid.uuid4()) + ".jpg")
    blob.upload_from_string(JPEG.tobytes(), content_type='image/jpeg')

    # Opt : if you want to make public access from the URL
    blob.make_public()
    return blob.public_url


def remove_obj_background(img):
    output = remove(img)
    # cv2.imwrite("test.png", output)
    return output


def read_img_url(url):
    url_response = urllib.request.urlopen(url)
    return cv2.imdecode(np.array(bytearray(url_response.read()), dtype=np.uint8), -1)