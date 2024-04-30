import { DAGGERHEART } from "../helpers/config.mjs";
import DaggerHeartActorBase from "./actor-base.mjs";

export default class DaggerHeartAdversary extends DaggerHeartActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.tier = new fields.NumberField({ initial: 0, min: 0 });
    schema.difficulty = new fields.NumberField({ initial: 0, min: 0 });
    schema.attackMod = new fields.NumberField({ initial: 0, min: 0 });
    schema.description = new fields.StringField({  initial: "", });
    schema.tactics = new fields.StringField({  initial: "", });
    schema.type = new fields.StringField({  initial: "solo", });
    schema.weapon = new fields.SchemaField({
      name: new fields.StringField({
        required: true,
        initial: "",
      }),
      range: new fields.StringField({
        required: true,
        initial: "",
      }),
      damage: new fields.StringField({
        required: true,
        initial: "",
      }),
      type: new fields.StringField({
        required: true,
        initial: "",
      }),
    });

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
      })
    );

    schema.features = new fields.ArrayField(
      new fields.SchemaField({
        id: new fields.StringField({
          required: true,
          immutable: true,
        }),
        name: new fields.StringField({
          required: true,
          initial: "",
        }),
        description: new fields.StringField({
          required: true,
          initial: "",
        }),
       
      })
    );

    schema.hitpoints = new fields.SchemaField({
      minor: new fields.NumberField({ initial: 0, integer: true }),
      major: new fields.NumberField({ initial: 0, integer: true }),
      severe: new fields.NumberField({ initial: 0, integer: true }),
    });

    schema.editMode = new fields.BooleanField({initial: false})
  
    return schema
  }

  prepareDerivedData() {
   
  }
}