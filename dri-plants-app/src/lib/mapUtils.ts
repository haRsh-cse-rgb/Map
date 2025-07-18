import { loadGeoJSON } from './dataLoader'

declare global {
  interface Window {
    Highcharts: any;
  }
}

interface MapCallbacks {
  onStateClick?: (stateName: string) => void
  onBiomassClick?: (state: string) => void
  onDistrictClick?: (district: string, plants: any[]) => void
}

export async function createIndiaMap(
  plantData: any,
  container: HTMLElement,
  callbacks: MapCallbacks
) {
  const geoJson = await loadGeoJSON('/geojson/india.json')
  
  const plantPoints = Object.values(plantData)
    .flat()
    .map((plant: any) => ({
      name: plant["Sponge Iron Plant"] || "Unknown Plant",
      lon: parseFloat(plant["Longitude"]),
      lat: parseFloat(plant["Latitude"]),
      marker: {
        radius: 6,
        fillColor: "#FF0000",
        lineColor: "#fff",
        lineWidth: 2,
      },
    }))

  const statesWithBiomass = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Goa", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal",
  ]

  const biomassPoints = statesWithBiomass
    .map((state) => {
      const stateFeature = geoJson.features.find(
        (f: any) => f.properties.st_nm === state
      )
      if (stateFeature) {
        const coordinates = calculateStateCentroid(stateFeature)
        if (coordinates) {
          return {
            name: state,
            lon: coordinates[0] + 0.2,
            lat: coordinates[1] + 0.2,
            marker: {
              radius: 8,
              fillColor: "#00FF00",
              lineColor: "#fff",
              lineWidth: 2,
            },
          }
        }
      }
      return null
    })
    .filter((point) => point !== null)

  const chart = window.Highcharts.mapChart(container, {
    chart: {
      map: geoJson,
    },
    title: {
      text: "India Map With Plant and Biomass Locations",
    },
    subtitle: {
      text: '<i>Click on a state to explore its districts, plants, and biomass data.</i>',
      useHTML: true,
    },
    mapNavigation: {
      enabled: true,
    },
    tooltip: {
      formatter: function (this: any) {
        const state = this.point.name || this.point.properties?.st_nm

        if (this.point.series.name === "States with Biomass") {
          return `<b>${state}</b><br>Click to view biomass details`
        } else if (this.point.series.name === "States") {
          const plants = plantData[state] || []
          return `<b>${state}</b><br>Number of Plants: ${plants.length}`
        } else if (this.point.series.name === "Plant Locations") {
          return `<b>Plant:</b> ${this.point.name}`
        } else {
          return `<b>${state}</b>`
        }
      },
    },
    exporting: {
      buttons: {
        contextButton: {
          menuItems: [
            "viewFullscreen",
            "printChart",
            "separator"
          ],
        },
      },
    },
    plotOptions: {
      series: {
        cursor: 'pointer'
      }
    },
    series: [
      {
        name: "States",
        showInLegend: false,
        mapData: geoJson,
        joinBy: ["st_nm", "name"],
        data: geoJson.features.map((f: any) => ({
          name: f.properties.st_nm,
          value: 1,
          color: '#e0e0e0'
        })),
        borderColor: "#000",
        borderWidth: 1,
        states: {
          hover: {
            color: '#FFD700'
          }
        },
        dataLabels: {
          enabled: true,
          format: "{point.name}",
          style: {
            fontWeight: "bold"
          }
        },
        point: {
          events: {
            click: function (this: any) {
              const stateName = this.name
              if (callbacks.onStateClick) {
                callbacks.onStateClick(stateName)
              }
            }
          }
        }
      },
      {
        id: "plants-series",
        type: "mappoint",
        name: "Plant Locations",
        showInLegend: false,
        data: plantPoints,
        color: "#FF0000",
        visible: true,
        dataLabels: {
          enabled: false,
        },
      },
      {
        id: "biomass-series",
        type: "mappoint",
        name: "States with Biomass",
        showInLegend: false,
        data: biomassPoints,
        color: "#00FF00",
        visible: true,
        dataLabels: {
          enabled: false,
        },
        point: {
          events: {
            click: function (this: any) {
              const state = this.name
              if (callbacks.onBiomassClick) {
                callbacks.onBiomassClick(state)
              }
            },
          },
        },
      },
    ],
  })

  return chart
}

export async function createStateMap(
  stateData: any,
  plants: any[],
  stateName: string,
  container: HTMLElement,
  callbacks: MapCallbacks
) {
  const normalizeDistrictName = (name: string) => {
    if (!name) return ""
    const variations: { [key: string]: string } = {
      sundergarh: "sundargarh",
      sundergarha: "sundargarh",
      sondagarh: "sundargarh",
      sundargadh: "sundargarh",
    }

    const normalized = name.trim().toLowerCase()
    return variations[normalized] || normalized
  }

  const plantsByDistrict: { [key: string]: any[] } = {}
  plants.forEach((plant) => {
    const rawDistrict = plant["City/ District"] || "Unknown"
    const district = normalizeDistrictName(rawDistrict)
    if (!plantsByDistrict[district]) {
      plantsByDistrict[district] = []
    }
    plantsByDistrict[district].push(plant)
  })

  const districtsWithPlants = new Set(Object.keys(plantsByDistrict))

  const chart = window.Highcharts.mapChart(container, {
    chart: {
      map: stateData,
      events: {
        load: function (this: any) {
          this.mapZoom(1.5)
        },
      },
    },
    title: {
      text: `${stateName} Districts`,
    },
    subtitle: {
      text: `Total Plants: ${plants.length} | Districts with Plants: ${districtsWithPlants.size} 
             <br><i>Click on a District to see the availability of Biomass and Plants</i>`,
      useHTML: true,
    },
    mapNavigation: {
      enabled: true,
    },
    tooltip: {
      formatter: function (this: any) {
        const district = this.point.properties?.district?.trim() || this.point.name
        const seriesName = this.series.name

        if (seriesName === "Biomass Availability") {
          return `<b>${district}</b><br>Click here to view Biomass Availability`
        }

        if (seriesName === "Sponge Iron Plants") {
          return `<b>Plant:</b> ${this.point.name}`
        }

        return `<b>${district}</b>`
      },
    },
    plotOptions: {
      series: {
        cursor: 'pointer'
      }
    },
    series: [
      {
        name: "Districts",
        showInLegend: false,
        mapData: stateData,
        joinBy: ["district", "name"],
        data: stateData.features.map((f: any) => ({
          name: f.properties.district.trim(),
          color: '#e0e0e0'
        })),
        borderColor: "#999",
        borderWidth: 1,
        states: {
          hover: {
            color: "#FFD700"
          }
        },
        dataLabels: {
          enabled: true,
          format: "{point.name}"
        },
        point: {
          events: {
            click: function (this: any) {
              const district = normalizeDistrictName(this.name)
              if (callbacks.onDistrictClick) {
                callbacks.onDistrictClick(district, plantsByDistrict[district] || [])
              }
            }
          }
        }
      },
      {
        id: "plants-series",
        name: "Sponge Iron Plants",
        showInLegend: false,
        type: "mappoint",
        color: "#FF0000",
        data: plants.map((plant) => ({
          name: plant["Sponge Iron Plant"] || "Unknown Plant",
          lon: parseFloat(plant["Longitude"]),
          lat: parseFloat(plant["Latitude"]),
          marker: {
            radius: 6,
            symbol: "circle",
            fillColor: "#FF0000",
            lineColor: "#fff",
            lineWidth: 2,
          },
        })),
        dataLabels: {
          enabled: false,
        },
      },
      {
        id: "biomass-series",
        name: "Biomass Availability",
        showInLegend: false,
        type: "mappoint",
        color: "#00FF00",
        visible: stateName === "Odisha",
        data: stateData.features
          .map((feature: any) => {
            const district = normalizeDistrictName(feature.properties.district)
            const centroid = calculateDistrictCentroid(feature)
            if (!centroid) return null
            const offsetCentroid = getOffsetCentroid(centroid, false, district, stateName)
            return {
              name: district,
              lon: offsetCentroid[0],
              lat: offsetCentroid[1],
              district: district,
              marker: {
                radius: 6,
                symbol: "circle",
                fillColor: "#00FF00",
                lineColor: "#fff",
                lineWidth: 2,
              },
            }
          })
          .filter((point: any) => point !== null),
        dataLabels: {
          enabled: false,
        },
        point: {
          events: {
            click: function (this: any) {
              const district = normalizeDistrictName(this.district)
              if (callbacks.onDistrictClick) {
                callbacks.onDistrictClick(district, plantsByDistrict[district] || [])
              }
            },
          },
        },
      },
    ],
  })

  return chart
}

function calculateStateCentroid(stateFeature: any) {
  if (stateFeature.geometry.type === "Polygon") {
    const coordinates = stateFeature.geometry.coordinates[0]
    const len = coordinates.length
    const sumLon = coordinates.reduce((sum: number, coord: number[]) => sum + coord[0], 0)
    const sumLat = coordinates.reduce((sum: number, coord: number[]) => sum + coord[1], 0)
    return [sumLon / len, sumLat / len]
  } else if (stateFeature.geometry.type === "MultiPolygon") {
    const polygons = stateFeature.geometry.coordinates
    const allCoords = polygons.flat(2)
    const len = allCoords.length
    const sumLon = allCoords.reduce((sum: number, coord: number[]) => sum + coord[0], 0)
    const sumLat = allCoords.reduce((sum: number, coord: number[]) => sum + coord[1], 0)
    return [sumLon / len, sumLat / len]
  }
  return null
}

function calculateDistrictCentroid(districtFeature: any) {
  if (districtFeature.geometry.type === "Polygon") {
    const coordinates = districtFeature.geometry.coordinates[0]
    const len = coordinates.length
    const sumLon = coordinates.reduce((sum: number, coord: number[]) => sum + coord[0], 0)
    const sumLat = coordinates.reduce((sum: number, coord: number[]) => sum + coord[1], 0)
    return [sumLon / len, sumLat / len]
  } else if (districtFeature.geometry.type === "MultiPolygon") {
    const polygons = districtFeature.geometry.coordinates
    const allCoords = polygons.flat(2)
    const len = allCoords.length
    const sumLon = allCoords.reduce((sum: number, coord: number[]) => sum + coord[0], 0)
    const sumLat = allCoords.reduce((sum: number, coord: number[]) => sum + coord[1], 0)
    return [sumLon / len, sumLat / len]
  }
  return null
}

function getOffsetCentroid(centroid: number[], isPlant: boolean, district: string, stateName: string) {
  if (stateName === "Odisha") {
    const horizontalOffset = isPlant ? 0.05 : -0.05
    const verticalOffset = isPlant ? 0.02 : -0.02
    return [centroid[0] + horizontalOffset, centroid[1] + verticalOffset]
  }
  return centroid
}