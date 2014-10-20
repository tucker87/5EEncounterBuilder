if (!Array.prototype.last) {
    Array.prototype.last = function () {
        return this[this.length - 1];
    };
};

$(document).ready(function () {
    addPlayer();
    addMonster();
});

function addPlayer() {
    $('.players')
        .append($('<div></div>')
            .addClass('player')
            .text("Level: ")
            .append($('<input/>')
                .val(1)
                .blur(function () { calculateEncounter(); })
            )
            .append($('<input/>')
                .attr('type', 'button')
                .click(function() { removePlayer(this); })
                .val("-")
            )
        );
    calculateEncounter();
}

function removePlayer(sender) {
    $(sender).parent().remove();
    calculateEncounter();
}

function addMonster() {
    $('.monsters')
        .append($('<div></div>')
            .addClass('monster')
            .text("Count: ")
            .append($('<input/>')
                .addClass('monsterCount')
                .val(1)
                .blur(function () { calculateEncounter(); })
            )
            .append(' CR: ')
            .append($('<input/>')
                .attr('list', 'challengeRatings')
                .addClass('monsterCr')
                .val("1/8")
                .blur(function () { calculateEncounter(); })
            )
            .append($('<input/>')
                .attr('type', 'button')
                .click(function () { removeMonster(this); })
                .val("-")
            )
        );
    calculateEncounter();
}

function removeMonster(sender) {
    $(sender).parent().remove();
    calculateEncounter();
}

function calculateEncounter() {
    $('.encounterXp').children().remove();
    $('.encounterDiff').children().remove();

    var xp = calculateXp();
    $('.encounterXp')
        .append($('<span></span>')
            .text(xp)
        );

    $('.encounterDiff')
        .append($('<span></span>')
            .text(calculateDiff(xp))
        );
}

function calculateXp() {
    var xp = 0;
    var monsterCount = 0;
    $('.monsters').children().each(function (index, monster) {
        monsterCount += parseInt($(monster).children('.monsterCount').val());
        var count = $(monster).children('.monsterCount').val();
        var cr = $(monster).children('.monsterCr').val();
        xp += getXp(cr) * count;
    });

    var multiplier;
    $.ajax({
        url: 'Size-Mult.json',
        dataType: 'json',
        async: false,
        success: function (data) {
            $.each(data.d, function (index, d) {
                if (d.count == monsterCount)
                    multiplier = d.multiplier;
            });
            if (multiplier == undefined)
                multiplier = data.d.last().multiplier;
        }
    });

    return xp*multiplier;
}

function getXp(challengeRating) {
    var xp;
    $.ajax({
        url: 'CR-XP.json',
        dataType: 'json',
        async: false,
        success: function(data) {
            $.each(data.d, function(index, d) {
                if (d.cr == challengeRating)
                    xp = d.xp;
            });
        }
    });
    return xp;
}

function calculateDiff(xp) {
    var levels = [];
    $('.players').children().each(function (index, player) {
        var level = $(player).children('input').val();
        levels.push(level);
    });
    var levelDiff;
    $.ajax({
        url: 'Level-Diff.json',
        dataType: 'json',
        async: false,
        success: function (data) {
            levelDiff = data.d;
        }
    });
    var targetXp = {easy:0, medium:0, hard:0, deadly:0}
    $.each(levels, function(index, level) {
        $.each(levelDiff, function(diffIndex, diff) {
            if (diff.level == level) {
                targetXp.easy += diff.easy;
                targetXp.medium += diff.medium;
                targetXp.hard += diff.hard;
                targetXp.deadly += diff.deadly;
            }
        });
    });
    if (xp <= targetXp.easy) return "Easy";
    if (xp <= targetXp.medium) return "Medium";
    if (xp <= targetXp.hard) return "Hard";
    return "Deadly";
}