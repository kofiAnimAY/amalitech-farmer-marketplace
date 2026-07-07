from flask_restx import Namespace, Resource, fields
from flask import request
from http import HTTPStatus
from datetime import datetime, timedelta
from bson.objectid import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from functools import wraps
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.apis import MSG
from app.db import marketplace, DB
# from app.db.constants import NUM_RECURRENCES, DAY_INTERVAL, EVENT_TITLE, DATE,IS_RECURRING, START_TIME, END_TIME, LOCATION
from app.apis import register
from app.apis.register import token_required, role_required
# from .validation import validate_fields,validate_date_time
from app.db.utils import serialize_items

marketplace_ns = Namespace(
    "marketplace", 
    description="Marketplace operations",
    authorizations=register.authorizations,
    security='Bearer Auth'
)

listing_model = marketplace_ns.model("Listing", {
    "item": fields.String(required=True, description="The item being listed"),
    "listed_by": fields.String(required=True, description="The user ID of the person registering the listing"),
    "price": fields.Float(required=True, description="The price per unit of the item"),
    "quantity": fields.Integer(required=True, description="The quantity of the item available")
})

class ListingResource(Resource):
    @marketplace_ns.doc(security='Bearer Auth')
    @marketplace_ns.expect(listing_model)
    @marketplace_ns.response(201, "Listing created successfully")
    @marketplace_ns.response(400, "Invalid input")
    @token_required
    @role_required("farmer")
    def post(self):
        """Create a new listing"""
        data = request.get_json() or {}
        item = data.get("item")
        listed_by = getattr(request, "user_id", None)
        price = data.get("price")
        quantity = data.get("quantity")

        if not all([item, listed_by, price, quantity]):
            return {"message": "All fields are required"}, HTTPStatus.BAD_REQUEST

        listing_id = marketplace.add_listing(item, listed_by, price, quantity)
        return {"message": "Listing created successfully", "listing_id": listing_id}, HTTPStatus.CREATED
    
    def get(self):
        """Get all listings"""
        listings = marketplace.get_all_listings()
        return {"listings": listings}, HTTPStatus.OK

class BuyResource(Resource):
    @marketplace_ns.doc(security='Bearer Auth')
    @marketplace_ns.response(200, "Purchase successful")
    @marketplace_ns.response(400, "Invalid input")
    @marketplace_ns.response(404, "Listing not found")
    @token_required
    @role_required("buyer")
    def post(self):
        """Buy an item from a listing"""
        data = request.get_json() or {}
        listing_id = data.get("listing_id")
        quantity = data.get("quantity")
        listing = marketplace.get_listing_by_id(listing_id)
        if not all([listing_id, quantity]):
            return {"message": "Listing ID and quantity are required"}, HTTPStatus.BAD_REQUEST

        result = marketplace.update_quantity(listing_id, -quantity)
        if result["message"] == "Quantity updated successfully":
            return {"message": "Purchase successful. Total Cost: ${}".format(quantity * listing["price"])}, HTTPStatus.OK
        else:
            return {"message": result["message"]}, HTTPStatus.NOT_FOUND
        
