'use client'

import { useState } from 'react'
import AutocompleteInput from './AutocompleteInput'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  plantsVisible: boolean
  onPlantsToggle: (visible: boolean) => void
  biomassVisible: boolean
  onBiomassToggle: (visible: boolean) => void
  distanceInputsVisible: boolean
  onDistanceToggle: (visible: boolean) => void
  onTutorialOpen: () => void
  onShowAllStatesBiomass: () => void
  onShowOdishaDistricts: () => void
  districtBiomassDisabled: boolean
  allPlantNames: any[]
  selectedPlant1: string | null
  selectedPlant2: string | null
  onPlant1Select: (plant: string | null) => void
  onPlant2Select: (plant: string | null) => void
  onCalculateDistance: () => void
  distanceResult: string
}

export default function Sidebar({
  collapsed,
  onToggle,
  plantsVisible,
  onPlantsToggle,
  biomassVisible,
  onBiomassToggle,
  distanceInputsVisible,
  onDistanceToggle,
  onTutorialOpen,
  onShowAllStatesBiomass,
  onShowOdishaDistricts,
  districtBiomassDisabled,
  allPlantNames,
  selectedPlant1,
  selectedPlant2,
  onPlant1Select,
  onPlant2Select,
  onCalculateDistance,
  distanceResult
}: SidebarProps) {
  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h3>DRI Plants Map</h3>
        <button className="sidebar-toggle" onClick={onToggle}>
          <i className="material-icons">menu</i>
        </button>
      </div>

      <div className="sidebar-content">
        <div className="sidebar-section">
          <button className="sidebar-button help" onClick={onTutorialOpen}>
            <i className="material-icons">help_outline</i>
            <span>How to Use</span>
          </button>
        </div>

        <div className="sidebar-section">
          <h4><i className="material-icons">directions</i> Distance Calculator</h4>
          <button 
            className="sidebar-button"
            onClick={() => onDistanceToggle(!distanceInputsVisible)}
          >
            <i className="material-icons">calculate</i>
            <span>Find Distance Between Plants</span>
          </button>
          
          {distanceInputsVisible && (
            <div>
              <div className="distance-form">
                <AutocompleteInput
                  placeholder="Choose starting point..."
                  icon="fa-circle-o"
                  options={allPlantNames}
                  onSelect={(plant) => onPlant1Select(plant?.city || null)}
                />
                <AutocompleteInput
                  placeholder="Choose destination..."
                  icon="fa-map-marker"
                  options={allPlantNames}
                  onSelect={(plant) => onPlant2Select(plant?.city || null)}
                />
              </div>
              <button className="sidebar-button primary" onClick={onCalculateDistance}>
                <i className="material-icons">calculate</i>
                <span>Calculate Distance</span>
              </button>
              {distanceResult && (
                <div className="distance-result">{distanceResult}</div>
              )}
            </div>
          )}
        </div>

        <div className="sidebar-section">
          <h4><i className="material-icons">layers</i> Map Layers</h4>
          <div className="toggle-controls">
            <div className="toggle-item">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={plantsVisible}
                  onChange={(e) => onPlantsToggle(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
              <span className="toggle-label">
                <span className="legend-color red"></span>
                Sponge Iron Plants
              </span>
            </div>
            <div className="toggle-item">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={biomassVisible}
                  onChange={(e) => onBiomassToggle(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
              <span className="toggle-label">
                <span className="legend-color green"></span>
                Biomass Availability
              </span>
            </div>
          </div>
        </div>

        <div className="sidebar-section">
          <button className="sidebar-button" onClick={onShowAllStatesBiomass}>
            <i className="material-icons">grass</i>
            <span>Biomass Details of State</span>
          </button>
          <button 
            className={`sidebar-button ${districtBiomassDisabled ? 'disabled' : ''}`}
            onClick={onShowOdishaDistricts}
            disabled={districtBiomassDisabled}
          >
            <i className="material-icons">location_on</i>
            <span>Biomass Details of District</span>
          </button>
        </div>
      </div>
    </div>
  )
}