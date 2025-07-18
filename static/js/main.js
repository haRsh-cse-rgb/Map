document.addEventListener("DOMContentLoaded", () => {
  let currentView = "india";
  let plantData = {};
  let currentChart = null;

  // --- NEW: Variables for Distance Calculator ---
  let allPlantNames = [];
  let selectedPlant1 = null;
  let selectedPlant2 = null;
  // --- END NEW ---

  // --- Sidebar and Layer Toggles ---
  const sidebarToggle = document.getElementById("sidebar-toggle");
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("main-content");
  const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
  const showSidebarBtn = document.getElementById("show-sidebar-btn");
  const biomassDetailsBtn = document.getElementById("biomass-details-btn");
  const districtBiomassBtn = document.getElementById("district-biomass-btn"); // Get the button

  // --- NEW: Side-by-Side Modal Elements ---
  const detailsModalContainer = document.getElementById("details-modal-container");
  const plantDetailsModal = document.getElementById("plant-details-modal");
  const biomassDetailsModal = document.getElementById("biomass-details-modal");
  const closeDetailsModalsBtn = document.getElementById("close-details-modals");

  closeDetailsModalsBtn.addEventListener('click', () => {
      detailsModalContainer.style.display = 'none';
  });
  // Close modals if backdrop is clicked
  detailsModalContainer.addEventListener('click', (e) => {
      if (e.target === detailsModalContainer) {
          detailsModalContainer.style.display = 'none';
      }
  });
  // --- END NEW ---


  biomassDetailsBtn.addEventListener("click", () => {
    showAllStatesBiomassData();
  });

  // --- NEW: Event listener for the district biomass button ---
  districtBiomassBtn.addEventListener("click", () => {
    // Only works if the button is not disabled (i.e., when viewing Odisha)
    if (!districtBiomassBtn.disabled) {
        showOdishaDistrictBiomassList();
    }
  });
  // --- END NEW ---

  sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    mainContent.classList.toggle("full-width");
    
    if (sidebar.classList.contains("collapsed")) {
        showSidebarBtn.style.display = 'flex';
    } else {
        showSidebarBtn.style.display = 'none';
    }

    // Reflow chart after transition
    setTimeout(() => {
        if (currentChart) {
            currentChart.reflow();
        }
    }, 300);
  });

  showSidebarBtn.addEventListener("click", () => {
    sidebar.classList.remove("collapsed");
    mainContent.classList.remove("full-width");
    showSidebarBtn.style.display = 'none'; // Hide itself

    // Reflow chart after transition
    setTimeout(() => {
        if (currentChart) {
            currentChart.reflow();
        }
    }, 300);
  });


  // Also handle mobile menu toggle
  mobileMenuToggle.addEventListener("click", () => {
    sidebar.classList.toggle('open');
    sidebar.classList.remove('collapsed');
  });

  const plantToggle = document.getElementById("plants-toggle");
  const biomassToggle = document.getElementById("biomass-toggle");

  plantToggle.addEventListener("change", () => {
    const plantsSeries = currentChart?.get("plants-series");
    if (plantsSeries) {
      plantsSeries.setVisible(plantToggle.checked);
    }
  });

  biomassToggle.addEventListener("change", () => {
    const biomassSeries = currentChart?.get("biomass-series");
    if (biomassSeries) {
      biomassSeries.setVisible(biomassToggle.checked);
    }
  });
  // --- End of Sidebar Logic ---


  const states = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
  ];

  // This stateListContainer will be hidden and only used when triggered from the context menu
  const stateListContainer = document.getElementById("state-list-container");
  stateListContainer.style.maxHeight = "400px";
  stateListContainer.style.overflowY = "scroll";
  stateListContainer.style.border = "1px solid #ccc";
  stateListContainer.style.padding = "10px";
  stateListContainer.style.margin = "20px auto";
  stateListContainer.style.width = "300px";
  stateListContainer.style.backgroundColor = "#f9f9f9";
  stateListContainer.style.display = "none"; // Initially hidden

  const stateButtons = [];
  states.forEach((state) => {
    const stateButton = document.createElement("div");
    stateButton.className = "state-button";
    stateButton.innerHTML = `
            <span>${state}</span>
            <button class="view-details-btn">View Details</button>
        `;

    const viewDetailsBtn = stateButton.querySelector(".view-details-btn");
    viewDetailsBtn.onclick = () => {
      fetch(`/api/biomass?state=${encodeURIComponent(state)}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            alert(data.error);
          } else {
            showStateDetails(state, data);
          }
        })
        .catch((error) => console.error("Error fetching biomass data:", error));
    };
    stateButtons.push(stateButton);
    stateListContainer.appendChild(stateButton);
  });

  // --- Event Listeners and Functions for Distance Calculator ---
  const distanceBtn = document.getElementById("distance-btn");
  const distanceInputs = document.getElementById("distance-inputs");
  // UPDATED IDs
  const plant1Input = document.getElementById("start-input");
  const plant2Input = document.getElementById("end-input");
  const plant1Options = document.getElementById("plant1-options");
  const plant2Options = document.getElementById("plant2-options");
  const calculateDistanceBtn = document.getElementById("calculate-distance-btn");
  const distanceResult = document.getElementById("distance-result");
  const tutorialBtn = document.getElementById("tutorial-btn");
  const tutorialModal = document.getElementById("tutorial-modal");
  const closeTutorial = document.querySelector(".close-tutorial");

  distanceBtn.addEventListener("click", () => {
    distanceInputs.style.display = distanceInputs.style.display === "none" ? "block" : "none";
  });

  tutorialBtn.addEventListener("click", () => {
    tutorialModal.style.display = "block";
  });

  closeTutorial.addEventListener("click", () => {
    tutorialModal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === tutorialModal) {
      tutorialModal.style.display = "none";
    }
  });

  calculateDistanceBtn.addEventListener("click", () => {
    if (selectedPlant1 && selectedPlant2) {
      distanceResult.textContent = "Calculating...";
      fetch(`/api/distance?origin=${selectedPlant1}&destination=${selectedPlant2}`)
        .then(response => response.json())
        .then(data => {
          distanceResult.textContent = data.distance ? `Distance: ${data.distance}` : (data.error || "Could not calculate distance.");
        })
        .catch(error => {
            console.error("Error fetching distance:", error);
            distanceResult.textContent = "Error fetching distance.";
        });
    } else {
      distanceResult.textContent = "Please select two plants from the list.";
    }
  });

  function populatePlantDataForAutocomplete(data) {
    allPlantNames = Object.values(data)
      .flat()
      .filter(plant => plant["Sponge Iron Plant"] && plant["City/ District"])
      .map((plant) => ({ name: plant["Sponge Iron Plant"], city: plant["City/ District"] }));
    allPlantNames.sort((a, b) => a.name.localeCompare(b.name));

    autocomplete(plant1Input, plant1Options, allPlantNames, (plant) => {
      selectedPlant1 = plant.city;
    });
    autocomplete(plant2Input, plant2Options, allPlantNames, (plant) => {
      selectedPlant2 = plant.city;
    });
  }

  function autocomplete(inputElement, optionsContainer, plantList, onSelect) {
    inputElement.addEventListener("input", function() {
      const value = this.value.toLowerCase();
      optionsContainer.innerHTML = "";
      if (!value) {
        optionsContainer.style.display = "none";
        return;
      }
      const filteredPlants = plantList.filter(plant => plant.name.toLowerCase().includes(value));
      filteredPlants.slice(0, 10).forEach(plant => {
        const li = document.createElement("li");
        li.textContent = plant.name;
        li.addEventListener("click", function() {
          inputElement.value = plant.name;
          onSelect(plant);
          optionsContainer.style.display = "none";
        });
        optionsContainer.appendChild(li);
      });
      optionsContainer.style.display = filteredPlants.length > 0 ? "block" : "none";
    });

    document.addEventListener("click", function(event) {
      if (event.target !== inputElement && !optionsContainer.contains(event.target)) {
        optionsContainer.style.display = "none";
      }
    });
  }
  
  function showStateDetails(state, data) {
    const modal = document.getElementById("biomass-modal") || createModal();

    const tableRows = data
      .map(
        (item, index) => `
    <tr>
        <td>${index === 0 ? "Total Biomass" : "Total Surplus"}</td>
        <td>${item["Wheat"] || "N/A"}</td>
        <td>${item["Rice"] || "N/A"}</td>
        <td>${item["Maize"] || "N/A"}</td>
        <td>${item["Bajra"] || "N/A"}</td>
        <td>${item["Sugarcane"] || "N/A"}</td>
        <td>${item["Groundnut"] || "N/A"}</td>
        <td>${item["Rapeseed Mustard"] || "N/A"}</td>
        <td>${item["Arhar/Tur"] || "N/A"}</td>
        <td>${item["Total Crops"] || "N/A"}</td>
    </tr>
`
      )
      .join("");

    const content = `
    <div class="modal-content">
        <span class="close-modal">&times;</span>
        <h3>${state} - Biomass Details</h3>
        <div style="overflow-x: auto;">
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
                    ${tableRows}
                </tbody>
            </table>
        </div>
         <p style="text-align: center; font-style: italic; margin-top: 10px;">* unit = 1000 tonnes per annum</p>
    </div>
`;

    modal.innerHTML = content;
    modal.id = "biomass-modal";
    modal.style.display = "block";

    modal.querySelector('.close-modal').onclick = () => {
        modal.style.display = 'none';
    };
  }

  function showAllStatesBiomassData() {
    const modal = document.createElement("div");
    modal.id = "biomass-states-modal";
    modal.className = "modal";
    modal.style.display = "block";
    modal.style.zIndex = "9999999";

    const modalContent = document.createElement("div");
    modalContent.className = "modal-content";
    modalContent.style.maxWidth = "600px";
    modalContent.style.padding = "20px";
    modalContent.style.margin = "50px auto";
    modalContent.style.backgroundColor = "#fff";
    modalContent.style.borderRadius = "8px";
    modalContent.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";

    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.justifyContent = "space-between";
    header.style.alignItems = "center";
    header.style.marginBottom = "20px";

    const title = document.createElement("h3");
    title.textContent = "Biomass Details by State";
    title.style.margin = "0";

    const closeBtn = document.createElement("span");
    closeBtn.innerHTML = "&times;";
    closeBtn.style.fontSize = "24px";
    closeBtn.style.cursor = "pointer";
    closeBtn.style.fontWeight = "bold";
    closeBtn.onclick = () => (modal.style.display = "none");

    header.appendChild(title);
    header.appendChild(closeBtn);
    modalContent.appendChild(header);

    const stateList = document.createElement("div");
    stateList.style.maxHeight = "500px";
    stateList.style.overflowY = "auto";

    states.forEach((state) => {
      const stateButton = document.createElement("div");
      stateButton.className = "state-biomass-button";
      stateButton.style.display = "flex";
      stateButton.style.justifyContent = "space-between";
      stateButton.style.alignItems = "center";
      stateButton.style.padding = "10px";
      stateButton.style.margin = "5px 0";
      stateButton.style.borderBottom = "1px solid #eee";

      const stateName = document.createElement("span");
      stateName.textContent = state;

      const viewBtn = document.createElement("button");
      viewBtn.textContent = "View Details";
      viewBtn.style.padding = "5px 10px";
      viewBtn.style.backgroundColor = "#4CAF50";
      viewBtn.style.color = "white";
      viewBtn.style.border = "none";
      viewBtn.style.borderRadius = "4px";
      viewBtn.style.cursor = "pointer";

      viewBtn.onclick = () => {
        modal.style.display = "none";

        fetch(`/api/biomass?state=${encodeURIComponent(state)}`)
          .then((response) => response.json())
          .then((data) => {
            if (data.error) {
              alert(data.error);
            } else {
              showStateDetails(state, data);
            }
          })
          .catch((error) =>
            console.error("Error fetching biomass data:", error)
          );
      };

      stateButton.appendChild(stateName);
      stateButton.appendChild(viewBtn);
      stateList.appendChild(stateButton);
    });

    modalContent.appendChild(stateList);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    modal.onclick = (event) => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    };
  }
  
  // --- NEW: Function to show list of Odisha districts with biomass data ---
  function showOdishaDistrictBiomassList() {
    fetch('/api/biomass/odisha')
        .then(response => {
            if (!response.ok) throw new Error('Could not fetch Odisha biomass data.');
            return response.json();
        })
        .then(data => {
            if (data.error) {
                alert(data.error);
                return;
            }

            const modal = document.createElement("div");
            modal.id = "district-biomass-list-modal";
            modal.className = "modal";
            modal.style.display = "block";
            modal.style.zIndex = "1000000";

            const modalContent = document.createElement("div");
            modalContent.className = "modal-content";
            modalContent.style.maxWidth = "600px";
            modalContent.style.padding = "20px";
            modalContent.style.margin = "50px auto";
            modalContent.style.backgroundColor = "#fff";
            modalContent.style.borderRadius = "8px";
            modalContent.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";

            const header = document.createElement("div");
            header.style.display = "flex";
            header.style.justifyContent = "space-between";
            header.style.alignItems = "center";
            header.style.marginBottom = "20px";

            const title = document.createElement("h3");
            title.textContent = "Biomass Details by District (Odisha)";
            title.style.margin = "0";

            const closeBtn = document.createElement("span");
            closeBtn.innerHTML = "&times;";
            closeBtn.style.fontSize = "24px";
            closeBtn.style.cursor = "pointer";
            closeBtn.style.fontWeight = "bold";
            closeBtn.onclick = () => modal.remove();

            header.appendChild(title);
            header.appendChild(closeBtn);
            modalContent.appendChild(header);

            const districtList = document.createElement("div");
            districtList.style.maxHeight = "500px";
            districtList.style.overflowY = "auto";

            data.forEach(item => {
                const district = item.district;
                const districtButton = document.createElement("div");
                districtButton.className = "state-biomass-button";
                districtButton.style.display = "flex";
                districtButton.style.justifyContent = "space-between";
                districtButton.style.alignItems = "center";
                districtButton.style.padding = "10px";
                districtButton.style.margin = "5px 0";
                districtButton.style.borderBottom = "1px solid #eee";

                const districtName = document.createElement("span");
                districtName.textContent = district;

                const viewBtn = document.createElement("button");
                viewBtn.textContent = "View Details";
                viewBtn.style.padding = "5px 10px";
                viewBtn.style.backgroundColor = "#4CAF50";
                viewBtn.style.color = "white";
                viewBtn.style.border = "none";
                viewBtn.style.borderRadius = "4px";
                viewBtn.style.cursor = "pointer";

                viewBtn.onclick = () => {
                    modal.remove(); 
                    const plantsInDistrict = (plantData["Odisha"] || []).filter(p => (p["City/ District"] || "").toLowerCase() === district.toLowerCase());
                    showDistrictDetails(district, plantsInDistrict);
                };

                districtButton.appendChild(districtName);
                districtButton.appendChild(viewBtn);
                districtList.appendChild(districtButton);
            });

            modalContent.appendChild(districtList);
            modal.appendChild(modalContent);
            document.body.appendChild(modal);

            modal.onclick = (event) => {
                if (event.target === modal) {
                    modal.remove();
                }
            };
        })
        .catch(error => {
            console.error("Error fetching Odisha districts for list:", error);
            alert("Could not load district list. Please try again.");
        });
  }
  // --- END NEW ---

  function toggleBiomassContainer(show) {
    const stateListContainer = document.getElementById("state-list-container");
    if (stateListContainer) {
      stateListContainer.style.display = "none";
    }
  }

  function loadOdishaBiomass() {
    fetch("/api/biomass/odisha")
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          console.error("Error fetching Odisha biomass data:", data.error);
        } else {
          displayOdishaBiomass(data);
        }
      })
      .catch((error) =>
        console.error("Error fetching Odisha biomass data:", error)
      );
  }

  function displayOdishaBiomass(data) {
    const odishaDistricts = document.querySelectorAll("[data-state='Odisha']");

    odishaDistricts.forEach((district) => {
      const districtName = district.getAttribute("data-district");
      const biomassData = data.find((d) => d.District.trim() === districtName);

      if (biomassData) {
        district.innerHTML += `
        <div class="biomass-column">
          <h4>Biomass Details</h4>
          <p>Rice: ${biomassData.Rice || "N/A"}</p>
          <p>Wheat: ${biomassData.Wheat || "N/A"}</p>
          <p>Total Biomass: ${biomassData.Total || "N/A"}</p>
        </div>
      `;
      }
    });
  }

  function highlightOdishaDistricts() {
    const odishaDistricts = document.querySelectorAll("[data-state='Odisha']");
    odishaDistricts.forEach((district) => {
      district.addEventListener("mouseover", () => {
        loadOdishaBiomass();
      });
    });
  }

  fetch("/api/plants")
    .then((response) => response.json())
    .then((data) => {
      plantData = data;
      populatePlantDataForAutocomplete(data); // Integration point
      console.log("Loaded plant data:", plantData);
      loadIndiaMap();
      highlightStatesWithPlants(); 
      highlightOdishaDistricts();
    })
    .catch((error) => console.error("Error loading plant data:", error));

  function highlightDistrictsWithPlants() {
    if (currentChart && plantData) {
      const series = currentChart.series[0];
      if (series) {
        series.data.forEach((point) => {
          const state = point.properties?.st_nm;
          const plants = plantData[state] || [];
          console.log(`Highlighting state: ${state}, Plants: ${plants.length}`);
          if (plants.length > 0) {
            point.update({ color: "#00FF00" }, true);
          } else {
            point.update({ color: "#EEEEEE" }, true);
          }
        });
      }
    }
  }

  const plantsRadioButton = document.getElementById("plants-radio");
  if (plantsRadioButton) {
    plantsRadioButton.addEventListener("change", () => {
      if (plantsRadioButton.checked) {
        highlightDistrictsWithPlants();
      }
    });
  }

  function loadIndiaMap() {
    const bioMassDetailsHeader = document.getElementById("bioMassDetails");
    if (bioMassDetailsHeader) {
      bioMassDetailsHeader.style.display = "none"; 
    }
    toggleBiomassContainer(false); 

    // --- MODIFICATION: Disable district button on India map ---
    districtBiomassBtn.disabled = true;
    // --- END MODIFICATION ---

    fetch("/static/geojson/india.json")
      .then((response) => response.json())
      .then((data) => {
        createMap(data);
      })
      .catch((error) => console.error("Error loading India map:", error));
  }

  highlightStatesWithPlants();

  function calculateStateCentroid(stateFeature) {
    if (stateFeature.geometry.type === "Polygon") {
      const coordinates = stateFeature.geometry.coordinates[0];
      const len = coordinates.length;
      const sumLon = coordinates.reduce((sum, coord) => sum + coord[0], 0);
      const sumLat = coordinates.reduce((sum, coord) => sum + coord[1], 0);
      return [sumLon / len, sumLat / len];
    } else if (stateFeature.geometry.type === "MultiPolygon") {
      const polygons = stateFeature.geometry.coordinates;
      const allCoords = polygons.flat(2); 
      const len = allCoords.length;
      const sumLon = allCoords.reduce((sum, coord) => sum + coord[0], 0);
      const sumLat = allCoords.reduce((sum, coord) => sum + coord[1], 0);
      return [sumLon / len, sumLat / len];
    }
    return null;
  }

  function updateDataGlanceBox(totalPlants, totalBiomassStates) {
      const container = document.getElementById('data-glance-overlay');
      if (container) {
          container.innerHTML = `
            <h4><i class="material-icons">bar_chart</i>Data at a Glance</h4>
            <div class="legend-item">
                <div class="legend-color red"></div>
                <span><b>${totalPlants}</b> Sponge Iron Plants</span>
            </div>
            <div class="legend-item">
                <div class="legend-color green"></div>
                <span><b>${totalBiomassStates}</b> States with Biomass</span>
            </div>
          `;
      }
  }

  function createMap(geoJson) {
    if (currentChart) {
      currentChart.destroy();
    }

    // --- MODIFICATION: Show the Data at a Glance box on India view ---
    const dataGlanceBox = document.getElementById('data-glance-overlay');
    if (dataGlanceBox) {
        dataGlanceBox.style.display = 'block';
    }
    // --- END MODIFICATION ---

    const plantPoints = Object.values(plantData)
      .flat()
      .map((plant) => {
        return {
          name: plant["Sponge Iron Plant"] || "Unknown Plant",
          lon: parseFloat(plant["Longitude"]),
          lat: parseFloat(plant["Latitude"]),
          marker: {
            radius: 6,
            fillColor: "#FF0000",
            lineColor: "#fff",
            lineWidth: 2,
          },
        };
      });

    const statesWithBiomass = [
      "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Gujarat",
      "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
      "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
      "Rajasthan", "Sikkim", "Goa", "Tamil Nadu", "Telangana", "Tripura",
      "Uttar Pradesh", "Uttarakhand", "West Bengal",
    ];

    const biomassPoints = statesWithBiomass
      .map((state) => {
        const stateFeature = geoJson.features.find(
          (f) => f.properties.st_nm === state
        );
        if (stateFeature) {
          const coordinates = calculateStateCentroid(stateFeature);
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
            };
          }
        }
        return null;
      })
      .filter((point) => point !== null);
    
    // Calculate totals and update the new "Data at a Glance" box
    const totalPlants = plantPoints.length;
    const totalBiomassStates = biomassPoints.length;
    updateDataGlanceBox(totalPlants, totalBiomassStates);
    
    currentChart = Highcharts.mapChart("map-container", {
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
        formatter: function () {
          const state = this.point.name || this.point.properties?.st_nm;

          if (this.point.series.name === "States with Biomass") {
            return `<b>${state}</b><br>Click to view biomass details`;
          } else if (this.point.series.name === "States") {
            const plants = plantData[state] || [];
            return `<b>${state}</b><br>Number of Plants: ${plants.length}`;
          } else if (this.point.series.name === "Plant Locations") {
            return `<b>Plant:</b> ${this.point.name}`;
          } else {
            return `<b>${state}</b>`;
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
          data: geoJson.features.map(f => ({
            name: f.properties.st_nm,
            value: 1,
            color: '#e0e0e0' // dummy value
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
              click: function () {
                const stateName = this.name;
                const plants = plantData[stateName];

                if (!stateName) return;

                if (!plants || plants.length === 0) {
                  alert("No plant data available for " + stateName);
                  return;
                }

                const stateFile = stateName.toLowerCase().replace(/\s+/g, "");
                fetch(`/static/geojson/states/${stateFile}.json`)
                  .then(response => response.json())
                  .then(stateData => {
                    currentView = stateName;
                    createStateMap(stateData, plants, stateName);
                    createBackButton();
                  })
                  .catch(error => {
                    console.error("Error loading state data:", error);
                    alert("Error loading map for " + stateName);
                  });
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
              click: function () {
                const state = this.name;
                fetch(`/api/biomass?state=${encodeURIComponent(state)}`)
                  .then((response) => response.json())
                  .then((data) => {
                    if (data.error) {
                      alert(data.error);
                    } else {
                      showStateDetails(state, data);
                    }
                  })
                  .catch((error) =>
                    console.error("Error fetching biomass data:", error)
                  );
              },
            },
          },
        },
      ],
    });

    return currentChart;
  }

  function toggleBiomassView() {
    if (currentChart) {
      const plantsSeries = currentChart.get("plants-series");
      const biomassSeries = currentChart.get("biomass-series");

      if (biomassSeries.visible) {
        plantsSeries.setVisible(true);
        biomassSeries.setVisible(false);
      } else {
        plantsSeries.setVisible(false);
        biomassSeries.setVisible(true);
      }
    }
  }

  function highlightStatesWithPlants() {
    if (currentChart) {
      const plantsSeries = currentChart.get("plants-series");
      plantsSeries.setVisible(!plantsSeries.visible);
    }
  }

  function createStateMap(stateData, plants, stateName) {
    // --- MODIFICATION: Hide the Data at a Glance box on state view ---
    const dataGlanceBox = document.getElementById('data-glance-overlay');
    if (dataGlanceBox) {
        dataGlanceBox.style.display = 'none';
    }
    // --- END MODIFICATION ---

    const bioMassDetailsHeader = document.getElementById("bioMassDetails");
    if (bioMassDetailsHeader) {
      bioMassDetailsHeader.style.display = "none";
    }

    if (currentChart) {
      currentChart.destroy();
    }
    const plantPoints = plants.map((plant) => {
      return {
        name: plant["Sponge Iron Plant"] || "Unknown Plant",
        lon: parseFloat(plant["Longitude"]),
        lat: parseFloat(plant["Latitude"]),
        marker: {
          radius: 6,
          fillColor: "#FF0000",
          lineColor: "#fff",
          lineWidth: 2,
        },
      };
    });

    toggleBiomassContainer(false);
    
    // --- MODIFICATION: Enable/disable district button based on state ---
    if (stateName === "Odisha") {
        districtBiomassBtn.disabled = false;
    } else {
        districtBiomassBtn.disabled = true;
    }
    // --- END MODIFICATION ---

    const normalizeDistrictName = (name) => {
      if (!name) return "";
      const variations = {
        sundergarh: "sundargarh",
        sundergarha: "sundargarh",
        sondagarh: "sundargarh",
        sundargadh: "sundargarh",
      };

      const normalized = name.trim().toLowerCase();
      return variations[normalized] || normalized;
    };

    const plantsByDistrict = {};
    plants.forEach((plant) => {
      const rawDistrict = plant["City/ District"] || "Unknown";
      const district = normalizeDistrictName(rawDistrict);
      if (!plantsByDistrict[district]) {
        plantsByDistrict[district] = [];
      }
      plantsByDistrict[district].push(plant);
    });

    function calculateDistrictCentroid(districtFeature) {
      const district = normalizeDistrictName(
        districtFeature.properties.district
      );

      if (district.includes("sundargarh")) {
        console.log("Processing Sundargarh district feature:", districtFeature);
      }

      if (districtFeature.geometry.type === "Polygon") {
        const coordinates = districtFeature.geometry.coordinates[0];
        const len = coordinates.length;
        const sumLon = coordinates.reduce((sum, coord) => sum + coord[0], 0);
        const sumLat = coordinates.reduce((sum, coord) => sum + coord[1], 0);
        return [sumLon / len, sumLat / len];
      } else if (districtFeature.geometry.type === "MultiPolygon") {
        const polygons = districtFeature.geometry.coordinates;
        const allCoords = polygons.flat(2);
        const len = allCoords.length;
        const sumLon = allCoords.reduce((sum, coord) => sum + coord[0], 0);
        const sumLat = allCoords.reduce((sum, coord) => sum + coord[1], 0);
        return [sumLon / len, sumLat / len];
      }
      return null;
    }

    const districtsWithPlants = new Set(Object.keys(plantsByDistrict));

    const getOffsetCentroid = (centroid, isPlant, district) => {
      if (stateName === "Odisha") {
        const horizontalOffset = isPlant ? 0.05 : -0.05;
        const verticalOffset = isPlant ? 0.02 : -0.02;

        if (normalizeDistrictName(district).includes("sundargarh")) {
          console.log("Applying offset for Sundargarh:", district, centroid);
        }

        return [centroid[0] + horizontalOffset, centroid[1] + verticalOffset];
      }
      return centroid;
    };

    currentChart = Highcharts.mapChart("map-container", {
      chart: {
        map: stateData,
        events: {
          load: function () {
            this.mapZoom(1.5);
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
        formatter: function () {
          const district =
            this.point.properties?.district?.trim() || this.point.name;
          const seriesName = this.series.name;

          if (seriesName === "Biomass Availability") {
            return `<b>${district}</b><br>Click here to view Biomass Availability`;
          }

          if (seriesName === "Sponge Iron Plants") {
            return `<b>Plant:</b> ${this.point.name}`;
          }

          return `<b>${district}</b>`;
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
          data: stateData.features.map(f => ({
            name: f.properties.district.trim(),
            color: '#e0e0e0' // Set neutral grey color for districts
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
              click: function () {
                const district = normalizeDistrictName(this.name);
                showDistrictDetails(district, plantsByDistrict[district] || []);
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
          data: plants.map((plant) => {
            return {
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
            };
          }),
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
            .map((feature) => {
              const district = normalizeDistrictName(
                feature.properties.district
              );
              const centroid = calculateDistrictCentroid(feature);
              if (!centroid) return null;
              const offsetCentroid = getOffsetCentroid(
                centroid,
                false,
                district
              );
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
              };
            })
            .filter((point) => point !== null),
          dataLabels: {
            enabled: false,
          },
          point: {
            events: {
              click: function () {
                const district = normalizeDistrictName(this.district);
                showDistrictDetails(district, plantsByDistrict[district] || []);
              },
            },
          },
        },
      ],
    });
  }
  
  // --- REWRITTEN FUNCTION for Side-by-Side Modals ---
  function showDistrictDetails(district, plants) {
    // Clear previous content
    plantDetailsModal.innerHTML = '';
    biomassDetailsModal.innerHTML = '';

    // --- 1. Populate Plant Data Modal ---
    const sortedPlants = plants?.length
      ? [...plants].sort((a, b) =>
          (a["Sponge Iron Plant"] || "").localeCompare(b["Sponge Iron Plant"] || "")
        )
      : [];

    const plantsTableHTML = sortedPlants.length > 0
        ? sortedPlants.map((plant) => {
            const details = Object.entries(plant)
              .filter(([key, value]) => value && value !== "N/A" && value !== "")
              .map(([key, value]) => `
                <tr>
                    <td class="key-column"><strong>${key}</strong></td>
                    <td class="value-column">${value}</td>
                </tr>`
              ).join("");
            return `
            <div class="plant-entry">
                <h4 class="plant-name">${plant["Sponge Iron Plant"] || "Plant"}</h4>
                <table class="plant-details-table">
                    ${details}
                </table>
            </div>`;
          }).join("")
        : "<p>No plant data available for this district.</p>";
    
    plantDetailsModal.innerHTML = `
        <div class="side-modal-header"><h3>Plants in ${district}</h3></div>
        <div class="side-modal-body">${plantsTableHTML}</div>
    `;

    // --- 2. Populate Biomass Data Modal (with loader) ---
    biomassDetailsModal.innerHTML = `
        <div class="side-modal-header"><h3>Biomass Data in ${district}</h3></div>
        <div class="side-modal-body"><p>Loading biomass data...</p></div>
    `;

    // --- 3. Fetch and fill biomass data ---
    if (currentView === "Odisha") {
        fetch(`/api/odisha/districts/${district.toLowerCase()}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Biomass data not found for this district.');
                }
                return response.json();
            })
            .then(biomassData => {
                const biomassContent = (biomassData && biomassData.biomass)
                    ? `
                    <div class="biomass-section">
                        <h4>Bioenergy Potential (GJ)</h4>
                        <table class="biomass-table">
                            ${Object.entries(biomassData.biomass.bioenergy_potential).map(([key, value]) => `
                                <tr><td>${key.replace("_", " ").toUpperCase()}:</td><td>${value?.toFixed(2) || "0.00"}</td></tr>`
                            ).join("")}
                        </table>
                    </div>
                    <div class="biomass-section">
                        <h4>Gross Biomass (Kilo tonnes)</h4>
                        <table class="biomass-table">
                            ${Object.entries(biomassData.biomass.gross_biomass).map(([key, value]) => `
                                <tr><td>${key.replace("_", " ").toUpperCase()}:</td><td>${value?.toFixed(2) || "0.00"}</td></tr>`
                            ).join("")}
                        </table>
                    </div>
                    <div class="biomass-section">
                        <h4>Surplus Biomass (Kilo tonnes)</h4>
                        <table class="biomass-table">
                            ${Object.entries(biomassData.biomass.surplus_biomass).map(([key, value]) => `
                                <tr><td>${key.replace("_", " ").toUpperCase()}:</td><td>${value?.toFixed(2) || "0.00"}</td></tr>`
                            ).join("")}
                        </table>
                    </div>
                    `
                    : "<p>No biomass data available.</p>";
                
                biomassDetailsModal.querySelector('.side-modal-body').innerHTML = biomassContent;
            })
            .catch(error => {
                console.error("Error fetching biomass data:", error);
                biomassDetailsModal.querySelector('.side-modal-body').innerHTML = `<p>${error.message}</p>`;
            });
    } else {
        biomassDetailsModal.querySelector('.side-modal-body').innerHTML = '<p>Detailed biomass data is not available for this state.</p>';
    }

    // --- 4. Show the main container ---
    detailsModalContainer.style.display = 'flex';
  }

  function createModal() {
    const existingModal = document.getElementById("plantModal");
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement("div");
    modal.id = "plantModal";
    modal.className = "modal";
    document.body.appendChild(modal);
    return modal;
  }

  function createBackButton() {
    const existing = document.querySelector(".back-button");
    if (existing) existing.remove();

    const button = document.createElement("button");
    button.className = "back-button";
    button.innerHTML = "← Back to India";
    button.onclick = () => {
      loadIndiaMap();
      currentView = "india";
      button.remove();
    };
    document.getElementById("map-container").appendChild(button);
  }
});