import { useNavigate } from "react-router-dom";

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");  // Remove JWT
    navigate("/");               // Redirect to login page
  };

  return (
    <button
      onClick={handleLogout}
      className="text-red-600 hover:text-red-800 transition-colors"
    >
      Logout
    </button>
  );
}

export default LogoutButton;
