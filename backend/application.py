from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from contextlib import contextmanager  # この行が必要
from dotenv import load_dotenv
import os
import mysql.connector
from decimal import Decimal
from datetime import datetime
import uuid

# 環境変数の読み込み
load_dotenv()

app = FastAPI()

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 環境変数からデータベース設定を読み込む
db_config = {
    "host": os.getenv("DB_HOST"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME"),
    "port": int(os.getenv("DB_PORT", 3306))
}

# 以下、既存のコードは同じ...

# データベース接続のコンテキストマネージャ
@contextmanager
def get_db_cursor(isolation_level=None):
    conn = mysql.connector.connect(**db_config)
    cursor = None
    try:
        if isolation_level:
            conn.start_transaction(isolation_level=isolation_level)
        cursor = conn.cursor(dictionary=True)
        yield cursor
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        if cursor:
            cursor.close()
        conn.close()

# モデル定義
class Product(BaseModel):
    id: int
    category_id: int
    name: str
    description: Optional[str] = None
    price: int
    stock: int
    image_url: Optional[str] = None

class Category(BaseModel):
    id: int
    name: str

class LoginRequest(BaseModel):
    username: str
    password: str

class CartItemAdd(BaseModel):
    user_id: int
    product_id: int
    quantity: int = Field(gt=0)

class CartItemUpdate(BaseModel):
    quantity: int = Field(gt=0)

class OrderCreate(BaseModel):
    user_id: int
    payment_method: str
    shipping_name: str
    shipping_postal_code: str
    shipping_address: str
    shipping_phone: str

# ログインエンドポイント
@app.post("/api/login")
async def login(request: LoginRequest):
    try:
        with get_db_cursor() as cursor:
            cursor.execute(
                "SELECT id FROM users WHERE name = %s AND password = %s",
                (request.username, request.password)
            )
            user = cursor.fetchone()
            
            if user:
                return {"userId": user["id"]}
            raise HTTPException(
                status_code=401,
                detail="ユーザー名またはパスワードが正しくありません"
            )
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

# 商品一覧取得
@app.get("/api/products", response_model=List[Product])
async def get_products():
    try:
        with get_db_cursor() as cursor:
            cursor.execute("""
                SELECT 
                    id,
                    category_id,
                    name,
                    description,
                    price,
                    stock,
                    image_url
                FROM products
                ORDER BY id
            """)
            products = cursor.fetchall()
            
            formatted_products = []
            for product in products:
                formatted_product = {
                    'id': product['id'],
                    'category_id': product['category_id'],
                    'name': product['name'],
                    'description': product['description'] if product['description'] else None,
                    'price': int(product['price']) if product['price'] else 0,
                    'stock': product['stock'],
                    'image_url': product['image_url'] if product['image_url'] else None
                }
                formatted_products.append(formatted_product)
                
            return formatted_products
    except Exception as e:
        print(f"Error in get_products: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# カテゴリー一覧取得
@app.get("/api/categories", response_model=List[Category])
async def get_categories():
    try:
        with get_db_cursor() as cursor:
            cursor.execute("SELECT id, name FROM categories ORDER BY id")
            categories = cursor.fetchall()
            
            formatted_categories = []
            for category in categories:
                formatted_category = {
                    'id': category['id'],
                    'name': category['name']
                }
                formatted_categories.append(formatted_category)
                
            return formatted_categories
    except Exception as e:
        print(f"Error in get_categories: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# カテゴリー別商品取得
@app.get("/api/products/category/{category_id}", response_model=List[Product])
async def get_products_by_category(category_id: int):
    try:
        with get_db_cursor() as cursor:
            cursor.execute("""
                SELECT 
                    id,
                    category_id,
                    name,
                    description,
                    price,
                    stock,
                    image_url
                FROM products 
                WHERE category_id = %s
                ORDER BY id
            """, (category_id,))
            products = cursor.fetchall()
            
            formatted_products = []
            for product in products:
                formatted_product = {
                    'id': product['id'],
                    'category_id': product['category_id'],
                    'name': product['name'],
                    'description': product['description'] if product['description'] else None,
                    'price': int(product['price']) if product['price'] else 0,
                    'stock': product['stock'],
                    'image_url': product['image_url'] if product['image_url'] else None
                }
                formatted_products.append(formatted_product)
                
            return formatted_products
    except Exception as e:
        print(f"Error in get_products_by_category: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# 商品詳細取得
@app.get("/api/products/{product_id}", response_model=Product)
async def get_product(product_id: int):
    try:
        with get_db_cursor() as cursor:
            cursor.execute("""
                SELECT 
                    id,
                    category_id,
                    name,
                    description,
                    price,
                    stock,
                    image_url
                FROM products 
                WHERE id = %s
            """, (product_id,))
            product = cursor.fetchone()
            
            if product is None:
                raise HTTPException(status_code=404, detail="Product not found")
                
            formatted_product = {
                'id': product['id'],
                'category_id': product['category_id'],
                'name': product['name'],
                'description': product['description'] if product['description'] else None,
                'price': int(product['price']) if product['price'] else 0,
                'stock': product['stock'],
                'image_url': product['image_url'] if product['image_url'] else None
            }
            
            return formatted_product
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

# カートアイテム追加
@app.post("/api/cart/add")
async def add_to_cart(item: CartItemAdd):
    try:
        with get_db_cursor(isolation_level='REPEATABLE READ') as cursor:
            # ユーザーの存在確認
            cursor.execute("SELECT id FROM users WHERE id = %s", (item.user_id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=401, detail="User not found")

            # 商品の存在と在庫確認
            cursor.execute("""
                SELECT stock, price, name 
                FROM products 
                WHERE id = %s AND stock > 0
                FOR UPDATE
            """, (item.product_id,))
            product = cursor.fetchone()
            if not product:
                raise HTTPException(
                    status_code=404,
                    detail="Product not found or out of stock"
                )
            if product['stock'] < item.quantity:
                raise HTTPException(status_code=400, detail="Insufficient stock")

            # カートの存在確認と取得/作成
            cursor.execute(
                "SELECT id FROM carts WHERE user_id = %s FOR UPDATE",
                (item.user_id,)
            )
            cart = cursor.fetchone()
            
            if not cart:
                cursor.execute(
                    "INSERT INTO carts (user_id) VALUES (%s)",
                    (item.user_id,)
                )
                cart_id = cursor.lastrowid
            else:
                cart_id = cart['id']
            
            # 既存のカートアイテムをチェック
            cursor.execute("""
                SELECT id, quantity 
                FROM cart_items 
                WHERE cart_id = %s AND product_id = %s
                FOR UPDATE
            """, (cart_id, item.product_id))
            existing_item = cursor.fetchone()
            
            if existing_item:
                new_quantity = existing_item['quantity'] + item.quantity
                if new_quantity > product['stock']:
                    raise HTTPException(
                        status_code=400,
                        detail="Total quantity exceeds available stock"
                    )
                    
                cursor.execute(
                    "UPDATE cart_items SET quantity = %s WHERE id = %s",
                    (new_quantity, existing_item['id'])
                )
            else:
                cursor.execute("""
                    INSERT INTO cart_items (cart_id, product_id, quantity) 
                    VALUES (%s, %s, %s)
                """, (cart_id, item.product_id, item.quantity))
            
            return {"message": "Successfully added to cart"}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

# カートアイテム一覧取得
@app.get("/api/cart/items")
async def get_cart_items(user_id: int):
    try:
        with get_db_cursor() as cursor:
            # ユーザーの存在確認
            cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=401, detail="User not found")

            # カートアイテムと商品情報を結合して取得
            cursor.execute("""
                SELECT 
                    ci.id,
                    ci.product_id,
                    ci.quantity,
                    p.name,
                    p.price,
                    p.image_url,
                    p.stock,
                    (p.price * ci.quantity) as total_price
                FROM carts c
                LEFT JOIN cart_items ci ON c.id = ci.cart_id
                LEFT JOIN products p ON ci.product_id = p.id
                WHERE c.user_id = %s
                ORDER BY ci.id DESC
            """, (user_id,))
            
            items = cursor.fetchall()
            
            # 数値型の適切な変換
            formatted_items = []
            for item in items:
                if item['id'] is not None:  # カートアイテムが存在する場合のみ
                    formatted_item = {
                        'id': item['id'],
                        'product_id': item['product_id'],
                        'quantity': item['quantity'],
                        'name': item['name'],
                        'price': int(item['price']) if item['price'] else 0,
                        'image_url': item['image_url'],
                        'stock': item['stock'],
                        'total_price': int(item['total_price']) if item['total_price'] else 0
                    }
                    formatted_items.append(formatted_item)
            
            return formatted_items
    except Exception as e:
        print(f"Error in get_cart_items: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# カートアイテム数量更新
@app.put("/api/cart/items/{item_id}")
async def update_cart_item(item_id: int, item: CartItemUpdate):
    try:
        with get_db_cursor(isolation_level='REPEATABLE READ') as cursor:
            cursor.execute("""
                SELECT ci.id, ci.product_id, p.stock, ci.cart_id 
                FROM cart_items ci
                JOIN products p ON ci.product_id = p.id
                WHERE ci.id = %s
                FOR UPDATE
            """, (item_id,))
            cart_item = cursor.fetchone()
            
            if not cart_item:
                raise HTTPException(status_code=404, detail="Cart item not found")
            
            if item.quantity > cart_item['stock']:
                raise HTTPException(status_code=400, detail="Insufficient stock")
            
            cursor.execute(
                "UPDATE cart_items SET quantity = %s WHERE id = %s",
                (item.quantity, item_id)
            )
            
            return {"message": "Successfully updated quantity"}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

# カートアイテム削除
@app.delete("/api/cart/items/{item_id}")
async def delete_cart_item(item_id: int):
    try:
        with get_db_cursor() as cursor:
            cursor.execute(
                "SELECT id FROM cart_items WHERE id = %s",
                (item_id,)
            )
            cart_item = cursor.fetchone()
            
            if not cart_item:
                raise HTTPException(status_code=404, detail="Cart item not found")
            
            cursor.execute(
                "DELETE FROM cart_items WHERE id = %s",
                (item_id,)
            )
            
            return {"message": "Successfully deleted item"}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

# カートの合計金額を取得
@app.get("/api/cart/total")
async def get_cart_total(user_id: int):
    try:
        with get_db_cursor() as cursor:
            # ユーザーの存在確認
            cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=401, detail="User not found")

            cursor.execute("""
                SELECT 
                    COUNT(ci.id) as total_items,
                    SUM(ci.quantity) as total_quantity,
                    SUM(ci.quantity * p.price) as total_amount
                FROM carts c
                JOIN cart_items ci ON c.id = ci.cart_id
                JOIN products p ON ci.product_id = p.id
                WHERE c.user_id = %s
            """, (user_id,))
            
            result = cursor.fetchone()
            return {
"total_items": result['total_items'] or 0,
                "total_quantity": result['total_quantity'] or 0,
                "total_amount": int(result['total_amount'] or 0)
            }
    except Exception as e:
        print(f"Error in get_cart_total: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# カートをクリア
@app.delete("/api/cart/clear")
async def clear_cart(user_id: int):
    try:
        with get_db_cursor() as cursor:
            # ユーザーの存在確認
            cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=401, detail="User not found")

            cursor.execute("""
                DELETE ci FROM cart_items ci
                JOIN carts c ON ci.cart_id = c.id
                WHERE c.user_id = %s
            """, (user_id,))
            
            return {"message": "Cart cleared successfully"}
    except Exception as e:
        print(f"Error in clear_cart: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

# 注文作成
@app.post("/api/orders/create")
async def create_order(order: OrderCreate):
    try:
        with get_db_cursor(isolation_level='SERIALIZABLE') as cursor:
            # ユーザーの存在確認
            cursor.execute("SELECT id FROM users WHERE id = %s", (order.user_id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="User not found")

            # カートの取得
            cursor.execute("""
                SELECT c.id 
                FROM carts c
                WHERE c.user_id = %s
            """, (order.user_id,))
            cart = cursor.fetchone()
            if not cart:
                raise HTTPException(status_code=404, detail="Cart not found")

            # カート内の商品を取得
            cursor.execute("""
                SELECT 
                    ci.product_id,
                    ci.quantity,
                    p.price,
                    p.name,
                    p.stock,
                    p.image_url
                FROM cart_items ci
                JOIN products p ON ci.product_id = p.id
                WHERE ci.cart_id = %s
                FOR UPDATE
            """, (cart['id'],))
            cart_items = cursor.fetchall()

            if not cart_items:
                raise HTTPException(status_code=400, detail="Cart is empty")

            # 在庫チェックと合計金額の計算
            total_amount = 0
            for item in cart_items:
                if item['stock'] < item['quantity']:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Insufficient stock for product: {item['name']}"
                    )
                total_amount += item['price'] * item['quantity']

            # 注文番号の生成
            order_number = f"ORD-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"

            # 注文の作成
            cursor.execute("""
                INSERT INTO orders (
                    user_id, order_number, total_amount, 
                    payment_method, shipping_name, shipping_postal_code,
                    shipping_address, shipping_phone, status
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                order.user_id, order_number, total_amount,
                order.payment_method, order.shipping_name, order.shipping_postal_code,
                order.shipping_address, order.shipping_phone, 'completed'
            ))
            order_id = cursor.lastrowid

            # 注文詳細の作成と在庫の更新
            for item in cart_items:
                # 注文詳細の追加
                cursor.execute("""
                    INSERT INTO order_details (
                        order_id, product_id, quantity, price,
                        product_name, product_image_url
                    ) VALUES (%s, %s, %s, %s, %s, %s)
                """, (
                    order_id, item['product_id'], item['quantity'],
                    item['price'], item['name'], item['image_url']
                ))

                # 在庫の更新
                cursor.execute("""
                    UPDATE products
                    SET stock = stock - %s
                    WHERE id = %s
                """, (item['quantity'], item['product_id']))

            # カートの中身を削除
            cursor.execute("DELETE FROM cart_items WHERE cart_id = %s", (cart['id'],))

            return {
                "message": "Order created successfully",
                "order_number": order_number
            }
    except Exception as e:
        print(f"Error in create_order: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

# 注文履歴取得
@app.get("/api/orders")
async def get_orders(user_id: int):
    try:
        with get_db_cursor() as cursor:
            # ユーザーの存在確認
            cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="User not found")

            # 注文一覧の取得
            cursor.execute("""
                SELECT 
                    o.id,
                    o.order_number,
                    o.status,
                    o.total_amount,
                    o.payment_method,
                    o.shipping_name,
                    o.shipping_postal_code,
                    o.shipping_address,
                    o.shipping_phone,
                    o.created_at
                FROM orders o
                WHERE o.user_id = %s
                ORDER BY o.created_at DESC
            """, (user_id,))
            orders = cursor.fetchall()

            formatted_orders = []
            for order in orders:
                # 各注文の詳細を取得
                cursor.execute("""
                    SELECT
                        id,
                        product_id,
                        quantity,
                        price,
                        product_name,
                        product_image_url
                    FROM order_details
                    WHERE order_id = %s
                """, (order['id'],))
                details = cursor.fetchall()

                # 注文データのフォーマット
                formatted_order = {
                    'id': order['id'],
                    'order_number': order['order_number'],
                    'status': order['status'],
                    'total_amount': int(order['total_amount']),
                    'payment_method': order['payment_method'],
                    'shipping_name': order['shipping_name'],
                    'shipping_postal_code': order['shipping_postal_code'],
                    'shipping_address': order['shipping_address'],
                    'shipping_phone': order['shipping_phone'],
                    'created_at': order['created_at'].isoformat(),
                    'details': [{
                        'id': detail['id'],
                        'product_id': detail['product_id'],
                        'quantity': detail['quantity'],
                        'price': int(detail['price']),
                        'product_name': detail['product_name'],
                        'product_image_url': detail['product_image_url']
                    } for detail in details]
                }
                formatted_orders.append(formatted_order)

            return formatted_orders
    except Exception as e:
        print(f"Error in get_orders: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

# 特定の注文詳細取得
@app.get("/api/orders/{order_number}")
async def get_order_details(order_number: str, user_id: int):
    try:
        with get_db_cursor() as cursor:
            # 注文の取得（ユーザーIDもチェック）
            cursor.execute("""
                SELECT 
                    o.id,
                    o.order_number,
                    o.status,
                    o.total_amount,
                    o.payment_method,
                    o.shipping_name,
                    o.shipping_postal_code,
                    o.shipping_address,
                    o.shipping_phone,
                    o.created_at
                FROM orders o
                WHERE o.order_number = %s AND o.user_id = %s
            """, (order_number, user_id))
            
            order = cursor.fetchone()
            if not order:
                raise HTTPException(status_code=404, detail="Order not found")

            # 注文詳細の取得
            cursor.execute("""
                SELECT
                    id,
                    product_id,
                    quantity,
                    price,
                    product_name,
                    product_image_url
                FROM order_details
                WHERE order_id = %s
            """, (order['id'],))
            
            details = cursor.fetchall()

            # レスポンスの整形
            formatted_order = {
                'id': order['id'],
                'order_number': order['order_number'],
                'status': order['status'],
                'total_amount': int(order['total_amount']),
                'payment_method': order['payment_method'],
                'shipping_name': order['shipping_name'],
                'shipping_postal_code': order['shipping_postal_code'],
                'shipping_address': order['shipping_address'],
                'shipping_phone': order['shipping_phone'],
                'created_at': order['created_at'].isoformat(),
                'details': [{
                    'id': detail['id'],
                    'product_id': detail['product_id'],
                    'quantity': detail['quantity'],
                    'price': int(detail['price']),
                    'product_name': detail['product_name'],
                    'product_image_url': detail['product_image_url']
                } for detail in details]
            }

            return formatted_order

    except Exception as e:
        print(f"Error in get_order_details: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)