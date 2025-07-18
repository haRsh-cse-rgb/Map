from flask import Flask, render_template, jsonify, request, send_from_directory
import pandas as pd
import os
import requests


app = Flask(__name__)

def get_coords(city):
    """Geocode a city to get its latitude and longitude using Nominatim."""
    url = f"https://nominatim.openstreetmap.org/search?q={city}&format=json"
    headers = {'User-Agent': 'biomass-map-app'} # Nominatim requires a user agent
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    data = response.json()
    if data:
        return data[0]['lat'], data[0]['lon']
    return None, None

def load_plant_data():
    """Load and process the plant data from data.xlsx"""
    try:
        df = pd.read_excel('data.xlsx')
        df = df.fillna('')
        df.columns = df.columns.astype(str).str.strip()
        
        plants_by_state = {}
        for state, group in df.groupby('State'):
            state = str(state).strip()
            if state:
                plants_by_state[state] = [
                    {k.strip(): str(v).strip() if isinstance(v, str) else v 
                     for k, v in row.items()}
                    for _, row in group.iterrows()
                ]
        return plants_by_state
    except Exception as e:
        print(f"Error loading plant data: {str(e)}")
        return {}

def load_odisha_biomass_data():
    try:
        file_path = 'Odisha_biomass.xlsx'
        # Read Excel file with multi-level headers
        df = pd.read_excel(file_path, header=[0, 1])
        
        # Get the district column (it's typically in the first column)
        districts = df.iloc[:, 0]  # Get the first column which contains districts
        
        result = []
        
        for index, row in df.iterrows():
            district_data = {
                'district': districts[index],  # Use the district from our separately extracted column
                'bioenergy_potential': {
                    'kharif_rice': float(row[('Bioenergy Potential GJ', 'Kharif Rice')]),
                    'rabi_rice': float(row[('Bioenergy Potential GJ', 'Rabi Rice')]),
                    'wheat': float(row[('Bioenergy Potential GJ', 'Wheat')]),
                    'cotton': float(row[('Bioenergy Potential GJ', 'Cotton')]),
                    'sugarcane': float(row[('Bioenergy Potential GJ', 'Sugarcane')])
                },
                'gross_biomass': {
                    'kharif_rice': float(row[('Gross Biomass Kilo tonnes', 'Kharif Rice')]),
                    'rabi_rice': float(row[('Gross Biomass Kilo tonnes', 'Rabi Rice')]),
                    'wheat': float(row[('Gross Biomass Kilo tonnes', 'Wheat')]),
                    'cotton': float(row[('Gross Biomass Kilo tonnes', 'Cotton')]),
                    'sugarcane': float(row[('Gross Biomass Kilo tonnes', 'Sugarcane')])
                },
                'surplus_biomass': {
                    'kharif_rice': float(row[('Surplus Biomass Kilo tonnes', 'Kharif Rice')]),
                    'rabi_rice': float(row[('Surplus Biomass Kilo tonnes', 'Rabi Rice')]),
                    'wheat': float(row[('Surplus Biomass Kilo tonnes', 'Wheat')]),
                    'cotton': float(row[('Surplus Biomass Kilo tonnes', 'Cotton')]),
                    'sugarcane': float(row[('Surplus Biomass Kilo tonnes', 'Sugarcane')])
                }
            }
            result.append(district_data)
        
        return result

    except Exception as e:
        print(f"Error loading Odisha biomass data: {str(e)}")
        return []

def load_biomass_data():
    """Load and process the biomass data from the provided Excel file."""
    try:
        file_path = 'biomass.xlsx'  # Path to the uploaded biomass file
        
        # Read all sheets from the Excel file
        sheets = pd.read_excel(file_path, sheet_name=None)
        
        # Process data from all sheets
        biomass_data = {}
        for sheet_name, df in sheets.items():
            df = df.fillna(0)  # Replace NaN with 0 for numeric columns
            df.columns = df.columns.astype(str).str.strip()  # Strip whitespace from column names
            biomass_data[sheet_name] = df.to_dict(orient='records')  # Convert DataFrame to list of dictionaries
        
        return biomass_data
    except Exception as e:
        print(f"Error loading biomass data: {str(e)}")
        return {}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/plants')
def get_plants():
    try:
        plants_by_state = load_plant_data()
        return jsonify(plants_by_state)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/biomass/odisha')
def get_odisha_biomass():
    try:
        biomass_data = load_odisha_biomass_data()
        if biomass_data:
            return jsonify(biomass_data), 200
        else:
            return jsonify({'error': 'No data found for Odisha'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/odisha/districts/<district>')
def get_odisha_district_details(district):
    try:
        plants_data = load_plant_data()
        biomass_data = load_odisha_biomass_data()
        
        district = district.strip().lower()
        
        # Get plant details
        plants_in_district = [plant for plant in plants_data.get("Odisha", []) if plant.get("City/ District", "").lower() == district]
        
        # Get biomass details
        biomass_in_district = next((b for b in biomass_data if b["district"].lower() == district), None)
        
        # Combine data
        response = {
            "district": district.title(),
            "plants": plants_in_district,
            "biomass": biomass_in_district
        }
        return jsonify(response), 200 if plants_in_district or biomass_in_district else 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500



@app.route('/api/plants/<state>')
def get_plants_by_state(state):
    try:
        plants_by_state = load_plant_data()
        state = str(state).strip()
        if state in plants_by_state:
            return jsonify(plants_by_state[state])
        else:
            return jsonify({'error': 'State not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/biomass', methods=['GET'])
def get_biomass():
    """API endpoint to return biomass data for a specific state."""
    try:
        state = request.args.get('state', '').strip()
        if not state:
            return jsonify({'error': 'State parameter is missing'}), 400

        biomass_data = load_biomass_data()
        
        # Combine data from all sheets for the given state
        state_data = []
        for sheet_name, data in biomass_data.items():
            state_data.extend([entry for entry in data if entry.get('States', '').strip().lower() == state.lower()])
        
        if state_data:
            return jsonify(state_data), 200
        else:
            return jsonify({'error': f'No data found for state: {state}'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/distance')
def get_distance():
    try:
        origin_city = request.args.get('origin')
        destination_city = request.args.get('destination')
        if not origin_city or not destination_city:
            return jsonify({'error': 'Origin and destination cities are required'}), 400

        lat1, lon1 = get_coords(origin_city)
        lat2, lon2 = get_coords(destination_city)

        if not lat1 or not lon1 or not lat2 or not lon2:
            return jsonify({'error': 'Could not geocode one or both cities'}), 400

        # Call OSRM route service
        url = f"http://router.project-osrm.org/route/v1/driving/{lon1},{lat1};{lon2},{lat2}?overview=false"
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()

        if data['code'] == 'Ok':
            distance_meters = data['routes'][0]['distance']
            distance_km = distance_meters / 1000
            return jsonify({'distance': f"{distance_km:.2f} km"})
        else:
            return jsonify({'error': 'Could not calculate distance using OSRM'}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/static/geojson/<path:filename>')
def serve_geojson(filename):
    return send_from_directory('static/geojson', filename)

# if __name__ == '__main__':
#     port = int(os.environ.get("PORT", 10000))  # Default to port 5000 if PORT is not set
#     app.run(host="0.0.0.0", port=PORT, debug=False)

PORT = int(os.environ.get("PORT", 10000))  # Use Render's assigned port

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=True)