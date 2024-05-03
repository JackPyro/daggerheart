import DaggerHeartFeature from "../data/feature.mjs";
import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from "../helpers/effects.mjs";

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class DaggerHeartItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["daggerheart", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "stats",
        },
      ],
    });
  }

  /** @override */
  get template() {
    const path = "systems/daggerheart/templates/item";
    // Return a single sheet for all item types.
    // return `${path}/item-sheet.hbs`;

    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.hbs`.
    return `${path}/item-${this.item.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve base data structure.
    const context = super.getData();
    context.domains = [];
    context.cardTypes = [];
    context.traits = [];

    // Use a safe clone of the item data for further operations.
    const itemData = context.data;

    // Retrieve the roll data for TinyMCE editors.
    context.rollData = this.item.getRollData();

    // Add the item's data to context.data for easier access, as well as flags.
    context.system = itemData.system;
    context.flags = itemData.flags;

    console.log(itemData);

    // Prepare active effects for easier access
    context.effects = prepareActiveEffectCategories(this.item.effects);

    // if(itemData.type === 'class') {
    //   const validatedItems = itemData.system.classFeatures.map(item => {
    //     if(!item.id) {
    //       item.id = crypto.randomUUID()
    //     }

    //     return item;
    //   })

    //   this.item.update({"system.classFeatures": validatedItems})
    // }

    if (["domain", "class"].includes(itemData.type)) {
      context.domains = CONFIG.DAGGERHEART.domains;
    }

    if (["weapon"].includes(itemData.type)) {
      // for (let [k, v] of Object.entries(context.system.abilities)) {
      //   v.label = game.i18n.localize(CONFIG.DAGGERHEART.abilities[k]) ?? k;
      // }
      context.traits = Object.keys(CONFIG.DAGGERHEART.abilities).map((key) => {
        const label = game.i18n.localize(CONFIG.DAGGERHEART.abilities[key]);
        const value = key;

        return { label, value };
      });

      context.burden = Object.keys(CONFIG.DAGGERHEART.burden).map((key) => {
        const label = CONFIG.DAGGERHEART.burden[key];
        const value = key;

        return { label, value };
      });

      context.attack_types = Object.keys(CONFIG.DAGGERHEART.attack_types).map(
        (key) => ({
          value: key,
          label: CONFIG.DAGGERHEART.attack_types[key],
        })
      );

      context.range = Object.keys(CONFIG.DAGGERHEART.range).map((key) => {
        const label = CONFIG.DAGGERHEART.range[key];
        const value = key;

        return { label, value };
      });

      console.log(context.traits);
    }

    if (itemData.type === "card") {
      context.cardTypes = Object.keys(CONFIG.DAGGERHEART.cardTypes).map(
        (key) => {
          const label = CONFIG.DAGGERHEART.cardTypes[key];
          const value = key;

          return { label, value };
        }
      );
    }

    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Roll handlers, click handlers, etc. would go here.
    html.on("click", ".add-domain", async (ev) => {
      const allDomains = this.item.system.selectedDomains;
      const newDomain = { id: await crypto.randomUUID(), name: "" };
      allDomains.push(newDomain);
      await this.item.update({ "system.selectedDomains": allDomains });
    });

    html.on("click", ".add-feature-for-card", async (ev) => {
      const newFeature = {
        id: await crypto.randomUUID(),
        name: "",
        description: "",
      };

      this.item.update({"system.cardFeatures": [...this.item.system.cardFeatures, newFeature]})
    });

    html.on("click", ".class-feature-add", async (ev) => {
      const classFeatures = this.item.system.classFeatures;
      const newFeature = {
        id: await crypto.randomUUID(),
        name: "",
        description: "",
      };
      classFeatures.push(newFeature);

      await this.item.update({ "system.classFeatures": classFeatures });
    });

    html.on("click", ".delete-domain", async (ev) => {
      const id = $(ev.currentTarget).data("id");
      const allDomains = this.item.system.selectedDomains.filter(
        (i) => i.id !== id
      );

      await this.item.update({ "system.selectedDomains": allDomains });
    });

    html.on("click", ".add-tier", async (ev) => {
      const type = $(ev.currentTarget).data("type");
      const allItems = this.item.system[type];
      const tierOption = {
        id: await crypto.randomUUID(),
        option: "",
        checked: false,
      };

      allItems.push(tierOption);
      await this.item.update({ [`system.${type}`]: allItems });
    });

    html.on("click", ".remove-tier, .feature-remove", async (ev) => {
      const type = $(ev.currentTarget).data("type");
      const id = $(ev.currentTarget).data("id");

      const allItems = this.item.system[type].filter((i) => i.id !== id);
      console.log(allItems, id, type);
      await this.item.update({ [`system.${type}`]: allItems });
    });

    html.on("click", ".edit-mode-toggle", async (ev) => {
      this.item.update({ [`system.editMode`]: !this.item.system.editMode });
    });

    html.on("click", ".class-choice-add", async (ev) => {
      const item = {
        id: await crypto.randomUUID(),
        choice1: " ",
        choice2: " ",
      };
      const allItems = this.item.system.choiceItems;
      allItems.push(item);

      this.item.update({ "system.choiceItems": allItems });
    });

    html.on("click", ".class-choice-remove", async (ev) => {
      const id = $(ev.currentTarget).data("id");
      const allItems = this.item.system.choiceItems.filter((i) => i.id !== id);
      this.item.update({ "system.choiceItems": allItems });
    });

    html.on("click", ".question-add", async (ev) => {
      const type = $(ev.currentTarget).data("type");
      const allQuestions = this.item.system[type];
      const question = {
        id: await crypto.randomUUID(),
        question: "",
        answer: "",
      };

      allQuestions.push(question);
      this.item.update({ [`system.${type}`]: allQuestions });
    });

    html.on("click", ".question-remove", async (ev) => {
      const type = $(ev.currentTarget).data("type");
      const id = $(ev.currentTarget).data("id");

      const allQuestions = this.item.system[type].filter((i) => i.id !== id);

      this.item.update({ [`system.${type}`]: allQuestions });
    });

    // Active Effect management
    html.on("click", ".effect-control", (ev) =>
      onManageActiveEffect(ev, this.item)
    );
  }
}
