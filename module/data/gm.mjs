import DaggerHeartActorBase from "./actor-base.mjs";

export default class DaggerHeartGM extends DaggerHeartActorBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.fear = new fields.NumberField({
      initial: 0,
      min: 0,
    });
    schema.action = new fields.NumberField({
      initial: 0,
      min: 0,
    });

    return schema;
  }
}
