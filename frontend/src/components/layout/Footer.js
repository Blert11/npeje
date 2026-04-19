import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Link to="/" className="footer__logo">
            <img src={logo} alt="npeje.com" />
            <span>npeje<span>.com</span></span>
          </Link>
          <p>Discover Peja &amp; Rugova Valley — Kosovo's hidden gem.</p>
          <span className="footer__tag">Part of Spreht</span>
        </div>
        <div className="footer__links">
          <div>
            <h4>Explore</h4>
            <Link to="/listings?category=hotels">Hotels</Link>
            <Link to="/listings?category=restaurants">Restaurants</Link>
            <Link to="/listings?category=fast_food">Fast Food</Link>
            <Link to="/listings?category=cafes">Cafés</Link>
            <Link to="/listings?category=activities">Activities</Link>
          </div>
          <div>
            <h4>Company</h4>
            <Link to="/contact">Contact us</Link>
            <Link to="/contact">Add your business</Link>
            <Link to="/map">Map view</Link>
          </div>
          <div>
            <h4>Account</h4>
            <Link to="/login">Sign in</Link>
            <Link to="/register">Register</Link>
          </div>
        </div>
      </div>
      <div className="footer__bottom">
        <div className="container">
          <span>© {new Date().getFullYear()} npeje.com — Made with ♥ in Kosovo.</span>
        </div>
      </div>
    </footer>
  );
}
