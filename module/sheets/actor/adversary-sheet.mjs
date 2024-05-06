import doGMRoll from '../../helpers/adversary-roll.mjs'
import { DAGGERHEART } from '../../helpers/config.mjs'
import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../../helpers/effects.mjs'
import openChoiceMenu from '../../helpers/item-choices.mjs'
import doDHRoll from '../../helpers/roll-macro.mjs'
import { DaggerHeartHandSheet } from '../hand-sheet.mjs'

// tabs.bind(window);
/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class DaggerHeartAdversarySheet extends ActorSheet {
  /** @override */
  static get defaultOptions () {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['daggerheart', 'sheet', 'adversary'],
      width: 700,
      height: 700
    })
  }

  /** @override */
  get template () {
    return `systems/daggerheart/templates/actor/adversary-sheet.hbs`
  }

  /* -------------------------------------------- */

  /** @override */
  getData () {
    console.log(this.actor)
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData()

    // Use a safe clone of the actor data for further operations.
    const actorData = context.data

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system
    context.flags = actorData.flags

    context.enemy_types = Object.keys(DAGGERHEART.enemy_types).map((key) => ({
      value: key,
      label: DAGGERHEART.enemy_types[key],
    }))

    context.attack_types = Object.keys(DAGGERHEART.attack_types).map((key) => ({
      value: key,
      label: DAGGERHEART.attack_types[key],
    }))
    context.ranges = Object.keys(DAGGERHEART.range).map((key) => ({
      value: key,
      label: DAGGERHEART.range[key],
    }))

    context.hasCharacter = game.user.character

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData()

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(
      // A generator that returns all effects stored on the actor
      // as well as any items
      this.actor.allApplicableEffects(),
    )

    return context
  }

  /** @override */
  activateListeners (html) {
    super.activateListeners(html)

    if (!this.isEditable) return

    html.on('click', '[data-action=\'experience-add\']', async (ev) => {
      const exps = this.actor.system.experiences
      const newExp = {
        id: await crypto.randomUUID(),
        name: 'New Experience',
        mod: 0,
      }

      exps.push(newExp)
      this.actor.update({ 'system.experiences': exps })
    })

    html.on('click', '[data-action=\'experience-delete\']', (ev) => {
      ev.preventDefault()
      ev.stopPropagation()
      const id = $(ev.currentTarget).data('id')

      const exps = this.actor.system.experiences.filter((i) => i.id !== id)

      this.actor.update({ 'system.experiences': exps })
    })

    html.on('click', '[data-action="attack-roll"]', async () => {
      doGMRoll(this.actor, `Attack Roll`)
    })

    html.on('click', '[data-action="damage-roll"]', async () => {
      const roll = await new Roll(`${this.actor.system.weapon.damage}`)

      roll.toMessage({
        flavor: `<div class="section">${this.actor.system.weapon.name}</div> <div class="bg-card"> ${this.actor.system.weapon.range} - ${this.actor.system.weapon.type} dmg</div>`,

        speaker: ChatMessage.implementation.getSpeaker({ actor: this.actor }),
      })
    })

    html.on('click', '[data-action="feature-add"]', async (ev) => {
      const features = this.actor.system.features
      const newFeature = {
        id: await crypto.randomUUID(),
        name: 'New Feature',
        mod: 0,
      }

      features.push(newFeature)

      this.actor.update({ 'system.features': features })
    })

    html.on('click', '[data-action="feature-delete"]', (ev) => {
      const id = $(ev.currentTarget).data('id')
      const features = this.actor.system.features.filter((i) => i.id !== id)

      this.actor.update({ 'system.features': features })
    })

    html.on('click', '[data-action="feature-show"]', async (ev) => {
      const id = $(ev.currentTarget).data('id')
      const feature = this.actor.system.features.find((i) => i.id !== id)

      return await ChatMessage.create({
        content: `
          <div class="item-chat-header">${feature.name}</div>
          <div class="item-chat-body">
            ${feature.description}
          </div>
        `,
        speaker: ChatMessage.implementation.getSpeaker({ actor: this.actor })
      });
    })
  }
}
