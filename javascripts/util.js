function randomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1))
}
Array.prototype.randomItem = function() {
  return this[randomInt(0, this.length - 1)]
}
Array.prototype.shuffle = function() {
  if (this.length < 1) return
  
  for (let i = this.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [this[i], this[j]] = [this[j], this[i]];
  }
  return this
}