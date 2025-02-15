document.addEventListener("DOMContentLoaded", async function () {
  const scheduleContainer = document.querySelector(".ai-schedule-scroll-area");
  scheduleContainer.innerHTML = `
      <div class="loading-spinner" style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 55vh;">
      <div class="spinner-border" style="color: #000000;" role="status"></div>
      <p style="margin-top: 10px; color: #000000;">일정 생성 중...</p>
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

  function renderSchedule(scheduleData) {
    scheduleContainer.innerHTML = ""; // 기존 일정 제거

    if (!scheduleData || scheduleData.length === 0) {
      scheduleContainer.innerHTML = "<p>일정이 없습니다.</p>";
      return;
    }

    scheduleData.forEach((daySchedule) => {
      const dayCard = document.createElement("div");
      dayCard.classList.add("ai-schedule-card");
      if (typeof daySchedule.schedule.address);
      const cardContent = `
          <div class="card">
            <div class="card-body">
              <h5 class="fw-bold">Day ${daySchedule.day}: ${
        daySchedule.title
      }</h5>
              ${daySchedule.schedule
                .map((item) => {
                  let addressText = item.address
                    ? `<br><small>주소: ${item.address}</small>`
                    : "";
                  return `
                      <p>
                        <strong>${item.time}</strong> - ${item.activity} (${item.destination})
                        <br><small>${item.description}</small>
                        ${addressText}
                      </p>
                    `;
                })
                .join("")}
            </div>
          </div>
        `;

      dayCard.innerHTML = cardContent;
      scheduleContainer.appendChild(dayCard);
    });
  }

  const scheduleData = await fetchSchedule();
  renderSchedule(scheduleData);
});
