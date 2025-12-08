import React from "react";
import "../App.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span className="footer-brand">JobPortal</span>

        <span className="footer-text">
          © {new Date().getFullYear()} JobPortal · Built for hiring, skill
          matching & insights.
        </span>

        <div className="footer-links">
          <a href="#!" className="footer-link">
            Help
          </a>
          <a href="#!" className="footer-link">
            Terms
          </a>
          <a href="#!" className="footer-link">
            Privacy
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;