// src/domain/board/Review.tsx

import { Button } from "react-bootstrap";
import { NavLink } from "react-router-dom";




function Review() {

    
    
    return <>
    
    <h1>리뷰 게시판</h1>

    <Button as={NavLink} to="/boardForm">리뷰 등록</Button>

    <table>
        <thead>
            <tr>
                <th>번호</th>
                <th>지역</th>
                <th>숙소명</th>
                <th>제목</th>
                <th>작성자</th>
                <th>작성일</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>1</td>
                <td>서울</td>
                <td>Staylog Hotel</td>
                <td>Great stay!</td>
                <td>user123</td>
                <td>2024-10-01</td>
            </tr>
            <tr>
                <td>2</td>
                <td>부산</td>
                <td>Ocean View Inn</td>
                <td>Loved the view!</td>
                <td>traveler456</td>
                <td>2024-10-02</td>
            </tr>
        </tbody> 
    </table>




    </>
}

export default Review;