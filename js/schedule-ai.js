document.addEventListener("DOMContentLoaded", async function () {
  const scheduleContainer = document.querySelector(".ai-schedule-scroll-area");
  scheduleContainer.innerHTML = `
      <div class="loading-spinner" style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 50vh;">
      <div class="spinner-border" style="color: #000000;" role="status"></div>
      <p style="margin-top: 10px; color: #000000; font-family: Jua;">일정 생성 중...</p>
    </div>
    `;

  async function fetchSchedule() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const theme = urlParams.get("theme");
      const region = urlParams.get("region");

      const response = await fetch(
        `https://sweltering-torch-paint.glitch.me/api/schedule?theme=${theme}&region=${region}`
      );
      const data = await response.json();
      return JSON.parse(data.schedule);
    } catch (error) {
      console.error("일정 데이터를 가져오는 중 오류 발생:", error);
      return null;
    }
  }

  function formatScheduleText(scheduleData) {
    return scheduleData
      .map((daySchedule) => {
        return (
          `<Day ${daySchedule.day} - ${daySchedule.title}>\n\n` +
          daySchedule.schedule
            .map((item) => {
              let addressText = item.address ? `주소: ${item.address}\n` : "";
              return `${item.time} > ${item.activity} (${item.destination})\n- ${item.description}\n${addressText}`;
            })
            .join("\n")
        );
      })
      .join("\n-------------------------------\n\n");
  }

  function copyScheduleToClipboard(scheduleData) {
    let errorFlag = 0;
    const formattedText = formatScheduleText(scheduleData);
    navigator.clipboard.writeText(formattedText).catch((err) => {
      console.error("클립보드 복사 실패:", err);
      errorFlag = 1;
    });

    const copyButton = document.querySelector(".ai-schedule-copy-button");
    if (errorFlag) {
      copyButton.innerHTML = "복사 실패";
    } else {
      copyButton.innerHTML = "복사됨";
    }

    setTimeout(() => {
      copyButton.innerHTML =
        '<img src="../assets/icon/copy-icon.png" alt="" />';
    }, 2000);
  }

  function renderSchedule(scheduleData) {
    // 기존 내용 제거
    scheduleContainer.innerHTML = "";

    // 일정 데이터가 없을 경우 처리
    if (!scheduleData || scheduleData.length === 0) {
      scheduleContainer.innerHTML = "<p>일정이 없습니다.</p>";
      return;
    }

    // 전체 타임라인을 감싸는 컨테이너
    const timelineContainer = document.createElement("div");
    // 인라인 스타일로 중앙선 구현을 위한 기본 설정
    timelineContainer.style.position = "relative";
    timelineContainer.style.width = "100%";
    timelineContainer.style.padding = "20px 0";

    // 중앙 세로 라인
    const verticalLine = document.createElement("div");
    verticalLine.style.position = "absolute";
    verticalLine.style.left = "50%";
    verticalLine.style.top = "0";
    verticalLine.style.width = "2px";
    verticalLine.style.height = "100%";
    verticalLine.style.backgroundColor = "black";

    // 타임라인 컨테이너에 세로 라인 추가
    timelineContainer.appendChild(verticalLine);

    // 각 Day(일자)마다 타임라인의 노드(점)와 내용 카드 생성
    scheduleData.forEach((daySchedule, index) => {
      // index가 짝수면 왼쪽, 홀수면 오른쪽에 배치
      const side = index % 2 === 0 ? "left" : "right";

      // 날짜(또는 Day)별 컨테이너
      const dayWrapper = document.createElement("div");
      dayWrapper.style.position = "relative";
      dayWrapper.style.width = "50%";
      dayWrapper.style.padding = "10px 20px";
      dayWrapper.style.boxSizing = "border-box";
      dayWrapper.style.textAlign = "left"; //  side === "left" ? "right" :
      if (side === "left") {
        dayWrapper.style.left = "0";
      } else {
        dayWrapper.style.left = "50%";
      }

      // 타임라인 점(원)
      const circle = document.createElement("div");
      circle.style.position = "absolute";
      circle.style.top = "10px";
      // 왼쪽 배치 시 원을 오른쪽 끝, 오른쪽 배치 시 왼쪽 끝에 둠
      if (side === "left") {
        circle.style.right = "-9px";
      } else {
        circle.style.left = "-9px";
      }
      circle.style.width = "18px";
      circle.style.height = "18px";
      circle.style.backgroundColor = "black";
      circle.style.borderRadius = "50%";

      // Day(또는 날짜) 제목
      const heading = document.createElement("h5");
      heading.style.fontWeight = "bold";
      heading.textContent = `Day ${daySchedule.day}: ${daySchedule.title}`;

      // 일정 목록 HTML
      const scheduleItemsHTML = daySchedule.schedule
        .map((item) => {
          const addressText = item.address
            ? `<br><small>주소: ${item.address}</small>`
            : "";
          return `
            <p>
              <strong>${item.time} - ${item.activity} (${item.destination})</strong>
              <br><small>${item.description}</small>
              ${addressText}
            </p>
          `;
        })
        .join("");

      // 일정 목록을 담는 div
      const scheduleItemsContainer = document.createElement("div");
      scheduleItemsContainer.innerHTML = scheduleItemsHTML;

      // 타임라인 점과 제목, 일정 목록을 순서대로 배치
      dayWrapper.appendChild(circle);
      dayWrapper.appendChild(heading);
      dayWrapper.appendChild(scheduleItemsContainer);

      // 타임라인 컨테이너에 이 Day의 모든 내용 추가
      timelineContainer.appendChild(dayWrapper);
    });

    // 최종적으로 scheduleContainer에 타임라인 전체를 추가
    scheduleContainer.appendChild(timelineContainer);

    // 복사 버튼 이벤트 등록
    const copyButton = document.querySelector(".ai-schedule-copy-button");
    copyButton.addEventListener("click", () =>
      copyScheduleToClipboard(scheduleData)
    );
  }

  const scheduleData = await fetchSchedule();
  if (scheduleData) {
    renderSchedule(scheduleData);
  }
});
