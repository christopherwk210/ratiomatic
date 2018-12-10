const Vue = require('vue/dist/vue');
const electron = require('electron');

const app = new Vue({
  el: '#app',
  data: {
    numerator: null,
    denominator: null,
    loading: false,
    subRatios: [],
    expanded: false
  },
  computed: {
    readyToSubmit() {
      return this.numerator && this.denominator;
    }
  },
  methods: {
    handleInputClick: event => event.target.select(),
    handleChangeNum() {
      this.numerator = this.numerator.replace(/-/g, '').split('.')[0]
    },
    handleChangeDen() {
      this.denominator = this.denominator.replace(/-/g, '').split('.')[0]
    },
    submitRatio: async function() {
      if (!this.readyToSubmit || this.loading) return;
      this.loading = true;
      const result = await this.calculateRatios(this.numerator, this.denominator);
      this.loading = false;

      if (result !== 'timeout') {
        this.subRatios = result;
      } else {
        // show timeout message
        return;
      }

      this.expandWindow();
      console.log(this.subRatios);
    },
    expandWindow() {
      if (this.expanded) return;
      this.expanded = true;

      electron.remote.getCurrentWindow().setSize(450, 450);
    },
    calculateRatios(num, den) {
      return new Promise((resolve, reject) => {
        const myWorker = new Worker('./assets/scripts/worker.js');
        let terminated = false;
    
        myWorker.onmessage = e => {
          if (terminated) return;
          myWorker.terminate();
          resolve(e.data);
        };

        setTimeout(() => {
          terminated = true;
          myWorker.terminate();
          resolve('timeout');
        }, 5000);
    
        myWorker.postMessage([num, den]);
      });
    }
  }
});
