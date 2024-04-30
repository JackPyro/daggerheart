const html = (choices) => {
  const choicesTemplate = choices.map((item) => {
    return `
      <div class='choice-dialog'>
        <div class='choice-dialog-select-one'> Select One </div>
        <div class='choice-options'>
        <input type='radio' name='${item.id}' value='${item.choice1}' checked> ${item.choice1} </input>
        <input type='radio' name='${item.id}' value='${item.choice2}'> ${item.choice2} </input>
        </div>
      </div>
    `;
  });

  console.log(choicesTemplate);

  const template = `
    <div class='choice-dialog-wrap'>
      ${choicesTemplate}
    </div>
  `;

  return template;
};

const callback = () => {
  const items = $(".choice-dialog-wrap input:checked").toArray().map(item => $(item).val())
  console.log(items);
  return items;
};
const openChoiceMenu = async (item) => {
  const items = await Dialog.wait({
    buttons: {
      confirm: {
        label: "Confirm",
        callback,
      },
    },
    content: html(item.system.choiceItems),
  });

  console.log(items);

  return items;
};

export default openChoiceMenu;
