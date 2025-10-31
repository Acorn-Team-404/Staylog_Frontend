// src/domain/journal/pages/Journal.tsx

import { Button } from "react-bootstrap";
import { NavLink } from "react-router-dom";




function Journal() {




    
    return <>
    
    <h1>저널 게시판 !!!</h1>

    
    <Button as={NavLink} to="/review">리뷰게시판</Button>

    </>
}

export default Journal;