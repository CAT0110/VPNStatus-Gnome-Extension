'use strict';

const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const St = imports.gi.St;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Main = imports.ui.main;
const Mainloop = imports.mainloop;

// Commands to run
const CMD_VPNSTATUS  = "nordvpn status";

// For compatibility checks, as described above
const Config = imports.misc.config;
const SHELL_MINOR = parseInt(Config.PACKAGE_VERSION.split('.')[1]);

// Available icons
var iconInsecure = undefined;
var iconSecure = undefined;

// Button to show in Topbar
var buttonStatus = undefined;

var timeout = undefined

function refresh() {
    var vpnStatusText = 
	GLib.spawn_command_line_sync(CMD_VPNSTATUS)[1].toString().split(`\n`)[0].split(` `)[1];

    if (vpnStatusText == `Connected`)
        buttonStatus.set_child(iconSecure);
    else
        buttonStatus.set_child(iconInsecure);

    removeTimeout();
    timeout = Mainloop.timeout_add_seconds(10, refresh);

    return true;
}

function removeTimeout() {
    if (timeout) {
        Mainloop.source_remove(timeout);
        timeout = undefined; 
    }
}

function init() {
    log(`Initializing ${Me.metadata.name} version ${Me.metadata.version}`);

    // Available icons
    iconInsecure = new St.Icon({
        gicon: new Gio.ThemedIcon({name: 'channel-insecure-symbolic'}),
        style_class: 'system-status-icon'});

    iconSecure = new St.Icon({
        gicon: new Gio.ThemedIcon({name: 'channel-secure-symbolic'}),
        style_class: 'system-status-icon'});

    // Button to show in Topbar
    buttonStatus = new St.Bin({ style_class: 'panel-button',
	                        reactive: false,
	                        can_focus: false,
	                        x_fill: true,
	                        y_fill: false,
	                        track_hover: false });
}

function enable() {
    log(`Enabling ${Me.metadata.name} version ${Me.metadata.version}`);

    refresh();

    Main.panel._rightBox.insert_child_at_index(buttonStatus, 0);
}

function disable() {
    log(`Disabling ${Me.metadata.name} version ${Me.metadata.version}`);

    removeTimeout();

    Main.panel._rightBox.remove_child(buttonStatus);
}
