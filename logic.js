var Config = {};

function applyCardAging(cardId, lastActivity) {
  card = findCard(cardId);
  if (card.length == 0)
    return;

  today = new Date();
  timeDiff = Math.abs(today.getTime() - lastActivity.getTime());
  diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

  agingLevel = 0;
  if (diffDays > 27) {
    agingLevel = 3
  } else if (diffDays > 13) {
    agingLevel = 2
  } else if (diffDays > 6) {
    agingLevel = 1
  }

  if (agingLevel > 0){
    for (let classname in ['aging-pirate', 'aging-regular', 'aging-level-1', 'aging-level-2', 'aging-level-3'])
      card.removeClass(classname);

    card.addClass('aging-'+ Config.apply_aging_style +' aging-level-'+ agingLevel);
  };
}

function dateDifferenceAsString(date){
  today = new Date();
  last_activity = new Date(date);
  diffMilisec = Math.abs(today.getTime() - last_activity.getTime());
  diffSeconds = Math.ceil(diffMilisec / 1000);
  diffMinutes = Math.ceil(diffSeconds / 60);
  diffHours = Math.ceil(diffMinutes / 60);
  diffDays = Math.ceil(diffHours / 24);
  diffMonths = Math.ceil(diffDays / 30);
  diffYears = Math.ceil(diffMonths / 12);

  msg = '';

  if (diffYears > 1)
    return diffYears + ' years';

  if (diffMonths > 1)
    return diffMonths + ' months';

  if (diffDays > 1)
    return diffDays + ' days';

  if (diffHours > 1)
    return diffHours + ' hours';

  if (diffMinutes > 1)
    return diffMinutes + ' minutes';

  if (diffSeconds > 1)
    return  diffSeconds + ' seconds';

  return '';
}

function getBoardURL(){
  return "https://trello.com/1/Boards/"+ $(location).attr('href').split('/')[4]
}

function findCard(shortLink){
  return $('.list-card[href*="'+shortLink+'"]');
}

function spanRealAge(creationDate, displayDate){
  return $('<span/>', {
    text: displayDate,
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

function spanLastActivityDate(lastModDate, displayDate){
  return $('<span/>', {
    text: '🕒 ' + displayDate,
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

function applyRealAge(){
  if (!Config.show_real_age)
    return;

  cardCreationActions = [
    "createCard",
    "copyCard",
    "convertToCardFromCheckItem",
    "moveCardFromBoard",
    "moveCardToBoard"
  ].join(",");

  $.ajax({
    url: getBoardURL()+"/cards/visible?fields=id,shortLink&actions="+cardCreationActions,
    success: function(result) {
      result.forEach((o)=>{
        if (o.actions.length == 0)
          return;

        cardId = o.shortLink;
        creationDate = new Date(o.actions[o.actions.length - 1].date);
        displayDate = dateDifferenceAsString(creationDate);
        if (Config.show_real_age)
          spanRealAge(creationDate, displayDate).appendTo(spanWrapper(cardId));
      });
    }
  });
}

function applyLastActivity(){
  if (!(Config.show_age || Config.apply_aging))
    return;

  lists = getListsIDs();
  lists.forEach((listID) => {
    $.ajax({
      url: "https://trello.com/1/Lists/"+listID+"/cards?fields=id,shortLink&actions=all",
      success: (result) => {
        result.forEach((card) => {
          if (card.actions.length == 0)
            return;

          lastModDate = new Date(card.actions[0].date);
          displayDate = dateDifferenceAsString(lastModDate);
          cardId = card.shortLink;

          if (Config.show_age)
            spanLastActivityDate(lastModDate, displayDate).appendTo(spanWrapper(cardId));

          if (Config.apply_aging)
            applyCardAging(cardId, lastModDate);
        });
      }
    });
  });
}

function getListsIDs(){
  var lists;
  $.ajax({
    url: getBoardURL() + "/lists/open",
    success: (result) => {
      lists = result.map((o) => {
        return o.id;
      })
    },
    async: false
  });
  return lists;
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

function start_effects_timer(configString) {
  if (effectsApplied())
    return;

  loadConfig(configString);
  setTimeout(()=>{
    applyRealAge();
    applyLastActivity();
  }, 300)

  setEffectsApplied();
}
