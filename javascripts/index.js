const app = new Vue({
  el: '#app',
  data: {
    mainTitle: '12月份滿意度調查抽獎',
    subTitle: '半伴共居公寓',
    awardTitle: '租金優惠$1000',
    lineLength: 920,
    lineStart: 540,
    lineEnd: 1460,
    openSnow: true,
    status: 0, // 上傳前: 0, 上傳後: 1, 洗牌中: 2, 出現得獎者:3
    persons: [],
  },
  methods: {
    toggleSnow(ev) {
      this.openSnow = ev.target.checked
      localStorage.setItem('snowSwitch', ev.target.checked)
    },
    setStatus(status) {
      this.status = status
    },
    openUploadWindow() {
      this.$refs.xlsx.click()
    },
    clearPersons() {
      this.persons = []
      this.status = 0
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
      this.status = 1
    },
    saveTitle(key, text) {
      localStorage.setItem(key, text)
    },
    blurInput(ev) {
      ev.target.blur()
    },
    markWinner(winnerId) {
      // 設定面板標示已中獎
      const winnerInSetting = this.persons.find(p => p.id === winnerId)
      winnerInSetting.isWinner = true
    }
  },
  created() {
    if (localStorage.getItem('snowSwitch') === 'false') {
      this.openSnow = false
    }
    const mainTitle = localStorage.getItem('mainTitle')
    if (mainTitle) {
      this.mainTitle = mainTitle
    }
    const subTitle = localStorage.getItem('subTitle')
    if (localStorage.getItem('subTitle')) {
      this.subTitle = subTitle
    }
    const awardTitle = localStorage.getItem('awardTitle')
    if (localStorage.getItem('awardTitle')) {
      this.awardTitle = awardTitle
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
      thumbMaxY = 890,
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
  app.setStatus(2)
  // 洗牌35次
  let currentPerson = null
  const candidates = app.$data.persons.filter(p => !p.isWinner)
  for (let i = 0; i < 35; i++) {
    const person = getRandomPerson(candidates, currentPerson?.id)
    const interval = mina.easeout(i) * 1.5
    
    popPerson(person, interval)
    await new Promise(resolve => setTimeout(resolve, interval))
    currentPerson = person
  }
  //抽出最終得獎者
  const winner = getRandomPerson(candidates, currentPerson.id)
  endingFlash()
  app.setStatus(3)
  popWinner(winner, mina.easeout(36) * 2)
}
// 取得和上次不一樣的人
function getRandomPerson(candidates, currentId) {
  let person = null
  do {
    person = candidates.randomItem()
  } while (person.id === currentId && candidates.length > 1)
  return person
}
function popPerson(person, interval) {
  lotteryGroup.add(
    paper.text(1000, 820, person.name)
      .attr({ 'text-anchor': 'middle', transform: 'scale(0.9)', 'transform-origin': '1000 770' })
      .addClass('name')
      .animate({ transform: 'scale(1.1)', opacity: 0.6 }, interval, mina.easein, function() {
        this.remove()
      })
  )
}
function popWinner(winner, interval) {
  lotteryGroup.add(
    paper.text(1000, 820, winner.name)
      .attr({ 'text-anchor': 'middle', transform: 'scale(0.9)', 'transform-origin': '1000 770' })
      .addClass('name')
      .animate({ transform: 'scale(1.6)', opacity: 1 }, interval, mina.easein, function() {
        app.markWinner(winner.id)
        this.addClass('winner')
        this.click(resetAll)
      })
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
function resetAll() {
  this.animate({ opacity: 0 }, 800, mina.linear, function() {
    app.setStatus(1)
    this.remove()
    resetThumb()
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
