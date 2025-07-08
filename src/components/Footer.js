import React from "react";
import "./Footer.css"; // Import Footer-specific styles

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-logos">
        <a href="https://www.iarc.uaf.edu/" target="_blank" rel="noopener noreferrer">
          <img src="/logos/IARC.png" alt="IARC Logo" className="footer-logo" />
        </a>
        <a href="https://uas.alaska.edu/" target="_blank" rel="noopener noreferrer">
          <img src="/logos/UAS.png" alt="UAS Logo" className="footer-logo" />
        </a>
        <a href="https://www.usgs.gov/" target="_blank" rel="noopener noreferrer">
          <img src="/logos/USGS.png" alt="USGS Logo" className="footer-logo" />
        </a>
        <a href="https://www.nsf.gov/" target="_blank" rel="noopener noreferrer">
          <img src="/logos/NSF.png" alt="NSF Logo" className="footer-logo" />
        </a>
       
      </div>

      <p>
        The <a href="https://www.alaska.edu/alaska" target="_blank" rel="noopener noreferrer"><strong>University of Alaska</strong></a> is an Equal Opportunity/Equal Access Employer and Educational Institution.
      </p>
      <p>
        The University is committed to a <a href="https://www.alaska.edu/nondiscrimination" target="_blank" rel="noopener noreferrer"><strong>policy of nondiscrimination</strong></a> against individuals on the basis of any legally protected status.
      </p>
      <p>
        UA is committed to providing accessible websites. <a href="https://www.alaska.edu/webaccessibility" target="_blank" rel="noopener noreferrer"><strong>Learn more about UA’s notice of web accessibility.</strong></a>
      </p>
    </footer>
  );
};

export default Footer;
