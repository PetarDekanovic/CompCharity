import { Link } from "react-router-dom";
import { Laptop, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Music2 } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-24">
          {/* Brand */}
          <div className="lg:col-span-4 space-y-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-blue-600 p-2 rounded-2xl shadow-lg shadow-blue-100">
                <Laptop className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tighter text-gray-900">CompCharity</span>
            </Link>
            <p className="text-lg leading-relaxed text-gray-500 font-medium">
              Empowering communities by refurbishing discarded technology and donating it to those in need. Bridging the digital divide across Ireland.
            </p>
            <div className="flex gap-4">
              {[
                { icon: Music2, href: "https://www.tiktok.com/@compcharity" },
                { icon: Facebook, href: "#" },
                { icon: Twitter, href: "#" },
                { icon: Instagram, href: "#" }
              ].map((social, i) => (
                <a 
                  key={i}
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-2xl text-gray-400 hover:bg-blue-600 hover:text-white transition-all hover:shadow-xl hover:shadow-blue-100"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-8">Quick Links</h3>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link to="/about" className="text-gray-600 hover:text-blue-600 transition-colors">About Us</Link></li>
              <li><Link to="/how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors">How It Works</Link></li>
              <li><Link to="/donate" className="text-gray-600 hover:text-blue-600 transition-colors">Donate Tech</Link></li>
              <li><Link to="/resell" className="text-gray-600 hover:text-blue-600 transition-colors">Resell Tech</Link></li>
              <li><Link to="/blog" className="text-gray-600 hover:text-blue-600 transition-colors">Latest News</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-8">Support</h3>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link to="/faq" className="text-gray-600 hover:text-blue-600 transition-colors">FAQ</Link></li>
              <li><Link to="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact Us</Link></li>
              <li><Link to="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-600 hover:text-blue-600 transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-8">Contact Us</h3>
            <div className="bg-gray-50 p-8 rounded-[32px] space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Location</div>
                  <div className="text-sm font-bold text-gray-900">Portlaoise, Ireland</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Phone className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Hours</div>
                  <div className="text-sm font-bold text-gray-900">9am – 6pm</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Email</div>
                  <div className="text-sm font-bold text-gray-900">office@compcharity.org</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <span>© {currentYear} CompCharity Ireland</span>
            <span className="w-1 h-1 bg-gray-200 rounded-full" />
            <span>Charity Number: 12345678</span>
          </div>
          <div className="flex items-center gap-8 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <Link to="/privacy" className="hover:text-blue-600 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-blue-600 transition-colors">Terms</Link>
            <Link to="/cookies" className="hover:text-blue-600 transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
