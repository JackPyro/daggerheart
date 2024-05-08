// Dice colors
import DieDetails from './html/die-details.js'
import DualityDieDialogForm from './html/duality-die-dialog-form.js'
import {hopeColor, fearColor} from './dies.js'

const template =
  (
    roll,
    {
      isCrit,
      isHope,
      isFear,
      prefix,
      diceDetailsHTML,
    }) => {


    return `
  
  <div class="dice-roll">
      <div class="dice-result">
          <div class="daggerheart-roll-result">
            <div class="daggerheart-roll-header">
             <div class="action-type">
              ${prefix ? prefix : 'Ability Roll'} 
              ${roll.data.mod >= 0 ? '+' : '-'}${
      roll.data.mod ? roll.data.mod : ''
    }
             </div>
             <div class='winner'>
              ${isCrit ? `WITH CRIT` : ''}
              ${isHope ? `WITH HOPE` : ''}
              ${isFear ? `WITH FEAR` : ''}
            </div>
            </div>
           
            <div class="daggerheart-dice-roll">
              ${
      /**  <div class="normal-dice-roll hope-roll"> ${hopeResult}</div>**/ ''
    }
              <div class="normal-dice-roll total-roll">${roll._total}</div>
              ${
      /** <div class="normal-dice-roll fear-roll">${fearResult}</div> **/ ''
    }
            </div>
          
      
          </div>
          <div class="show-result">Details</div>
          <div class="dice-tooltip" style="display:none;">
              <section class="tooltip-part">
                  <div class="dice">
                      <header class="part-header flexrow">
                          <span class="part-formula">${roll._formula}</span>
                      </header>
                      ${diceDetailsHTML}
                      <hr>
                  </div>
              </section>
          </div>
      </div>
  </div>
  `
  }

// Create "Advantage" dialog
const buttons = ['Disadvantage', 'Normal', 'Advantage'].reduce(
  (acc, action) => {
    acc[action] = { label: action.capitalize(), callback }
    return acc
  },
  {},
)

// Button "Advantage/Disadvantige/Modifier" callback
function callback (html, event) {
  console.log(event)

// Get any roll modifiers
  // Get Any user input Mod
  const input = html.find('#mod_input')

  //Get any additional mods (Effects/ other actor applied mods)

  // Get Base Ability Mod
  const abilityMod = $('#ability-select option:selected').data('mod')

  // Get experience Modifier
  // const selectValue = $(select.options[select.selectedIndex]).data('mod');
  const expMod = $('.dialog-input-group input:checked').
    toArray().
    reduce((acc, item) => {
      const mod = parseInt($(item).data('mod'))
      if (!isNaN(mod)) {
        return acc + mod
      }
    }, 0)

  const mod = parseInt(input.val()) || 0
  const result = {
    hope: {
      formula: `1d12[Hope]`,
      dieCount: 1,
    },
    fear: {
      formula: '1d12[Fear]',
      dieCount: 1,
    },
    isAdvantage: false,
    isDisadvantage: false,
    mod: mod,
    expMod: expMod,
    abilityMod,
  }
  const action = event.currentTarget.dataset.button
  if (action === 'Advantage') {
    result.isAdvantage = true
  } else if (action === 'Disadvantage') {
    result.isDisadvantage = true
  }

  return result
}

// Define rolls
const doDHRoll = async (actor, ability, prefix = '') => {
  const {
    hope,
    expMod,
    fear,
    abilityMod,
    isAdvantage,
    isDisadvantage,
    mod,
    cancelled,
  } =
    await Dialog.wait({
      buttons,
      content: DualityDieDialogForm(actor, ability),
      close: (html, e) => {
        return { cancelled: true }
      },
    })

  let advantageRoll = ''

  if (isAdvantage) {
    advantageRoll = '+ 1d6'
  }

  if (isDisadvantage) {
    advantageRoll = '- 1d6'
  }

  if (cancelled) {
    return
  }

  const roll = await new Roll(
    `(${hope.formula} + ${fear.formula})${advantageRoll} + @mod`, {
      mod: mod + expMod + abilityMod,
    }).evaluate()

  // Get the specific results
  const hopeResult = roll.dice[0].results.find(
    (result) => result.active == true,
  ).result

  const fearResult = roll.dice[1].results.find(
    (result) => result.active == true,
  ).result

  let advResult = 0

  if (isAdvantage || isDisadvantage) {
    advResult = roll.dice[2].results.find(
      (result) => result.active == true,
    ).result
  }

  let diceDetailsHTML = DieDetails(hopeResult, fearResult, advResult,
    isAdvantage, isDisadvantage)

  const isCrit = hopeResult === fearResult
  const isHope = hopeResult > fearResult
  const isFear = fearResult > hopeResult

  // Dice colors
  roll.dice[0].options.appearance = hopeColor
  roll.dice[1].options.appearance = fearColor
  // roll.toMessage({
  //   speaker: ChatMessage.implementation.getSpeaker({actor: actor}),
  //   flavor: isCrit ? "Crit" : isHope ? "Hope Wins" : isFear ? "Fear Wins" : ""
  // });
  // Roll to chat
  if (game.dice3d) {
    await game.dice3d.showForRoll(roll)
  }

  return await ChatMessage.create({
    content: template(roll, {
      isCrit,
      isHope,
      isFear,
      isAdvantage,
      prefix,
      isDisadvantage,
      hopeResult,
      fearResult,
      diceDetailsHTML,
    }),
    speaker: ChatMessage.implementation.getSpeaker({ actor: actor }),
  })
}

export default doDHRoll
