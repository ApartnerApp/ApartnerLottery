const THEME = {
  WINTER: 'WINTER',
  SUMMER: 'SUMMER',
  BEACH: 'BEACH',
}
const app = new Vue({
  el: '#app',
  data: {
    mainTitle: '',
    subTitle: '',
    awardTitle: '',
    lineLength: 920,
    lineStart: 540,
    lineEnd: 1460,
    theme: THEME.WINTER,
    effect: {
      snow: true,
      firefly: true,
      cloud: true,
    },
    fireflyCount: 30,
    status: 0, // 上傳前: 0, 上傳後: 1, 洗牌中: 2, 出現得獎者:3
    banning: false,
    persons: [],
    round: 1,
    cloudBox: null,
    cloudInitRight: ['80%', '55%', '30%', '5%'],
  },
  methods: {
    toggleTheme(themeName) {
      localStorage.setItem('theme', themeName)
      this.clearCloud()
      this.initTheme()
    },
    toggleEffect(ev, effectName) {
      this.effect[effectName] = ev.target.checked
      localStorage.setItem('effect', JSON.stringify(this.effect))
    },
    initTheme() {
      switch (this.theme) {
        case THEME.BEACH:
          if (this.effect.cloud) {
            this.resetCloud()
          }
          break
        default:
          break
      }
    },
    resetCloud() {
      for (let i = 0; i < 4; i++) {
        this.addCloud(this.cloudInitRight[i])
      }
      this.addCloud()
      this.nextCloud()
    },
    clearCloud() {
      clearInterval(this.cloudTimeout)
      this.cloudBox.innerHTML = ''
    },
    addCloud(startRight = '100%') {
      const temp = document.getElementById('template-cloud')
      const scale = randomFloat(3, 6)
      const top = randomFloat(15, 55)
      const speed = 1 // 速度 = 1% / 秒
      const duration = (parseInt(startRight) + 100) / speed * 1000 // 時長 = 距離 / 速度
      const cloud = temp.content.cloneNode(true).childNodes[1]
      this.cloudBox.appendChild(cloud)
      cloud.style.top = `${top}%`
      cloud.style.transform = `scale(${scale})`
      cloud.animate([{
        right: startRight,
      }, {
        right: '-100%',
      }], {
        duration,
        iterations: 1,
        easing: 'linear', 
      }).onfinish = function() {
        this.effect.target.remove()
      }
    },
    nextCloud() {
      this.cloudTimeout = setTimeout(() => {
        this.addCloud()
        this.nextCloud()
      }, randomFloat(15000, 25000))
    },
    setStatus(status) {
      this.status = status
    },
    openUploadWindow() {
      this.$refs.xlsx.click()
    },
    resetBoard() {
      this.banning = false
    },
    toggleBanPersons() {
      this.banning = !this.banning
    },
    banPersons (person) {
      if (person.ban) {
        person.ban = false
      } else {
        person.ban = true
      }
      resetThumb()
    },
    clearPersons() {
      this.persons = []
      this.status = 0
      this.banning = false
      this.round = 1
    },
    async uploadXlsx(ev) {
      this.persons = []
      const file = ev.target.files[0]
      // 限制上傳xlsx
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
        this.persons.push({ id: i++, name, isWinner: false, ban: false })
      }
      
      if (this.persons.length <= 0) {
        ev.target.value = null
        return
      }
      resetThumb()
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
      const person = this.persons.find(p => p.id === winnerId)
      person.isWinner = true
      person.winRound = this.round
    }
  },
  computed: {
    winners() {
      return this.persons.filter(p => p.isWinner)
        .sort((p1, p2) => p1.winRound - p2.winRound)
    },
    losers() {
      return this.persons.filter(p => !p.isWinner)
    },
  },
  watch: {
    'effect.cloud'() {
      if (this.effect.cloud) {
        this.initTheme()
      } else {
        this.clearCloud()
      }
    }
  },
  created() {
    const theme = localStorage.getItem('theme')
    if (theme) {
      this.theme = theme
    }
    const effect = JSON.parse(localStorage.getItem('effect'))
    if (effect !== null) {
      this.effect = effect
    }
    const mainTitle = localStorage.getItem('mainTitle')
    if (mainTitle) {
      this.mainTitle = mainTitle
    }
    const subTitle = localStorage.getItem('subTitle')
    if (subTitle) {
      this.subTitle = subTitle
    }
    const awardTitle = localStorage.getItem('awardTitle')
    if (awardTitle) {
      this.awardTitle = awardTitle
    }
  },
  mounted() {
    this.cloudBox = this.$el.querySelector('#cloud-box')
    this.initTheme()
  }
})

const paper = Snap('#house')
const thumb = Snap.select('#house .lottery .thumb')
const prompt = Snap.select('#house .lottery .prompt')
const lotteryGroup = Snap.select('#house .lottery')
const houseHeight = document.getElementById('house').getBoundingClientRect().height

let thumbAdjustY
const thumbInitY = +thumb.attr('y')
const thumbMinY = +thumb.attr('y')
const thumbMaxY = 890
const critical = (thumbMaxY - thumbMinY) * 0.9 + thumbMinY

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
  const candidates = app.persons.filter(p => !p.isWinner)
  for (let i = 0; i < 35; i++) {
    const person = getRandomPerson(candidates, currentPerson?.id)
    const interval = mina.easeout(i) * 1.5
    
    popPerson(person, interval)
    await new Promise(resolve => setTimeout(resolve, interval))
    currentPerson = person
  }
  // 抽出最終得獎者
  const candidatesFinal = candidates.filter(p => !p.ban)
  const winner = getRandomPerson(candidatesFinal, currentPerson.id)
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
  const flashBackground = document.getElementById('flash-screen')
  flashBackground.animate([
    { backgroundColor: 'rgba(255,255,255,0.7)' },
    { backgroundColor: 'rgba(255,255,255,0)' }
  ], {
    duration: 2000,
    easing: 'ease-in'
  })
}
function resetAll() {
  this.unclick(resetAll) // 避免重複點擊
  this.animate({ opacity: 0 }, 800, mina.linear, function() {
    app.setStatus(1)
    app.round += 1
    this.remove()
    resetThumb()
  })
}
function resetThumb() {
  const candidates = app.persons.filter(p => !p.isWinner && !p.ban)
  if (candidates.length > 0) {
    thumbOn()
  } else {
    thumbOff()
  }
}
function thumbOn() {
  thumb.drag(dragMove, dragStart, dragEnd)
  thumb.removeClass('trigger')
}
function thumbOff() {
  thumb.undrag()
  thumb.addClass('trigger')
}
