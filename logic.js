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

    if (aging_level > 0)
        card.addClass('aging-pirate aging-level-' + aging_level);
}

function apply_card_aging() {

    $('.list-card').each(function(i, o) {
        link = $(o).find('.list-card-title').attr('href');
        link = link.split('/')[2];
        link = "https://trello.com/1/cards/" + link + "?actions=addAttachmentToCard%2CaddChecklistToCard%2CaddMemberToCard%2CcommentCard%2CcopyCommentCard%2CconvertToCardFromCheckItem%2CcreateCard%2CcopyCard%2CdeleteAttachmentFromCard%2CemailCard%2CmoveCardFromBoard%2CmoveCardToBoard%2CremoveChecklistFromCard%2CremoveMemberFromCard%2CupdateCard%3AidList%2CupdateCard%3Aclosed%2CupdateCard%3Adue%2CupdateCheckItemStateOnCard&actions_limit=1"

        $.ajax({
            url: link,
            success: function(result) {
                apply_style($(o), result.actions[0].date);
            }
        })
    });
}

function start_aging(board_title) {

    board_title = board_title.split('|')[0].trim();
    attempts = 0;
    check = setInterval(
        function() {
            if (board_title == $('.board-header-btn-text:eq(0)').text().trim()) {
                apply_card_aging();
                must_exit = true;
            } else {
                attempts++;
                must_exit = (attempts > 50);
                console.log('not ready');
            }

            if (must_exit)
                clearInterval(check);
        }, 200);
}