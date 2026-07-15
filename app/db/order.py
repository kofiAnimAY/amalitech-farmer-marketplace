from app.db.utils import serialize_item, serialize_items
from app.db import DB
from bson.objectid import ObjectId
from http import HTTPStatus
from datetime import datetime,timedelta,date,time
import listing

def _get_order_collection_():
    return DB.get_collection("orders")

def create_order(listing_id: str, quantity: int, buyer_id: str) -> dict:
    orders_col = _get_order_collection_()
    order_data = {
        "listing_id": listing_id,
        "quantity": quantity,
        "buyer_id": buyer_id,
        "created_at": datetime.utcnow(),
        "status": 0     #Order status can be 0 (placed), 1 (confirmed), or 2 (fulfilled)
    }
    listing=listing.get_listing_by_id(listing_id)

    if not listing:
        return {"message": "Listing not found"}
    if listing["quantity"] < quantity:
        return {"message": "Insufficient quantity available"}
    
    result = orders_col.insert_one(order_data)
    return str(result.inserted_id)

def update_order_status(order_id: str) -> dict:
    orders_col = _get_order_collection_()
    result = orders_col.update_one({"_id": ObjectId(order_id)}, {"$inc": {"status":1}})
    if result.modified_count == 1:
        return {"message": "Order status updated successfully"}
    else:
        return {"message": "Order not found or status unchanged"}
    
def get_orders_by_buyer(buyer_id: str) -> list:
    orders_col = _get_order_collection_()
    orders = orders_col.find({"buyer_id": buyer_id})
    return serialize_items(orders)

def get_order_by_id(order_id: str) -> dict | None:
    orders_col = _get_order_collection_()
    order = orders_col.find_one({"_id": ObjectId(order_id)})
    if order:
        return serialize_item(order)
    return None

def get_orders_by_listing(listing_id: str) -> list:
    orders_col = _get_order_collection_()
    orders = orders_col.find({"listing_id": listing_id})
    return serialize_items(orders)

def delete_order(order_id: str) -> dict:
    orders_col = _get_order_collection_()
    result = orders_col.delete_one({"_id": ObjectId(order_id)})
    if result.deleted_count == 1:
        return {"message": "Order deleted successfully"}
    else:
        return {"message": "Order not found"}
    
def check_order_quantity(listing_id: str, order_id: str) -> bool:
    order = get_order_by_id(order_id)
    if not order:
        return False
    listing = listing.get_listing_by_id(listing_id)
    if not listing:
        return False
    return listing["quantity"] >= order["quantity"]