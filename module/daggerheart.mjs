// Import document classes.
import { DaggerHeartActor } from "./documents/actor.mjs";
import { DaggerHeartItem } from "./documents/item.mjs";
// Import sheet classes.
import { DaggerHeartCharacterSheet } from "./sheets/character-sheet.mjs";
import { DaggerHeartItemSheet } from "./sheets/item-sheet.mjs";
import { DaggerHeartHandSheet } from "./sheets/hand-sheet.mjs";
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { DAGGERHEART } from "./helpers/config.mjs";
// Import DataModel classes
import * as models from "./data/_module.mjs";
import { DaggerHeartAdversarySheet } from "./sheets/adversary-sheet.mjs";
import { DaggerHeartGMSheet } from "./sheets/gm-sheet.mjs";

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once("init", function () {
  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.daggerheart = {
    DaggerHeartActor,
    DaggerHeartItem,
    rollItemMacro,
  };

  // Add custom constants for configuration.
  CONFIG.DAGGERHEART = DAGGERHEART;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "2d12 + @abilities.agi.value",
    decimals: 2,
  };

  // Define custom Document and DataModel classes
  CONFIG.Actor.documentClass = DaggerHeartActor;

  // Note that you don't need to declare a DataModel
  // for the base actor/item classes - they are included
  // with the Character/NPC as part of super.defineSchema()
  CONFIG.Actor.dataModels = {
    character: models.DaggerHeartCharacter,
    gm: models.DaggerHeartGM,
    adversary: models.DaggerHeartAdversary,
  };
  CONFIG.Item.documentClass = DaggerHeartItem;
  CONFIG.Item.dataModels = {
    item: models.DaggerHeartItem,
    feature: models.DaggerHeartFeature,
    spell: models.DaggerHeartSpell,
    class: models.DaggerHeartClass,
    domain: models.DaggerHeartDomain,
    card: models.DaggerHeartCard,
    weapon: models.DaggerHeartWeapon,
    armor: models.DaggerHeartArmor,
  };

  // Active Effects are never copied to the Actor,
  // but will still apply to the Actor from within the Item
  // if the transfer property on the Active Effect is true.
  CONFIG.ActiveEffect.legacyTransferral = false;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("daggerheart", DaggerHeartCharacterSheet, {
    makeDefault: true,
    types: ["character"],
    label: "DAGGERHEART.SheetLabels.Actor",
  });

  Actors.registerSheet("daggerheart", DaggerHeartAdversarySheet, {
    types: ["adversary"],
    label: "DAGGERHEART.SheetLabels.Actor",
  });

  Actors.registerSheet("daggerheart", DaggerHeartGMSheet, {
    types: ["gm"],
    label: "DAGGERHEART.SheetLabels.Actor",
  });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("daggerheart", DaggerHeartItemSheet, {
    makeDefault: true,
    label: "DAGGERHEART.SheetLabels.Item",
  });

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here is a useful example:
Handlebars.registerHelper("toLowerCase", function (str) {
  return str.toLowerCase();
});

Handlebars.registerHelper("checkbox", function (name, checked) {
  return `
    <label class="checkbox-container">
      <input type="checkbox" name="${name}" ${checked ? "checked" : ""}/>
      <span class="checkmark"></span>
    </label>
  `;
});

Handlebars.registerHelper("action", function (context) {
  const { action, ...options } = context.hash;

  const dataString = [];

  if (!action) {
    return "";
  }

  dataString.push(`data-action="${action}"`);

  Object.keys(options).forEach((key) => {
    if (options[key]) {
      dataString.push(`data-${key}="${options[key]}"`);
    }
  });

  return dataString.join(" ");
});

Handlebars.registerHelper("ternary", function (cond, v1, v2) {
  return cond ? v1 : v2;
});

Handlebars.registerHelper("icon", function (icon) {
  return `<i class="fas fa-${icon}"></i>`;
});

Handlebars.registerHelper("concat", function () {
  var outStr = "";
  for (var arg in arguments) {
    if (typeof arguments[arg] != "object") {
      outStr += arguments[arg];
    }
  }
  return outStr;
});

Handlebars.registerHelper("get", function (item, name) {
  if (!item) {
    return "";
  }
  if (item[name]) {
    return item[name];
  }

  return "";
});
/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", function () {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => createItemMacro(data, slot));

  if (game.user.character) {
    new DaggerHeartHandSheet(game.user.character).render(true);
  }
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
  // First, determine if this is a valid owned item.
  if (data.type !== "Item") return;
  if (!data.uuid.includes("Actor.") && !data.uuid.includes("Token.")) {
    return ui.notifications.warn(
      "You can only create macro buttons for owned Items"
    );
  }
  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data);

  // Create the macro command using the uuid.
  const command = `game.daggerheart.rollItemMacro("${data.uuid}");`;
  let macro = game.macros.find(
    (m) => m.name === item.name && m.command === command
  );
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "daggerheart.itemMacro": true },
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: "Item",
    uuid: itemUuid,
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then((item) => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(
        `Could not find item ${itemName}. You may need to delete and recreate this macro.`
      );
    }

    // Trigger the item roll
    item.roll();
  });
}
