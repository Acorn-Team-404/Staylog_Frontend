import { Carousel } from "react-bootstrap";
import HomeListSection from "../../domain/home/components/HomeListSection";

function Home2() {

  return <>
    <Carousel className="w-100 h-100 mt-4 mb-4">
      <Carousel.Item>
        <img src={"https://picsum.photos/2100/900"} alt="숙소 이미지 1" className="carousel-img" />
      </Carousel.Item>
      <Carousel.Item>
        <img src={"https://picsum.photos/2100/900"} alt="숙소 이미지 2" className="carousel-img" />
      </Carousel.Item>
    </Carousel>


    <HomeListSection
      title="여기는 부산, 별점순"
      regionCode="REGION_BUSAN"
      sort="rating"
      limit={20}
    />

    <HomeListSection
      title="여기는 서울, 리뷰많은 순"
      regionCode="REGION_SEOUL"
      sort="review"
      limit={20}
    />

    <HomeListSection
      title="전국 최신순"
      regionCode=""
      sort="latest"
      limit={20}
    />

    <HomeListSection
      title="전국, 리뷰많은 순"
      regionCode=""
      sort="review"
      limit={20}
    />
  </>
}

export default Home2;