import { NavLink } from "react-router-dom";

const navItems = [
  { id: "map", label: "Map", icon: "⌖", path: "/home" },
  { id: "activity", label: "Activity", icon: "♧", path: "/activity" },
  { id: "scan", label: "Scan", icon: "⌾", path: "/home" },
  { id: "rewards", label: "Rewards", icon: "♢", path: "/rewards" },
  { id: "profile", label: "Profile", icon: "♙", path: "/profile" },
];

export default function BottomNav({ active, navigate }) {
  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`bottom-nav-item ${
            active === item.id ? "active" : ""
          }`}
          onClick={() => navigate(item.path)}
        >
          <span className="bottom-nav-icon">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}