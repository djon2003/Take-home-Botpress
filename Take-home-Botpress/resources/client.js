var socket = io();

// Apply tree modification for a file change
socket.on('change', function (entry) {
    var $fileExplorer = $('#fileExplorer');
    loadEntry($fileExplorer, entry);
});

// Show initial load or a folder load
socket.on('load', function (data) {
    var $fileExplorer = $('#fileExplorer');
    if (!$fileExplorer.prop("loaded")) {
        $fileExplorer.find('.list').html('');
        $fileExplorer.prop("loaded", true);
        $fileExplorer.on("click", '.list .folder > .link', function () {
            var $this = $(this);
            var $parent = $this.parent();
            if (!$parent.prop("loaded")) {
                socket.emit('load', $parent.attr("name"));
                $parent.prop("loaded", true);
            }
            $parent.children('.entries').toggle();
            if ($this.attr('data-opened-content') == "+") {
                $this.attr('data-opened-content', "-");
            } else {
                $this.attr('data-opened-content', "+");
            }
        });
    }
    data.entries.forEach(entry => {
        loadEntry($fileExplorer, entry);
    });
});

socket.emit('load', '');

function loadEntry($fileExplorer, entry) {
    // Get/Create container
    var $container = $fileExplorer.find('.list .folder[name="' + entry.container + '"]');
    if ($container.length == 0 && entry.container.indexOf("/") == -1) {
        $container = $('#folderTemplate').clone().attr('id', '');
        $container.attr('name', entry.container);
        $container.prop("loaded", true);
        var $title = $container.find('A.link');
        $title.html(entry.container);
        $fileExplorer.find('.list').append($container);
    }
    if ($container.length == 0 || !$container.prop("loaded")) {
        return; //Skip file change because the container has not been created nor loaded yet
    }

    if (entry.type == "delete" || entry.type == "change") {
        var $entry = $container.find('UL.entries .entry[name="' + entry.container + '/' + entry.name + '"]');
        $entry.remove();
    }

    if (entry.type == "add" || entry.type == "change") {
        if (entry.isDirectory) {
            var $folderTemplate = $('#folderTemplate').clone().attr('id', '');
            $folderTemplate.attr('name', entry.container + '/' + entry.name);
            var $title = $folderTemplate.find('A.link');
            $title.html(entry.name);
            $container.children("UL.entries").append($folderTemplate);
        } else {
            var $fileTemplate = $('#fileTemplate').clone().attr('id', '');
            $fileTemplate.attr('name', entry.container + '/' + entry.name);
            $fileTemplate.html(entry.name);
            $container.children("UL.entries").append($fileTemplate);
        }
    }

}