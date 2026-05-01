import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Link to="/" className="footer__logo">
            <img src={logo} alt="npeje.com" className="footer__logo-img" />
            <span>npeje<span>.com</span></span>
          </Link>
          <p>Discover the best of Peja and the breathtaking Rugova Valley.</p>
        </div>

        <div className="footer__links">
          <div className="footer__col">
            <h4>Explore</h4>
            <Link to="/listings">All Listings</Link>
            <Link to="/listings?category=hotels">Hotels</Link>
            <Link to="/listings?category=restaurants">Restaurants</Link>
            <Link to="/listings?category=activities">Activities</Link>
          </div>
          <div className="footer__col">
            <h4>Company</h4>
            <Link to="/contact">Contact Us</Link>
            <Link to="/contact">Add your Business</Link>
          </div>
          <div className="footer__col">
            <h4>Account</h4>
            <Link to="/login">Sign In</Link>
            <Link to="/register">Register</Link>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <span>&copy; {new Date().getFullYear()} npeje.com — Made with ♥ in Kosovo</span>
        </div>
      </div>
    </footer>
  );
}
