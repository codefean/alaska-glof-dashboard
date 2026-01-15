import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import "./ResearchTeam.css";

const ResearchTeam = () => {
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    fetch("/research-team.csv")
      .then((response) => response.text())
      .then((csvText) => {
        const parsed = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
        });

        setTeamMembers(parsed.data);
      })
      .catch((error) => {
        console.error("Error loading research-team.csv:", error);
      });
  }, []);

  const isEmail = (value) =>
    value && value.includes("@") && !value.startsWith("http");

  return (
    <>
      <div className="research-team-container">
        <h2 className="team-title">About Research</h2>
        <h3 className="research-subheading">
          Funded by NSF & AKCASC
        </h3>

        <div className="about-research-card">
          <p>
            Our research focuses on understanding and predicting glacier
            outburst floods. We combine field observations, satellite data, and
            advanced computer models to study how glaciers store and release
            water. This work helps us assess current and future flood hazards as
            glaciers retreat, identify locations most prone to glacial floods
            across Alaska and western British Columbia, and improve forecasting
            tools to protect communities and infrastructure.
          </p>
        </div>

        <div className="team-cards-container">
          {teamMembers.map((member) => {
            const href = member.website
              ? isEmail(member.website)
                ? `mailto:${member.website}`
                : member.website
              : null;

            return (
              <div key={member.id} className="team-card">
                <div className="team-card-image">
                  {member.image && (
                    <img
                      src={member.image}
                      alt={`Portrait of ${member.name}`}
                      loading="lazy"
                    />
                  )}
                </div>

                <div className="team-card-info">
                  <h4>
                    {href ? (
                      <a
                        href={href}
                        target={href.startsWith("http") ? "_blank" : undefined}
                        rel={
                          href.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="team-link"
                      >
                        {member.name}
                      </a>
                    ) : (
                      member.name
                    )}
                  </h4>

                  <p className="team-role">{member.role}</p>
                  <p className="affiliation-role">{member.affiliation}</p>
                  <p className="team-bio">{member.bio}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="funding-sources">
        <h3>Funding Sources</h3>
        <ul>
          <li>
            <a
              href="https://www.nsf.gov/awardsearch/showAward?AWD_ID=2438778&HistoricalAwards=false"
              target="_blank"
              rel="noopener noreferrer"
            >
              <strong>National Science Foundation:</strong> Confronting Hazards
              Impacts and Risk for a Resilient Planet (CHIRRP)
            </a>
          </li>
          <li>
            <a
              href="https://akcasc.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <strong>Alaska Climate Adaptation Science Center:</strong> Improving
              Early Warning Forecasting and Mitigation for Glacier Lake Outburst
              Floods in Alaska
            </a>
          </li>
        </ul>
      </div>
    </>
  );
};

export default ResearchTeam;
