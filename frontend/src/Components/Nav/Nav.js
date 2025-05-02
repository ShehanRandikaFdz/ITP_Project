"use client"

import { Link, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import "../../styles/nav.css"

const Nav = () => {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + "/")
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const menuItems = [
    { path: "/", icon: "📊", label: "Dashboard" },
    { path: "/student", icon: "👨‍🎓", label: "Students" },
    { path: "/staff", icon: "👨‍🏫", label: "Staff" },
    { path: "/inventory", icon: "📦", label: "Inventory" },
    { path: "/payments", icon: "💰", label: "Payments" },
    { path: "/calendar", icon: "📅", label: "Calendar" },
  ]
  

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button className="mobile-toggle" onClick={toggleMobileMenu} aria-label="Toggle mobile menu">
        {isMobileMenuOpen ? "✖️" : "☰"}
      </button>

      {/* Sidebar Navigation */}
      <div className={`sidebar ${isMobileMenuOpen ? "mobile-open" : ""}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src="/MKVLogo.jpg" alt="MKV Logo" style={{ width: "40px", height: "40px" }} />
        </div>
        <h1 className="sidebar-title">MKV</h1>
      </div>

        <div className="sidebar-content">
          <ul className="sidebar-menu">
            {menuItems.map((item) => (
              <li key={item.path} className="sidebar-menu-item">
                <Link
                  to={item.path}
                  className={`sidebar-menu-link ${isActive(item.path) ? "active" : ""}`}
                  onClick={() => windowWidth < 1024 && setIsMobileMenuOpen(false)}
                >
                  <span className="sidebar-menu-icon">{item.icon}</span>
                  <span className="sidebar-menu-text">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">A</div>
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">Admin User</p>
              <p className="sidebar-user-email">admin@school.edu</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && windowWidth < 1024 && <div className="overlay" onClick={toggleMobileMenu} />}

      {/* Main Content Container */}
      <div className="main-content">{/* The rest of the app content will be rendered here */}</div>
    </>
  )
}

export default Nav
