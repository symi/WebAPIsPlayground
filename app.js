  if (!Array.prototype.last) {
    Array.prototype.last = function() {
      return this[this.length - 1];
  }
  // Artifical loading for a bit to make sure the gyro loads the data first
  setTimeout(function() {
    document.getElementById("body").style.display = 'block'
  }, 500)
  var historicMotion = {
    "x": [],
    "y": [],
    "z": []
  }
  var historicOrientation = {
    "x": [],
    "y": [],
    "z": []
  }
  function setStatus(status) {
    document.getElementById("result").textContent = status
  }
  function updateStatus() {
    let movement = mostRecentMovementOverall(75)
    document.getElementById("motionOveral").textContent = movement.toFixed(2)
    // Below some stupid, very basic code to guess what the user is doing
    // As described in the README, this is just a proof of concept
    if (mostRecentMovementOverall(4000) > 40) { // TODO: haven't tested this, 1,000 so it's a longer time
      setStatus("driving or other form of transportation")
    } else if (historicOrientation["z"].last() > 70 || historicOrientation["z"].last() < -70) {
      setStatus("lying in bed sideways, or taking a landscape picture")
    } else if (historicOrientation["y"].last() > 160 || historicOrientation["y"].last() < -160) {
      setStatus("lying on your back, with your phone up")
    } else if (historicOrientation["y"].last() >= 30 && historicOrientation["y"].last() < 70) {
      if (movement > 18) {
        setStatus("using your phone while walking")
      } else {
        setStatus("using your phone, sitting or standing")
      }
    } else if (historicOrientation["y"].last() >= 70 && historicOrientation["y"].last() < 95) {
      if (movement > 18) {
        setStatus("using your phone while walking")
      } else {
        setStatus("taking a picture")
      }
    } else if (historicOrientation["y"].last() >= 95 && historicOrientation["y"].last() < 120) {
      setStatus("taking a selfie")
    } else if (Math.round(historicOrientation["z"].last()) == 0 && Math.round(historicOrientation["y"].last()) == 0) {
      setStatus("using the phone on a table")
    } else {
      if (movement > 18) {
        setStatus("using your phone while walking")
      } else {
        setStatus("using your phone, sitting or standing")
      }
    }
  }
  function mostRecentMovementOverall(numberOfHistoricPoints) {
    return (mostRecentMovement(historicMotion["x"], numberOfHistoricPoints, true) + 
            mostRecentMovement(historicMotion["y"], numberOfHistoricPoints, true) + 
            mostRecentMovement(historicMotion["z"], numberOfHistoricPoints, true)) / 3.0
  }
  // numberOfHistoricPoints: 100 is about 3 seconds
  function mostRecentMovement(array, numberOfHistoricPoints, removeNegatives) {
    if (array.length > numberOfHistoricPoints) {
      totalSum = 0
      for (var toCount = 0; toCount < numberOfHistoricPoints; toCount++) {
        currentElement = array[array.length - toCount - 1]
        currentElement *= (1 - toCount / numberOfHistoricPoints) // weight the most recent data more
        if (currentElement < 0 && removeNegatives) currentElement = currentElement * -1 
        if (currentElement > 0.1 || currentElement < -0.1) totalSum += currentElement
      }
      return totalSum * 100 / numberOfHistoricPoints
    }
    return 0 // not enough data yet
  }  
  var isMobile = navigator.userAgent.match(/(iPhone|iPod|iPad|Android)/); 
  if (isMobile != null) {
    window.addEventListener("devicemotion", motion, false);
    function motion(event) {
      document.getElementById("motionX").textContent = (mostRecentMovement(historicMotion["x"], 150, false)).toFixed(2)
      document.getElementById("motionY").textContent = (mostRecentMovement(historicMotion["y"], 150, false)).toFixed(2)
      document.getElementById("motionZ").textContent = (mostRecentMovement(historicMotion["z"], 150, false)).toFixed(2)
      historicMotion["x"].push(event.acceleration.x)
      historicMotion["y"].push(event.acceleration.y)
      historicMotion["z"].push(event.acceleration.z)
    }
    window.addEventListener("deviceorientation", orientation, false);
    function orientation(event) {
      document.getElementById("orientationX").textContent = Math.round(event.alpha)
      document.getElementById("orientationY").textContent = Math.round(event.beta)
      document.getElementById("orientationZ").textContent = Math.round(event.gamma)
      historicOrientation["x"].push(event.alpha)
      historicOrientation["y"].push(event.beta)
      historicOrientation["z"].push(event.gamma)
    }
    setInterval(updateStatus, 100)
  } else {
    setStatus("Please open this site on your smartphone")
    document.getElementById("chances").style.display = 'none';
  }
};
