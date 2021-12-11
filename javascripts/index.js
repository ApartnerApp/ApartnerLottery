const app = new Vue({
  el: '#app',
  data: {
    openSnow: true,
    persons: ['王小明1','王小明2','王小明3'],
    stick_X: null,
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
      for (const key in sheets) {
        if (key.startsWith('!')) {
          continue
        }
        const person = sheets[key].w.trim()
        if (person === '') {
          continue
        }
        this.persons.push(person)
      }
    },
    dragStart(ev) {
      console.log('down')
      // const stick = ev.target
      // window.onmousemove = function(e) {
      //   this.stick_X = e.clientX
      // }
      // window.onmouseup = () => window.onmousemove = null
    },
    draging(ev) {
      
    },
    dragEnd(ev) {
      
    },
  },
  created() {
    if (localStorage.getItem('snowSwitch') === 'false') {
      this.openSnow = false
    }
  }
})

const houseHeight = document.getElementById('house').getBoundingClientRect().height
const snap = Snap('#house')
const thumb = Snap.select('#house .slider .thumb')
let thumbAdjustX, thumbAdjustY
thumb.drag(function(dx, dy, x, y, ev) {
  this.attr({ y: (y * 1000 / 960 - thumbAdjustY) })
}, function(x, y, ev) {
  thumbAdjustY = y * 1000 / 960 - this.attr('y')
}, function() {
  
})