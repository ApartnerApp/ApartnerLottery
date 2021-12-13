const app = new Vue({
  el: '#app',
  data: {
    openSnow: true,
    status: 'hasData', // 上傳前: noData, 上傳後: hasData, 顯示結果: showResult
    persons: [
      { id: 0, name: '王小明0', isWinner: false },
      { id: 1, name: '王小明1', isWinner: false },
      { id: 2, name: '王小明2', isWinner: false },
      { id: 3, name: '王小明3', isWinner: false },
      { id: 4, name: '王小明4', isWinner: false },
      { id: 5, name: '王小明5', isWinner: false },
      { id: 6, name: '王小明6', isWinner: false },
      { id: 7, name: '王小明7', isWinner: false },
      { id: 8, name: '王小明8', isWinner: false },
      { id: 9, name: '王小明9', isWinner: false },
      // { id: 10, name: '王小明10' },
    ],
  },
  methods: {
    toggleSnow(ev) {
      this.openSnow = ev.target.checked
      localStorage.setItem('snowSwitch', ev.target.checked)
    },
    openUploadWindow() {
      this.$refs.xlsx.click()
    },
    clearPersons() {
      this.persons = []
      this.status = 'noData'
    },
    async uploadXlsx(ev) {
      this.persons = []
      const file = ev.target.files[0]
      //限制上傳xlsx
      if (!file.name.endsWith('.xlsx')) {
        ev.target.value = null
        return
      }
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const sheets = workbook.Sheets[Object.keys(workbook.Sheets)[0]]
      let i = 0
      this.status = 'hasData'
      
      for (const key in sheets) {
        if (key.startsWith('!')) {
          continue
        }
        const name = sheets[key].w.trim()
        if (name === '') {
          continue
        }
        this.persons.push({ id: i++, name, isWinner: false })
      }
    },
    markWinner(winner) {
      // this.status = 'showResult'
      //設定面板標示已中獎
      const winnerInSetting = this.persons.find(p => p.id === winner.id)
      winnerInSetting.isWinner = true
      
    }
  },
  created() {
    if (localStorage.getItem('snowSwitch') === 'false') {
      this.openSnow = false
    }
  }
})

const paper = Snap('#house')
const thumb = Snap.select('#house .lottery .thumb')
const lotteryGroup = Snap.select('#house .lottery')
const winnerName = Snap.select('#house .result .winner')
const houseHeight = document.getElementById('house').getBoundingClientRect().height

let thumbAdjustY;
const thumbInitY = +thumb.attr('y'),
      thumbMinY = +thumb.attr('y'),
      thumbMaxY = 830,
      critical = (thumbMaxY - thumbMinY) * 0.9 + thumbMinY

function dragMove(_dx, _dy, _x, y, _ev) {
  let currentY = (y * 1000 / houseHeight - thumbAdjustY)
  if (currentY < thumbMinY) {
    currentY = thumbMinY
  } else if (currentY > thumbMaxY) {
    currentY = thumbMaxY
  }
  if (currentY > critical) {
    this.addClass('trigger')
  } else {
    this.removeClass('trigger')
  }
  this.attr({ y: currentY })
}
function dragStart(_x, y, _ev) {
  thumbAdjustY = y * 1000 / houseHeight - this.attr('y')
}
function dragEnd(ev) {
  const currentY = +this.attr('y')
  const isRun = currentY > critical
  if (isRun) {
    this.undrag()
  }
  thumbRollback(this, isRun)
}
function thumbRollback(thumb, isRun) {
  thumb.animate({ y: thumbInitY }, 50, mina.easeinout, isRun ? runShuffle : null)
}
async function runShuffle() {
  Snap.select('#house .lottery .name').remove()
  
  let currentPerson = null
  for (let i = 0; i < 36; i++) {
    const person = getRandomPerson(app.$data.persons, currentPerson?.id)
    const interval = mina.easeout(i) * 1.5
    const name = await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(person.name)
      }, interval)
    })
    const personName = paper.text(1000, 750, name)
      .attr({ 'text-anchor': 'middle', 'transform-origin': '1000 700' })
      .addClass('name')
    personName.animate({ transform: 'scale(1.1)', opacity: '0.7' }, interval, mina.easein, function() {
      this.remove()
    })
    lotteryGroup.add(personName)
    currentPerson = person
  }
  app.markWinner(currentPerson)
  showWinner(currentPerson)
}
function getRandomPerson(persons, currentId) {
  let person = null
  do {
    person = persons.randomItem()
  } while (person.id === currentId)
  return person
}
function showWinner(params) {
  
}

thumb.drag(dragMove, dragStart, dragEnd)