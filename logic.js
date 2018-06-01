var Config = {};

function getBoardURL(){
  return "https://trello.com/1/Boards/"+ $(location).attr('href').split('/')[4]
}

function findCard(shortLink){
  return $('.list-card[href*="'+shortLink+'"]');
}

function spanRealAge(creationDate){
  return $('<span/>', {
    text: dateDifferenceAsString(creationDate),
    title: 'Created at ' + creationDate.toLocaleDateString("en-US"),
    class: 'card-label',
    css: {
      float: 'left',
      color: Config.show_real_age_text_color,
      "background-color": Config.show_real_age_bg_color,
      "text-shadow": 'none'
    }
  });
}

function spanLastActivityDate(lastModDate){
  return $('<span/>', {
    text: '🕒 ' + dateDifferenceAsString(lastModDate),
    title: 'Last activity at ' + lastModDate.toLocaleDateString("en-US"),
    class: 'card-label',
    css: {
      float: 'right',
      color: Config.show_age_text_color,
      "background-color": Config.show_age_bg_color,
      "text-shadow": 'none'
    }
  });
}

function spanWrapper(cardId){
  obj = findCard(cardId)
  if (obj.length == 0)
    return $('<div />');

  wrapper = obj.find('.trello-card-aging-span-wrapper');
  if (wrapper.length == 0){
    wrapper = $('<div/>', {
      class: 'list-card-labels trello-card-aging-span-wrapper'
    }).insertAfter(obj.find('.list-card-details:eq(0)'));
  }

  return wrapper;
}

function applyDateEffects(){
  if (!(Config.show_age || Config.apply_aging || Config.show_real_age))
    return;

  getListsIDsAndExecute(function(ids){
    ids.forEach((listID) => {
      $.ajax({
        url: "https://trello.com/1/Lists/"+listID+"/cards?fields=id,shortLink&actions=all",
        success: (result) => {
          result.forEach((card) => {
            if (card.actions.length == 0)
              return;

            cardId = card.shortLink;
            creationDate = new Date(card.actions[card.actions.length -1].date)
            lastModDate = new Date(card.actions[0].date);

            if (Config.show_real_age)
              spanRealAge(creationDate).appendTo(spanWrapper(cardId));

            if (Config.show_age)
              spanLastActivityDate(lastModDate).appendTo(spanWrapper(cardId));

            if (Config.apply_aging)
              applyCardAging(cardId, lastModDate);
          });
        }
      });
    });
  });
}

function getListsIDsAndExecute(callback){
  var ids;
  $.ajax({
    url: getBoardURL() + "/lists/open",
    success: (result) => {
      ids = result.map((o) => {
        return o.id;
      });

      callback(ids);
    }
  });
}

function dateDifferenceUntilToday(date){
  today = new Date();
  dateToCompare = new Date(date);

  diff = {};
  diff["seconds"] = (Math.abs(today.getTime() - dateToCompare.getTime())) / 1000;
  diff["minutes"] = Math.ceil(diff["seconds"] / 60);
  diff["hours"] = Math.ceil(diff["minutes"] / 60);
  diff["days"] = Math.ceil(diff["hours"] / 24);
  diff["months"] = Math.ceil(diff["days"] / 30);
  diff["years"] = Math.ceil(diff["months"] / 12);

  return diff;
}

function applyCardAging(cardId, lastActivity) {
  card = findCard(cardId);
  if (card.length == 0)
    return;

  diffDays = dateDifferenceUntilToday(lastActivity)["days"];

  agingLevel = 0;
  if (diffDays > 27) {
    agingLevel = 3
  } else if (diffDays > 13) {
    agingLevel = 2
  } else if (diffDays > 6) {
    agingLevel = 1
  }

  classes = ['aging-pirate', 'aging-regular', 'aging-level-1', 'aging-level-2', 'aging-level-3'];
  classes.forEach((classname)=>{
    card.removeClass(classname);
  });

  if (agingLevel > 0)
    card.addClass('aging-'+ Config.apply_aging_style +' aging-level-'+ agingLevel);
}

function dateDifferenceAsString(date){
  diff = dateDifferenceUntilToday(date);
  keys = Object.getOwnPropertyNames(diff).reverse();

  for (let i in keys){
    key = keys[i];
    value = diff[key];
    if (value > 1)
      return value + ' ' + key;
  };
  return '';
}

function effectsApplied(){
  return $('#effects_applied').length == 1;
}

function setEffectsApplied(){
  $('<div/>', {
    id: 'effects_applied',
    style: 'display:none'
  }).appendTo($('body'));
}

function loadConfig(configString){
  Config = JSON.parse(configString);
}

function applyEffects(configString) {
  if (effectsApplied())
    return;

  loadConfig(configString);
  setTimeout(()=>{
    applyDateEffects();
  }, 300)

  setEffectsApplied();
}
