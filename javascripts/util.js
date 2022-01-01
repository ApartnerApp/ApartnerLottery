function randomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1))
}
Array.prototype.randomItem = function() {
  return this[randomInt(0, this.length - 1)]
}
