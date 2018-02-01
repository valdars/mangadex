// compatibility for chrome
if (!window.browser) {
    browser = chrome;
}

var input = document.getElementById('json');
var errorContainer = document.getElementById('errorContainer');
var errorContent = document.getElementById('errorContent');

function parseJson() {
    let json = input.value;
    if (json.length == 0) {
        error(`No JSON entered.`);
        return;
    }
    let parsed = {};
    try {
        parsed = JSON.parse(json);
    } catch (ex) {
        error(`Invalid JSON.`);
        return;
    }

    buildFollowList(parsed);
}

function fetchJson() {
    // use XMLHttpRequest to get follows from official export link
    var request = new XMLHttpRequest();
    request.overrideMimeType("application/json");
    request.addEventListener("load", function () {
        if (this.status != 200) {
            error(`Unable to get follows list. Are you logged in?`);
        } else {
            input.append(document.createTextNode(this.responseText));
        }
    });
    request.open("GET", "https://vatoto.com/follows_export?method=json");
    request.send();
}

function buildFollowList(follows) {
    let listContainer = document.getElementById('followsList');
    let list = document.createDocumentFragment();

    if (!Array.isArray(follows)) {
        error('Wrong JSON.');
        return;
    }

    follows.forEach(follow => {
        if (follow == null || typeof follow !== 'object' || !follow.comic_id || !follow.title) {
            error('Wrong JSON.');
            return;
        }
        let checkbox = document.createElement('input');
        checkbox.setAttribute('type', 'checkbox');
        //checkbox.setAttribute('checked', 'checked');
        checkbox.classList.add('followCheckbox');
        checkbox.setAttribute('value', follow.comic_id);

        let label = document.createElement('label');
        label.classList.add('checkbox');
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(`${follow.title} (${follow.comic_id})`));

        let li = document.createElement('li');
        li.appendChild(label);
        list.appendChild(li);
    });

    listContainer.appendChild(list);
    document.getElementById('jsonContaner').setAttribute('hidden', true);
    document.getElementById('importContainer').removeAttribute('hidden');
}

function importSelectedFollows() {
    document.querySelectorAll('.followCheckbox:checked').forEach(checkbox => {
        let id = checkbox.value;
        importFollow(id);
    });
}

function importFollow(id) {
    let url = 'https://mangadex.com/ajax/actions.ajax.php?function=manga_follow&id=' + id;

    var myHeaders = new Headers();
    myHeaders.append('referer', 'https://mangadex.com/follows');

    var myInit = {
        method: 'GET',
        headers: myHeaders,
        mode: 'cors',
        cache: 'default'
    };

    var myRequest = new Request(url, myInit);

    fetch(myRequest);

    //var request = new XMLHttpRequest();
    /*request.overrideMimeType("application/json");
    request.addEventListener("load", function () {
        if (this.status != 200) {
            error(`Unable to get follows list. Are you logged in?`);
        } else {
            input.append(document.createTextNode(this.responseText));
        }
    });*/
    /*request.open("GET", url);
    request.send();*/
}

function error(message) {
    errorContent.textContent = message;
    errorContainer.classList.remove('is-hidden');
}

function closeError() {
    errorContainer.classList.add('is-hidden');
}

document.getElementById('btnCloseError').addEventListener('click', closeError);
document.getElementById('btnFetchJson').addEventListener('click', fetchJson);
document.getElementById('btnParseJson').addEventListener('click', parseJson);
document.getElementById('btnImport').addEventListener('click', importSelectedFollows);