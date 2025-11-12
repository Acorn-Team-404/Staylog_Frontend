import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../global/store/types";
import "../../global/css/BottomTabBar.css";

export default function BottomTabBar() {
  
  const navigate = useNavigate();
  const user = useSelector((s: RootState) => s.userInfo);
  const [params, setParams] = useSearchParams();

  const requireLogin = (path: string) => {
    if (!user) return navigate("/login", { replace: true, state: { from: path } });
    navigate(path);
  };
  const openCouponModal = () => {
    params.set("modal", user ? "coupon" : "login");
    setParams(params);              // -> 주소창: /#?modal=coupon
  };

  return (
    <nav className="sl-bottom-tab">
      <div className="sl-tab-grid">



        <NavLink to="/journal" className="sl-tab">
          <i className="bi bi-stars" />
          <span>저널</span>
        </NavLink>

        <NavLink to="/review" className="sl-tab">
          <i className="bi bi-chat-square-heart-fill" />
          <span>리뷰</span>
        </NavLink>

        <NavLink to="/" className="sl-tab">
          <i className="bi bi-house-fill" />
          <span>홈</span>
        </NavLink>
        
        <button className="sl-tab" onClick={openCouponModal}>
          <i className="bi bi-ticket-perforated-fill" />
          <span>쿠폰</span>
        </button>

        <button className="sl-tab" onClick={() => requireLogin("/mypage")}>
          <i className="bi bi-person-circle" />
          <span>마이</span>
        </button>
        </div>
    </nav>
  );
}
