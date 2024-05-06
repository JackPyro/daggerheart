import doDHRoll from '../helpers/roll-macro.mjs'

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class DaggerHeartHandSheet extends ActorSheet {
  constructor (actor) {
    super(actor)
  }

  /** @override */
  static get defaultOptions () {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['daggerheart', 'sheet', 'actor'],
      width: '100%',
      height: 175,

      popOut: false,
      resizable: true,
      title: 'Player Hand',

      template: `systems/daggerheart/templates/actor/hand.hbs`,
      minimizable: true,
      top: window.innerHeight,
      left: 0,
    })
  }

  /** @override */
  _onSubmit (e) {
    super._onSubmit(e)
  }

  /** @override */
  prepareData () {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData()
  }

  /** @overrider */
  _canUserView (user) {
    return true
  }

  /** @override */
  getData () {
    const context = super.getData()

    const subclasses = []

    if (this.actor.system?.ancestry?.name) {
      // subclasses.push({
      //   ...this.actor.system.ancestry,
      //   system: {
      //     cardType: 'ancestry',
      //     feature: this.actor.system.ancestry.feature,
      //   },
      // })
      if (this.actor.system.ancestry.system.cardFeatures.length) {
        this.actor.system.ancestry.system.cardFeatures.forEach(feature => {
          subclasses.push({
            _id: feature.id,
            name: feature.name,
            img: this.actor.system.ancestry.img,
            system: { cardType: 'ancestry', feature: feature.description },
          })
        })
      }
    }

    if (this.actor.system?.community?.name) {
      if (this.actor.system.community.system.cardFeatures.length) {
        this.actor.system.community.system.cardFeatures.forEach(feature => {
          subclasses.push({
            _id: feature.id,
            name: feature.name,
            img: this.actor.system.community.img,
            system: { cardType: 'ancestry', feature: feature.description },
          })
        })
      }
    }

    const subclassCards = this.actor.items.filter(
      (i) => i.type === 'card' && i.system?.cardType === 'subclass',
    )

    if (subclassCards.length) {
      subclasses.push(...subclassCards)
    }

    context.domains = this.actor.items.filter((i) => i.type === 'domain')
    context.subclasses = subclasses

    return context
  }

  /** @override */
  get template () {
    return `systems/daggerheart/templates/actor/hand.hbs`
  }

  /** @override */
  activateListeners (html) {
    super.activateListeners(html)
    html.on('click', '.hand-roll', () => {
      return doDHRoll(this.actor, 'agi', `Ability roll`)
    })

    html.on('click', '.open-actor-sheet', () => {
      this.actor.sheet.render(true)
    })
    html.on('click', '.ui-card-tooltip', async (ev) => {
      const el = $(ev.currentTarget)

      const content = `
        <h2>${el.data('name')}</h2>
        <p>${el.html()}</p>
      `

      return await ChatMessage.create({
        content,
        speaker: ChatMessage.implementation.getSpeaker({ actor: this.actor }),
      })
    })
  }
}
