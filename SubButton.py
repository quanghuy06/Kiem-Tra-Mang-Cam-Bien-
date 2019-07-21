import paho.mqtt.client as mqtt
import pymysql
import json
from datetime import datetime
db = pymysql.connect("localhost", "huytq","Quanghuy@123","wsn")
print ("Running....")
cursor = db.cursor()

def on_connect(client, userdata, flags, rc):
    client.subscribe("Button1")
    client.subscribe("Button2")
    client.subscribe("Slider")
def on_message(client, userdata, msg):
    if msg.topic == "Button1":
        val = json.loads(msg.payload)
        print("Subed Button1")
        print(val)
    if msg.topic == "Button2":
        val = json.loads(msg.payload)
        print("Subed Button2")
        print(val)
    if msg.topic == "Slider":
        val = json.loads(msg.payload)
        print("Subed Slider")
        print(val)
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message
client.username_pw_set(username="huytq",password="Quanghuy@123")
client.connect("localhost", 1883, 45)
try:
    client.loop_forever()
except KeyboardInterrupt:
    client.loop_stop()
    print ("Client Disconnect")
    db.close()
    print ("Close Database")

