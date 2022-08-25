// 範圍: [min, max]
function randomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1))
}
// 範圍: [min, max)
function randomFloat(min, max) {
  return min + Math.random() * (max - min)
}
Array.prototype.randomItem = function() {
  return this[randomInt(0, this.length - 1)]
}
