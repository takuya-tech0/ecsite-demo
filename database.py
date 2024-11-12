import os
import mysql.connector
from mysql.connector import Error
from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship, sessionmaker, declarative_base
from datetime import datetime

# データベース接続情報
db_config = {
    "host": os.getenv("DB_HOST", "awseb-e-iqtgkpaibr-stack-awsebrdsdatabase-xykh1zg4qvlc.c5is2icoyp4k.ap-northeast-1.rds.amazonaws.com"),
    "user": os.getenv("DB_USER", "takuyaoshima"),
    "password": os.getenv("DB_PASSWORD", "shigure1230"),
    "database": os.getenv("DB_NAME", "ec_site"),
    "port": int(os.getenv("DB_PORT", 3306))
}

# データベースを作成する関数
def create_database():
    try:
        # データベース名を除いた接続情報でMySQLに接続
        connection = mysql.connector.connect(
            host=db_config["host"],
            user=db_config["user"],
            password=db_config["password"],
            port=db_config["port"]
        )
        
        if connection.is_connected():
            cursor = connection.cursor()
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_config['database']}")
            print(f"Database '{db_config['database']}' created successfully.")
    
    except Error as e:
        print(f"Error: {e}")
    
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
            print("MySQL connection is closed.")

# データベースとテーブルを作成するための設定
Base = declarative_base()

# Categoryテーブルの定義
class Category(Base):
    __tablename__ = 'categories'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)

# Productテーブルの定義
class Product(Base):
    __tablename__ = 'products'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    category_id = Column(Integer, ForeignKey('categories.id'), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Integer, nullable=False)
    stock = Column(Integer, nullable=False)
    image_url = Column(String(255), nullable=True)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)

# Userテーブルの定義
class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    name = Column(String(50), nullable=False)
    postal_code = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)
    phone = Column(String(20), nullable=True)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)

# データベース作成関数を実行
create_database()

# SQLAlchemyエンジンの作成
DATABASE_URL = f"mysql+mysqlconnector://{db_config['user']}:{db_config['password']}@{db_config['host']}:{db_config['port']}/{db_config['database']}"
engine = create_engine(DATABASE_URL, echo=True)

# テーブルを作成
Base.metadata.create_all(bind=engine)
print("Tables created successfully.")
