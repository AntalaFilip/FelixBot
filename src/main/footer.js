import { Link } from '@material-ui/core';
import React from 'react';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-div">
        <small className="footer-text">Created by Filip Antala | This content is not endorsed by <u><Link color="inherit" href="https://skolafelix.sk">FELIX</Link></u> </small>
        <br/><small className="cookies">We only use cookies to keep you logged in on the website.</small>
      </div>
    </footer>
  )
}

export default Footer;