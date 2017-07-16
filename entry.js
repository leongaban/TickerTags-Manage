var auth_module                = require("./app/auth/auth_module.js"),
    admin_module               = require("./app/admin/admin_module.js"),
    constants_module           = require("./app/constants/constants_module.js"),
    tags_module                = require("./app/tags/tags_module.js"),
    app                        = require("./app/admin.js"),
    addTagButtonComponent      = require("./app/tags/add_tag_button_component.js"),
    analytics                  = require("./app/analytics/analytics_component.js"),
    api_factory                = require("./app/api/api_factory.js"),
    bulk_add_component         = require("./app/bulk/bulk_add_component.js"),
    bulk_terms_module          = require("./app/tags/bulk/bulk_terms_component.js"),
    capitalizeDirective        = require("./app/helpers/capitalizeDirective.js"),
    chooseTickerListComponent  = require("./app/tickers/chooseTickerListComponent.js"),
    indexController            = require("./app/index/indexController.js"),
    loginController            = require("./app/login/loginController.js"),
    massActionsModalDirective  = require("./app/tags/massActionsModalDirective.js"),
    message                    = require("./app/message/message_factory.js"),
    navComponent               = require("./app/nav/navComponent.js"),
    notify                     = require('./app/notifications/notificationService.js'),
    notifications              = require("./app/notifications/notificationsDirective.js"),
    overlayDirective           = require("./app/overlay/overlayDirective.js"),
    quarterlyReportsDirective  = require("./app/tickers/quarterlyReportsDirective.js"),
    quarterlyReportComponent   = require("./app/tickers/quartelyReportComponent.js"),
    restDirective              = require("./app/rest/restDirective.js"),
    restFactory                = require("./app/rest/restFactory.js"),
    restModalDirective         = require("./app/rest/restModalDirective"),
    reportedTagsDirective      = require("./app/tags/reportedTagsDirective.js"),
    reportedTagsFactory        = require("./app/tags/reportedTagsFactory.js"),
    settings                   = require("./app/settings/settingsDirective.js"),
    tagsComponent              = require("./app/tags/tags_component.js"),
    tagsTable                  = require("./app/tags/tags_table_component.js"),
    tagsHeader                 = require("./app/tags/tags_header_component.js"),
    toggleTagsTable            = require("./app/tags/toggle_tags_table_component.js"),
    tagsBulkDelete             = require("./app/tags/bulk/bulk_delete_component.js"),
    tagsFactory                = require("./app/tags/tags_factory.js"),
    templateCache              = require("./app/templates/templateCache.js"),
    tickersDirective           = require("./app/tickers/tickersDirective.js"),
    tickersFactory             = require("./app/tickers/tickersFactory.js"),
    tickerDetailsFactory       = require("./app/tickers/tickerDetailsFactory.js"),
    topicsDirective            = require("./app/topics/topicsDirective.js"),
    usersDirective             = require("./app/users/usersDirective.js"),
    usersFactory               = require("./app/users/usersFactory.js"),
    utilityService             = require('./app/helpers/utility.js');

/** ============================================================================
----------------------------------------------------------------------------- */

/**
 * TickerTags Webpack module loader for the Manage 2.0 Admin app
 * @desc Webpack entry file, bundles all Angular modules together.
 * @summary "All change is detectable."
 * @copyright TickerTags 2016
 */

/** ----------------------------------------------------------------------------
============================================================================= */
