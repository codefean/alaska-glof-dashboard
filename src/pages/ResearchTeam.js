import React from "react";
import "./ResearchTeam.css";

const teamMembers = [
  {
    name: "Gabriel Wolken",
    role: "Geological Scientist",
    bio: "Geological Scientist with the Alaska Division of Geological & Geophysical Surveys, focusing on Alaska’s geologic framework and contributing to regional publications and public outreach.",
    image: process.env.PUBLIC_URL + '/images/wolken.jpg',
    website: "https://dggs.alaska.gov/pubs/staff/gjwolken",
  },
  {
    name: "David Rounce",
    role: "Glaciologist",
    bio: "Assistant Professor at Carnegie Mellon University. Leads the CryoTartans research group using computational modeling, remote sensing, and fieldwork to understand glacier, water resource, and hazard responses to climate change. Creator of the open‑source PyGEM glacier evolution model and recipient of the IGS Firn Award.",
    image: process.env.PUBLIC_URL + '/images/rounce.jpeg',
    website: "https://davidrounce.weebly.com/",
  },
  {
    name: "Eran Hood",
    role: "Environmental Scientist",
    bio: "Professor of Environmental Science and Department Chair at University of Alaska Southeast. Researches watershed-scale biogeochemistry, alpine and snow hydrology, and glacier‑influenced aquatic systems, while fostering interdisciplinary teaching and bridging Indigenous and Western scientific knowledge.",
    image: process.env.PUBLIC_URL + '/images/hood.png',
    website: "https://uas.alaska.edu/dir/ewhood.html",
  },
];

const ResearchTeam = () => {
  return (
    <div className="research-team-container">
      <h2 className="team-title">Meet Our Research Team</h2>
      <div className="team-cards-container">
        {teamMembers.map((member, index) => (
          <div key={index} className="team-card">
            <div className="team-card-image">
              <img src={member.image} alt={member.name} loading="lazy" />
            </div>
            <div className="team-card-info">
              <h3>
                <a 
                  href={member.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="team-link"
                >
                  {member.name}
                </a>
              </h3>
              <p className="team-role">{member.role}</p>
              <p className="team-bio">{member.bio}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResearchTeam;
