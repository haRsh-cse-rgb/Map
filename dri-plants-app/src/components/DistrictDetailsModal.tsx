'use client'

interface DistrictDetailsModalProps {
  data: {
    district: string
    plants: any[]
    biomass: any
  }
  onClose: () => void
}

export default function DistrictDetailsModal({ data, onClose }: DistrictDetailsModalProps) {
  const { district, plants, biomass } = data

  const sortedPlants = plants?.length
    ? [...plants].sort((a, b) =>
        (a["Sponge Iron Plant"] || "").localeCompare(b["Sponge Iron Plant"] || "")
      )
    : []

  const plantsTableHTML = sortedPlants.length > 0
    ? sortedPlants.map((plant, index) => {
        const details = Object.entries(plant)
          .filter(([key, value]) => value && value !== "N/A" && value !== "")
          .map(([key, value]) => (
            <tr key={key}>
              <td className="key-column"><strong>{key}</strong></td>
              <td className="value-column">{value as string}</td>
            </tr>
          ))
        
        return (
          <div key={index} className="plant-entry">
            <h4 className="plant-name">{plant["Sponge Iron Plant"] || "Plant"}</h4>
            <table className="plant-details-table">
              <tbody>{details}</tbody>
            </table>
          </div>
        )
      })
    : [<p key="no-plants">No plant data available for this district.</p>]

  const biomassContent = biomass && biomass.biomass ? (
    <div>
      <div className="biomass-section">
        <h4>Bioenergy Potential (GJ)</h4>
        <table className="biomass-table">
          <tbody>
            {Object.entries(biomass.biomass.bioenergy_potential).map(([key, value]) => (
              <tr key={key}>
                <td>{key.replace("_", " ").toUpperCase()}:</td>
                <td>{(value as number)?.toFixed(2) || "0.00"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="biomass-section">
        <h4>Gross Biomass (Kilo tonnes)</h4>
        <table className="biomass-table">
          <tbody>
            {Object.entries(biomass.biomass.gross_biomass).map(([key, value]) => (
              <tr key={key}>
                <td>{key.replace("_", " ").toUpperCase()}:</td>
                <td>{(value as number)?.toFixed(2) || "0.00"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="biomass-section">
        <h4>Surplus Biomass (Kilo tonnes)</h4>
        <table className="biomass-table">
          <tbody>
            {Object.entries(biomass.biomass.surplus_biomass).map(([key, value]) => (
              <tr key={key}>
                <td>{key.replace("_", " ").toUpperCase()}:</td>
                <td>{(value as number)?.toFixed(2) || "0.00"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ) : (
    <p>No biomass data available for this district.</p>
  )

  return (
    <div className="details-modal-container" style={{ display: 'flex' }}>
      <div className="side-modal">
        <div className="side-modal-header">
          <h3>Plants in {district}</h3>
        </div>
        <div className="side-modal-body">
          {plantsTableHTML}
        </div>
      </div>
      
      <div className="side-modal">
        <div className="side-modal-header">
          <h3>Biomass Data in {district}</h3>
        </div>
        <div className="side-modal-body">
          {biomassContent}
        </div>
      </div>
      
      <button className="close-details-btn" onClick={onClose}>
        &times;
      </button>
    </div>
  )
}