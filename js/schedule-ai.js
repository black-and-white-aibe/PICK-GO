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
  function copyAddressToClipboard(address) {
    navigator.clipboard.writeText(address).catch((err) => {
      console.error("주소 복사 실패:", err);
    });
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

    timelineContainer.appendChild(verticalLine);

    // 각 Day(일자)마다 타임라인의 노드(점)와 내용 카드 생성
    scheduleData.forEach((daySchedule, index) => {
      const side = index % 2 === 0 ? "left" : "right";

      // 날짜별 컨테이너
      const dayWrapper = document.createElement("div");
      dayWrapper.classList.add("timeline-item"); // 애니메이션 적용
      dayWrapper.style.position = "relative";
      dayWrapper.style.width = "50%";
      dayWrapper.style.padding = "10px 20px";
      dayWrapper.style.boxSizing = "border-box";
      dayWrapper.style.opacity = "0"; // 초기 상태
      dayWrapper.style.transform = "translateY(20px)"; // 초기 애니메이션 상태

      if (side === "left") {
        dayWrapper.style.left = "0";
      } else {
        dayWrapper.style.left = "50%";
      }

      // 타임라인 점(원)
      const circle = document.createElement("div");
      circle.classList.add("circle"); // 원 애니메이션 적용
      circle.style.position = "absolute";
      circle.style.top = "10px";
      circle.style.width = "18px";
      circle.style.height = "18px";
      circle.style.backgroundColor = "black";
      circle.style.borderRadius = "50%";
      circle.style.transform = "scale(0)"; // 초기 상태

      if (side === "left") {
        circle.style.right = "-9px";
      } else {
        circle.style.left = "-9px";
      }

      // Day 제목
      const heading = document.createElement("h5");
      heading.style.fontWeight = "bold";
      heading.textContent = `Day ${daySchedule.day}: ${daySchedule.title}`;

      // 일정 목록
      const scheduleItemsHTML = daySchedule.schedule
        .map((item) => {
          const addressText = item.address
            ? `<br><small>주소: ${item.address}</small><button class="copy-address-btn" data-address="${item.address}" 
                       style="margin-left: 5px; padding: 2px 6px; font-size: 10px; cursor: pointer;border-radius: 5px; border: 1px solid #ddd;
                 background-color: #f8f9fa; transition: background-color 0.3s;">
                       📋</button>`
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

      // 일정 목록 컨테이너
      const scheduleItemsContainer = document.createElement("div");
      scheduleItemsContainer.innerHTML = scheduleItemsHTML;

      // 요소 추가
      dayWrapper.appendChild(circle);
      dayWrapper.appendChild(heading);
      dayWrapper.appendChild(scheduleItemsContainer);
      timelineContainer.appendChild(dayWrapper);
    });

    scheduleContainer.appendChild(timelineContainer);

    // 일정 복사 버튼 이벤트 등록
    const copyButton = document.querySelector(".ai-schedule-copy-button");
    copyButton.addEventListener("click", () =>
      copyScheduleToClipboard(scheduleData)
    );

    // 🔹 버튼 클릭 시 스타일 변경 (복사 효과 강조)
    document.querySelectorAll(".copy-address-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        copyAddressToClipboard(this.dataset.address);

        // 🔹 복사 완료 스타일 변경
        this.innerHTML = "✅"; // 텍스트 변경

        // 2초 후 원래 상태로 복귀
        setTimeout(() => {
          this.innerHTML = "📋";
        }, 2000);
      });

      // 🔹 호버 효과 추가
      btn.addEventListener("mouseover", function () {
        this.style.backgroundColor = "#e2e6ea"; // 연한 회색
      });

      btn.addEventListener("mouseout", function () {
        this.style.backgroundColor = "#f8f9fa"; // 원래 색상 복귀
      });
    });
  }

  const scheduleData = await fetchSchedule();
  if (scheduleData) {
    renderSchedule(scheduleData);
  }
});
