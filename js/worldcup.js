(() => {
  let roundNum = 8; //확장 가능성 - 16강, 32강 등
  let regions = [];
  let currentPair = [];
  let currentRound = roundNum;
  let currentRegionCount = 1;

  // 현재 선택된 테마 (임시 지정, URL 파라미터에서 가져오는 방식 가능)
  const urlParams = new URLSearchParams(window.location.search);
  const theme = urlParams.get("theme");
  let themeEn = getEnglishTheme(theme);

  /**
   * 지역명을 한글로 변환
   */
  function getKoreanRegion(region) {
    switch (region) {
      case "andong":
        return "안동";
      case "boryeong":
        return "보령";
      case "buan":
        return "부안";
      case "busan":
        return "부산";
      case "chuncheon":
        return "춘천";
      case "daegu":
        return "대구";
      case "daejeon":
        return "대전";
      case "damyang":
        return "담양";
      case "danyang":
        return "단양";
      case "gangnueng":
        return "강릉";
      case "gapyeong":
        return "가평";
      case "geoje":
        return "거제";
      case "goheung":
        return "고흥";
      case "goisan":
        return "괴산";
      case "gongju":
        return "공주";
      case "gunsan":
        return "군산";
      case "gwangju":
        return "광주";
      case "gyeongju":
        return "경주";
      case "incheon":
        return "인천";
      case "inje":
        return "인제";
      case "jeju":
        return "제주";
      case "jeonju":
        return "전주";
      case "jiri":
        return "지리산";
      case "mokpo":
        return "목포";
      case "mungyeong":
        return "문경";
      case "naju":
        return "나주";
      case "pyeongchang":
        return "평창";
      case "seongnam":
        return "성남";
      case "seoul":
        return "서울";
      case "sokcho":
        return "속초";
      case "suncheon":
        return "순천";
      case "suwon":
        return "수원";
      case "taean":
        return "태안";
      case "taebaek":
        return "태백";
      case "uljin":
        return "울진";
      case "ulsan":
        return "울산";
      case "yangpyeong":
        return "양평";
      case "yangyang":
        return "양양";
      case "yeosu":
        return "여수";
      case "yongin":
        return "용인";
      default:
        return region;
    }
  }

  function getEnglishTheme(theme) {
    switch (theme) {
      case "액티비티":
        return "activity";
      case "도심":
        return "city";
      case "연인":
        return "couple";
      case "가족":
        return "family";
      case "전통":
        return "tradition";
      case "힐링":
        return "healing";
      case "산":
        return "mountain";
      case "바다":
        return "sea";
      case "맛집":
        return "food";
      default:
        return "food";
    }
  }

  /**
   * 첫 라운드를 설정합니다.
   */
  function setFirstRound() {
    currentRound = 8;
    currentRegionCount = 1;
  }

  /**
   * 배열을 무작위로 섞습니다.
   * @param {array} array - 섞을 배열.
   * @returns {array} - 섞인 배열.
   */
  function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
  }

  /**
   * 현재 라운드 정보를 화면에 표시합니다.
   */
  function updateRoundInfo() {
    let text =
      currentRound === 1
        ? "우승!"
        : currentRound === 2
        ? "결승"
        : `${currentRound}강(${currentRegionCount++}/${currentRound / 2})`;
    document.getElementById("round-info").textContent = text;
  }

  /**
   * 우승 시 결과 페이지로 이동합니다.
   */
  function winner(region) {
    //실제 배포 시 아래 링크로 수정 필요
    // const baseUrl = window.location.origin + "/PICK-GO";
    // location.href = `${baseUrl}/pages/schedule.html?theme=${theme}&region=${region}`;
    location.href = `./schedule.html?theme=${theme}&region=${region}`;
  }

  /**
   * 다음 대결 쌍을 화면에 표시합니다.
   */
  function displayNextPair() {
    let regionKr = "";
    if (regions.length < 2) {
      if (currentRound === 1) {
        regionKr = getKoreanRegion(regions[0]);
        alert(`🏆 우승! ${regionKr} 🎉`);
        winner(regionKr);
        return;
      } else {
        regions = shuffleArray(regions);
        currentRound /= 2;
      }
    }

    currentPair = regions.splice(0, 2);
    for (let i = 0; i < 2; i++) {
      regionKr = getKoreanRegion(currentPair[i]);
      document.getElementById(`region-title-${i}`).textContent = regionKr;
      document.getElementById(
        `region-img-${i}`
      ).src = `../assets/region/${themeEn}/${currentPair[i]}-${themeEn}.png`;
    }
    updateRoundInfo();
  }

  /**
   * 아이템을 선택했을 때의 동작을 처리합니다.
   */
  function selectRegion(index) {
    const cardContainer = document.querySelector(".card-container");
    cardContainer.style.pointerEvents = "none";

    const cards = document.querySelectorAll(".card");
    cards[index].classList.add("selected");
    cards[1 - index].classList.add("unselected");

    setTimeout(() => {
      regions.push(currentPair[index]);
      if (regions.length === currentRound / 2) {
        currentRound /= 2;
        currentRegionCount = 1;
        regions = shuffleArray(regions);
      }

      cards[index].classList.remove("selected");
      cards[1 - index].classList.remove("unselected");
      cardContainer.style.pointerEvents = "auto";
      displayNextPair();
    }, 2000);
  }

  /**
   * 테마별 8개 지역을 로드합니다.
   * 데이터가 너무 많아요 ㅠㅠ
   * 나중에 반드시 DB로 하겠습니다.
   */
  function loadRegions() {
    switch (themeEn) {
      case "activity":
        regions = shuffleArray([
          "busan",
          "chuncheon",
          "danyang",
          "gapyeong",
          "jeju",
          "mungyeong",
          "pyeongchang",
          "yeosu",
        ]);
        break;
      case "city":
        regions = shuffleArray([
          "busan",
          "daegu",
          "daejeon",
          "gwangju",
          "incheon",
          "jeju",
          "seongnam",
          "seoul",
        ]);
        break;
      case "couple":
        regions = shuffleArray([
          "busan",
          "gapyeong",
          "gongju",
          "gunsan",
          "jeju",
          "seoul",
          "yangyang",
          "yeosu",
        ]);
        break;
      case "family":
        regions = shuffleArray([
          "busan",
          "daegu",
          "jeju",
          "pyeongchang",
          "seoul",
          "suncheon",
          "taean",
          "yongin",
        ]);
        break;
      case "tradition":
        regions = shuffleArray([
          "andong",
          "gangnueng",
          "gongju",
          "gyeongju",
          "jeju",
          "jeonju",
          "naju",
          "seoul",
        ]);
        break;
      case "healing":
        regions = shuffleArray([
          "buan",
          "damyang",
          "goheung",
          "inje",
          "jeju",
          "taean",
          "uljin",
          "yangpyeong",
        ]);
        break;
      case "mountain":
        regions = shuffleArray([
          "goisan",
          "gapyeong",
          "inje",
          "jeju",
          "buan",
          "jiri",
          "mungyeong",
          "taebaek",
        ]);
        break;
      case "sea":
        regions = shuffleArray([
          "boryeong",
          "busan",
          "geoje",
          "incheon",
          "jeju",
          "sokcho",
          "ulsan",
          "yeosu",
        ]);
        break;
      case "food":
        regions = shuffleArray([
          "andong",
          "busan",
          "daegu",
          "jeju",
          "jeonju",
          "mokpo",
          "sokcho",
          "suwon",
        ]);
        break;
      default:
        regions = shuffleArray([
          "default1",
          "default2",
          "default3",
          "default4",
          "default5",
          "default6",
          "default7",
          "default8",
        ]);
    }
    startWorldCup();
  }

  /**
   * 월드컵 게임을 시작합니다.
   */
  function startWorldCup() {
    setFirstRound();
    displayNextPair();
  }

  /**
   * 웹 페이지가 로드되면 호출됩니다.
   */
  window.onload = () => {
    console.log("웹 페이지 로드 완료");

    for (let i = 0; i < 2; i++) {
      const cards = document.querySelectorAll(".card");
      cards[i].addEventListener("click", () => {
        selectRegion(i);
      });
    }

    loadRegions();
  };
})();
