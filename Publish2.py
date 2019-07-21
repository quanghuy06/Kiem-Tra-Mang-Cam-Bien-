
import paho.mqtt.client as mqtt
import random,json
from datetime import datetime
from time import sleep

#mqtt settings
MQTT_Server = "localhost" #ten may chu MQTT
MQTT_Port = 1883          #port mac dinh cua MQTT
Keep_Alive_Interval = 45  #thoi gian giua cac lan gui tin
MQTT_Topic = "DHT11"

#Ham ket noi den may chu MQTT
def on_connect(client, userdata, rc):
    if rc != 0:
        pass
        print("Unable to connect to MQTT Broker...")
    else:
        print("Connected with MQTT Broker: " + str(MQTT_Server))

def on_publish(client, userdata, mid):
    pass

def on_disconnect(client, userdata, rc):
    if rc != 0:
        pass

mqttc = mqtt.Client()
mqttc.username_pw_set(username="huytq",password="Quanghuy@123") #thay doi user password ca MQTT
mqttc.on_connect = on_connect
mqtt.on_disconnect = on_disconnect
mqttc.on_publish = on_publish
mqttc.connect(MQTT_Server, MQTT_Port, Keep_Alive_Interval)

#publish du lieu
def publish_To_Topic(topic, message):
    mqttc.publish(topic,message)
    print(("Published:" +str(message) + "" + "on MQTT Topic:" + str(topic)))
    print("")

#fake random sensor
def publish_Values_to_MQTT():
    room = int(random.uniform(0,4))
    temp = int(random.uniform(9, 40))
    hum = int(random.uniform(0, 100))
    Sensor_data = {}
    Sensor_data['room'] = room
    Sensor_data['Temperature'] = temp
    Sensor_data['Humidity'] = hum
    Sensor_json_data = json.dumps(Sensor_data)
    print("Publishing Value: ")
    publish_To_Topic(MQTT_Topic, Sensor_json_data)
    sleep(2)

while True:
    publish_Values_to_MQTT()
    sleep(2)
