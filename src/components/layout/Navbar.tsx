import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Menu, X, User, LogOut, Settings } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Logo from "./Logo";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Donate", path: "/donate" },
    { name: "Resell", path: "/resell" },
    { name: "Blog", path: "/blog" },
    { name: "FAQ", path: "/faq" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <Logo size="sm" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="relative text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors group py-2"
              >
                <motion.span whileHover={{ y: -2 }} className="block">
                  {link.name}
                </motion.span>
                <motion.div 
                  className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"
                />
              </Link>
            ))}
            {user ? (
              <div className="flex items-center gap-6 border-l pl-10 border-gray-100">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={user.role === "ADMIN" ? "/admin" : "/dashboard"}
                    className="flex items-center gap-2 text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                      {user.role === "ADMIN" ? <Settings className="w-4 h-4 text-blue-600" /> : <User className="w-4 h-4 text-blue-600" />}
                    </div>
                    <span>{user.name || (user.role === "ADMIN" ? "Admin" : "Dashboard")}</span>
                  </Link>
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.1, color: "#ef4444" }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLogout}
                  className="p-2 text-gray-400 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </motion.button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="bg-gray-900 text-white px-8 py-3 rounded-2xl text-sm font-bold hover:bg-blue-600 transition-all shadow-xl shadow-gray-200 hover:shadow-blue-200"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-600">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-50 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block text-lg font-medium text-gray-700 hover:text-blue-600"
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-50">
                {user ? (
                  <div className="space-y-4">
                    <Link
                      to={user.role === "ADMIN" ? "/admin" : "/dashboard"}
                      onClick={() => setIsOpen(false)}
                      className="block text-lg font-medium text-gray-700"
                    >
                      {user.role === "ADMIN" ? "Admin Dashboard" : "My Dashboard"}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block text-lg font-medium text-red-500"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center bg-blue-600 text-white py-3 rounded-xl font-medium"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
