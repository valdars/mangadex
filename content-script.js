var follows = [];
var delay = 300;
var $form = $('#import_form');
var $textarea = $('textarea', $form);
var $fetchJsonButton = $('<button type="submit" class="btn btn-default"><span class="fas fa-upload fa-fw" aria-hidden="true" title=""></span> <span class="span-1280">Get JSON from Vatoto</span></button>');
$form.append($fetchJsonButton);

let $prepareImportButton = $('<button type="submit" class="btn btn-default"><span class="fas fa-upload fa-fw" aria-hidden="true" title=""></span> <span class="span-1280">Prepare for import</span></button>');
$form.append($prepareImportButton);

let $startImportButton = $('<button type="submit" class="btn btn-default hidden"><span class="fas fa-upload fa-fw" aria-hidden="true" title=""></span> <span class="span-1280">Start importing</span></button>');
$form.append($startImportButton);

$fetchJsonButton.on('click', function (evt) {
    evt.preventDefault();

    var request = new window.XMLHttpRequest();
    request.overrideMimeType("application/json");
    request.addEventListener("load", function () {
        if (this.status != 200) {
            alert(`Unable to get follows list. Are you logged in?`);
        } else {
            $textarea.val(this.responseText);
        }
    });
    request.open("GET", "https://vatoto.com/follows_export?method=json");
    request.send();

    return false;
});

$prepareImportButton.on('click', function (evt) {
    evt.preventDefault();

    let $list = $('<ul class="list-group">');

    var json = parseAndValidateJson($textarea.val());
    if(!json) {
        alert('Invalid JSON');
        return false;
    }

    follows = [];
    json.forEach(x => {
        follows.push(x.comic_id);
        $list.append($(`<li class="list-group-item"><label>${x.title}</label>&nbsp;<span class="pull-right label label-info follow-status" data-followid="${x.comic_id}">Waiting</span></li>`));
    });
    $textarea.replaceWith($list);

    $fetchJsonButton.addClass('hidden');
    $prepareImportButton.addClass('hidden');
    $startImportButton.removeClass('hidden');

    //importFollow(22832);

    return false;
});

$startImportButton.on('click', function (evt) {
    evt.preventDefault();

    setInterval(importNextFollow, 1000);
    return false;
});

function parseAndValidateJson(text) {
    let json = null;
    try {
        json = JSON.parse(text);
    }catch(ex) {
        return false;
    }
    
    if (!Array.isArray(json)) {
        return false;
    }

    if (json.length == 0) {
        return false;
    }

    let follow = json[0];
    if (follow == null || typeof follow !== 'object' || !follow.comic_id || !follow.title) {
        return false;
    }

    return json;
}

function importNextFollow() {
    let followId = follows.shift();
    importFollow(followId);
}

function importFollow(id) {
    let $status = $(`.follow-status[data-followid="${id}"]`);
    $status.text('Processing').removeClass('label-info').addClass('label-primary');
    let request = $.ajax({
        url: `/ajax/actions.ajax.php?function=manga_follow&id=${id}`,
        type: "GET",
        xhr: () => {
            return new content.XMLHttpRequest();
        }
    });
    request.done(function (msg) {
        $status.text('Done').removeClass('label-primary').addClass('label-success');
    });

    request.fail(function (jqXHR, textStatus) {
        $status.text('Failed').removeClass('label-primary').addClass('label-danger');
    });
}