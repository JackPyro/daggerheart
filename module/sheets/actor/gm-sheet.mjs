

  /**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class DaggerHeartGMSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["daggerheart", "sheet", "GM"],
      width: 400,
      height: 300,
    });
  }

  /** @override */
  get template() {
    return `systems/daggerheart/templates/actor/gm-sheet.hbs`;
  }

  /** @override */
  getData() {
    console.log(this.actor);
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

    context.hasCharacter = game.user.character;

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    return context;
  }
  
  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    html.on("click", ".incremental .fas", (ev) => {
      const item = $(ev.currentTarget).data("type");
      const increment = $(ev.currentTarget).data("increment");
      const mod = increment ? +1 : -1;
      this.actor.update({ [`system.${item}`]: this.actor.system[item] + mod });
    });
  }
}
