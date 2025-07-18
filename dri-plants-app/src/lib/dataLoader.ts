import * as XLSX from 'xlsx'

// Mock data - In a real application, you would load this from your data files
const mockPlantData = {
  "Odisha": [
    {
      "Sponge Iron Plant": "Arya Iron & Steel Company",
      "City/ District": "Sundargarh",
      "Longitude": "84.0167",
      "Latitude": "22.1167",
      "Capacity (MTPA)": "0.5",
      "Technology": "Rotary Kiln"
    },
    {
      "Sponge Iron Plant": "Bhushan Steel Limited",
      "City/ District": "Dhenkanal",
      "Longitude": "85.5983",
      "Latitude": "20.6667",
      "Capacity (MTPA)": "1.2",
      "Technology": "Rotary Kiln"
    }
  ],
  "Maharashtra": [
    {
      "Sponge Iron Plant": "Tata Steel BSL",
      "City/ District": "Pune",
      "Longitude": "73.8567",
      "Latitude": "18.5204",
      "Capacity (MTPA)": "2.0",
      "Technology": "Coal Based"
    }
  ],
  "Jharkhand": [
    {
      "Sponge Iron Plant": "Tata Steel Jamshedpur",
      "City/ District": "Jamshedpur",
      "Longitude": "86.1844",
      "Latitude": "22.8046",
      "Capacity (MTPA)": "3.0",
      "Technology": "Blast Furnace"
    }
  ]
}

const mockBiomassData = {
  "Odisha": [
    {
      "Wheat": "150.5",
      "Rice": "2500.8",
      "Maize": "200.3",
      "Bajra": "50.2",
      "Sugarcane": "300.7",
      "Groundnut": "100.4",
      "Rapeseed Mustard": "75.6",
      "Arhar/Tur": "80.9",
      "Total Crops": "3458.4"
    },
    {
      "Wheat": "120.3",
      "Rice": "2000.6",
      "Maize": "150.2",
      "Bajra": "40.1",
      "Sugarcane": "250.5",
      "Groundnut": "80.3",
      "Rapeseed Mustard": "60.4",
      "Arhar/Tur": "65.7",
      "Total Crops": "2767.1"
    }
  ]
}

const mockOdishaBiomassData = [
  {
    district: "Sundargarh",
    bioenergy_potential: {
      kharif_rice: 1250.5,
      rabi_rice: 800.3,
      wheat: 150.2,
      cotton: 50.1,
      sugarcane: 300.8
    },
    gross_biomass: {
      kharif_rice: 2500.8,
      rabi_rice: 1600.6,
      wheat: 300.4,
      cotton: 100.2,
      sugarcane: 601.6
    },
    surplus_biomass: {
      kharif_rice: 1875.6,
      rabi_rice: 1200.45,
      wheat: 225.3,
      cotton: 75.15,
      sugarcane: 451.2
    }
  },
  {
    district: "Dhenkanal",
    bioenergy_potential: {
      kharif_rice: 800.3,
      rabi_rice: 500.2,
      wheat: 100.1,
      cotton: 30.05,
      sugarcane: 200.4
    },
    gross_biomass: {
      kharif_rice: 1600.6,
      rabi_rice: 1000.4,
      wheat: 200.2,
      cotton: 60.1,
      sugarcane: 400.8
    },
    surplus_biomass: {
      kharif_rice: 1200.45,
      rabi_rice: 750.3,
      wheat: 150.15,
      cotton: 45.075,
      sugarcane: 300.6
    }
  }
]

export async function loadPlantData() {
  // In a real application, you would load from Excel files
  // For now, return mock data
  return mockPlantData
}

export async function loadBiomassData(state: string) {
  // In a real application, you would load from Excel files
  // For now, return mock data
  return mockBiomassData[state as keyof typeof mockBiomassData] || []
}

export async function loadOdishaBiomassData(district?: string) {
  if (district) {
    const districtData = mockOdishaBiomassData.find(
      d => d.district.toLowerCase() === district.toLowerCase()
    )
    return districtData ? { biomass: districtData } : null
  }
  return mockOdishaBiomassData
}

export async function calculateDistance(origin: string, destination: string): Promise<string> {
  // Mock distance calculation
  // In a real application, you would use a routing service
  const distances = [
    "125.5 km", "234.7 km", "456.2 km", "789.1 km", "321.8 km"
  ]
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return distances[Math.floor(Math.random() * distances.length)]
}

// Function to load GeoJSON data
export async function loadGeoJSON(path: string) {
  const response = await fetch(path)
  if (!response.ok) {
    throw new Error(`Failed to load GeoJSON: ${response.statusText}`)
  }
  return response.json()
}