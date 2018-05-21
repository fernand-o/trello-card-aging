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

function display_last_date(card, date){
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

function display_real_age(card, date){
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

function getBoardId(){
  return $(location).attr('href').split('/')[4]
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
  link = "https://trello.com/1/Boards/"+getBoardId()+"/cards/visible?fields=id&actions="+actions;
  $.ajax({
    url: link,
    success: function(result) {
      result.forEach((o, i, a)=>{
        if (o.actions.length == 0)
          return;

        action = o.actions[o.actions.length - 1];
        card = $('.list-card[href*="'+action.data.card.shortLink+'"]')
        if (card.length == 0)
          return;

        display_real_age(card, action.date);
      })
    }
  })
}

function effects_applied(){
  return $('#effects_applied').length == 1;
}

function apply_effects() {
    if (effects_applied())
      return;

    apply_real_age();

    $('<div/>', {
      id: 'effects_applied',
      style: 'display:none'
    }).appendTo($('body'));

    // $('.list-card').each(function(i, o) {
    //   card = $(o);

    //   if (effect_already_applied(card))
    //     return;

    //   link = card.attr('href');
    //   link = link.split('/')[2];
    //   link = "https://trello.com/1/cards/" + link + "?actions=addAttachmentToCard%2CaddChecklistToCard%2CaddMemberToCard%2CcommentCard%2CcopyCommentCard%2CconvertToCardFromCheckItem%2CcreateCard%2CcopyCard%2CdeleteAttachmentFromCard%2CemailCard%2CmoveCardFromBoard%2CmoveCardToBoard%2CremoveChecklistFromCard%2CremoveMemberFromCard%2CupdateCard%3AidList%2CupdateCard%3Aclosed%2CupdateCard%3Adue%2CupdateCheckItemStateOnCard&actions_limit=100"

    //   $.ajax({
    //       url: link,
    //       success: function(result) {
    //           if (!apply_effects($(o), result.actions[0].date, result.actions[result.actions.length - 1].date))
    //             return false;
    //       }
    //   })
    // });
}

function effect_already_applied(card){
  identifier_class = 'ext-effects-identifier';
  if (card.hasClass(identifier_class)){
    return true
  } else {
    card.addClass(identifier_class);
  }
}

// function apply_effects(card, last_mod_date, creation_date){

//     if (global_config.show_age)
//       display_last_date(card, last_mod_date);

//     if (global_config.apply_aging)
//       apply_style(card, last_mod_date);
// }

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
