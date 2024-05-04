const formHTML = (actor) => {
  return `
  <div class='dialog-input-group'>
    <label for="mod_input">Modifier</label>
    <input id="mod_input" type="number" value="${actor.system.attackMod}">
  </div>

  <div  class='dialog-input-group'>
    ${actor.system.experiences
      .map(
        (item) =>
          `<div class="dialog-input"> <input type="checkbox" data-mod=${item.mod}/> <label class="dialog-input-name">${item.name}</label> <label class="dialog-input-mod">${item.mod}</label></div>`
      )
      .join("")}
  </div>
`;
};

const template = (roll, { prefix }) => {
  const rolls = roll.terms.reduce((acc, item) => {
    if (!item.results) {
      return acc;
    }

    const results = item.results.map(({ result, discarded }) => ({
      value: result,
      discarded: discarded ?? false,
    }));

    acc.push(...results);
    return acc;
  }, []);

  const list = rolls.map(
    (rollResult) =>
      `<li class="roll die ${rollResult.discarded ? "discarded" : ""} d20">${rollResult.value}</li>`
  );

  return `
  <div class="dice-roll">
      <div class="dice-result">
          <div class="daggerheart-roll-result">
            <div class="daggerheart-enemy-header">
             <div class="action-type">
              ${prefix ? prefix : "Ability Roll"} 
             </div>
            </div>
           
            <div class="daggerheart-dice-roll">
              ${
                /**  <div class="normal-dice-roll hope-roll"> ${hopeResult}</div>**/ ""
              }
              <div class="normal-dice-roll total-roll">${roll._total}</div>
              ${
                /** <div class="normal-dice-roll fear-roll">${fearResult}</div> **/ ""
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
                      <ol class="dice-rolls">
                        ${list}
                      </ol>
                  </div>
              </section>
          </div>
      </div>
  </div>
  `;
};

// Create "Advantage" dialog
const buttons = ["Disadvantage", "Normal", "Advantage"].reduce(
  (acc, action) => {
    acc[action] = { label: action.capitalize(), callback };
    return acc;
  },
  {}
);

// Button callback
function callback(html, event) {
  const input = html.find("#mod_input");
  const expMod = $(".dialog-input-group input:checked")
    .toArray()
    .reduce((acc, item) => {
      const mod = parseInt($(item).data("mod"));
      if (!isNaN(mod)) {
        return acc + mod;
      }
    }, 0);
  const mod = parseInt(input.val()) || 0;
  const result = {
    attack: {
      formula: `1d20`,
      dieCount: 1,
    },
    isAdvantage: false,
    isDisadvantage: false,
    mod: mod,
    expMod: expMod,
  };
  const action = event.currentTarget.dataset.button;
  if (action === "Advantage") {
    result.attack.formula = "2d20kh1";
    result.attack.dieCount = 2;
    result.isAdvantage = true;
  } else if (action === "Disadvantage") {
    result.attack.formula = "2d20kl1";
    result.attack.dieCount = 2;
    result.isDisadvantage = true;
  }
  return result;
}

// Define rolls
const doGMRoll = async (actor, prefix = '') => {
  const { attack, expMod, isAdvantage, isDisadvantage, mod } =
    await Dialog.wait({
      buttons,
      content: formHTML(actor),
    });


  const roll = await new Roll(`${attack.formula} + @mod`, {
    mod: mod + expMod,
  }).evaluate();

  // Roll to chat
  if (game.dice3d) {
    await game.dice3d.showForRoll(roll);
  }

  return await ChatMessage.create({
    content: template(roll, {
      isAdvantage,
      prefix,
      isDisadvantage,
    }),
    speaker: ChatMessage.implementation.getSpeaker({ actor: actor }),
  });
};

export default doGMRoll;
