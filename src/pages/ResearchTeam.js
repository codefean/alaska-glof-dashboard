import React, { useState } from "react";
import "./ResearchTeam.css";

const teamMembers = [
  {
    name: "Dr. ",
    role: "Lead Hydrologist",
    bio: "Dr. specializes in glacier hydrology and climate impacts. She oversees data analysis and field campaigns.",
    imageUrl: "/team/emily.jpg"
  },
  {
    name: "Dr.",
    role: "Remote Sensing Specialist",
    bio: " focuses on satellite imagery and aerial surveys to monitor glacier lakes and flood pathways.",
    imageUrl: "/team/carlos.jpg"
  },
  {
    name: "Researcher",
    role: "Data Scientist",
    bio: "builds predictive models to estimate GLOF risk and helps maintain our historical database.",
    imageUrl: "/team/sarah.jpg"
  },
  {
    name: "Researcher",
    role: "GIS Analyst",
    bio: "creates detailed maps and spatial analyses of glacier lake regions to support decision making.",
    imageUrl: "/team/alex.jpg"
  },
];

const ResearchTeam = () => {
  return (
    <div className="research-team-container">
      <h2 className="team-title">Meet Our Research Team</h2>
      <p className="team-description">
        Our interdisciplinary team brings together experts in hydrology, remote sensing, data science, and GIS
        to better understand glacial lake outburst floods and their impacts.
      </p>

      <div className="team-cards-container">
        {teamMembers.map((member, index) => (
          <div key={index} className="team-card">
            <div className="team-card-image">
              <img src={member.imageUrl} alt={`${member.name}`} />
            </div>
            <div className="team-card-info">
              <h3>{member.name}</h3>
              <p className="team-role">{member.role}</p>
              <p className="team-bio">{member.bio}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="team-footer">
        <p>
          Together, we aim to advance scientific understanding and help communities prepare for future GLOF events.
        </p>
      </div>
    </div>
  );
};

export default ResearchTeam;
