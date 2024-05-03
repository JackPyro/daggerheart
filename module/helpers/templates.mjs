/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  loadTemplates(["systems/daggerheart/templates/actor/parts/hand-card.hbs"]);

  loadTemplates([
    "systems/daggerheart/templates/item/parts/item-effects.hbs",
    "systems/daggerheart/templates/item/parts/item-tier.hbs",
  ]);


  loadTemplates([
    'systems/daggerheart/templates/actor/layout/sidebar.hbs',
    'systems/daggerheart/templates/actor/layout/header.hbs',
    'systems/daggerheart/templates/actor/layout/navigation.hbs',
    'systems/daggerheart/templates/actor/layout/content.hbs',
  ]);


  loadTemplates([
    'systems/daggerheart/templates/actor/parts/character-loadout.hbs',
    'systems/daggerheart/templates/actor/parts/character-inventory.hbs',
    'systems/daggerheart/templates/actor/parts/character-description.hbs',
    'systems/daggerheart/templates/actor/parts/character-leveling.hbs',
    'systems/daggerheart/templates/actor/parts/character-card.hbs',
  ]);

  return;
};
