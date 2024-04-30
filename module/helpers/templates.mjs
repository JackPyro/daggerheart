/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return loadTemplates([
    // Actor partials.
    'systems/daggerheart/templates/actor/parts/actor-features.hbs',
    'systems/daggerheart/templates/actor/parts/actor-items.hbs',
    'systems/daggerheart/templates/actor/parts/actor-spells.hbs',
    'systems/daggerheart/templates/actor/parts/actor-effects.hbs',
    'systems/daggerheart/templates/actor/parts/actor-loadout.hbs',
    'systems/daggerheart/templates/actor/parts/actor-exps.hbs',
    'systems/daggerheart/templates/actor/parts/actor-card.hbs',
    'systems/daggerheart/templates/actor/parts/actor-description.hbs',
    'systems/daggerheart/templates/actor/parts/actor-leveling.hbs',
    'systems/daggerheart/templates/actor/parts/actor-weapons.hbs',
    'systems/daggerheart/templates/actor/parts/actor-equipped.hbs',
    // Item partials
    'systems/daggerheart/templates/item/parts/item-effects.hbs',
    'systems/daggerheart/templates/item/parts/item-tier.hbs',
  ]);
};
