import doGMRoll from "../helpers/adversary-roll.mjs";
import { DAGGERHEART } from "../helpers/config.mjs";
import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from "../helpers/effects.mjs";
import openChoiceMenu from "../helpers/item-choices.mjs";
import doDHRoll from "../helpers/roll-macro.mjs";
import { DaggerHeartHandSheet } from "./hand-sheet.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class DaggerHeartActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["daggerheart", "sheet", "actor"],
      width: 600,
      height: 600,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "features",
        },
      ],
    });
  }

  /** @override */
  get template() {
    return `systems/daggerheart/templates/actor/actor-${this.actor.type}-sheet.hbs`;
  }

  async _onDropItemCreate(itemData) {
    if (this.actor.type === "character") {
      if (itemData.type === "class") {
        this.actor.update({
          "system.class": itemData.system,
          "system.hitpoints": itemData.system.defaultThreshold,
          "system.evasion": itemData.system.defaultEvasion,
          "system.wallet": itemData.system.wallet,
        });

        if (itemData.system.choiceItems) {
          const items = await openChoiceMenu(itemData);

          console.log(items);

          items.forEach(async (item) => {
            await Item.create(
              { type: "item", name: item },
              { parent: this.actor }
            );
          });
        }

        if (itemData.system.classFeatures) {
          itemData.system.classFeatures.forEach(async (classFeature) => {
            await Item.create(
              { type: "card", name: classFeature.name, system: {cardType: "class", feature: classFeature.description} },
              { parent: this.actor }
            );
          })
        }

        await Item.create(
          { type: "item", name: "A torch" },
          { parent: this.actor }
        );
        await Item.create(
          { type: "item", name: "50ft of rope" },
          { parent: this.actor }
        );
        await Item.create(
          { type: "item", name: "Basic supplies" },
          { parent: this.actor }
        );
      }

      if (itemData.type === "card") {
        if (
          itemData.system.cardType ===
          DAGGERHEART.cardTypes.community.toLowerCase()
        ) {
          this.actor.update({
            "system.community.name": itemData.name,
            "system.community.feature": itemData.system.feature,
            "system.community.description": itemData.system.description,
          });
          return;
        }

        if (
          itemData.system.cardType ===
          DAGGERHEART.cardTypes.ancestry.toLowerCase()
        ) {
          this.actor.update({
            "system.ancestry.name": itemData.name,
            "system.ancestry.feature": itemData.system.feature,
            "system.ancestry.description": itemData.system.description,
          });
          return;
        }
      }
    }

    return super._onDropItemCreate(itemData);
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    console.log(this)
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = context.data;

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Prepare character data and items.
    if (actorData.type == "character") {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == "npc") {
      this._prepareItems(context);
    }

    if (actorData.type == "adversary") {
      this._prepareAdversatyData(context);
    }

    context.hasCharacter = game.user.character;

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(
      // A generator that returns all effects stored on the actor
      // as well as any items
      this.actor.allApplicableEffects()
    );

    return context;
  }

  _prepareAdversatyData(context) {
    context.enemy_types = Object.keys(DAGGERHEART.enemy_types).map((key) => ({
      value: key,
      label: DAGGERHEART.enemy_types[key],
    }));

    context.attack_types = Object.keys(DAGGERHEART.attack_types).map((key) => ({
      value: key,
      label: DAGGERHEART.attack_types[key],
    }));
    context.ranges = Object.keys(DAGGERHEART.range).map((key) => ({
      value: key,
      label: DAGGERHEART.range[key],
    }));
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterData(context) {
    // Handle ability scores.
    // for (let [k, v] of Object.entries(context.system.abilities)) {
    //   v.label = game.i18n.localize(CONFIG.DAGGERHEART.abilities[k]) ?? k;
    // }
    if (this.actor.system.class) {
      context.tier1 = {
        items: this.actor.system.class.tier1,
        description: this.actor.system.class.tier1Description,
      };
      context.tier2 = {
        items: this.actor.system.class.tier2,
        description: this.actor.system.class.tier2Description,
      };
      context.tier3 = {
        items: this.actor.system.class.tier3,
        description: this.actor.system.class.tier3Description,
      };
    }
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems(context) {
    // Initialize containers.
    const gear = [];
    const features = [];
    const active_loadout = [];
    let armor = null;
    const armors = [];
    let primaryWeapon = null;
    let secondaryWeapon = null;
    const weapons = [];
    const subclasses = [];
    const vault = [];

    if (this.actor.type === "adversary") {
      enemy_types = DAGGERHEART.enemy_types;
    }

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || Item.DEFAULT_ICON;
      // Append to gear.
      if (i.type === "item") {
        gear.push(i);
      }
      // Append to features.
      else if (i.type === "feature") {
        features.push(i);
      }

      if (i.type === "armor") {
        if (i.system.isEquipped) {
          armor = i;
        } else {
          armors.push(i);
        }
      }

      if (i.type === "weapon") {
        if (i.system.isEquipped) {
          if (i.system.isEquipped) {
            const abilityScore =
              this.actor.system.abilities[i.system.trait].value;
            if (i.system.isSecondary) {
              secondaryWeapon = i;
              secondaryWeapon.abilityScore = abilityScore;
              secondaryWeapon.abilityScorePrefix =
                abilityScore >= 0 ? "+" : "-";
            } else {
              primaryWeapon = i;
              primaryWeapon.abilityScore =
                this.actor.system.abilities[i.system.trait].value;
              primaryWeapon.abilityScorePrefix = abilityScore >= 0 ? "+" : "-";
            }
          }
        } else {
          const abilityScore =
            this.actor.system.abilities[i.system.trait].value;
          const abilityScorePrefix = abilityScore >= 0 ? "+" : "-";
          weapons.push({
            ...i,
            abilityScore,
            abilityScorePrefix,
            attributeFullName: game.i18n.localize(
              DAGGERHEART.abilities[i.system.trait]
            ),
          });
        }
      }

      if (i.type === "card") {
        if (["subclass", "class"].includes(i.system.cardType)) {
          subclasses.push(i);
        }
      }

      if (i.type === "domain") {
        i.system.active ? active_loadout.push(i) : vault.push(i);
      }
    }
    // Assign and return
    context.gear = gear;
    context.features = features;
    context.active_loadout = active_loadout;
    context.vault = vault;
    context.subclasses = subclasses.sort((a,b) => a.system.cardType > b.system.cardType ? 1 : -1);
    context.weapons = weapons;
    context.primary = primaryWeapon;
    context.secondary = secondaryWeapon;
    context.armor = armor;
    context.armors = armors;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    html.on('click', ".enemy-attack-roll", async () => {
      doGMRoll(this.actor, `Attack Roll`)
    });

    html.on('click', ".enemy-damage-roll", async () => {
      const roll = await new Roll(
        `${this.actor.system.weapon.damage}`
      );

      roll.toMessage({
        flavor: `<div class="action-type weapon-roll-type">${this.actor.system.weapon.name}</div> <div class="attack-roll-traits"> ${this.actor.system.weapon.range} - ${this.actor.system.weapon.type} dmg</div>`,

        speaker: ChatMessage.implementation.getSpeaker({ actor: this.actor }),
      });
    });
    // Render the item sheet for viewing/editing prior to the editable check.
    html.on("click", ".item-edit", (ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    html.on("click", ".incremental .fas", (ev) => {
      const item = $(ev.currentTarget).data("type")
      const increment = $(ev.currentTarget).data("increment")
      const mod = increment ? +1 : -1;
      this.actor.update({[`system.${item}`]: this.actor.system[item]+mod})
    });

    html.on("click", ".accordion", (ev) => {
      const id = $(ev.currentTarget).data("to-open");

      const content = $(`div[data-accordion=${id}]`);
      content.toggle();
      $(ev.currentTarget).toggleClass("active");
    });

    html.on("click", ".open-loadout", (ev) => {
      if (game.user.character) {
        new DaggerHeartHandSheet(game.user.character).render(true);
      }
    });

    html.on("click", ".card-activate", (ev) => {
      const id = $(ev.currentTarget).data("itemId");
      const item = this.actor.items.get(id);
      item.update({ "system.active": !item.system.active });
    });

    html.on("click", ".weapon-unequip, .armor-unequip", (ev) => {
      const id = $(ev.currentTarget).data("id");
      const item = this.actor.items.get(id);

      item.update({ "system.isEquipped": false });
    });

    html.on("click", ".armor-equip", (ev) => {
      const id = $(ev.currentTarget).data("id");
      const item = this.actor.items.get(id);

      this.actor.items.forEach((armor) => {
        if (armor.type === "armor") {
          if (armor.system.isEquipped) {
            armor.update({ "system.isEquipped": false });
          }
        }
      });

      item.update({ "system.isEquipped": true });
      return;
    });

    html.on("click", ".weapon-equip", (ev) => {
      const id = $(ev.currentTarget).data("id");
      const item = this.actor.items.get(id);

      if (item.system.isSecondary) {
        this.actor.items.forEach((weapon) => {
          if (weapon.system.isEquipped && weapon.system.isSecondary) {
            weapon.update({ "system.isEquipped": false });
          }
        });

        item.update({ "system.isEquipped": true });
        return;
      }

      if (item.system.burden.toUpperCase() === "1H") {
        this.actor.items.forEach((weapon) => {
          if (weapon.system.burden === "2H") {
            weapon.update({ "system.isEquipped": false });
          }
          if (weapon.system.isEquipped && weapon.system.burden === "1H") {
            weapon.update({ "system.isEquipped": false });
          }
        });

        item.update({ "system.isEquipped": true });
        return;
      }

      if (item.system.burden.toUpperCase() === "2H") {
        this.actor.items.forEach((weapon) => {
          if (weapon.system.isEquipped) {
            weapon.update({ "system.isEquipped": false });
          }
        });

        item.update({ "system.isEquipped": true });
        return;
      }
    });

    html.on("click", ".weapon-delete, .inventory-item-delete", (ev) => {
      const id = $(ev.currentTarget).data("id");
      const item = this.actor.items.get(id);
      item.delete();
    });

    html.on("click", ".weapon-edit, .inventory-item-edit", (ev) => {
      const id = $(ev.currentTarget).data("id");
      const item = this.actor.items.get(id);
      item.sheet.render(true);
    });

    html.on("click", ".card-delete", (ev) => {
      const id = $(ev.currentTarget).data("itemId");
      const item = this.actor.items.get(id);
      item.delete();
    });

    html.on("click", ".card-edit", (ev) => {
      const id = $(ev.currentTarget).data("itemId");
      const item = this.actor.items.get(id);
      item.sheet.render(true);
    });

    html.on("click", ".delete-trait", (ev) => {
      const type = $(ev.currentTarget).data("type");

      this.actor.update({
        [`system.${type}.name`]: "",
        [`system.${type}.feature`]: "",
      });
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    html.on("click", ".class-delete", (ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
    });

    html.on("click", ".time-to-roll", (ev) => {
      const type = $(ev.currentTarget).data("type");
      const label = $(ev.currentTarget).data("label");
      return doDHRoll(this.actor, type, `${label} roll`);
    });

    html.on("click", ".weapon-main-ability", (ev) => {
      const type = $(ev.currentTarget).data("type");
      return doDHRoll(this.actor, type, "Attack roll");
    });

    html.on("click", ".weapon-main-damage", async (ev) => {
      const id = $(ev.currentTarget).data("id");
      const item = this.actor.items.get(id);
      const roll = await new Roll(
        `${this.actor.system.proficiency}${item.system.damage}`
      );

      roll.toMessage({
        flavor: `<div class="action-type weapon-roll-type">${item.name}</div> <div class="attack-roll-traits"> ${item.system.range} - ${item.system.type} dmg</div>`,

        speaker: ChatMessage.implementation.getSpeaker({ actor: this.actor }),
      });
    });

    // Add Inventory Item
    html.on("click", ".item-create", this._onItemCreate.bind(this));

    html.on("click", ".item-save", (ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.update({ name: li.find("input")[0].value });

      // item.delete();
    });
    // Delete Inventory Item
    html.on("click", ".item-delete", (ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Active Effect management
    html.on("click", ".effect-control", (ev) => {
      const row = ev.currentTarget.closest("li");
      const document =
        row.dataset.parentId === this.actor.id
          ? this.actor
          : this.actor.items.get(row.dataset.parentId);
      onManageActiveEffect(ev, document);
    });

    html.on("click", ".add-experience", async (ev) => {
      const exps = this.actor.system.experiences;
      const newExp = {
        id: await crypto.randomUUID(),
        name: "New Experience",
        mod: 0,
      };

      exps.push(newExp);
      this.actor.update({ "system.experiences": exps });
    });
    html.on("click", ".exp-edit", async (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const exps = [...this.actor.system.experiences];
      const key = parseInt($(ev.currentTarget).data("key"));
      exps[key].editMode = true;

      this.actor.update({ [`system.experiences`]: exps });
    });

    html.on("click", ".enemy-feature-create", async (ev) => {
      const features = this.actor.system.features;
      const newFeature = {
        id: await crypto.randomUUID(),
        name: "New Feature",
        mod: 0,
      };

      features.push(newFeature);

      this.actor.update({ "system.features": features });
    });

    html.on("click", ".enemy-feature-delete", (ev) => {
      const id = $(ev.currentTarget).data("id");
      const features = this.actor.system.features.filter((i) => i.id !== id);

      this.actor.update({ "system.features": features });
    });

    html.on("click", ".exp-save", async (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const exps = [...this.actor.system.experiences];
      const key = parseInt($(ev.currentTarget).data("key"));
      exps[key].editMode = false;

      this.actor.update({ [`system.experiences`]: exps });
    });
    html.on("click", ".exp-delete", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const id = $(ev.currentTarget).data("id");

      const exps = this.actor.system.experiences.filter((i) => i.id !== id);

      this.actor.update({ "system.experiences": exps });
    });

    // Rollable abilities.
    html.on("click", ".rollable", this._onRoll.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = (ev) => this._onDragStart(ev);
      html.find("li.item").each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data,
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system["type"];

    // Finally, create the item!
    return await Item.create(itemData, { parent: this.actor });
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == "item") {
        const itemId = element.closest(".item").dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let label = dataset.label ? `[ability] ${dataset.label}` : "";
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get("core", "rollMode"),
      });
      return roll;
    }
  }
}
