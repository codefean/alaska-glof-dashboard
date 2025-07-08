import React from 'react';
import './sidebar.css';

const Sidebar = ({ groupedData, sidebarOpen, toggleSidebar, onLakeSelect }) => {
  return (
    <>
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        {sidebarOpen && (
          <div className="lake-list">
            <h3>Glacial Lakes</h3>
            {Object.entries(groupedData).map(([region, lakes]) => (
              <div key={region} className="region-group">
                <h4>{region}</h4>
                <ul>
                  {lakes.map((lake, idx) => (
                    <li key={idx} onClick={() => onLakeSelect(lake)}>
                      <strong>{lake.LakeID}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        className={`corner-toggle ${sidebarOpen ? 'rotated' : ''}`}
        onClick={toggleSidebar}
      >
        ≡
      </button>
    </>
  );
};

export default Sidebar;
