onmessage = e => {
  const subRatios = determineSubRatios(e.data[0], e.data[1]);
  subRatios.sort(sortTuples);
  postMessage(subRatios);
}

/**
 * Determines all evenly proportional ratios below the provided ratio
 * @param {number} originalNum 
 * @param {number} originalDenom 
 */
function determineSubRatios(originalNum, originalDenom) {
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const thisGCD = gcd(originalNum, originalDenom);
  const GD = [originalNum / thisGCD, originalDenom / thisGCD];

  let thisNum = originalNum;
  let thisDenom = originalDenom;

  let i = 2;
  const ret = [];

  while (thisNum != GD[0] && thisDenom != GD[1]) {
    thisNum = originalNum / i;
    thisDenom = originalDenom / i;

    if (thisNum % 1 === 0 && thisDenom % 1 === 0) {
      ret.push([thisNum, thisDenom]);
    }
    i++;
  }

  for (const thisTuple of ret) {
    const maxMultiple = Math.floor(originalNum / thisTuple[0]) + 1;

    for (let i = 1; i < maxMultiple; i++) {
      const thisMultiple = [thisTuple[0] * i, thisTuple[1] * i];
      if (
        ret.find(value => (
          thisMultiple[0] == value[0] &&
          thisMultiple[1] == value[1]
        )) == undefined
      ) {
        ret.push(thisMultiple);
      }
    }
  }

  return ret;
}

/**
 * Determines all evenly proportional ratios above the provided ratio up to a given numerator
 * @param {number} targetNumerator 
 * @param {number} targetDenomenator 
 * @param {number} maxNumerator 
 */
function determineSuperRatios(targetNumerator, targetDenomenator, maxNumerator) {
  const originalNum = maxNumerator;
  const originalDenom = (maxNumerator / targetNumerator) * targetDenomenator;

  return determineSubRatios(originalNum, originalDenom);
}

function sortTuples(a, b) {
  if (a[0] < b[0]) {
    return -1;
  } else if (a[0] > b[0]) {
    return 1;
  }

  return 0;
}
