import cv2
import torch
from ultralytics import YOLO


MODEL_NAME = 'models/yolov10b.pt' # Confidence threshold: detections with a confidence score below this will be ignored.
CONFIDENCE_THRESHOLD = 0.5

print(f"Loading YOLOv8 model ('{MODEL_NAME}')...")
model = YOLO(MODEL_NAME)
print("Model loaded successfully.")

def cheat_detector(frame):

    class_names = model.names

    person_detected = False
    phone_detected = False

    results = model(frame, verbose=False) 
    
    for r in results:
        boxes = r.boxes
        for box in boxes:
            confidence = box.conf[0]
            
            if confidence > CONFIDENCE_THRESHOLD:
                cls_id = int(box.cls[0])
                class_name = class_names[cls_id]

                if class_name == 'person':
                    person_detected = True

                elif class_name == 'cell phone':
                    phone_detected = True

    anomaly_reason = None
    if phone_detected:
        anomaly_reason = "Mobile Phone Detected"
    elif not person_detected:
        anomaly_reason = "No Person Detected"
    return  anomaly_reason   



