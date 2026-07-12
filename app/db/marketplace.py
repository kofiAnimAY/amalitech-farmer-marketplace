# from app.db.constants import EVENT_COLLECTION, EVENT_TITLE, DATE,IS_RECURRING, START_TIME, END_TIME, LOCATION, ID,RECURRENCE_ID
from app.db.utils import serialize_item, serialize_items
from app.db import DB
from bson.objectid import ObjectId
from http import HTTPStatus
from datetime import datetime,timedelta,date,time

def _get_listing_collection_():
    return DB.get_collection("listings")

def add_listing(item: str, listed_by: str, price: float, quantity: int) -> dict:
    listings_col = _get_listing_collection_()
    listing_data = {
        "item": item,
        "listed_by": listed_by,
        "price": price,
        "quantity": quantity
    }
    result = listings_col.insert_one(listing_data)
    return str(result.inserted_id)

def update_quantity(listing_id: str, delta: int) -> dict:
    listings_col = _get_listing_collection_()
    if listings_col.find_one({"_id": ObjectId(listing_id)})["quantity"] < -delta:
        return {"message": "Insufficient quantity available"}
    result = listings_col.update_one({"_id": ObjectId(listing_id)}, {"$inc": {"quantity": delta}})
    
    if result.modified_count == 1:
        return {"message": "Quantity updated successfully"}
    else:
        return {"message": "Listing not found or quantity unchanged"}

def update_price(listing_id: str, new_price: float) -> dict:
    listings_col = _get_listing_collection_()
    result = listings_col.update_one({"_id": ObjectId(listing_id)}, {"$set": {"price": new_price}})
    if result.modified_count == 1:
        return {"message": "Price updated successfully"}
    else:
        return {"message": "Listing not found or price unchanged"}
    
def get_listing_by_id(listing_id: str) -> dict | None:
    listings_col = _get_listing_collection_()
    listing = listings_col.find_one({"_id": ObjectId(listing_id)})
    if listing:
        return serialize_item(listing)
    return None

def get_all_listings() -> list:
    listings_col = _get_listing_collection_()
    listings = listings_col.find()
    return serialize_items(listings)