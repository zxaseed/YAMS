/* Author: Richard Benson
 * YAMS Javascripts
 */
 
if (typeof YAMS == "undefined" || !YAMS) {
    var YAMS = {};
}

YAMS = {

    servers: [],

    timer: 0,

    server: function (id, name, ver) {
        this.id = id;
        this.name = name;
        this.ver = ver;

        this.timer = 0;

        this.lastLogId = 0;
        this.status = "stopped";

        this.init = function () {
            var d = document.createElement("div");
            d.id = "server_" + this.id;
            //Copy the template
            d.innerHTML = $('#server-template').html();

            //Add to the body
            $('#main').append(d);

            $('#server_' + this.id).addClass('server');

            //Add server specific info
            $('#server_' + this.id + ' h2').html(this.name + " (" + this.ver + ")");

            //Control
            $('#server_' + this.id + ' .start').click(function () {
                this.start();
            });
            $('#server_' + this.id + ' .stop').click(function () {
                this.stop();
            });

            //Lastly fill up log
            this.getLog();
        };

        this.tick = function () {
            this.getLog();
            this.checkStatus();
            this.getPlayers();
        };

        this.getLog = function () {
            //YAMS.getRows(this.lastLogId, 0, this.id, "all");
            var svr = this;
            $.ajax({
                url: "/api/",
                type: "POST",
                data: "action=log&start=" + this.lastLogId + "&rows=" + 0 + "&serverid=" + this.id + "&level=" + "all",
                dataType: "json",
                success: function (data) {
                    $.each(data["Table"], function (i, item) {
                        var s = document.createElement('div');
                        $(s).addClass('message').addClass(item["LogLevel"]).html(item["LogMessage"]);
                        $('#server_' + svr.id + ' .log').append(s);
                        svr.lastLogId = item["LogID"];
                    });
                    $('#server_' + svr.id + ' .log').attr({ scrollTop: $('#server_' + svr.id + ' .log').attr('scrollHeight') });
                }
            });
        };

        this.start = function () {
            $.ajax({
                url: "/api/",
                type: "POST",
                data: "action=start&serverid=" + this.id,
                dataType: "json",
                success: function (data) {
                    if (data["result"] != "sentstart") alert("Start failed");
                }
            });
        }

        this.stop = function () {
            $.ajax({
                url: "/api/",
                type: "POST",
                data: "action=stop&serverid=" + this.id,
                dataType: "json",
                success: function (data) {
                    if (data["result"] != "sentstop") alert("Stop failed");
                }
            });
        }

        this.checkStatus = function () {
            srv = this;
            $.ajax({
                url: "/api/",
                type: "POST",
                data: "action=status&serverid=" + this.id,
                dataType: "json",
                success: function (data) {
                    srv.status = data["status"];
                    $('#server_' + srv.id + ' .status').html(
                    '<p>Running: ' + srv.status + '</p>' +
                    '<p>RAM: ' + data["ram"] + '</p>' +
                    '<p>VM: ' + data["vm"] + '</p>'
                  );
                }
            });
        },

        this.getPlayers = function () {
            srv = this;
            $.ajax({
                url: "/api/",
                type: "POST",
                data: "action=players&serverid=" + this.id,
                dataType: "json",
                success: function (data) {
                    $('#server_' + srv.id + ' .players').html('');
                    $.each(data["players"], function (i, item) {
                        $('#server_' + srv.id + ' .players').html($('#server_' + srv.id + ' .players').html() + '<br />' + data["players"][i]);
                    });
                }
            });
        }

    },

    init: function () {
        $.ajax({
            url: "/api/",
            type: "POST",
            data: "action=list",
            dataType: "json",
            success: function (data) {
                $.each(data["servers"], function (i, item) {
                    var s = new YAMS.server(item["id"], item["title"], item["ver"]);
                    s.init();
                    YAMS.servers.push(s);
                });
                $.each(YAMS.servers, function (i, item) {
                    item.timer = setInterval("YAMS.servers[" + i + "].tick();", 5000);
                })
            }
        })
    },

    getRows: function (start, rows, serverid, level) {
        $.ajax({
            url: "/api/",
            type: "POST",
            data: "action=log&start=" + start + "&rows=" + rows + "&serverid=" + serverid + "&level=" + level,
            dataType: "json",
            success: function (data) {
                $.each(data["Table"], function (i, item) {
                    var s = document.createElement('div');
                    $(s).addClass('message').addClass(item["LogLevel"]).html(item["LogMessage"]);
                    $('#server_' + serverid + ' .log').append(s);
                });
                $('#server_' + serverid + ' .log').attr({ scrollTop: $('#server_' + serverid + ' .log').attr('scrollHeight') });
            }
        });
        return false;
    }

};

$(document).ready(YAMS.init);





















