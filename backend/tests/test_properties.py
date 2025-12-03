def test_get_property_by_id(test_client, auth_headers):
    """
    GIVEN a property exists
    WHEN the '/properties/<id>' endpoint is requested
    THEN check the response is valid and the view count is incremented in the DB
    """
    # First, create a property
    create_res = test_client.post('/properties', json={
        "property_title": "Another Test Property",
        "price": 300000,
        "location": "Another City",
        "property_type": "villa",
        "bedrooms": 3,
        "bathrooms": 2,
        "area_sqft": 1500
    }, headers=auth_headers)
    property_id = create_res.json['_id']

    # Then, get it by ID
    response = test_client.get(f'/properties/{property_id}')
    assert response.status_code == 200
    assert response.json['property_title'] == "Another Test Property"
    
    # The API response contains the view count BEFORE the request
    assert response.json['views'] == 0

    # --- FIX: Verify the view count was incremented in the database ---
    from app import mongo # Import mongo to query the DB
    from bson.objectid import ObjectId
    
    updated_property = mongo.db.properties.find_one({"_id": ObjectId(property_id)})
    assert updated_property['views'] == 1