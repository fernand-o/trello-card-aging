var debugging = true;

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
    class: 'list-card-labels js-card-labels'
  }).insertAfter(card.find('.list-card-details:eq(0)'));//card.find('.list-card-details:eq(0)'));

  $('<span/>', {
    class: 'card-label last_modification_span',
    title: 'Last modification date',
    style: span_style,
    text: '🕒 '+ display_date
  }).appendTo(div);
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

function process_all_cards() {
    log('Processing all cards');

    $('.list-card').each(function(i, o) {

        link = $(o).find('.list-card-title').attr('href');
        link = link.split('/')[2];
        link = "https://trello.com/1/cards/" + link + "?actions=addAttachmentToCard%2CaddChecklistToCard%2CaddMemberToCard%2CcommentCard%2CcopyCommentCard%2CconvertToCardFromCheckItem%2CcreateCard%2CcopyCard%2CdeleteAttachmentFromCard%2CemailCard%2CmoveCardFromBoard%2CmoveCardToBoard%2CremoveChecklistFromCard%2CremoveMemberFromCard%2CupdateCard%3AidList%2CupdateCard%3Aclosed%2CupdateCard%3Adue%2CupdateCheckItemStateOnCard&actions_limit=1"

        $.ajax({
            url: link,
            success: function(result) {
                if (!apply_effects($(o), result.actions[0].date))
                  return false;
            }
        })
    });
}

function effect_already_applied(card){
  identifier_class = 'ext-effects-identifier';
  if (card.hasClass(identifier_class)){
    return true
  } else {
    card.addClass(identifier_class);
  }
}

function apply_effects(card, date){
    if (effect_already_applied(card))
      return false;

    if (global_config.show_age)
      display_last_date(card, date);

    if (global_config.apply_aging)
      apply_style(card, date);
}

function start_effects_timer(config_as_string) {
    log('Waiting for page fully loaded..');
    log('Config to be used:');
    global_config = JSON.parse(config_as_string);
    log(global_config);

    setTimeout(
      function(){
        process_all_cards();
      }, 1000);    
}
