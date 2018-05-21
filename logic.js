var debugging = false;

function log(text){
  if (debugging)
    console.log(text);
};

function apply_style(card, date) {
    today = new Date();
    last_activity = date.split('T')[0];
    last_activity = new Date(last_activity);

    timeDiff = Math.abs(today.getTime() - last_activity.getTime());
    diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

    aging_level = 0;

    if (diffDays > 27) {
        aging_level = 3
    } else if (diffDays > 13) {
        aging_level = 2
    } else if (diffDays > 6) {
        aging_level = 1
    }

    if (aging_level > 0){
      card.removeClass('aging-pirate');
      card.removeClass('aging-regular');
      card.removeClass('aging-level-1');
      card.removeClass('aging-level-2');
      card.removeClass('aging-level-3');
      card.addClass('aging-'+ global_config.apply_aging_style +' aging-level-' + aging_level);
    };
}

function display_last_date(cardShortLink, date){
  card = find_card_from_short_link(cardShortLink)
  if (card.length == 0)
    return;

  display_date = last_modified_date_description(date);
  span_style = 'text-shadow: none; background-color: '+ global_config.show_age_bg_color + '; color: ' + global_config.show_age_text_color +';';

  div = $('<div/>', {
    class: 'list-card-labels ext-labels'
  }).insertAfter(card.find('.list-card-details:eq(0)'));//card.find('.list-card-details:eq(0)'));

  $('<span/>', {
    class: 'card-label last_modification_span',
    title: 'Last modification date',
    style: span_style,
    text: '🕒 '+ display_date
  }).appendTo(div);
}

function display_real_age(cardShortLink, date){
  card = find_card_from_short_link(cardShortLink)
  if (card.length == 0)
    return;

  display_date = last_modified_date_description(date);
  span_style = 'float:left; text-shadow: none; background-color: '+ global_config.show_real_age_bg_color + '; color: ' + global_config.show_real_age_text_color +';';

  parent = card.find('.ext-labels')
  if (parent.length == 0) {
    parent = $('<div/>', {
      class: 'list-card-labels ext-labels'
    }).insertAfter(card.find('.list-card-details:eq(0)'));
  }

  $('<span/>', {
    class: 'card-label last_modification_span',
    title: 'Created at ' + date,
    style: span_style,
    text: display_date
  }).appendTo(parent);
}

function last_modified_date_description(date){
  today = new Date();
  last_activity = new Date(date);

  log('today ' + today);
  log('last '+ last_activity);
  diffMilisec = Math.abs(today.getTime() - last_activity.getTime());
  diffSeconds = Math.ceil(diffMilisec / 1000);
  diffMinutes = Math.ceil(diffSeconds / 60);
  diffHours = Math.ceil(diffMinutes / 60);
  diffDays = Math.ceil(diffHours / 24);
  diffMonths = Math.ceil(diffDays / 30);
  diffYears = Math.ceil(diffMonths / 12);

  log(diffMilisec);
  log(diffSeconds);
  log(diffMinutes);
  log(diffHours);
  log(diffDays);

  msg = '';

  if (diffYears > 1)
    return diffYears + ' years ago';

  if (diffMonths > 1)
    return  diffMonths + ' months ago';

  if (diffDays > 1)
    return  diffDays + ' days ago';

  if (diffHours > 1)
    return  diffHours + ' hours ago';

  if (diffMinutes > 1)
    return  diffMinutes + ' minutes ago';

  if (diffSeconds > 1)
    return  diffSeconds + ' seconds ago';

  return '';
}

function getBoardURL(){
  return "https://trello.com/1/Boards/"+ $(location).attr('href').split('/')[4]
}

function find_card_from_short_link(shortLink){
  return $('.list-card[href*="'+shortLink+'"]');
}

function apply_real_age(){
  if (!global_config.show_real_age)
    return;

  card_creation_actions = [
    "createCard",
    "copyCard",
    "convertToCardFromCheckItem",
    "moveCardFromBoard",
    "moveCardToBoard",
  ];
  actions = card_creation_actions.join(",");

  $.ajax({
    url: getBoardURL()+"/cards/visible?fields=id&actions="+actions,
    success: function(result) {
      result.forEach((o, i, a)=>{
        if (o.actions.length == 0)
          return;

        action = o.actions[o.actions.length - 1];
        display_real_age(action.data.card.shortLink, action.date);
      })
    }
  })
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

function apply_last_modification(){
  if (!(global_config.show_age || global_config.apply_aging))
    return;

  lists = getListsIDs();
  lists.forEach((listID) => {
    $.get(
      "https://trello.com/1/Lists/"+listID+"/cards?fields=id,name&actions=all",
      (result) => {
        result.forEach((card) => {
          if (card.actions.length == 0)
            return;

          action = card.actions[0];
          display_last_date(action.data.card.idShort, action.date);
        })
      }
    );
  });

  // if (global_config.apply_aging)
    // apply_style(card, last_mod_date);
}

function effects_applied(){
  return $('#effects_applied').length == 1;
}

function apply_effects() {
    if (effects_applied())
      return;

    apply_real_age();
    apply_last_modification();

    $('<div/>', {
      id: 'effects_applied',
      style: 'display:none'
    }).appendTo($('body'));
}

function effect_already_applied(card){
  identifier_class = 'ext-effects-identifier';
  if (card.hasClass(identifier_class)){
    return true
  } else {
    card.addClass(identifier_class);
  }
}

function start_effects_timer(config_as_string) {
    log('Waiting for page fully loaded..');
    log('Config to be used:');
    global_config = JSON.parse(config_as_string);
    log(global_config);

    setTimeout(
      function(){
        apply_effects();
      }, 300);
}
