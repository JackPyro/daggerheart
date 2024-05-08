const mapKeys = {
  HOPE: 'hope',
  FEAR: 'fear',
  ADV: 'advantage',
  DISADV: 'disadvantage',
  CRIT: 'crit',
}

const classMapping = {
  hope: 'die-hope',
  fear: 'die-fear',
  advantage: 'die-adv',
  disadvantage: 'die-disadv',
  crit: 'die-crit',
  default: 'duality-dice-msg',

}

const generateRollTemplate = (roll, type) => {
  const className = classMapping[type] ?? classMapping.default
  return `
    <div class="${className} duality-die-result-wrap">
      <label class="duality-die-result">${roll}</label>
    </div>
  `
}

/**
 * Create HTML of dice details (row of any d12's rolled and their result)
 * @param {int} hopeResult - result of currently selected hope die
 * @param {int} fearResult - result of fear die
 * @param {int} advantageResult - result of advantage / disadvantage die
 * @param {boolean} isAdvantage - did we roll with advantage?
 * @param {boolean} isDisadvantage - did we roll with disadvantage?
 * @returns {String} - HTML strig of every Duality die with css in a row flexbox
 */
function getDieDetails (
  hopeResult, fearResult, advantageResult, isAdvantage, isDisadvantage) {
  console.log(hopeResult, fearResult, advantageResult, isAdvantage, isDisadvantage)

  /* Create the html string */
  let htmlString = `<div class="duality-dice-msg-container">`
  if (hopeResult === fearResult) {
    htmlString += generateRollTemplate(hopeResult, mapKeys.CRIT) +
      generateRollTemplate(fearResult, mapKeys.CRIT)
  } else {
    htmlString += generateRollTemplate(hopeResult, mapKeys.HOPE) +
      generateRollTemplate(fearResult, mapKeys.FEAR)
  }

  if (isAdvantage) {
    htmlString += generateRollTemplate(advantageResult, mapKeys.ADV)
  }

  if (isDisadvantage) {
    htmlString += generateRollTemplate(advantageResult, mapKeys.DISADV)
  }

  htmlString += `</div>`

  return htmlString
}

export default getDieDetails;