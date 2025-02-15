// Supabase 라이브러리 가져오기
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
// Supabase 프로젝트 URL & API 키
const SUPABASE_URL = "https://shqnkpmoabtpejearjzq.supabase.co"; // 여기에 본인 URL 입력
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNocW5rcG1vYWJ0cGVqZWFyanpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1MDA1MjcsImV4cCI6MjA1NTA3NjUyN30.jMl-Di-rjLmLkAH1hQOwsYKUq0Bjb1vNFh4erpvw5PY"; // 여기에 본인 anon key 입력

// Supabase 클라이언트 생성
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const urlParams = new URLSearchParams(window.location.search);
const theme = urlParams.get("theme");
const region = urlParams.get("region");

let reviewCardCount = 0; // 카드 id 식별용 변수

const createReviewCard = function (reviewTitle, reviewContent, reviewImg) {
  // review-cards 컨테이너 선택
  const reviewCardsContainer = document.querySelector(".review-cards");

  // 카드 컨테이너 생성
  const cardContainer = document.createElement("div");
  cardContainer.classList.add("col-12", "mb-3", "review-card");

  // 카드 본문 생성
  const card = document.createElement("div");
  card.classList.add("card", "card-comment-padding");
  cardContainer.appendChild(card);

  // 카드 내 행(row) 생성
  const row = document.createElement("div");
  row.classList.add("row", "g-0");
  card.appendChild(row);

  // 이미지 컬럼 생성
  const imgCol = document.createElement("div");
  imgCol.classList.add("col-md-3", "card-img-size");
  row.appendChild(imgCol);

  // 이미지 생성
  const img = document.createElement("img");
  img.src = reviewImg;
  img.classList.add("img-fluid", "rounded-circle", "review-img");
  imgCol.appendChild(img);

  // 내용 컬럼 생성
  const contentCol = document.createElement("div");
  contentCol.classList.add("col-md-9"); // 콘텐츠는 9칸 차지
  row.appendChild(contentCol);

  // 카드 본문(body) 생성
  const cardBody = document.createElement("div");
  cardBody.classList.add("card-body");
  contentCol.appendChild(cardBody);

  // 리뷰 제목 생성
  const title = document.createElement("h5");
  title.classList.add("review-item-title", "card-title");
  title.textContent = reviewTitle;
  cardBody.appendChild(title);

  // 숨김 내용에 해당하는 div
  const collapseDiv = document.createElement("div");
  collapseDiv.classList.add("collapse");
  collapseDiv.id = `collapse-${reviewCardCount}`; // 고유 ID적용
  cardBody.appendChild(collapseDiv);

  // 리뷰 내용 생성
  const paragraph = document.createElement("p");
  paragraph.textContent = reviewContent;
  collapseDiv.appendChild(paragraph);

  // "자세히 보기" 버튼 생성
  const detailButton = document.createElement("button");
  detailButton.classList.add(
    "btn",
    "btn-sm",
    "btn-outline-secondary",
    "show-detail-button"
  );
  detailButton.type = "button";
  detailButton.setAttribute("data-bs-toggle", "collapse");
  detailButton.setAttribute("data-bs-target", `#${collapseDiv.id}`);
  detailButton.setAttribute("aria-expanded", "false");
  detailButton.textContent = "자세히 보기";
  cardBody.appendChild(detailButton);

  // 버튼 클릭 시 "자세히 보기" 버튼 숨기기
  detailButton.addEventListener("click", () => {
    detailButton.style.display = "none"; // 버튼 숨기기
  });

  // collapse 이벤트 리스너: 내용 표시/숨김에 따라 버튼 토글
  collapseDiv.addEventListener("shown.bs.collapse", () => {
    detailButton.style.display = "none"; // 펼쳐지면 "자세히 보기" 버튼 숨김
  });

  collapseDiv.addEventListener("hidden.bs.collapse", () => {
    detailButton.style.display = "block"; // 접히면 "자세히 보기" 버튼 보임
  });

  // "카드 접기" 버튼 생성
  const collapseButton = document.createElement("button");
  collapseButton.classList.add(
    "btn",
    "btn-sm",
    "btn-outline-secondary",
    "mt-2",
    "collapse-button"
  );
  collapseButton.type = "button";
  collapseButton.setAttribute("data-bs-toggle", "collapse");
  collapseButton.setAttribute("data-bs-target", `#${collapseDiv.id}`);
  collapseButton.textContent = "카드 접기";
  collapseDiv.appendChild(collapseButton);

  // 최종적으로 reviewCardsContainer에 카드 추가
  reviewCardsContainer.prepend(cardContainer);
  reviewCardCount += 1;
};

async function fetchReviews(theme, region) {
  reviewCardCount = 0;
  const { data, error } = await supabase
    .from("Review") // 'Review' 테이블에서
    .select("*") // 모든 데이터 가져오기
    .eq("theme", theme) // 특정 theme 값 필터링
    .eq("region", region); // 특정 region 값 필터링

  if (error) {
    console.error("데이터 가져오기 실패:", error.message);
    return;
  }

  const reviewCardsContainer = document.querySelector(".review-cards");
  reviewCardsContainer.innerHTML = "";

  data.forEach((review) => {
    createReviewCard(review.title, review.content, review.img);
  });
}

// 리뷰 업로드 함수
async function uploadReview(theme, region, title, content) {
  // theme, region 이전 페이지에서 받아오면 변수값 대입
  const fileInput = document.getElementById("reviewImage");
  const file = fileInput.files[0];
  if (!file) {
    document.getElementById("uploadMessage").innerText =
      "이미지를 선택해주세요.";
    return;
  }
  const uniqueFileName = `${Date.now()}_${file.name}`; // 고유한 파일 이름 생성
  // 스토리지에 파일 업로드
  const { data: storageData, error: storageError } = await supabase.storage
    .from("ReviewImg") // 'ReviewImg' 스토리지 선택
    .upload(`reviews/${uniqueFileName}`, file);
  if (storageError) {
    console.error("이미지 업로드 실패:", storageError.message);
    return;
  }
  // 업로드한 이미지의 URL 가져오기
  const imageUrl = `${SUPABASE_URL}/storage/v1/object/public/ReviewImg/${storageData.path}`;
  // 'Review' 테이블에 데이터 추가
  const { error: dbError } = await supabase.from("Review").insert([
    {
      theme: theme,
      region: region,
      title: title,
      content: content,
      img: imageUrl,
    }, // 테마와 지역은 설정된 값으로 넣기
  ]);
  if (dbError) {
    console.error("리뷰 데이터 추가 실패:", dbError.message);
    return;
  }

  const toast = new bootstrap.Toast(document.querySelector("#toastControl"));
  const toastBody = document.querySelector(".toast-body");
  toastBody.textContent = "리뷰가 성공적으로 업로드되었습니다!";
  toast.show();
}

// 페이지 로딩 완료시 리뷰 및 브이로그 링크 요청
document.addEventListener("DOMContentLoaded", () => {
  fetchReviews(theme, region);
});

// 폼 제출 이벤트 리스너
document.querySelector(".review").addEventListener("submit", async (event) => {
  event.preventDefault(); // 기본 제출 동작 방지
  const title = document.getElementById("reviewTitle").value;
  const content = document.getElementById("reviewContent").value;
  await uploadReview(theme, region, title, content);
  await fetchReviews(theme, region);
});
