import DaggerHeartActorBase from "./actor-base.mjs";

export default class DaggerHeartCharacter extends DaggerHeartActorBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.attributes = new fields.SchemaField({
      level: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 1 }),
      }),
    });

    schema.looks = new fields.SchemaField({
      clothes: new fields.StringField({ initial: "" }),
      eyes: new fields.StringField({ initial: "" }),
      body: new fields.StringField({ initial: "" }),
      skin: new fields.StringField({ initial: "" }),
      attitude: new fields.StringField({ initial: "" }),
    });

    schema.wallet = new fields.SchemaField({
      coins: new fields.NumberField({ initial: 0, integer: true }),
      handful: new fields.NumberField({ initial: 0, integer: true }),
      bags: new fields.NumberField({ initial: 0, integer: true }),
      chest: new fields.NumberField({ initial: 0, integer: true }),
    });

    schema.hitpoints = new fields.SchemaField({
      minor: new fields.NumberField({ initial: 0, integer: true }),
      major: new fields.NumberField({ initial: 0, integer: true }),
      severe: new fields.NumberField({ initial: 0, integer: true }),
    });

    schema.armor_slots = new fields.SchemaField({
      value: new fields.NumberField({ initial: 0, integer: true }),
      max: new fields.NumberField({ initial: 0, integer: true }),
    });

    schema.primary = new fields.BooleanField({ initial: false });
    schema.secondary = new fields.BooleanField({ initial: false });

    schema.evasion = new fields.NumberField({ initial: 0, integer: true });
    schema.armor = new fields.NumberField({ initial: 0, integer: true });
    schema.hope = new fields.SchemaField({
      value: new fields.NumberField({ initial: 0, integer: true }),
      max: new fields.NumberField({ initial: 6, integer: true }),
    });
    schema.proficiency = new fields.NumberField({ initial: 1, integer: true });
    schema.pronouns = new fields.StringField({ blank: true });

    schema.experiences = new fields.ArrayField(
      new fields.SchemaField({
        id: new fields.StringField({
          required: true,
          immutable: true,
        }),
        name: new fields.StringField({
          required: true,
          initial: "",
        }),
        mod: new fields.NumberField({ initial: 0, integer: true }),
        editMode: new fields.BooleanField({ initial: false }),
      })
    );
    // Iterate over ability names and create a new SchemaField for each.
    schema.abilities = new fields.SchemaField(
      Object.keys(CONFIG.DAGGERHEART.abilities).reduce((obj, ability) => {
        obj[ability] = new fields.SchemaField({
          value: new fields.NumberField({
            ...requiredInteger,
            initial: 0,
            min: -5,
          }),
          label: new fields.StringField({ required: true, blank: true }),
          checked: new fields.BooleanField({}),
        });
        return obj;
      }, {})
    );

    return schema;
  }

  prepareDerivedData() {
    // Loop through ability scores, and add their modifiers to our sheet output.
    for (const key in this.abilities) {
      // Calculate the modifier using d20 rules.
      this.abilities[key].mod = Math.floor(
        (this.abilities[key].value - 10) / 2
      );
      // Handle ability label localization.
      this.abilities[key].label =
        game.i18n.localize(CONFIG.DAGGERHEART.abilities[key]) ?? key;
    }
  }

  getRollData() {
    const data = {};

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (this.abilities) {
      for (let [k, v] of Object.entries(this.abilities)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    data.lvl = this.attributes.level.value;

    return data;
  }

  get class() {
    const classes = this.parent.items.filter(i => i.type === "class");
    if (classes) return classes[0]

    return {}
  }

  get ancestry() {
    const ancestry = this.parent.items.filter(i => i.type === "card" && i.system.cardType === 'ancestry');
    if (ancestry) return ancestry[0]

    return {}
  }

  get community() {
    const community = this.parent.items.filter(i => i.type === "card" && i.system.cardType === 'community' );
    if (community) return community[0]

    return {}
  }

  
}
