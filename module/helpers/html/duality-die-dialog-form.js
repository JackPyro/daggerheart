/**
 * Duality Die Dialog Form
 * @param actor
 * @param ability
 * @returns html
 */
const dualityDieDialogForm = (actor, ability) => {
  return `
  <div class="dialog-input-group"> 
    <label class="label" for="ability-select">Ability: </label>
    <select class="input w-100" id="ability-select" type="number" value="${ability}">
      ${Object.keys(actor.system.abilities).map(
    (key) =>
      `<option ${key === ability
        ? 'selected=true'
        : ''}value="${key}" data-mod="${actor.system.abilities[key].value}">${
        actor.system.abilities[key].label
      }</option>`,
  ).join('')};
    </select>
  </div>
  <div class='dialog-input-group'>
    <label class="label" for="mod_input">Additional Mod</label>
    <input id="mod_input" class="input w-100">
  </div>

  <div  class='dialog-input-group'>
    ${actor.system.experiences.map(
    (item) =>
      `<div class="dialog-input"> <input type="checkbox" data-mod=${item.mod}/> <label class="dialog-input-name">${item.name}</label> <label class="dialog-input-mod">${item.mod}</label></div>`,
  ).join('')}
  </div>        
  <div class='dialog-input-group'>
      <label class="label" for="orderborne-checkbox">Orderborne</label>
      <input type="checkbox" id="orderborne-checkbox" class="input-checkbox">
  </div>
`
}

export default dualityDieDialogForm
