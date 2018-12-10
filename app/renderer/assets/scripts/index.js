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
    superRatios: [],

    // Proportional values
    propNum: null,
    propDen: null
  },
  computed: {
    readyToSubmit() {
      return this.numerator && this.denominator;
    }
  },
  methods: {
    reset() {
      this.contractWindow();

      this.numerator = null;
      this.denominator = null;

      this.expanded = false;
      this.loading = false;

      this.subRatios = [];
      this.superRatios = [];

      this.propNum = null;
      this.propDen = null;
    },

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
        this.subRatios = result.reverse();
      } else {
        // show timeout message
        return;
      }

      this.expandWindow();
    },

    expandWindow() {
      if (this.expanded) return;
      this.expanded = true;

      electron.remote.getCurrentWindow().setSize(450, 450);
    },

    contractWindow() {
      electron.remote.getCurrentWindow().setSize(450, 150);
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
    },

    handleRatioSelect(event) {
      const newProp = event.target.value.split(':');

      this.propNum = newProp[0];
      this.propDen = newProp[1];
    },

    handlePropNumInput() {
      const crossDivide = this.propNum * this.denominator;
      this.propDen = crossDivide / this.numerator;
    },
    handlePropDenInput() {
      const crossDivide = this.propDen * this.numerator;
      this.propNum = crossDivide / this.denominator;
    }
  }
});
