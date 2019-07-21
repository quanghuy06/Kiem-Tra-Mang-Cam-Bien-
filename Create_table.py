import pymysql

db = pymysql.connect("localhost","huytq","Quanghuy@123","wsn")
cursor = db.cursor()
sql = """create table WSN(
    id int(10) primary key auto_increment,
    temp char(10),
    hum char(10),
    light char(10),
    time datetime)"""
cursor.execute(sql)
db.close()
