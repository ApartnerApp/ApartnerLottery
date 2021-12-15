const app = new Vue({
  el: '#app',
  data: {
    openSnow: true,
    status: 'noData', // 上傳前: noData, 上傳後: hasData
    isShuffling: false,
    persons: [],
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
      resetNamePrompt()
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
      
      if (this.persons.length <= 0) {
        ev.target.value = null
        return
      }
      this.status = 'hasData'
    },
    toggleShuffling(value) {
      this.isShuffling = value
    },
    markWinner(winner) {
      // 設定面板標示已中獎
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
const prompt = Snap.select('#house .lottery .prompt')
const lotteryGroup = Snap.select('#house .lottery')
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
  app.toggleShuffling(true)
  // 移除OOO-OOO
  Snap.select('#house .lottery .name')?.remove()
  // 洗牌35次
  let currentPerson = null
  const candidates = app.$data.persons.filter(p => !p.isWinner)
  for (let i = 0; i < 35; i++) {
    const person = getRandomPerson(candidates, currentPerson?.id)
    const interval = mina.easeout(i) * 1.5
    
    popPerson(person.name, interval, function() {
      this.remove()
    })
    await new Promise(resolve => setTimeout(resolve, interval))
    currentPerson = person
  }
  //抽出最終得獎者
  const winner = getRandomPerson(candidates, currentPerson.id)
  endingFlash()
  popPerson(winner.name, mina.easeout(36) * 2, function() {
    app.markWinner(winner)
    app.toggleShuffling(false)
    resetThumb()
  })
}
// 取得和上次不一樣的人
function getRandomPerson(candidates, currentId) {
  let person = null
  do {
    person = candidates.randomItem()
  } while (person.id === currentId && candidates.length > 1)
  return person
}
function popPerson(name, interval, callback) {
  lotteryGroup.add(
    paper.text(1000, 750, name)
      .attr({ 'text-anchor': 'middle', 'transform-origin': '1000 700' })
      .addClass('name')
      .animate({ transform: 'scale(1.15)', opacity: 0.7 }, interval, mina.easein, callback)
  )
}
function endingFlash() {
  const flashBackground = document.getElementById('flash-background')
  flashBackground.animate([
    { backgroundColor: 'rgba(255,255,255,0.7)' },
    { backgroundColor: 'rgba(255,255,255,0)' }
  ], {
    duration: 2000,
    easing: 'ease-in'
  })
}
function resetNamePrompt() {
  Snap.select('#house .lottery .name')?.remove()
  lotteryGroup.add(prompt)
}
function resetThumb() {
  const candidates = app.$data.persons.filter(p => !p.isWinner)
  if (candidates.length > 0) {
    setThumb()
  }
}
function setThumb() {
  thumb.drag(dragMove, dragStart, dragEnd)
  thumb.removeClass('trigger')
}
setThumb()