const inputXlsx = document.querySelector('input#xlsx')
inputXlsx.addEventListener('change', async function(e) {
  const file = e.target.files[0]
  const data = await file.arrayBuffer()
  const workbook = XLSX.read(data)
  const sheets = workbook.Sheets[Object.keys(workbook.Sheets)[0]]
  const persons = []
  
  for (const key in sheets) {
    if (key.startsWith('!')) {
      continue
    }
    persons.push(sheets[key])
  }
})

const App = {
  data() {
    return {
      openSnow: true,
      stick_X: null,
    }
  },
  methods: {
    toggleSnow(ev) {
      this.openSnow = ev.target.checked
      localStorage.setItem('snowSwitch', ev.target.checked)
    },
    dragStart(ev) {
      console.log('down')
      const stick = ev.target
      window.onmousemove = function(e) {
        this.stick_X = e.clientX
        // console.log(e.clientX, e.clientY)
      }
      window.onmouseup = () => window.onmousemove = null
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
}
Vue.createApp(App).mount('#app')