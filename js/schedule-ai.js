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
    const scheduleContainer = document.querySelector(
      ".ai-schedule-scroll-area"
    );
    scheduleContainer.innerHTML = "";

    if (!scheduleData || scheduleData.length === 0) {
      scheduleContainer.innerHTML = "<p>일정이 없습니다.</p>";
      return;
    }

    // 전체 타임라인을 감싸는 컨테이너
    const timelineContainer = document.createElement("div");
    timelineContainer.classList.add("timeline-container");

    // 중앙 세로 라인
    const verticalLine = document.createElement("div");
    verticalLine.classList.add("vertical-line");
    timelineContainer.appendChild(verticalLine);

    // 각 Day(일자)마다 타임라인의 노드(점)와 내용 카드 생성
    scheduleData.forEach((daySchedule, index) => {
      const side = index % 2 === 0 ? "left" : "right";

      // 날짜별 컨테이너
      const dayWrapper = document.createElement("div");
      dayWrapper.classList.add("timeline-item");

      if (side === "left") {
        dayWrapper.style.left = "0";
      } else {
        dayWrapper.style.left = "50%";
      }

      // 타임라인 점(원)
      const circle = document.createElement("div");
      circle.classList.add("circle");

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
              <strong><small>${item.time} - ${item.activity} (${item.destination})</small></strong>
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

    // 스크롤 이벤트에 따른 포커스 효과
    function updateFocus() {
      const timelineItems =
        scheduleContainer.querySelectorAll(".timeline-item");
      const containerRect = scheduleContainer.getBoundingClientRect();
      const containerCenter = containerRect.top + containerRect.height / 2;

      timelineItems.forEach((item) => {
        const rect = item.getBoundingClientRect();
        const itemCenter = rect.top + rect.height / 2;
        const distanceFromCenter = Math.abs(containerCenter - itemCenter);

        // 중앙에서의 거리에 따라 클래스 적용
        console.log(distanceFromCenter);
        if (distanceFromCenter < 300) {
          item.classList.add("focus");
          item.classList.remove("semi-focus");
        } else if (distanceFromCenter < 450) {
          item.classList.add("semi-focus");
          item.classList.remove("focus");
        } else {
          item.classList.remove("focus", "semi-focus");
        }
      });
    }

    // 스크롤 영역에 대한 이벤트 리스너 등록
    scheduleContainer.addEventListener("scroll", updateFocus);
    // 초기 포커스 상태 설정
    updateFocus();

    // 일정 복사 버튼 이벤트 등록
    const copyButton = document.querySelector(".ai-schedule-copy-button");
    if (copyButton) {
      copyButton.addEventListener("click", () =>
        copyScheduleToClipboard(scheduleData)
      );
    }

    // 주소 복사 버튼 이벤트
    scheduleContainer.querySelectorAll(".copy-address-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        copyAddressToClipboard(this.dataset.address);
        this.innerHTML = "✅";
        setTimeout(() => {
          this.innerHTML = "📋";
        }, 2000);
      });
      btn.addEventListener("mouseover", function () {
        this.style.backgroundColor = "#e2e6ea";
      });
      btn.addEventListener("mouseout", function () {
        this.style.backgroundColor = "#f8f9fa";
      });
    });

    // 컴포넌트가 제거될 때 스크롤 이벤트 리스너 제거
    return () => {
      scheduleContainer.removeEventListener("scroll", updateFocus);
    };
  }

  const scheduleData = await fetchSchedule();
  if (scheduleData) {
    renderSchedule(scheduleData);
  }
});
