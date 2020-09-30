function search() {
    box = document.getElementById('search-box');
    list = document.getElementById('search-results');
    list.innerHTML = '';

    if (box.value == "") {
        return
    }

    config = {
        fields: {
            title: {
                boost: 2,
            },
            body: {
                boost: 1
            }
        },
        bool: "OR",
        expand: true
    }

    INDEX.search(box.value, config).forEach(function(result) {
        listItem = document.createElement("li");
        listItem.className = "search-result-item";
        listItem.innerHTML =
            "<a href='" + result.doc.uri + "'>" + result.doc.title +
            "<p class='search-result-item-preview'>" + searchPreview(result.doc.body) + "</p>" +
            "</a>";

        list.appendChild(listItem);
    });
}

function searchPreview(body) {
    return body.substring(0, 100)
        .replace(/=+/g, "")
        .replace(/#+/g, "")
        .replace(/\*+/g, "")
        .replace(/_+/g, "") +
        "...";
}

function disableScrollifMenuOpen() {
    var checkbox = document.getElementById('menu-toggle-switch');

    if (checkbox.checked) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
}

function atTop() {
    return window.scrollY === 0;
}

function navTouchingBottom() {
    var nav = document.getElementsByClassName("page-nav")[0];

    var height = Math.max(
        document.body.scrollHeight, document.documentElement.scrollHeight,
        document.body.offsetHeight, document.documentElement.offsetHeight,
        document.body.clientHeight, document.documentElement.clientHeight
    );
                                                                         // Magic number determined
                                                                         // by height of bottom wave
    return window.scrollY + nav.offsetTop + nav.offsetHeight >= height - 220;
}

function scrolledUp() {
    var height = Math.max(
        document.body.scrollHeight, document.documentElement.scrollHeight,
        document.body.offsetHeight, document.documentElement.offsetHeight,
        document.body.clientHeight, document.documentElement.clientHeight
    );

                                                         // Magic number determined
                                                         // by height of bottom wave
    return window.scrollY + window.innerHeight < height - 220;
}

function dragRightMenu() {
    if (atTop()) {
        console.log("At top");
        document.getElementById('page-nav').classList.remove('fixed');
        document.getElementsByClassName('sidebar-right')[0].classList.remove('bottom');
    } else if (scrolledUp()) {
        console.log("Moved Up");
        document.getElementById('page-nav').classList.add('fixed');
        document.getElementsByClassName('sidebar-right')[0].classList.remove('bottom');
    } else if (navTouchingBottom()) {
        console.log("At Bottom");
        document.getElementById('page-nav').classList.remove('fixed');
        document.getElementsByClassName('sidebar-right')[0].classList.add('bottom');
    } else {
        console.log("Going down/up");
        document.getElementById('page-nav').classList.add('fixed');
        document.getElementsByClassName('sidebar-right')[0].classList.remove('bottom');
    }
}

function isVisible(element) {
    var rect = element.getBoundingClientRect();
    var elemTop = rect.top;
    var elemBottom = rect.bottom;

    var isVisible = (elemTop >= 0) && (elemBottom <= window.innerHeight);
    return isVisible;
}

// Don't reset scrolling on livereload
window.addEventListener('scroll', function() {
    localStorage.setItem('scrollPosition', window.scrollY);

    dragRightMenu();
}, false);

window.addEventListener('load', function() {
    if (localStorage.getItem('scrollPosition') !== null)
        window.scrollTo(0, localStorage.getItem('scrollPosition'));

    document.getElementById('menu-toggle-switch').addEventListener('change', function(e) {
        disableScrollifMenuOpen();
    });
}, false);


// Initialize mermaid JS
mermaid.initialize({
    startOnLoad: true
});

var INDEX;

// Load search index
fetch('/search_index.json')
    .then(function(response) {
        if (!response.ok) {
            throw new Error("HTTP error " + response.status);
        }
        return response.json();
    })
    .then(function(json) {
        INDEX = elasticlunr.Index.load(json)
        document.getElementById('search-box').oninput = search;
        search();
    });

// Setup keyboard shortcuts

document.onkeydown = function(e) {
    var searchResults = document.getElementById('search-results');
    var first = searchResults.firstChild;
    var searchBox = document.getElementById('search-box');

    switch (e.keyCode) {
        case 83: // The S key
            if (document.activeElement == searchBox) {
                break;
            } else {
                searchBox.focus();
                e.preventDefault();
            }
            break;
        case 38: // if the UP key is pressed
            if (document.activeElement == (searchBox || first)) {
                break;
            } else {
                document.activeElement.parentNode.previousSibling.firstChild.focus();
                e.preventDefault();
            }
            break;
        case 40: // if the DOWN key is pressed
            if (document.activeElement == searchBox) {
                first.firstChild.focus();
                e.preventDefault();
            } else {
                document.activeElement.parentNode.nextSibling.firstChild.focus();
                e.preventDefault();
            }
            break;
    }
}

disableScrollifMenuOpen();
dragRightMenu();
