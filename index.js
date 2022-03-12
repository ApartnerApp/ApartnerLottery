const container = document.querySelector('.fireworks-container')
const fireworks = new Fireworks(container, {
  "hue": {
    "min": 0,
    "max": 345
  },
  "delay": {
    "min": 30,
    "max": 50
  },
  "rocketsPoint": 50,
  "opacity": 0.5,
  "acceleration": 1.02,
  "friction": 0.975,
  "gravity": 1.5,
  "particles": 120,
  "trace": 1,
  "traceSpeed": 1,
  "explosion": 6,
  "intensity": 40,
  "flickering": 20,
  "lineStyle": "round",
  "lineWidth": {
    "explosion": {
      "min": 1,
      "max": 4
    },
    "trace": {
      "min": 0.1,
      "max": 1
    }
  },
  "brightness": {
    "min": 50,
    "max": 80,
    "decay": {
      "min": 0.002,
      "max": 0.003
    }
  },
  // "boundaries": {
  //   "x": 50,
  //   "y": 50,
  //   "width": 1920,
  //   "height": 951,
  //   "visible": false
  // },
})

setTimeout(() => {
  fireworks.start()
}, 15000)
