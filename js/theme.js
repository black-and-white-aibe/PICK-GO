document.addEventListener("DOMContentLoaded", function () {
  // 모든 image-container 요소 가져오기
  const imageContainers = document.querySelectorAll(".image-container");

  imageContainers.forEach((container) => {
    // 각 컨테이너의 img 태그에서 alt 속성을 가져와 테마 이름으로 사용
    const theme = container.querySelector("img").alt;

    // 클릭 이벤트 추가
    container.addEventListener("click", function () {
      moveToPage(theme);
    });
  });
});

function moveToPage(theme) {
  //  query문으로 theme값 저장 (encodeURIComponent; 한글포함 URL 가능)
  const targetUrl = `./worldcup.html?theme=${encodeURIComponent(theme)}`;
  window.location.href = targetUrl;
}
