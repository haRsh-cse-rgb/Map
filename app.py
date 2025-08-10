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

def load_steel_plant_data():
    """Load and process the steel iron plant data from data.xlsx"""
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
        print(f"Error loading steel plant data: {str(e)}")
        return {}

def load_sponge_plant_data():
    """Load and process the sponge iron plant data from Sponge_Iron_Plants.xlsx"""
    try:
        df = pd.read_excel('Sponge_Iron_Plants.xlsx')
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
        print(f"Error loading sponge iron plant data: {str(e)}")
        return {}

def load_all_biomass_data():
    """Load biomass data for all states"""
    try:
        biomass_data = {}
        
        # Load Odisha biomass data
        odisha_file = 'Odisha_biomass.xlsx'
        if os.path.exists(odisha_file):
            df = pd.read_excel(odisha_file, header=[0, 1])
            districts = df.iloc[:, 0]
            odisha_data = []
            
            for index, row in df.iterrows():
                district_data = {
                    'state': 'Odisha',
                    'district': districts[index],
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
                odisha_data.append(district_data)
            biomass_data['Odisha'] = odisha_data
        
        # Load Himachal Pradesh biomass data
        himachal_file = 'Himachal_Pradesh_biomass.xlsx'
        if os.path.exists(himachal_file):
            df = pd.read_excel(himachal_file, header=[0, 1])
            districts = df.iloc[:, 0]
            himachal_data = []
            
            for index, row in df.iterrows():
                district_data = {
                    'state': 'Himachal Pradesh',
                    'district': districts[index],
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
                himachal_data.append(district_data)
            biomass_data['Himachal Pradesh'] = himachal_data

        # Load Goa biomass data
        goa_file = 'Goa_biomass.xlsx'
        if os.path.exists(goa_file):
            df = pd.read_excel(goa_file, header=[0, 1])
            districts = df.iloc[:, 0]
            goa_data = []
            
            for index, row in df.iterrows():
                district_data = {
                    'state': 'Goa',
                    'district': districts[index],
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
                goa_data.append(district_data)
            biomass_data['Goa'] = goa_data

        # Load Tripura biomass data
        tripura_file = 'Tripura_biomass.xlsx'
        if os.path.exists(tripura_file):
            df = pd.read_excel(tripura_file, header=[0, 1])
            districts = df.iloc[:, 0]
            tripura_data = []
            
            for index, row in df.iterrows():
                district_data = {
                    'state': 'Tripura',
                    'district': districts[index],
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
                tripura_data.append(district_data)
            biomass_data['Tripura'] = tripura_data

        # Load Sikkim biomass data
        sikkim_file = 'Sikkim_biomass.xlsx'
        if os.path.exists(sikkim_file):
            df = pd.read_excel(sikkim_file, header=[0, 1])
            districts = df.iloc[:, 0]
            sikkim_data = []
            
            for index, row in df.iterrows():
                district_data = {
                    'state': 'Sikkim',
                    'district': districts[index],
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
                sikkim_data.append(district_data)
            biomass_data['Sikkim'] = sikkim_data

        # Load Puducherry biomass data
        puducherry_file = 'Puducherry_biomass.xlsx'
        if os.path.exists(puducherry_file):
            df = pd.read_excel(puducherry_file, header=[0, 1])
            districts = df.iloc[:, 0]
            puducherry_data = []
            
            for index, row in df.iterrows():
                district_data = {
                    'state': 'Puducherry',
                    'district': districts[index],
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
                puducherry_data.append(district_data)
            biomass_data['Puducherry'] = puducherry_data

        # Load Meghalaya biomass data
        meghalaya_file = 'Meghalaya_biomass.xlsx'
        if os.path.exists(meghalaya_file):
            df = pd.read_excel(meghalaya_file, header=[0, 1])
            districts = df.iloc[:, 0]
            meghalaya_data = []
            
            for index, row in df.iterrows():
                district_data = {
                    'state': 'Meghalaya',
                    'district': districts[index],
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
                meghalaya_data.append(district_data)
            biomass_data['Meghalaya'] = meghalaya_data

        # Load Mizoram biomass data
        mizoram_file = 'Mizoram_biomass.xlsx'
        if os.path.exists(mizoram_file):
            df = pd.read_excel(mizoram_file, header=[0, 1])
            districts = df.iloc[:, 0]
            mizoram_data = []
            
            for index, row in df.iterrows():
                district_data = {
                    'state': 'Mizoram',
                    'district': districts[index],
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
                mizoram_data.append(district_data)
            biomass_data['Mizoram'] = mizoram_data

        # Load Karnataka biomass data
        karnataka_file = 'Karnataka_biomass.xlsx'
        if os.path.exists(karnataka_file):
            df = pd.read_excel(karnataka_file, header=[0, 1])
            districts = df.iloc[:, 0]
            karnataka_data = []
            
            for index, row in df.iterrows():
                district_data = {
                    'state': 'Karnataka',
                    'district': districts[index],
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
                karnataka_data.append(district_data)
            biomass_data['Karnataka'] = karnataka_data

        # Load Kerala biomass data
        kerala_file = 'Kerela_biomass.xlsx'
        if os.path.exists(kerala_file):
            df = pd.read_excel(kerala_file, header=[0, 1])
            districts = df.iloc[:, 0]
            kerala_data = []
            
            for index, row in df.iterrows():
                district_data = {
                    'state': 'Kerala',
                    'district': districts[index],
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
                kerala_data.append(district_data)
            biomass_data['Kerala'] = kerala_data

        # Load Maharashtra biomass data
        maharashtra_file = 'Maharastra_biomass.xlsx'
        if os.path.exists(maharashtra_file):
            df = pd.read_excel(maharashtra_file, header=[0, 1])
            districts = df.iloc[:, 0]
            maharashtra_data = []
            
            for index, row in df.iterrows():
                district_data = {
                    'state': 'Maharashtra',
                    'district': districts[index],
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
                maharashtra_data.append(district_data)
            biomass_data['Maharashtra'] = maharashtra_data

        # Load Andhra Pradesh biomass data
        andhra_file = 'Andra_Pradesh_biomass.xlsx'
        if os.path.exists(andhra_file):
            df = pd.read_excel(andhra_file, header=[0, 1])
            districts = df.iloc[:, 0]
            andhra_data = []
            
            for index, row in df.iterrows():
                district_data = {
                    'state': 'Andhra Pradesh',
                    'district': districts[index],
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
                andhra_data.append(district_data)
            biomass_data['Andhra Pradesh'] = andhra_data
        
        return biomass_data

    except Exception as e:
        print(f"Error loading biomass data: {str(e)}")
        return {}

# Keep the old function for backward compatibility
def load_odisha_biomass_data():
    """Load and process the biomass data from the provided Excel file."""
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
        steel_plants = load_steel_plant_data()
        sponge_plants = load_sponge_plant_data()
        return jsonify({
            'steel': steel_plants,
            'sponge': sponge_plants
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/biomass/all')
def get_all_biomass():
    try:
        biomass_data = load_all_biomass_data()
        if biomass_data:
            return jsonify(biomass_data), 200
        else:
            return jsonify({'error': 'No biomass data found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/biomass/state/<state>')
def get_state_biomass(state):
    try:
        biomass_data = load_all_biomass_data()
        state_data = biomass_data.get(state, [])
        if state_data:
            return jsonify(state_data), 200
        else:
            return jsonify({'error': f'No biomass data found for {state}'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/districts/<state>/<district>')
def get_district_details(state, district):
    try:
        plants_data = load_plant_data()
        biomass_data = load_all_biomass_data()
        
        district = district.strip().lower()
        state = state.strip()
        
        # Get plant details for the state
        plants_in_district = []
        if state in plants_data:
            plants_in_district = [plant for plant in plants_data[state] if plant.get("City/ District", "").lower() == district]
        
        # Get biomass details for the state
        biomass_in_district = None
        if state in biomass_data:
            biomass_in_district = next((b for b in biomass_data[state] if b["district"].lower() == district), None)
        
        # Combine data
        response = {
            "district": district.title(),
            "state": state,
            "plants": plants_in_district,
            "biomass": biomass_in_district
        }
        return jsonify(response), 200 if plants_in_district or biomass_in_district else 404
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
        lat1 = request.args.get('lat1')
        lon1 = request.args.get('lon1')
        lat2 = request.args.get('lat2')
        lon2 = request.args.get('lon2')
        print('Received:', lat1, lon1, lat2, lon2)
        if all([lat1, lon1, lat2, lon2]):
            try:
                lat1 = float(lat1)
                lon1 = float(lon1)
                lat2 = float(lat2)
                lon2 = float(lon2)
            except Exception as e:
                return jsonify({'error': f'Invalid coordinates: {e}'}), 400
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
        # Fallback: use city geocoding if lat/lon not provided
        origin_city = request.args.get('origin')
        destination_city = request.args.get('destination')
        if not origin_city or not destination_city:
            return jsonify({'error': 'Origin and destination cities or coordinates are required'}), 400
        lat1, lon1 = get_coords(origin_city)
        lat2, lon2 = get_coords(destination_city)
        if not lat1 or not lon1 or not lat2 or not lon2:
            return jsonify({'error': 'Could not geocode one or both cities'}), 400
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