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
export class DaggerHeartCharacterSheet extends ActorSheet {
  /** @override */
  static get defaultOptions () {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['daggerheart', 'sheet', 'actor'],
      width: 700,
      height: 700,
      tabs: [
        {
          navSelector: '.navigation-tab',
          contentSelector: '.content-body',
          initial: 'loadout',
        },
        {
          navSelector: '.inventory-nav',
          contentSelector: '.inventory-content',
          initial: 'normal_cards',
        },
      ],
    })
  }

  /** @override */
  get template () {
    return `systems/daggerheart/templates/actor/character-sheet.hbs`
  }

  async _onDropItemCreate (itemData) {
    if (this.actor.type === 'character') {
      if (itemData.type === 'class') {
        this._handleClassUpdate(itemData)
      }

      if (
        (itemData.type === 'card') &
        (itemData.system.cardType === 'ancestry')
      ) {
        this.actor.items.forEach(async (item) => {
          if (
            (item.type === 'card') &
            (item.system.cardType === 'ancestry') &
            (item._id !== itemData._id)
          ) {
            await item.delete()
          }
        })
      }

      if (
        (itemData.type === 'card') &
        (itemData.system.cardType === 'community')
      ) {
        this.actor.items.forEach(async (item) => {
          if (
            (item.type === 'card') &
            (item.system.cardType === 'community') &
            (item._id !== itemData._id)
          ) {
            await item.delete()
          }
        })
      }
    }

    return super._onDropItemCreate(itemData)
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

    // Prepare character data and items.
    if (actorData.type == 'character') {
      this._prepareItems(context)
      this._prepareCharacterData(context)
    }

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

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterData (context) {
    // Handle ability scores.
    // for (let [k, v] of Object.entries(context.system.abilities)) {
    //   v.label = game.i18n.localize(CONFIG.DAGGERHEART.abilities[k]) ?? k;
    // }
    if (this.actor.system.class) {
      context.leveling = [
        {
          position: 1,
          level: 'Level 2-4',
          bonus: 'At Level 2, take an additional Experience.',
          items: this.actor.system?.class?.tier1 ?? [],
          description: this.actor.system.class?.tier1Description ?? '',
        },
        {
          position: 2,
          level: 'Level 5-7',
          bonus:
            'At Level 5, take an additional Experience and clear all marks on Character Traits.',
          items: this.actor.system.class?.tier2 ?? [],
          description: this.actor.system.class?.tier2Description ?? '',
        },
        {
          position: 3,
          level: 'Level 8-10',
          bonus:
            'At Level 8, take an additional Experience and clear all marks on Character Traits.',
          items: this.actor.system.class?.tier3 ?? [],
          description: this.actor.system.class?.tier3Description ?? '',
        },
      ]
    }
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems (context) {
    // Initialize containers.
    const cards = {}
    const active_loadout = []
    const weapons = []
    const vault = []
    const armors = []
    const randomItems = [];

    const equipment = {
      armor: null,
      primary: null,
      secondary: null,
    }

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || Item.DEFAULT_ICON

      if (i.type === 'armor') {
        if (i.system.isEquipped) {
          equipment.armor = i
        } else {
          armors.push(i)
        }
        continue
      }

      if (i.type === 'weapon') {
        const abilityScore = this.actor.system.abilities[i.system.trait].value
        const abilityScorePrefix = abilityScore >= 0 ? '+' : '-'
        const abilityFullName = game.i18n.localize(
          DAGGERHEART.abilities[i.system.trait],
        )

        const extendedWeapon = {
          ...i,
          abilityScore,
          abilityFullName,
          abilityScorePrefix,
        }

        if (i.system.isEquipped) {
          if (i.system.isSecondary) {
            equipment.secondary = extendedWeapon
            continue
          } else {
            equipment.primary = extendedWeapon
            continue
          }
        } else {
          weapons.push(extendedWeapon)
          continue
        }
      }

      if (i.type === 'card') {
        cards[i.system.cardType] = cards[i.system.cardType]
          ? [...cards[i.system.cardType], i]
          : [i]
        continue
      }
      if (i.type === 'class') {
        continue
      }
      if (i.type === 'domain') {
        i.system.active ? active_loadout.push(i) : vault.push(i)
        continue
      }

      randomItems.push(i)
    }

    // Assign and return
    context.cards = [
      ...(cards.ancestry ? cards.ancestry : []),
      ...(cards.community ? cards.community : []),
      ...(cards.class ? cards.class : []),
      ...(cards.subclass ? cards.subclass : []),
    ]
    context.active_loadout = active_loadout
    context.vault = vault
    context.weapons = weapons
    context.equipment = equipment
    context.armors = armors
    context.gear = [...weapons, ...armors, ...randomItems]
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners (html) {
    super.activateListeners(html)

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return

    html.on('click', '.open-loadout', (ev) => {
      if (game.user.character) {
        new DaggerHeartHandSheet(game.user.character).render(true)
      }
    })

    html.on('click', '.accordion', (ev) => {
      const id = $(ev.currentTarget).data('accordion')

      const content = $(`.accordion-content[data-accordion="${id}"]`)
      content.toggle()
      $(ev.currentTarget).toggleClass('active')
    })

    html.on('click', `[data-action="add-character-item"]`, async (ev) => {
      const { type } = await Dialog.wait({
        buttons: {
          OK: {
            label: 'Ok',
            callback: (html, event) => {
              const type = html.find('#create-item-type option:selected').val()
              console.log(html.find('#create-item-type option:selected'))

              return { type }
            },
          },
        },
        content: `
          <select id="create-item-type" name="type">
            <option value="item">Item</option>
            <option value="weapon">Weapon</option>
            <option value="armor">Armor</option>
          </select>
        `,
      })

      await await Item.create(
        { type, name: `New ${type}` },
        { parent: this.actor },
      )
    })

    html.on('click', '[data-action=\'ability-roll\']', (ev) => {
      const type = $(ev.currentTarget).data('type')
      const label = $(ev.currentTarget).data('label')
      return doDHRoll(this.actor, type, `${label} roll`)
    })

    // Character Card Management
    html.on('click', `[data-action="toggle-card"]`, async (ev) => {
      const id = $(ev.currentTarget).data('id')
      const item = this.actor.items.get(id)
      item.update({ 'system.active': !item.system.active })
    })

    html.on('click', `[data-action="weapon-roll"]`, async (ev) => {
      const id = $(ev.currentTarget).data('id')
      const item = this.actor.items.get(id)
      console.log('henlo')
      if (!item) {
        return
      }

      return doDHRoll(this.actor, item.system.trait, 'Attack roll')
    })

    html.on('click', `[data-action="weapon-damage"]`, async (ev) => {
      const id = $(ev.currentTarget).data('id')
      const item = this.actor.items.get(id)

      if (!item) {
        return
      }

      const roll = await new Roll(
        `${this.actor.system.proficiency}${item.system.damage}`,
      )

      return roll.toMessage()
    })

    // Character Armor equip / unequip
    html.on('click', `[data-action="armor-toggle"]`, async (ev) => {
      const id = $(ev.currentTarget).data('id')
      const item = this.actor.items.get(id)

      if (item.system.isEquipped) {
        item.update({ 'system.isEquipped': false })
        return
      }

      this.actor.items.forEach((armor) => {
        if (armor.type === 'armor') {
          if (armor.system.isEquipped) {
            armor.update({ 'system.isEquipped': false })
          }
        }
      })

      item.update({ 'system.isEquipped': true })
      return
    })

    // Weapon equip / unequip
    html.on('click', `[data-action="weapon-toggle"]`, async (ev) => {
      console.log(this.actor.items)
      const id = $(ev.currentTarget).data('id')
      const itemToEquip = this.actor.items.get(id)

      console.log(itemToEquip)

      if (itemToEquip.system.isEquipped) {
        itemToEquip.update({ 'system.isEquipped': false })
        return
      }

      let has1H = false
      let has2H = false
      let hasSecondary = false

      this.actor.items.forEach((item) => {
        const isEquipped = item.system.isEquipped
        const is1H = item.system.burden === '1H'
        const is2H = item.system.burden === '2H'
        const isSecondary = item.system.isSecondary

        if (isEquipped && is1H) has1H = true
        if (isEquipped && is2H) has2H = true
        if (isEquipped && isSecondary) hasSecondary = true

        if (itemToEquip.system.burden === '2H') {
          if (has1H || hasSecondary) {
            item.update({ 'system.isEquipped': false })
          }
        } else if (itemToEquip.system.burden === '1H' && has2H) {
          item.update({ 'system.isEquipped': false })
        } else if (
          itemToEquip.system.isSecondary &&
          has1H &&
          !hasSecondary &&
          isSecondary
        ) {
          item.update({ 'system.isEquipped': true })
          console.log(`Equipped ${item.type}: ${item.name}`)
        }
      })

      itemToEquip.update({ 'system.isEquipped': true })
    })

    html.on('click', '[data-action="item-delete"]', async (ev) => {
      const id = $(ev.currentTarget).data('id')
      const item = this.actor.items.get(id)
      item.delete()
    })

    html.on('click', '[data-action="item-edit"]', async (ev) => {
      const id = $(ev.currentTarget).data('id')
      const item = this.actor.items.get(id)
      item.sheet.render(true)
    })

    html.on('click', `[data-action="item-show"]`, async (ev) => {
      ev.preventDefault()
      ev.stopPropagation()
      const id = $(ev.currentTarget).data('id')
      const item = this.actor.items.get(id)
      return await ChatMessage.create({
        content: `
          ${item.name}
          ${item.system.feature ? item.system.feature : ''}
        `,
        speaker: ChatMessage.implementation.getSpeaker({ actor: this.actor }),
      })
    })

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

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = (ev) => this._onDragStart(ev)
      html.find('li.item').each((i, li) => {
        if (li.classList.contains('inventory-header')) return
        li.setAttribute('draggable', true)
        li.addEventListener('dragstart', handler, false)
      })
    }
  }

  async _handleClassUpdate (itemData) {
    await this.actor.update({
      'system.hitpoints': itemData.system.defaultThreshold,
      'system.evasion': itemData.system.defaultEvasion,
      'system.wallet': itemData.system.wallet,
      'system.class': itemData.system,
    })

    if (itemData.system.choiceItems) {
      const items = await openChoiceMenu(itemData)
      items.forEach(async (item) => {
        const result = await Item.create({ type: 'item', name: item },
          { parent: this.actor })
      })
    }

    this.actor.items.forEach((item) => {
      if (
        (item.type === 'card') & (item.system.cardType === 'class') ||
        (item.type === 'class') & (item._id !== this.actor.system.classItem._id)
      ) {
        item.delete()
      }
    })

    if (itemData.system.classFeatures) {
      itemData.system.classFeatures.forEach(async (classFeature) => {
        await Item.create(
          {
            type: 'card',
            name: classFeature.name,
            system: { cardType: 'class', feature: classFeature.description },
          },
          { parent: this.actor },
        )
      })
    }

    await Item.create(
      { type: 'item', name: 'A torch' },
      { parent: this.actor },
    )
    await Item.create(
      { type: 'item', name: '50ft of rope' },
      { parent: this.actor },
    )
    await Item.create(
      { type: 'item', name: 'Basic supplies' },
      { parent: this.actor },
    )
  }
}
