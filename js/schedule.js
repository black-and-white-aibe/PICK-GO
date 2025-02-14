document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelector(".ai-schedule-copy-button")
    .addEventListener("click", function () {
      // 버튼 클릭 시 복사 작업 (실제 복사 기능을 구현하고 싶다면 추가)

      // Toast 생성 및 표시
      var toastEl = document.getElementById("copyToast");
      var toast = new bootstrap.Toast(toastEl);
      toast.show();
    });
});
