import React, { useState, useEffect } from 'react';
import './sidebar.css';

const Sidebar = ({ groupedData, sidebarOpen, toggleSidebar, onLakeSelect }) => {
  // Make regions open by default
  const [openRegions, setOpenRegions] = useState({});
  const [openPlaces, setOpenPlaces] = useState({});

  useEffect(() => {
    // Open all regions by default
    const initialRegions = {};
    for (const region of Object.keys(groupedData)) {
      initialRegions[region] = true;
    }
    setOpenRegions(initialRegions);

  }, [groupedData]);

  const toggleRegion = (region) => {
    setOpenRegions(prev => ({ ...prev, [region]: !prev[region] }));
  };

  const togglePlace = (region, place) => {
    const key = `${region}-${place}`;
    setOpenPlaces(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        {sidebarOpen && (
          <div className="lake-list">
            <h3>Glacial Lakes</h3>
            {Object.entries(groupedData).map(([region, lakes]) => {
              const placeGroups = {};
              lakes.forEach(lake => {
                const place = lake.place || 'Unknown';
                if (!placeGroups[place]) placeGroups[place] = [];
                placeGroups[place].push(lake);
              });

              return (
                <div key={region} className="region-group">
                  <h4 onClick={() => toggleRegion(region)} style={{cursor: 'pointer'}}>
                    {region} {openRegions[region] ? '▼' : '►'}
                  </h4>
                  {openRegions[region] && (
                    <ul>
                      {Object.entries(placeGroups).map(([place, placeLakes]) => {
                        const placeKey = `${region}-${place}`;
                        return (
                          <li key={placeKey}>
                            <div
                              onClick={() => togglePlace(region, place)}
                              style={{ cursor: 'pointer', paddingLeft: '8px' }}
                            >
                              {place} {openPlaces[placeKey] ? '▼' : '►'}
                            </div>
                            {openPlaces[placeKey] && (
                              <ul>
                                {placeLakes.map((lake, idx) => (
                                  <li
                                    key={idx}
                                    onClick={() => onLakeSelect(lake)}
                                    className="lake-item"
                                    style={{ paddingLeft: '16px' }}
                                  >
                                    Lake {lake.LakeID} - {lake.LakeName || 'Unnamed'}, {lake.km2} km²
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button
        className="corner-toggle"
        onClick={toggleSidebar}
      >
        MENU
      </button>
    </>
  );
};

export default Sidebar;
