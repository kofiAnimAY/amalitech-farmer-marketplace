# from app.db.constants import EVENT_COLLECTION, EVENT_TITLE, DATE,IS_RECURRING, START_TIME, END_TIME, LOCATION, ID,RECURRENCE_ID
from app.db.utils import serialize_item, serialize_items
from app.db import DB
from bson.objectid import ObjectId
from http import HTTPStatus
from datetime import datetime,timedelta,date,time

def _get_listing_collection_():
    return DB.get_collection("listings")

def add_listing(item: str, listed_by: str, price: float, quantity: int, description: str = None) -> dict:
    listings_col = _get_listing_collection_()
    listing_data = {
        "item": item,
        "listed_by": listed_by,
        "price": price,
        "quantity": quantity
    }
    if description is not None:
        listing_data["description"] = description
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
def set_quantity(listing_id: str, new_quantity: int) -> dict:
    listings_col = _get_listing_collection_()
    result = listings_col.update_one({"_id": ObjectId(listing_id)}, {"$set": {"quantity": new_quantity}})
    if result.modified_count == 1:
        return {"message": "Quantity set successfully"}
    else:
        return {"message": "Listing not found or quantity unchanged"}
def update_price(listing_id: str, new_price: float) -> dict:
    listings_col = _get_listing_collection_()
    result = listings_col.update_one({"_id": ObjectId(listing_id)}, {"$set": {"price": new_price}})
    if result.modified_count == 1:
        return {"message": "Price updated successfully"}
    else:
        return {"message": "Listing not found or price unchanged"}

def delete_listing(listing_id: str) -> dict:
    listings_col = _get_listing_collection_()
    result = listings_col.delete_one({"_id": ObjectId(listing_id)})
    if result.deleted_count == 1:
        return {"message": "Listing deleted successfully"}
    else:
        return {"message": "Listing not found"}
    
def update_description(listing_id: str, new_description: str) -> dict:
    listings_col = _get_listing_collection_()
    result = listings_col.update_one({"_id": ObjectId(listing_id)}, {"$set": {"description": new_description}})
    if result.modified_count == 1:
        return {"message": "Description updated successfully"}
    else:
        return {"message": "Listing not found or description unchanged"}

def update_name(listing_id: str, new_name: str) -> dict:
    listings_col = _get_listing_collection_()
    result = listings_col.update_one({"_id": ObjectId(listing_id)}, {"$set": {"item": new_name}})
    if result.modified_count == 1:
        return {"message": "Name updated successfully"}
    else:
        return {"message": "Listing not found or name unchanged"}

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