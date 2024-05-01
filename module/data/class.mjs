export default class DaggerHeartClass extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    schema.selectedDomains = new fields.ArrayField(
      new fields.SchemaField({
        id: new fields.StringField({
          required: true,
          immutable: true,
        }),
        name: new fields.StringField({
          required: true,
          initial: "",
        }),
      })
    );
    schema.editMode = new fields.BooleanField({ initial: true });
    schema.suggested = new fields.StringField({ initial: "" });
    schema.inventory = new fields.StringField({ initial: "" });
    schema.description = new fields.StringField({ initial: "" });

    schema.classFeatures = new fields.ArrayField(
      new fields.SchemaField({
        id: new fields.StringField({
          required: true,
          immutable: true,
        }),
        name: new fields.StringField(),
        description: new fields.StringField(),
      })
    );

    schema.questions = new fields.ArrayField(
      new fields.SchemaField({
        id: new fields.StringField({
          required: true,
          immutable: true,
        }),
        question: new fields.StringField({
          required: true,
          initial: "",
        }),
        answer: new fields.StringField({
          initial: "",
        }),
      })
    );

    schema.choiceItems = new fields.ArrayField(
      new fields.SchemaField({
        id: new fields.StringField({
          required: true,
          immutable: true,
        }),
        choice1: new fields.StringField({
          required: true
        }),
        choice2: new fields.StringField({
          required: true
        })
      })
    );

    schema.wallet = new fields.SchemaField({
      coins: new fields.NumberField({ initial: 2, integer: true }),
      handful: new fields.NumberField({ initial: 0, integer: true }),
      bags: new fields.NumberField({ initial: 0, integer: true }),
      chest: new fields.NumberField({ initial: 0, integer: true }),
    });

    schema.connections = new fields.ArrayField(
      new fields.SchemaField({
        id: new fields.StringField({
          required: true,
          immutable: true,
        }),
        question: new fields.StringField({
          required: true,
          initial: "",
        }),
        answer: new fields.StringField({
          initial: "",
        }),
      })
    );
    schema.defaultEvasion = new fields.NumberField({
      initial: 0,
      integer: true,
    });
    schema.defaultThreshold = new fields.SchemaField({
      minor: new fields.NumberField({ initial: 0, integer: true }),
      major: new fields.NumberField({ initial: 0, integer: true }),
      severe: new fields.NumberField({ initial: 0, integer: true }),
    });

    schema.tier1Description = new fields.StringField({
      initial: "",
    });
    schema.tier2Description = new fields.StringField({
      initial: "",
    });
    schema.tier3Description = new fields.StringField({
      initial: "",
    });

    schema.tier1 = new fields.ArrayField(
      new fields.SchemaField({
        id: new fields.StringField({
          required: true,
          immutable: true,
        }),
        option: new fields.StringField({
          required: true,
          initial: "",
        }),
        checked: new fields.BooleanField({
          initial: false,
        }),
      })
    );

    schema.tier2 = new fields.ArrayField(
      new fields.SchemaField({
        id: new fields.StringField({
          required: true,
          immutable: true,
        }),
        option: new fields.StringField({
          required: true,
          initial: "",
        }),
        checked: new fields.BooleanField({
          initial: false,
        }),
      })
    );

    schema.tier3 = new fields.ArrayField(
      new fields.SchemaField({
        id: new fields.StringField({
          required: true,
          immutable: true,
        }),
        option: new fields.StringField({
          required: true,
          initial: "",
        }),
        checked: new fields.BooleanField({
          initial: false,
        }),
      })
    );

    return schema;
  }
}
