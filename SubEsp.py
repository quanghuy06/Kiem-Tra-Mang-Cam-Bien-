import paho.mqtt.client as mqtt
import pymysql
import json
from datetime import datetime
db = pymysql.connect("localhost", "huytq","Quanghuy@123","wsn")
print ("Running....")
cursor = db.cursor()

def on_connect(client, userdata, flags, rc):
    client.subscribe("DHT11")
    #client.subscribe("dataButton")
def on_message(client, userdata, msg):
    if msg.topic == "DHT11":
        print("Subed")
        val = json.loads(msg.payload)
        print(val)
        sql ="INSERT INTO WSN(temp,hum,light,time) VALUES('%s','%s','%s','%s')"%(str(val["Temperature"]),str(val["Humidity"]),str(val["Light"]),str(datetime.now()))
        cursor.execute(sql)
        db.commit()
        print("Update")
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


