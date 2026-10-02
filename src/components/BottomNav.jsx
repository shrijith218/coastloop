import { NavLink } from "react-router-dom";

const navigationItems = [
  {
    label: "Home",
    path: "/home",
    icon: "⌂",
  },
  {
    label: "Rewards",
    path: "/rewards",
    icon: "🎁",
  },
  {
    label: "Rank",
    path: "/leaderboard",
    icon: "🏆",
  },
  {
    label: "Profile",
    path: "/profile",
    icon: "👤",
  },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {navigationItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `bottom-nav-item ${isActive ? "bottom-nav-active" : ""}`
          }
        >
          <span className="bottom-nav-icon">{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}