const Vue = require('vue/dist/vue');
const electron = require('electron');

const app = new Vue({
  el: '#app',
  data: {
    // Current ratio values
    numerator: null,
    denominator: null,

    // State params
    loading: false,
    expanded: false,

    // Worker results
    subRatios: [],
    superRatios: []
  },
  computed: {
    readyToSubmit() {
      return this.numerator && this.denominator;
    }
  },
  methods: {
    handleInputClick: event => event.target.select(),

    // Ensure that only positive whole numbers can be used
    handleChangeNum() {
      this.numerator = this.numerator.replace(/-/g, '').split('.')[0]
    },
    handleChangeDen() {
      this.denominator = this.denominator.replace(/-/g, '').split('.')[0]
    },

    catchEnterKey(event) {
      if (event.keyCode === 13) this.submitRatio();
    },

    // Submit the current ratio data to the web worker and save the results
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

    /**
     * Sends a given ratio to the web worker to determine its sub ratios
     * @param {number} num 
     * @param {number} den 
     */
    calculateRatios(num, den) {
      return new Promise((resolve, reject) => {
        const myWorker = new Worker('./assets/scripts/worker.js');
        let terminated = false;
    
        myWorker.onmessage = e => {
          if (terminated) return;
          myWorker.terminate();
          resolve(e.data);
        };

        // Add a 5 second timeout to prevent hangs
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
