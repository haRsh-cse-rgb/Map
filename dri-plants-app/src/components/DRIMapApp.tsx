'use client'

import { useEffect, useState, useRef } from 'react'
import { loadPlantData, loadBiomassData, loadOdishaBiomassData, calculateDistance } from '@/lib/dataLoader'
import { createIndiaMap, createStateMap } from '@/lib/mapUtils'
import Sidebar from './Sidebar'
import Modal from './Modal'
import DistrictDetailsModal from './DistrictDetailsModal'

declare global {
  interface Window {
    Highcharts: any;
  }
}

interface PlantData {
  [state: string]: any[];
}

interface BiomassData {
  [key: string]: any;
}

export default function DRIMapApp() {
  const [currentView, setCurrentView] = useState<string>('india')
  const [plantData, setPlantData] = useState<PlantData>({})
  const [currentChart, setCurrentChart] = useState<any>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [plantsVisible, setPlantsVisible] = useState(true)
  const [biomassVisible, setBiomassVisible] = useState(true)
  const [distanceInputsVisible, setDistanceInputsVisible] = useState(false)
  const [tutorialVisible, setTutorialVisible] = useState(false)
  const [modalContent, setModalContent] = useState<any>(null)
  const [districtModalVisible, setDistrictModalVisible] = useState(false)
  const [districtModalData, setDistrictModalData] = useState<any>(null)
  const [allPlantNames, setAllPlantNames] = useState<any[]>([])
  const [selectedPlant1, setSelectedPlant1] = useState<string | null>(null)
  const [selectedPlant2, setSelectedPlant2] = useState<string | null>(null)
  const [distanceResult, setDistanceResult] = useState<string>('')
  
  const mapContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const data = await loadPlantData()
        setPlantData(data)
        
        // Populate plant names for autocomplete
        const plantNames = Object.values(data)
          .flat()
          .filter(plant => plant["Sponge Iron Plant"] && plant["City/ District"])
          .map((plant) => ({ 
            name: plant["Sponge Iron Plant"], 
            city: plant["City/ District"] 
          }))
          .sort((a, b) => a.name.localeCompare(b.name))
        
        setAllPlantNames(plantNames)
        
        // Load India map
        if (window.Highcharts && mapContainerRef.current) {
          const chart = await createIndiaMap(data, mapContainerRef.current, {
            onStateClick: handleStateClick,
            onBiomassClick: handleBiomassClick
          })
          setCurrentChart(chart)
        }
      } catch (error) {
        console.error('Error initializing app:', error)
      }
    }

    // Wait for Highcharts to load
    const checkHighcharts = () => {
      if (window.Highcharts) {
        initializeApp()
      } else {
        setTimeout(checkHighcharts, 100)
      }
    }
    
    checkHighcharts()
  }, [])

  useEffect(() => {
    if (currentChart) {
      const plantsSeries = currentChart.get('plants-series')
      const biomassSeries = currentChart.get('biomass-series')
      
      if (plantsSeries) plantsSeries.setVisible(plantsVisible)
      if (biomassSeries) biomassSeries.setVisible(biomassVisible)
    }
  }, [plantsVisible, biomassVisible, currentChart])

  const handleStateClick = async (stateName: string) => {
    const plants = plantData[stateName]
    if (!plants || plants.length === 0) {
      alert('No plant data available for ' + stateName)
      return
    }

    try {
      const stateFile = stateName.toLowerCase().replace(/\s+/g, '')
      const response = await fetch(`/geojson/states/${stateFile}.json`)
      const stateData = await response.json()
      
      if (currentChart) {
        currentChart.destroy()
      }
      
      const chart = await createStateMap(stateData, plants, stateName, mapContainerRef.current!, {
        onDistrictClick: handleDistrictClick
      })
      
      setCurrentChart(chart)
      setCurrentView(stateName)
    } catch (error) {
      console.error('Error loading state data:', error)
      alert('Error loading map for ' + stateName)
    }
  }

  const handleBiomassClick = async (state: string) => {
    try {
      const data = await loadBiomassData(state)
      setModalContent({
        type: 'biomass',
        title: `${state} - Biomass Details`,
        data: data
      })
    } catch (error) {
      console.error('Error fetching biomass data:', error)
      alert('Error fetching biomass data')
    }
  }

  const handleDistrictClick = async (district: string, plants: any[]) => {
    if (currentView === 'Odisha') {
      try {
        const biomassData = await loadOdishaBiomassData(district)
        setDistrictModalData({
          district,
          plants,
          biomass: biomassData
        })
        setDistrictModalVisible(true)
      } catch (error) {
        console.error('Error fetching district data:', error)
        setDistrictModalData({
          district,
          plants,
          biomass: null
        })
        setDistrictModalVisible(true)
      }
    } else {
      setDistrictModalData({
        district,
        plants,
        biomass: null
      })
      setDistrictModalVisible(true)
    }
  }

  const handleBackToIndia = async () => {
    if (currentChart) {
      currentChart.destroy()
    }
    
    const chart = await createIndiaMap(plantData, mapContainerRef.current!, {
      onStateClick: handleStateClick,
      onBiomassClick: handleBiomassClick
    })
    
    setCurrentChart(chart)
    setCurrentView('india')
  }

  const handleShowAllStatesBiomass = () => {
    setModalContent({
      type: 'allStatesBiomass',
      title: 'Biomass Details by State',
      data: null
    })
  }

  const handleShowOdishaDistricts = async () => {
    if (currentView !== 'Odisha') return
    
    try {
      const districts = await loadOdishaBiomassData()
      setModalContent({
        type: 'odishaDistricts',
        title: 'Biomass Details by District (Odisha)',
        data: districts
      })
    } catch (error) {
      console.error('Error loading Odisha districts:', error)
      alert('Could not load district list. Please try again.')
    }
  }

  const handleCalculateDistance = async () => {
    if (selectedPlant1 && selectedPlant2) {
      setDistanceResult('Calculating...')
      try {
        const distance = await calculateDistance(selectedPlant1, selectedPlant2)
        setDistanceResult(`Distance: ${distance}`)
      } catch (error) {
        console.error('Error calculating distance:', error)
        setDistanceResult('Error calculating distance.')
      }
    } else {
      setDistanceResult('Please select two plants from the list.')
    }
  }

  return (
    <div className="relative">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        plantsVisible={plantsVisible}
        onPlantsToggle={setPlantsVisible}
        biomassVisible={biomassVisible}
        onBiomassToggle={setBiomassVisible}
        distanceInputsVisible={distanceInputsVisible}
        onDistanceToggle={setDistanceInputsVisible}
        onTutorialOpen={() => setTutorialVisible(true)}
        onShowAllStatesBiomass={handleShowAllStatesBiomass}
        onShowOdishaDistricts={handleShowOdishaDistricts}
        districtBiomassDisabled={currentView !== 'Odisha'}
        allPlantNames={allPlantNames}
        selectedPlant1={selectedPlant1}
        selectedPlant2={selectedPlant2}
        onPlant1Select={setSelectedPlant1}
        onPlant2Select={setSelectedPlant2}
        onCalculateDistance={handleCalculateDistance}
        distanceResult={distanceResult}
      />

      <div className={`main-content ${sidebarCollapsed ? 'full-width' : ''}`}>
        {sidebarCollapsed && (
          <button
            className="show-sidebar-btn"
            onClick={() => setSidebarCollapsed(false)}
          >
            <i className="material-icons">menu_open</i>
            <span>Options</span>
          </button>
        )}

        <div ref={mapContainerRef} id="map-container" className="w-full h-screen" />

        {currentView !== 'india' && (
          <button
            className="back-button"
            onClick={handleBackToIndia}
          >
            ← Back to India
          </button>
        )}

        <div id="bottom-right-overlays">
          {currentView === 'india' && (
            <div id="data-glance-overlay" className="map-overlay-box">
              <h4><i className="material-icons">bar_chart</i>Data at a Glance</h4>
              <div className="legend-item">
                <div className="legend-color red"></div>
                <span><b>{Object.values(plantData).flat().length}</b> Sponge Iron Plants</span>
              </div>
              <div className="legend-item">
                <div className="legend-color green"></div>
                <span><b>28</b> States with Biomass</span>
              </div>
            </div>
          )}
        </div>

        <div className="mobile-controls">
          <button
            className="mobile-button"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <i className="material-icons">menu</i>
          </button>
        </div>
      </div>

      {/* Tutorial Modal */}
      {tutorialVisible && (
        <Modal onClose={() => setTutorialVisible(false)}>
          <div className="modal-content">
            <span className="close-tutorial" onClick={() => setTutorialVisible(false)}>&times;</span>
            <h2>How to Use This Web Application</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <h3>🗺️ Exploring the Map</h3>
              <ul>
                <li><strong>Click on a state</strong> to zoom in and see its districts with detailed plant locations</li>
                <li><strong>Click on a district</strong> when viewing a state to see specific plants and biomass data</li>
                <li><strong>Hover over states/districts</strong> to highlight them and see basic information</li>
                <li><strong>Use map navigation</strong> to zoom and pan around the map</li>
              </ul>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3>📏 Finding Distance Between Plants</h3>
              <ol>
                <li>Click the <strong>"Find Distance Between Plants"</strong> button in the sidebar</li>
                <li>Start typing the name of the first plant - a dropdown will appear with matching options</li>
                <li>Select your desired plant from the dropdown list</li>
                <li>Repeat the process for the second plant in the bottom input field</li>
                <li>Click <strong>"Calculate Distance"</strong> to see the distance between the two locations</li>
              </ol>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3>🎛️ Using Map Controls</h3>
              <ul>
                <li>Use the <strong>toggle switches</strong> in the sidebar to show/hide plant or biomass layers</li>
                <li>The sidebar can be <strong>collapsed</strong> using the menu button for a full map view</li>
                <li>On mobile devices, tap the menu button to access all controls</li>
              </ul>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3>🔍 Understanding the Legend</h3>
              <ul>
                <li><strong>Red dots (●)</strong> represent Sponge Iron Plant locations</li>
                <li><strong>Green dots (●)</strong> represent areas with Biomass data availability</li>
                <li>Click on any dot to get detailed information about that location</li>
              </ul>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3>📊 Accessing Biomass Data</h3>
              <ul>
                <li>Click the <strong>"Biomass Details of State"</strong> button in the sidebar to see a list of all states.</li>
                <li>When viewing a state map, click the <strong>"Biomass Details of District"</strong> button to see a list of districts.</li>
                <li>You can also click directly on green dots or districts to see local biomass information</li>
              </ul>
            </div>

            <div style={{ backgroundColor: '#f0f8ff', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
              <strong>💡 Pro Tip:</strong> For the best experience, start by exploring the India map, then click on states of interest to see detailed district-level information.
            </div>
          </div>
        </Modal>
      )}

      {/* General Modal */}
      {modalContent && (
        <Modal onClose={() => setModalContent(null)}>
          {modalContent.type === 'biomass' && (
            <div className="modal-content">
              <span className="close-modal" onClick={() => setModalContent(null)}>&times;</span>
              <h3>{modalContent.title}</h3>
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th></th>
                      <th>Wheat</th>
                      <th>Rice</th>
                      <th>Maize</th>
                      <th>Bajra</th>
                      <th>Sugarcane</th>
                      <th>Groundnut</th>
                      <th>Rapeseed Mustard</th>
                      <th>Arhar/Tur</th>
                      <th>Sum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalContent.data.map((item: any, index: number) => (
                      <tr key={index}>
                        <td>{index === 0 ? "Total Biomass" : "Total Surplus"}</td>
                        <td>{item["Wheat"] || "N/A"}</td>
                        <td>{item["Rice"] || "N/A"}</td>
                        <td>{item["Maize"] || "N/A"}</td>
                        <td>{item["Bajra"] || "N/A"}</td>
                        <td>{item["Sugarcane"] || "N/A"}</td>
                        <td>{item["Groundnut"] || "N/A"}</td>
                        <td>{item["Rapeseed Mustard"] || "N/A"}</td>
                        <td>{item["Arhar/Tur"] || "N/A"}</td>
                        <td>{item["Total Crops"] || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ textAlign: 'center', fontStyle: 'italic', marginTop: '10px' }}>
                * unit = 1000 tonnes per annum
              </p>
            </div>
          )}
          
          {modalContent.type === 'allStatesBiomass' && (
            <div className="modal-content">
              <span className="close-modal" onClick={() => setModalContent(null)}>&times;</span>
              <h3>{modalContent.title}</h3>
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {[
                  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
                  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
                  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
                  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
                  "Uttar Pradesh", "Uttarakhand", "West Bengal"
                ].map((state) => (
                  <div key={state} className="state-biomass-button">
                    <span>{state}</span>
                    <button
                      className="view-details-btn"
                      onClick={async () => {
                        setModalContent(null)
                        try {
                          const data = await loadBiomassData(state)
                          setModalContent({
                            type: 'biomass',
                            title: `${state} - Biomass Details`,
                            data: data
                          })
                        } catch (error) {
                          alert('Error fetching biomass data')
                        }
                      }}
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {modalContent.type === 'odishaDistricts' && (
            <div className="modal-content">
              <span className="close-modal" onClick={() => setModalContent(null)}>&times;</span>
              <h3>{modalContent.title}</h3>
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {modalContent.data.map((item: any) => (
                  <div key={item.district} className="state-biomass-button">
                    <span>{item.district}</span>
                    <button
                      className="view-details-btn"
                      onClick={() => {
                        setModalContent(null)
                        const plantsInDistrict = (plantData["Odisha"] || []).filter(
                          (p: any) => (p["City/ District"] || "").toLowerCase() === item.district.toLowerCase()
                        )
                        handleDistrictClick(item.district, plantsInDistrict)
                      }}
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* District Details Modal */}
      {districtModalVisible && districtModalData && (
        <DistrictDetailsModal
          data={districtModalData}
          onClose={() => setDistrictModalVisible(false)}
        />
      )}
    </div>
  )
}