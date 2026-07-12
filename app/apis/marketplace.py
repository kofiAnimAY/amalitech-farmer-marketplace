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
from app.db import listing, order, DB
from app.apis import register
from app.apis.register import token_required, role_required


marketplace_ns = Namespace(
    "marketplace", 
    description="Marketplace operations",
    authorizations=register.authorizations,
    security='Bearer Auth'
)

listing_model = marketplace_ns.model("Listing", {
    "item": fields.String(required=True, description="The item being listed"),
    "description": fields.String(required=False, description="A brief description of the item"),
    # "listed_by": fields.String(required=True, description="The user ID of the person registering the listing"),
    "price": fields.Float(required=True, description="The price per unit of the item"),
    "quantity": fields.Integer(required=True, description="The quantity of the item available")
})

order_model = marketplace_ns.model("Order", {
    "listing_id": fields.String(required=True, description="The ID of the listing to order from"),
    "quantity": fields.Integer(required=True, description="The quantity of the item to order")
})

order_update_model = marketplace_ns.model("OrderUpdate", {
    "order_id": fields.String(required=True, description="The ID of the order to update"),
    "new_status": fields.String(required=True, description="The new status of the order")
})

update_model = marketplace_ns.model("Update", {
    "listing_id": fields.String(required=True, description="The ID of the listing to update"),
    "new_name": fields.String(required=False, description="The new name of the item"),
    "new_price": fields.Float(required=False, description="The new price per unit of the item"),
    "new_quantity": fields.Integer(required=False, description="The new quantity of the item available"),
    "description": fields.String(required=False, description="A brief description of the item")
})

delete_model = marketplace_ns.model("Delete", {
    "listing_id": fields.String(required=True, description="The ID of the listing to delete")
})

@marketplace_ns.route("/listings")
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
        description = data.get("description")
        listed_by = getattr(request, "user_id", None)
        price = data.get("price")
        quantity = data.get("quantity")

        if not all([item, listed_by, price, quantity]):
            return {"message": "All fields are required"}, HTTPStatus.BAD_REQUEST

        listing_id = listing.add_listing(item, listed_by, price, quantity, description)
        return {"message": "Listing created successfully", "listing_id": listing_id}, HTTPStatus.CREATED
    
    def get(self):
        """Get all listings"""
        listings = listing.get_all_listings()
        return {"listings": listings}, HTTPStatus.OK
    
    def _require_listing_owner(self, listing_id):
        listing = listing.get_listing_by_id(listing_id)
        if not listing:
            return {"message": "Listing not found"}, HTTPStatus.NOT_FOUND
        if listing.get("listed_by") != getattr(request, "user_id", None):
            return {"message": "Forbidden"}, HTTPStatus.FORBIDDEN
        return None, None

    @marketplace_ns.doc(security='Bearer Auth')
    @marketplace_ns.expect(update_model)
    @marketplace_ns.response(200, "Listing updated successfully")
    @marketplace_ns.response(400, "Invalid input")
    @marketplace_ns.response(404, "Listing not found")
    @marketplace_ns.response(403, "Forbidden")
    @token_required
    @role_required("farmer")
    def patch(self):
        """Update a listing's price or quantity"""
        data = request.get_json() or {}
        listing_id = data.get("listing_id")
        new_name = data.get("new_name")
        description = data.get("description")
        new_price = data.get("new_price")
        new_quantity = data.get("new_quantity")

        if not listing_id:
            return {"message": "Listing ID is required"}, HTTPStatus.BAD_REQUEST

        error_response, error_status = self._require_listing_owner(listing_id)
        if error_response:
            return error_response, error_status

        if new_price is not None:
            result = listing.update_price(listing_id, new_price)
            if result["message"] != "Price updated successfully":
                return {"message": result["message"]}, HTTPStatus.NOT_FOUND
        
        if new_name is not None:
            result = listing.update_name(listing_id, new_name)
            if result["message"] != "Name updated successfully":
                return {"message": result["message"]}, HTTPStatus.NOT_FOUND

        if description is not None:
            result = listing.update_description(listing_id, description)
            if result["message"] != "Description updated successfully":
                return {"message": result["message"]}, HTTPStatus.NOT_FOUND
        
        if new_quantity is not None:
            result = listing.set_quantity(listing_id, new_quantity)
            if result["message"] != "Quantity set successfully":
                return {"message": result["message"]}, HTTPStatus.NOT_FOUND

        return {"message": "Listing updated successfully"}, HTTPStatus.OK

    @marketplace_ns.doc(security='Bearer Auth')
    @marketplace_ns.expect(delete_model)
    @marketplace_ns.response(200, "Listing deleted successfully")
    @marketplace_ns.response(400, "Invalid input")
    @marketplace_ns.response(404, "Listing not found")
    @marketplace_ns.response(403, "Forbidden")
    @token_required
    @role_required("farmer")
    def delete(self):
        """Delete a listing"""
        data = request.get_json() or {}
        listing_id = data.get("listing_id")

        if not listing_id:
            return {"message": "Listing ID is required"}, HTTPStatus.BAD_REQUEST

        error_response, error_status = self._require_listing_owner(listing_id)
        if error_response:
            return error_response, error_status

        result = listing.delete_listing(listing_id)
        if result["message"] != "Listing deleted successfully":
            return {"message": result["message"]}, HTTPStatus.NOT_FOUND

        return {"message": "Listing deleted successfully"}, HTTPStatus.OK
    

@marketplace_ns.route("/order")
class OrderResource(Resource):
    @marketplace_ns.doc(security='Bearer Auth')
    @marketplace_ns.expect(order_model)
    @marketplace_ns.response(200, "Order successful")
    @marketplace_ns.response(400, "Invalid input")
    @marketplace_ns.response(404, "Listing not found")
    @token_required
    @role_required("buyer")
    def post(self):
        """Place an order for an item from a listing"""
        data = request.json
        listing_id = data.get("listing_id")
        quantity = data.get("quantity")
        buyer_id = getattr(request, "user_id", None)

        if not all([listing_id, quantity]):
            return {"message": "Listing ID and quantity are required"}, HTTPStatus.BAD_REQUEST
        
        result = order.create_order(listing_id, quantity, buyer_id)

        if "message" in result:
            return {"message": result["message"]}, HTTPStatus.BAD_REQUEST
        
        return {"message": "Order successful", "order_id": result}, HTTPStatus.OK
    
    @marketplace_ns.doc(security='Bearer Auth')
    @marketplace_ns.expect(order_update_model)
    @marketplace_ns.response(200, "Order status updated successfully")
    @marketplace_ns.response(400, "Invalid input")
    @marketplace_ns.response(404, "Order not found")
    @token_required
    @role_required("farmer")
    def patch(self, order_id):
        """Update the status of an order"""     
        

        if not order_id:
            return {"message": "Order ID is required"}, HTTPStatus.BAD_REQUEST
        
        listing_id=order.get("listing_id")
        if order.check_order_quantity(order_id,listing_id):
            result = order.update_order_status(order_id)
        else:
            return {"message": "Insufficient quantity available"}, HTTPStatus.BAD_REQUEST

        if "message" in result and result["message"] != "Order status updated successfully":
            return {"message": result["message"]}, HTTPStatus.NOT_FOUND
        
        
        
        return {"message": "Order status updated successfully"}, HTTPStatus.OK
        

        
