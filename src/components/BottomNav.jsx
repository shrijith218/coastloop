import { useNavigate } from "react-router-dom";

const navigationItems = [
  { id: "map", label: "Map", icon: "⌖", path: "/home" },
  { id: "activity", label: "Activity", icon: "◷", path: "/activity" },
  { id: "scan", label: "Scan", icon: "⌾", path: "/home" },
  { id: "rewards", label: "Rewards", icon: "★", path: "/rewards" },
  { id: "profile", label: "Profile", icon: "♙", path: "/profile" },
];

export default function BottomNav({ active, scanBinId }) {
  const navigate = useNavigate();

  function handleNavigation(item) {
    if (item.id === "scan") {
      if (scanBinId) {
        navigate(`/scan/${scanBinId}`);
      } else {
        alert("Please select a collection point before scanning.");
      }

      return;
    }

    navigate(item.path);
  }

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {navigationItems.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`bottom-nav-item ${
            active === item.id ? "bottom-nav-item-active" : ""
          }`}
          onClick={() => handleNavigation(item)}
        >
          <span className="bottom-nav-icon">{item.icon}</span>
          <span className="bottom-nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}