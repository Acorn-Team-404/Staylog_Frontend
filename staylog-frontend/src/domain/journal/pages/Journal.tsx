// src/domain/journal/pages/Journal.tsx

import { Button } from "react-bootstrap";
import { Link, NavLink } from "react-router-dom";




function Journal() {




    
    return <>
    
    <h1>저널 게시판 !!!</h1>
    <Link to="/review">
        <Button>리뷰 게시판</Button>
    </Link>
    </>
}

export default Journal;