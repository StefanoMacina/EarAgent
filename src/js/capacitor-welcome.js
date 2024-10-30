let isLottieActive = false;
const startBtn = document.getElementById("start-earing");
const lottieContainerIcon = document.getElementById('lottie');
const sideToggle = document.getElementById("sidebar-toggle");
const sidebar = document.getElementById("sidebar");

var animation = lottie.loadAnimation({
  container: lottieContainerIcon, 
  path: './assets/lotties/antenna.json',
  renderer: 'canvas', 
  loop: true, 
  autoplay: isLottieActive, 
});

startBtn.addEventListener("click", startEaring);
sideToggle.addEventListener("click", openSidebar);

function startEaring(){
  isLottieActive = !isLottieActive;
  startBtn.innerHTML = isLottieActive ? "Stop<br>Earing" : "Start<br>Earing";   
  
  if (isLottieActive) {
    animation.play();
  } else {
    animation.stop();
  }
}

function openSidebar(){

  if (sidebar.classList.contains('closed-sidebar')) {
    sideToggle.style.left = '40%'
    sideToggle.style.transform = 'rotateY(180deg)';
    sidebar.classList.remove('closed-sidebar');
    sidebar.classList.add('open-sidebar');
  } else {
    sideToggle.style.left = '0.5rem';
    sideToggle.style.transform = 'rotateY(0deg)';
    sidebar.classList.remove('open-sidebar');
    sidebar.classList.add('closed-sidebar');
  }
}
