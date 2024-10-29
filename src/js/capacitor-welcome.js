
let isLottieActive = false;
let startBtn = document.getElementById("start-earing");
let lottieContainerIcon = document.getElementById('lottie');


var animation = lottie.loadAnimation({
  container: lottieContainerIcon, 
  path: './assets/lotties/antenna.json',
  renderer: 'canvas', 
  loop: true, 
  autoplay: isLottieActive, 
});



startBtn.addEventListener("click", startEaring);


function startEaring(){
  isLottieActive = !isLottieActive;
  startBtn.innerHTML = isLottieActive ? "Stop<br>Earing" : "Start<br>Earing";   
  animation.play();
  if (!isLottieActive) animation.stop()
}