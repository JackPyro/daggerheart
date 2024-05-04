// Dice colors
const hopeColor = {
  // Hope colors
  colorset: "custom",
  foreground: "#000000",
  //background: "#FFFFFF",
  Image: "systems/daggerheart/assets/d12-no-text.svg",
  outline: "#000000",
  edge: "#000000",
  texture: "none",
  material: "metal",
  font: "Arial Black",
  system: "standard",
};
const fearColor = {
  // Fear colors
  colorset: "custom",
  foreground: "#FFFFFF",
  background: "#000000",
  outline: "#000000",
  edge: "#000000",
  texture: "none",
  material: "metal",
  font: "Arial Black",
  system: "standard",
};

const inputHTML = `<input id="vsratii_input" type="number" value="0"/>`;

const formHTML = (actor) => {
  return `
  <div class='dialog-input-group'>
    <label for="mod_input">Additional Mod</label>
    <input id="mod_input" type="number">
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

const template = (roll, { isCrit, isHope, isFear, hopeResult, fearResult, prefix }) => {
  const rolls = roll.terms.reduce((acc, item) => {
    if (!item.results) {
      return acc;
    }

    const results = item.results.map(({ result, discarded }) => ({
      value: result,
      discarded: discarded ?? false,
      type: item.options.flavor.toLowerCase(),
    }));

    acc.push(...results);
    return acc;
  }, []);

  const list = rolls.map(
    (rollResult) =>
      `<li class="roll die ${rollResult.discarded ? "discarded" : ""}  ${
        rollResult.type == "hope" ? "hope-result" : "fear-result"
      } d12">${rollResult.value}</li>`
  );

  console.log(roll)

  return `
  
  <div class="dice-roll">
      <div class="dice-result">
          <div class="daggerheart-roll-result">
            <div class="daggerheart-roll-header">
             <div class="action-type">
              ${prefix ? prefix : "Ability Roll"} 
              ${roll.data.mod >= 0 ? "+" : "-"}${roll.data.mod ? roll.data.mod : ""}
             </div>
             <div class='winner'>
              ${isCrit ? `WITH CRIT` : ""}
              ${isHope ? `WITH HOPE` : ""}
              ${isFear ? `WITH FEAR` : ""}
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

                      <hr>
                      <div class="duality-dice-msg-container">
                        <div class="duality-dice-msg-die-fear">
                          <label class="duality-dice-msg-resut-text-fear">12</label>
                        </div>
                        <div class="duality-dice-msg-die-spacer"></div>
                        <div class="duality-dice-msg-die-hope">
                          <label class="duality-dice-msg-resut-text-hope">6</label>
                        </div>
                        <div class="duality-dice-msg-die-spacer"></div>
                        <div class="duality-dice-msg-die-crit-success">
                          <label class="duality-dice-msg-resut-text-crit-success">3</label>
                        </div>
                        <div class="duality-dice-msg-die-spacer"></div>
                        <div class="duality-dice-msg-die-crit-fail">
                          <label class="duality-dice-msg-resut-text-crit-fail">3</label>
                        </div>
                      </div>

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
    hope: {
      formula: `1d12[Hope]`,
      dieCount: 1,
    },
    fear: {
      formula: "1d12[Fear]",
      dieCount: 1,
    },
    isAdvantage: false,
    isDisadvantage: false,
    mod: mod,
    expMod: expMod,
  };
  const action = event.currentTarget.dataset.button;
  if (action === "Advantage") {
    result.hope.formula = "2d12kh1[Hope]";
    result.hope.dieCount = 2;
    result.isAdvantage = true;
  } else if (action === "Disadvantage") {
    result.hope.formula = "2d12kl1[Hope]";
    result.hope.dieCount = 2;
    result.isDisadvantage = true;
  }
  return result;
}

// Define rolls
const doDHRoll = async (actor, abilityMod, prefix = '') => {
  const { hope, expMod, fear, isAdvantage, isDisadvantage, mod } =
    await Dialog.wait({
      buttons,
      content: formHTML(actor),
    });

    console.log(mod, expMod, abilityMod)

  const roll = await new Roll(`${hope.formula} + ${fear.formula} + @mod`, {
    mod: mod + expMod + abilityMod,
  }).evaluate();
  const hopeResult = roll.dice[0].results.find(
    (result) => result.active == true
  ).result;
  const fearResult = roll.dice[1].results.find(
    (result) => result.active == true
  ).result;

  const isCrit = hopeResult == fearResult;
  const isHope = hopeResult > fearResult;
  const isFear = fearResult > hopeResult;

  // Dice colors
  //roll.dice[0].options.appearance = hopeColor;
  //roll.dice[1].options.appearance = fearColor;
  console.log(isCrit, isHope, isFear, hopeResult, fearResult);
  // roll.toMessage({
  //   speaker: ChatMessage.implementation.getSpeaker({actor: actor}),
  //   flavor: isCrit ? "Crit" : isHope ? "Hope Wins" : isFear ? "Fear Wins" : ""
  // });
  // Roll to chat
  if (game.dice3d) {
    await game.dice3d.showForRoll(roll);
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
    }),
    speaker: ChatMessage.implementation.getSpeaker({ actor: actor }),
  });
};

export default doDHRoll;
