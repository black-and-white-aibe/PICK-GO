const urlParams = new URLSearchParams(window.location.search);
const theme = urlParams.get("theme");
const region = urlParams.get("region");

if (!theme || !region) {
  alert("비정상적인 접근입니다.");
  const baseUrl = window.location.origin + "/PICK-GO";
  location.href = `${baseUrl}/index.html`;
}

let vlogUrlList = [];
let players = [];
const totalPlayers = 3; // 생성할 플레이어 개수

// 브이로그 링크 요청 함수
async function requestVlogList(theme, region) {
  console.log("vlog 요청");
  const url = `https://sweltering-torch-paint.glitch.me/api/vlogs?theme=${encodeURIComponent(
    theme
  )}&region=${encodeURIComponent(region)}`;

  const response = await axios.get(url);
  vlogUrlList = response.data.vlog["urls"];
  console.log(vlogUrlList);
}

/**
 * YouTube 링크에서 비디오 ID를 추출합니다.
 * @param {string} youtubeLink - YouTube 링크.
 * @returns {string} - 비디오 ID.
 */
function extractVideoId(youtubeLink) {
  const url = new URL(youtubeLink);
  return url.pathname.startsWith("/embed/")
    ? url.pathname.split("/embed/")[1]
    : url.searchParams.get("v");
}

// 유튜브 플레이어 생성 후 링크 연결
async function newYoutubePlayer(index) {
  const carouselContainer = document.querySelector(".carousel-container");

  // 새로운 carousel 아이템 생성
  const newItem = document.createElement("div");
  newItem.classList.add("carousel-item");
  // 첫 번째 슬라이드에는 active 클래스 추가
  if (index === 0) {
    newItem.classList.add("active");
  }

  // iframe 요소 생성
  const iframe = document.createElement("iframe");
  iframe.classList.add("youtube-player");
  iframe.src = "https://www.youtube.com/embed/?enablejsapi=1";
  iframe.setAttribute("frameborder", "0");
  iframe.setAttribute(
    "allow",
    "accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  );
  iframe.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
  // 수정: 올바른 CSS 적용 (세미콜론 추가)
  iframe.setAttribute("style", "width: 100%; height: 100%;");
  iframe.allowFullscreen = true;

  // iframe을 carousel 아이템에 추가 후 carousel 컨테이너에 추가
  newItem.appendChild(iframe);
  carouselContainer.appendChild(newItem);

  // 각 iframe에 대해 YT.Player 생성
  const player = new YT.Player(iframe, {
    events: {
      onReady: () => {
        const vlogUrl = vlogUrlList[index];
        console.log("vlogUrl:", vlogUrl);
        const videoId = extractVideoId(vlogUrl);
        if (videoId) {
          player.cueVideoById(videoId);
        } else {
          console.error("서버 응답에서 videoId 추출 실패:", vlogUrl);
        }
        players.push(player);
      },
      onStateChange: onPlayerStateChange,
    },
  });
}

// 유튜브 플레이어를 링크 수만큼 생성하는 함수
async function appendYoutubeVlog() {
  for (let i = 0; i < totalPlayers; i++) {
    await newYoutubePlayer(i);
  }
}

async function onYouTubeIframeAPIReady() {
  console.log("유튜브 API 준비 완료");

  // 브이로그 로딩 필요하면 아래 주석 해제하기:)
  // 유튜브 영상 링크 요청
  // await requestVlogList(theme, region);
  // 유튜브 영상 플레이어 추가
  appendYoutubeVlog();
  // 모든 플레이어가 준비되면 스피너 제거
  document.getElementById("spinner").remove();

  // 유튜브 iframe 영역 꽉 채우게 수정
  const carouselInner = document.querySelector(".carousel-inner"); // 요소 선택
  carouselInner.style.justifyContent = "start";
  carouselInner.style.alignItems = "start";
}

/**
 * 플레이어 상태 변경 시, 한 플레이어가 재생 중이면 다른 플레이어는 일시 정지 처리
 */
function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    players.forEach((player) => {
      if (player !== event.target) player.pauseVideo();
    });
  }
}

// 전체 유튜브 플레이어 정지
function stopYoutubePlayer() {
  players.forEach((player) => {
    player.stopVideo();
  });
}

const prevControl = document.querySelector(".carousel-control-prev");
const nextControl = document.querySelector(".carousel-control-next");

prevControl.addEventListener("click", () => {
  stopYoutubePlayer();
});

nextControl.addEventListener("click", () => {
  stopYoutubePlayer();
});

// 복사 버튼 클릭 시 이벤트
document
  .querySelector(".ai-schedule-copy-button")
  .addEventListener("click", function () {
    // 버튼 클릭 시 복사 작업 (실제 복사 기능을 구현하고 싶다면 추가)

    // Toast 생성 및 표시
    var toastEl = document.getElementById("toastControl");
    var toast = new bootstrap.Toast(toastEl);
    toast.show();
  });
