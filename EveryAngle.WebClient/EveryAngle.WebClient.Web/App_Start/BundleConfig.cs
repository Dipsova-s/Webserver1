using System;
using System.Configuration;
using System.Web.Optimization;

namespace EveryAngle.WebClient.Web
{
    public static class BundleConfig
    {
        public static void RegisterBundles(BundleCollection bundles)
        {
            var modernizrScripts = new string[] {
                "~/scripts/modernizr.2.6.2.custom.js"
            };
            var jQueryScripts = new string[] {
                "~/scripts/jquery/jquery.js",
                "~/scripts/jquery/jquery-migrate-1.2.1.js"
            };
            var jqueryExtentionScripts = new string[] {
                "~/scripts/jquery/jquery.placeholder.min.js",
                "~/scripts/jquery/jquery.highlight.js",
                "~/scripts/jquery/jquery.mousewheel.js",
                "~/scripts/jquery/jquery.address.js",
                "~/scripts/jquery/jquery.scrollbar.min.js"
            };

            var knockoutScripts = new string[] {
                "~/scripts/knockout/knockout-2.2.0.debug.js",
                "~/scripts/knockout/knonkout.helper.js"
            };

            var coreScripts = new string[] {
                "~/scripts/jquery/jquery.cookie-1.4.1.min.js",
                "~/scripts/helper/managecookies.js",
                "~/scripts/helper/bootstrap.js",
                "~/scripts/helper/measureperformance.js",
                "~/scripts/helper/storage.js"
            };

            var loginScripts = new string[] {
                "~/scripts/jquery/jquery.base64.min.js",
                "~/scripts/user/authentication.js"
            };

            var kendoScripts = new string[] {
                "~/scripts/kendoui/kendo.core.min.js",
                "~/scripts/kendoui/kendo.data.min.js",
                "~/scripts/kendoui/kendo.userevents.min.js",
                "~/scripts/kendoui/kendo.draganddrop.min.js",
                "~/scripts/kendoui/kendo.timezones.min.js",
                "~/scripts/kendouicustom/kendo.core.extension.js",
                "~/scripts/kendoui/kendo.color.min.js",
                "~/scripts/kendoui/kendo.drawing.min.js",
                "~/scripts/kendoui/kendo.fx.min.js",
                "~/scripts/kendoui/kendo.sortable.min.js",
                "~/scripts/kendoui/kendo.virtuallist.min.js",
                "~/scripts/kendoui/kendo.mobile.scroller.min.js",
                "~/scripts/kendoui/kendo.popup.min.js",
                "~/scripts/kendoui/kendo.list.min.js",
                "~/scripts/kendoui/kendo.autocomplete.min.js",
                "~/scripts/kendoui/kendo.calendar.min.js",
                "~/scripts/kendoui/kendo.slider.min.js",
                "~/scripts/kendoui/kendo.colorpicker.min.js",
                "~/scripts/kendouicustom/kendo.colorpicker.style.js",
                "~/scripts/kendouicustom/kendo.colorpicker.custom.js",
                "~/scripts/kendoui/kendo.combobox.min.js",
                "~/scripts/kendouicustom/kendo.combobox.style.js",
                "~/scripts/kendoui/kendo.datepicker.min.js",
                "~/scripts/kendoui/kendo.timepicker.min.js",
                "~/scripts/kendoui/kendo.datetimepicker.min.js",
                "~/scripts/kendouicustom/kendo.datetimepicker.custom.js",
                "~/scripts/kendoui/kendo.dropdownlist.min.js",
                "~/scripts/kendouicustom/kendo.dropdownlist.style.js",
                "~/scripts/kendoui/kendo.resizable.min.js",
                "~/scripts/kendoui/kendo.window.min.js",
                "~/scripts/kendouicustom/kendo.window.style.js",
                "~/scripts/kendoui/kendo.editor.min.js",
                "~/scripts/kendoui/kendo.pager.min.js",
                "~/scripts/kendoui/kendo.selectable.min.js",
                "~/scripts/kendoui/kendo.reorderable.min.js",
                "~/scripts/kendoui/kendo.ooxml.min.js",
                "~/scripts/kendoui/kendo.progressbar.min.js",
                "~/scripts/kendoui/kendo.columnsorter.min.js",
                "~/scripts/kendoui/kendo.grid.min.js",
                "~/scripts/kendoui/kendo.numerictextbox.min.js",
                "~/scripts/kendouicustom/kendo.numerictextbox.style.js",
                "~/scripts/kendouicustom/kendo.numerictextbox.custom.js",
                "~/scripts/kendouicustom/kendo.percentagetextbox.js",
                "~/scripts/kendouicustom/kendo.timespanpicker.js",
                "~/scripts/kendouicustom/kendo.periodpicker.js",
                "~/scripts/kendoui/kendo.splitter.min.js",
                "~/Scripts/KendoUI/kendo.upload.min.js",
                "~/scripts/kendoui/kendo.dataviz.core.min.js",
                "~/scripts/kendoui/kendo.dataviz.themes.min.js",
                "~/scripts/kendoui/kendo.dataviz.chart.min.js",
                "~/scripts/kendoui/kendo.dataviz.gauge.min.js",
                "~/scripts/kendoui/kendo.touch.min.js",
                "~/scripts/kendoui/kendo.notification.min.js",
                "~/scripts/kendoui/kendo.button.min.js",
                "~/scripts/kendoui/kendo.tabstrip.min.js"
            };

            var kendoCultures = new string[] {
                "~/scripts/kendoui/cultures/kendo.culture.en-gb.min.js",
                "~/scripts/kendoui/cultures/kendo.culture.en-us.min.js",
                "~/scripts/kendoui/cultures/kendo.culture.es-es.min.js",
                "~/scripts/kendoui/cultures/kendo.culture.fr-fr.min.js",
                "~/scripts/kendoui/cultures/kendo.culture.nl-nl.min.js",
                "~/scripts/kendoui/cultures/kendo.culture.th-th.min.js",
                "~/scripts/kendoui/cultures/kendo.culture.de-de.min.js"
            };

            var customScripts = new string[] {
                "~/scripts/helper/enumhandlers.js",
                "~/scripts/configuration/globalconfiguration.js",
                "~/scripts/helper/localization.js",
                "~/scripts/errorhandler/errorhandler.js",
                "~/scripts/helper/datetimeextension.js",
                "~/scripts/helper/utilities.js",
                "~/scripts/helper/htmlhelper.js",
                "~/scripts/helper/htmlhelper.tooltip.js",
                "~/scripts/helper/htmlhelper.menunavigatable.js",
                "~/scripts/helper/htmlhelper.actionmenu.js",
                "~/scripts/helper/htmlhelper.accordion.js",
                "~/scripts/helper/htmlhelper.multiselect.js",
                "~/scripts/helper/htmlhelper.tab.js",
                "~/scripts/helper/htmlhelper.overlay.js",
                "~/scripts/helper/globalfunction.js",
                "~/scripts/helper/viewengine.js",
                "~/scripts/helper/modelhelper.js",
                "~/scripts/helper/handlerhelper.js",
                "~/scripts/helper/modelhandlerhelper.js",
                "~/scripts/helper/defaultvaluehandler.js",
                "~/scripts/ajaxhttphandler/ajaxrequesthandler.js",
                "~/scripts/helper/bignumber.js"
            };

            var shareScripts = new string[] {
                "~/scripts/viewmanagement/shared/searchstoragehandler.js",
                "~/scripts/viewmanagement/shared/directoryhandler.js",
                "~/scripts/viewmanagement/shared/validationhandler.js",
                "~/scripts/viewmanagement/shared/internalresourcehandler.js",
                "~/scripts/viewmanagement/shared/fieldcategoryhandler.js",
                "~/scripts/viewmanagement/shared/systemsettinghandler.js",
                "~/scripts/viewmanagement/shared/systemlanguagehandler.js",
                "~/scripts/viewmanagement/shared/systeminformationhandler.js",
                "~/scripts/viewmanagement/shared/systemcurrencyhandler.js",
                "~/scripts/viewmanagement/shared/systemdefaultusersettinghandler.js",
                "~/scripts/viewmanagement/shared/aboutsystemhandler.js",
                "~/scripts/viewmanagement/shared/userfriendlynamehandler.js",
                "~/scripts/viewmanagement/shared/businessprocesshandler.js",
                "~/scripts/viewmanagement/shared/modelshandler.js",
                "~/scripts/viewmanagement/shared/modelcurrentinstancehandler.js",

               "~/scripts/htmltemplate/menu/usersettingpopuphtmltemplate.js",
               "~/scripts/htmltemplate/menu/aboutHtmlTemplate.js",

                "~/scripts/viewmodels/models/user/usermodel.js",
                "~/scripts/viewmodels/models/user/privileges.js",
                "~/scripts/viewmodels/models/user/usersettingmodel.js",
                "~/scripts/viewmanagement/shared/modellabelcategoryhandler.js",
                "~/scripts/viewmanagement/user/usersettingspanelhandler.js",
                "~/scripts/viewmanagement/user/userpasswordhandler.js",
                "~/scripts/viewmanagement/user/usersettingview.js",
                "~/scripts/viewmanagement/help/helppopuppagehandler.js",
                "~/scripts/viewmodels/models/session/sessionmodel.js",
                "~/scripts/viewmanagement/shared/progressbar.js",
                "~/scripts/viewmanagement/shared/popuppagehandlers.js",
                "~/scripts/viewmanagement/shared/helptexthandler.js",
                "~/scripts/viewmanagement/shared/modelclasseshandler.js",
                "~/scripts/viewmanagement/shared/modelfieldshandler.js",
                "~/scripts/viewmanagement/shared/modelinstancefieldshandler.js",
                "~/scripts/viewmanagement/shared/modelfollowupshandler.js",
                "~/scripts/viewmanagement/shared/modelfieldsourcehandler.js",
                "~/scripts/viewmanagement/shared/modelfielddomainhandler.js",
                "~/scripts/viewmanagement/shared/toastnotificationhandler.js",
                "~/scripts/viewmodels/shared/datatype/datatype.js",
                "~/scripts/viewmodels/shared/queryblock/querystepmodel.js",
                "~/scripts/viewmodels/shared/queryblock/queryblockmodel.js",
                "~/scripts/viewmodels/shared/queryblock/queryblocksmodel.js"
            };

            var videoPlayerScripts = new string[]
            {
                "~/scripts/videoplayer/video.min.js",
                "~/scripts/videoplayer/plugins/videojs-playlist.js",
                "~/scripts/videoplayer/plugins/videojs-playlist-ui.js"
            };

            var widgetFilterScripts = new string[] {
                "~/scripts/viewmanagement/shared/widgetfilter/widgetfiltermodel.js",
                "~/scripts/viewmanagement/shared/widgetfilter/widgetfilterhelper.js",
                "~/scripts/viewmanagement/shared/widgetfilter/widgetfilterhelper.datetranslator.js",

                "~/scripts/viewmanagement/shared/querydefinition/filtereditors/basefiltereditor.js",
                "~/scripts/viewmanagement/shared/querydefinition/filtereditors/baseadvancefiltereditor.js",
                "~/scripts/viewmanagement/shared/querydefinition/filtereditors/filterbooleaneditor.js",
                "~/scripts/viewmanagement/shared/querydefinition/filtereditors/filtercurrencyeditor.js",
                "~/scripts/viewmanagement/shared/querydefinition/filtereditors/filterdateeditor.js",
                "~/scripts/viewmanagement/shared/querydefinition/filtereditors/filterdatetimeeditor.js",
                "~/scripts/viewmanagement/shared/querydefinition/filtereditors/filterdoubleeditor.js",
                "~/scripts/viewmanagement/shared/querydefinition/filtereditors/filterenumeratededitor.js",
                "~/scripts/viewmanagement/shared/querydefinition/filtereditors/filterinteditor.js",
                "~/scripts/viewmanagement/shared/querydefinition/filtereditors/filterpercentageeditor.js",
                "~/scripts/viewmanagement/shared/querydefinition/filtereditors/filterperiodeditor.js",
                "~/scripts/viewmanagement/shared/querydefinition/filtereditors/filtertexteditor.js",
                "~/scripts/viewmanagement/shared/querydefinition/filtereditors/filtertimeeditor.js",
                "~/scripts/viewmanagement/shared/querydefinition/filtereditors/filtertimespaneditor.js",

                "~/scripts/viewmanagement/shared/querydefinition/querystepview.js",
                "~/scripts/viewmanagement/shared/querydefinition/querystepviewmodel.js",
                "~/scripts/viewmanagement/shared/querydefinition/querydefinitionhandler.js",
                "~/scripts/viewmanagement/shared/querydefinition/querystepfilterhandler.js",
                "~/scripts/viewmanagement/shared/querydefinition/querystepjumphandler.js",
                "~/scripts/viewmanagement/shared/querydefinition/querystepaggregationhandler.js",
                "~/scripts/viewmanagement/shared/querydefinition/queryStepaggregationsortablehandler.js",
                "~/scripts/viewmanagement/shared/querydefinition/querystepsortinghandler.js",
                "~/scripts/viewmanagement/shared/querydefinition/querystepsortablehandler.js"
            };
            var widgetDetailsScripts = new string[] {
                "~/scripts/viewmanagement/shared/widgetdetails/widgetdetailsview.js",
                "~/scripts/viewmanagement/shared/widgetdetails/widgetdetailshandler.js"
            };
            var executionparameterScripts = new string[] {
                "~/scripts/htmltemplate/executeparameters/executeparametershtmltemplate.js",
                "~/scripts/viewmanagement/shared/executionparameterhandler.js"
            };
            var itemStateScripts = new string[] {
                "~/scripts/viewmanagement/shared/itemstate/itemstateview.js",
                "~/scripts/viewmanagement/shared/itemstate/itemstatehandler.js",
                "~/scripts/viewmanagement/shared/itemstate/itempublishstatehandler.js",
                "~/scripts/viewmanagement/shared/itemstate/itemvalidatestatehandler.js"
            };
            var sidePanelScripts = new string[] {
                "~/scripts/viewmanagement/shared/sidepanel/sidepanelview.js",
                "~/scripts/viewmanagement/shared/sidepanel/sidepanelhandler.js"
            };
            var itemDescriptionScripts = new string[] {
                "~/scripts/viewmanagement/shared/itemdescription/itemdescriptionview.js",
                "~/scripts/viewmanagement/shared/itemdescription/itemdescriptionhandler.js"
            };
            var itemSaveAsScripts = new string[] {
                "~/scripts/viewmanagement/shared/itemsaveas/itemsaveasview.js",
                "~/scripts/viewmanagement/shared/itemsaveas/itemsaveashandler.js"
            };

            /*** Begin - main ***/
            bundles.Add(new StyleBundle("~/content/css/main.css")
                .Include(
                    "~/content/css/kendoextension.css",
                    "~/content/css/common.css",
                    "~/content/css/login.css",
                    "~/content/css/usersettings.css",
                    "~/content/css/userpassword.css",
                    "~/content/css/base.css"));

            bundles.Add(new StyleBundle("~/content/css/searchpage.css")
                .Include("~/content/css/createangle.css",
                    "~/content/css/search.masschange.css",
                    "~/content/css/search.angledownload.css",
                    "~/content/css/search.css",
                    "~/content/videoplayer/video-js.min.css",
                    "~/content/videoplayer/plugins/videojs-playlist-ui.css",
                    "~/content/videoplayer/plugins/videojs-playlist-ui.vertical.css"));

            bundles.Add(new StyleBundle("~/content/css/anglepage.css")
                .Include("~/content/css/pivot.css",
                    "~/content/css/customsort.css",
                    "~/content/css/exportexcel.css",
                    "~/content/css/exportcsv.css",
                    "~/content/css/jumpchooser.css",
                    "~/content/css/displaylist.css",
                    "~/content/css/displaychart.css",
                    "~/content/css/displaypivot.css",
                    "~/content/css/itemstate.css",
                    "~/content/css/angle.displaydropdown.css",
                    "~/content/css/angle.css"));

            bundles.Add(new StyleBundle("~/content/css/dashboardpage.css")
                .Include("~/content/css/dashboard.css"));

            bundles.Add(new StyleBundle("~/content/css/widgets.css")
                .Include("~/content/css/widgetlanguages.css",
                    "~/content/css/widgetdetails.css",
                    "~/content/css/widgetfilters.css"));

            bundles.Add(new ScriptBundle("~/bundles/core_external")
                .Include(modernizrScripts)
                .Include(jQueryScripts)
                .Include(knockoutScripts));

            bundles.Add(new ScriptBundle("~/bundles/core")
                .Include(coreScripts));

            bundles.Add(new ScriptBundle("~/bundles/main")
                .Include(customScripts)
                .Include(jqueryExtentionScripts)
                .Include(shareScripts));

            bundles.Add(new ScriptBundle("~/bundles/login")
                .Include(loginScripts));
            /*** End - main ***/

            /*** Begin - kendo ***/
            string kendoTheme = ConfigurationManager.AppSettings["KendoTheme"];
            bundles.Add(new StyleBundle("~/content/kendoui/kendoui.css")
                .Include("~/content/kendoui/kendo.common.min.css",
                    "~/content/kendoui/kendo.default.min.css",
                    //String.Format("~/content/kendoui/kendo.{0}.min.css", kendoTheme),
                    "~/content/kendoui/kendo.dataviz.min.css",
                    String.Format("~/content/kendoui/kendo.dataviz.{0}.min.css", kendoTheme)));

            // for IE9 or older
            bundles.Add(new StyleBundle("~/content/kendoui/kendoui.common.css")
                .Include("~/content/kendoui/kendo.common.min.css"));
            bundles.Add(new StyleBundle("~/content/kendoui/kendoui.default.css")
                .Include("~/content/kendoui/kendo.default.min.css",
                    "~/content/kendoui/kendo.dataviz.min.css",
                    String.Format("~/content/kendoui/kendo.dataviz.{0}.min.css", kendoTheme)));

            bundles.Add(new ScriptBundle("~/bundles/kendoui_core.js").Include(kendoScripts));
            bundles.Add(new ScriptBundle("~/bundles/kendoui_cultures.js").Include(kendoCultures));

            bundles.Add(new ScriptBundle("~/bundles/kendoui_messages_en")
                .Include("~/scripts/kendoui/messages/kendo.messages.en-us.min.js"));

            bundles.Add(new ScriptBundle("~/bundles/kendoui_messages_es")
                .Include("~/scripts/kendoui/messages/kendo.messages.es-es.min.js"));

            bundles.Add(new ScriptBundle("~/bundles/kendoui_messages_fr")
                .Include("~/scripts/kendoui/messages/kendo.messages.fr-fr.min.js"));

            bundles.Add(new ScriptBundle("~/bundles/kendoui_messages_nl")
                .Include("~/scripts/kendoui/messages/kendo.messages.nl-nl.min.js"));

            bundles.Add(new ScriptBundle("~/bundles/kendoui_messages_th")
                .Include("~/scripts/kendoui/messages/kendo.messages.en-us.min.js"));

            bundles.Add(new ScriptBundle("~/bundles/kendoui_messages_de")
                .Include("~/scripts/kendoui/messages/kendo.messages.de-de.min.js"));
            /*** End - kendo ***/

            /*** Begin - search page ***/
            bundles.Add(new StyleBundle("~/content/searchpagecss")
                .Include("~/content/css/searchpage.css"));

            bundles.Add(new ScriptBundle("~/bundles/searchpage.js")
                .Include(videoPlayerScripts)
                .Include(widgetFilterScripts)
                .Include(widgetDetailsScripts)
                .Include(executionparameterScripts)
                .Include(sidePanelScripts)
                .Include("~/scripts/viewmodels/models/dashboard/dashboardwidgetmodel.js",
                    "~/scripts/viewmanagement/search/itemInfohandler.js",
                    "~/scripts/viewmanagement/search/importAngleHandler.js",
                    "~/scripts/viewmodels/models/dashboard/dashboardmodel.js",
                    "~/scripts/viewmanagement/angle/chart/charthelper.js",
                    "~/scripts/viewmanagement/angle/chart/chartoptionsview.js",
                    "~/scripts/viewmanagement/angle/chart/chartoptionshandler.js",
                    "~/scripts/viewmanagement/angle/fieldsettingshandler.js",
                    "~/scripts/viewmanagement/shared/fieldchooserhandler.js",
                    "~/scripts/viewmanagement/shared/notificationsfeedhandler.js",
                    "~/scripts/viewmodels/models/angle/angleinfomodel.js",
                    "~/scripts/viewmodels/models/angle/anglequerystepmodel.js",
                    "~/scripts/viewmodels/models/angle/resultmodel.js",
                    "~/scripts/viewmodels/models/angle/displayqueryblockmodel.js",
                    "~/scripts/viewmodels/models/angle/displayfieldmodel.js",
                    "~/scripts/viewmodels/models/angle/displaymodel.js",
                    "~/scripts/viewmodels/models/search/businessprocessmodel.js",
                    "~/scripts/viewmodels/models/search/facetfiltersmodel.js",
                    "~/scripts/viewmodels/models/search/searchmodel.js",
                    "~/scripts/viewmodels/models/search/searchquery.js",
                    "~/scripts/viewmodels/models/search/welcomemodel.js",
                    "~/scripts/viewmanagement/angle/ResolveAngleDisplayHandler.js",

                    // mass changes
                    "~/scripts/htmltemplate/masschange/masschangehtmltemplate.js",
                    "~/scripts/htmltemplate/masschange/masschangelabelshtmltemplate.js",
                    "~/scripts/viewmodels/models/search/masschangemodel.js",

                    // angle export (eapackage + download)
                    "~/scripts/viewmanagement/search/eapackagehandler.js",
                    "~/scripts/viewmanagement/shared/itemdownloadhandler.js",
                    "~/scripts/viewmanagement/search/angleexporthandler.js",

                    // execute dashboard
                    "~/scripts/viewmanagement/search/dashboardexecutionhandler.js",

                    // create angle
                    "~/scripts/htmltemplate/createnewangle/createangleoptionhtmlpopuptemplate.js",
                    "~/scripts/htmltemplate/createnewangle/createangleschemahtmlpopuptemplate.js",
                    "~/scripts/viewmanagement/createnewangle/createnewanglepagehandler.js",

                    // search options
                    "~/scripts/viewmanagement/search/searchsidepanelhandler.js",
                    "~/scripts/viewmanagement/search/searchfilterlistviewhandler.js",

                    "~/scripts/htmltemplate/advancefilter/advancefilterhtmltemplate.js",
                    "~/scripts/viewmanagement/search/searchpagetemplate.js",
                    "~/scripts/viewmanagement/search/anglecopyhandler.js",
                    "~/scripts/viewmanagement/search/searchpageretainsurl.js",
                    "~/scripts/viewmanagement/search/searchpagehandler.js"));
            /*** End - search page ***/

            bundles.Add(new ScriptBundle("~/bundles/anglepage.js")
                .Include(widgetFilterScripts)
                .Include(widgetDetailsScripts)
                .Include(executionparameterScripts)
                .Include(itemStateScripts)
                .Include(itemDescriptionScripts)
                .Include(itemSaveAsScripts)
                .Include(sidePanelScripts)
                .Include("~/scripts/viewmodels/models/dashboard/dashboardwidgetmodel.js",
                    "~/scripts/viewmodels/models/dashboard/dashboardmodel.js",

                    // fieldsettings
                    "~/scripts/viewmodels/models/fieldsettings/bucketmodel.js",
                    "~/scripts/viewmodels/models/fieldsettings/fieldmodel.js",
                    "~/scripts/viewmodels/models/fieldsettings/fieldsettingsmodel.js",

                    "~/scripts/viewmodels/models/angle/anglequerystepmodel.js",
                    "~/scripts/viewmodels/models/angle/angleinfomodel.js",
                    "~/scripts/viewmodels/models/angle/displayqueryblockmodel.js",
                    "~/scripts/viewmodels/models/angle/displayfieldmodel.js",
                    "~/scripts/viewmodels/models/angle/displaymodel.js",
                    "~/scripts/viewmodels/models/angle/resultmodel.js",
                    "~/scripts/viewmanagement/angle/displaycopyhandler.js",
                    "~/scripts/viewmanagement/shared/fieldchooserhandler.js",
                    "~/scripts/viewmanagement/shared/notificationsfeedhandler.js",
                    "~/scripts/viewmanagement/shared/breadcrumb/breadcrumbhandler.js",
                    "~/scripts/viewmanagement/shared/breadcrumb/anglebreadcrumbhandler.js",
                    "~/scripts/viewmanagement/angle/ResolveAngleDisplayHandler.js",
                    "~/scripts/viewmanagement/angle/DisplayUpgradeHandler.js",

                    // save actions
                    "~/scripts/viewmanagement/shared/itemsaveactionhandler.js",
                    "~/scripts/viewmanagement/angle/anglesaveactionhandler.js",

                    // templates
                    "~/scripts/htmltemplate/dashboard/addtodashboardhtmltemplate.js",

                    // jump
                    "~/scripts/viewmanagement/angle/followuptemplate.js",
                    "~/scripts/viewmanagement/angle/followuppagehandler.js",

                    // export to excel/csv
                    "~/scripts/htmltemplate/export/exportcsvhtmltemplate.js",
                    "~/scripts/htmltemplate/export/exportdrilldownexcelhtmltemplate.js",
                    "~/scripts/htmltemplate/export/exportexcelhtmltemplate.js",
                    "~/scripts/viewmodels/models/exports/exportmodel.js",
                    "~/scripts/viewmodels/models/exports/exportcsvmodel.js",
                    "~/scripts/viewmanagement/exports/exporthandler.js",
                    "~/scripts/viewmanagement/exports/exportexcelhandler.js",

                    // chart
                    "~/scripts/viewmanagement/angle/chart/charthelper.js",
                    "~/scripts/viewmanagement/angle/chart/chartoptionsview.js",
                    "~/scripts/viewmanagement/angle/chart/chartoptionshandler.js",
                    "~/scripts/viewmanagement/angle/charthandler.js",

                    // pivot
                    "~/scripts/viewmanagement/angle/pivot/pivothelper.js",
                    "~/scripts/viewmanagement/angle/pivot/pivotoptionsview.js",
                    "~/scripts/viewmanagement/angle/pivot/pivotoptionshandler.js",
                    "~/scripts/viewmanagement/angle/pivothandler.js",

                    // list format
                    "~/scripts/htmltemplate/listformatsetting/listformatsettinghtmltemplate.js",
                    "~/scripts/viewmanagement/angle/listformatsettinghandler.js",

                    // list sort
                    "~/scripts/htmltemplate/customsort/customsorthtmtemplate.js",
                    "~/scripts/viewmanagement/angle/listsorthandler.js",

                    // list find
                    "~/scripts/htmltemplate/find/findangleresulthtmltemplate.js",
                    "~/scripts/viewmanagement/angle/findpopuphandler.js",

                    // list
                    "~/scripts/viewmanagement/angle/listdrilldownhandler.js",
                    "~/scripts/viewmanagement/angle/listhandler.js",

                    // schedule angle
                    "~/scripts/htmltemplate/scheduleangle/scheduleanglehtmltemplate.js",
                    "~/scripts/viewmanagement/angle/scheduleanglehandler.js",

                    // anglesidepanel
                    "~/scripts/viewmanagement/angle/anglesidepanelview.js",
                    "~/scripts/viewmanagement/angle/anglesidepanelhandler.js",
                     
                    // angle statistic handler
                    "~/scripts/viewmanagement/angle/anglestatisticview.js",
                    "~/scripts/viewmanagement/angle/anglestatistichandler.js",

                    // display statistic handler
                    "~/scripts/viewmanagement/angle/displaystatisticview.js",
                    "~/scripts/viewmanagement/angle/displaystatistichandler.js",

                    // angle user specific
                    "~/scripts/viewmanagement/angle/angleuserspecifichandler.js",

                    // anglestate
                    "~/scripts/viewmanagement/angle/anglestateview.js",
                    "~/scripts/viewmanagement/angle/anglestatehandler.js",
                    "~/scripts/viewmanagement/angle/anglepublishstatehandler.js",
                    "~/scripts/viewmanagement/angle/anglevalidatestatehandler.js",
                    "~/scripts/viewmanagement/angle/angletemplatestatehandler.js",

                    // display overview / tab / scrolling
                    "~/scripts/viewmanagement/angle/displayoverviewhandler.js",

                    // aggregation format
                    "~/scripts/viewmanagement/angle/displayaggregationformathandler.js",

                    // save as
                    "~/scripts/viewmanagement/angle/anglesaveashandler.js",
                    "~/scripts/viewmanagement/angle/displaysaveashandler.js",

                    // display result handler
                    "~/scripts/viewmanagement/angle/displayresulthandler/basedisplayresulthandler.js",
                    "~/scripts/viewmanagement/angle/displayresulthandler/displaylistresulthandler.js",
                    "~/scripts/viewmanagement/angle/displayresulthandler/displaychartresulthandler.js",
                    "~/scripts/viewmanagement/angle/displayresulthandler/displaypivotresulthandler.js",

                    // angle + display handler
                    "~/scripts/viewmanagement/shared/baseitemhandler.js",
                    "~/scripts/viewmanagement/angle/anglehandler.js",
                    "~/scripts/viewmanagement/angle/displaydrilldownhandler.js",
                    "~/scripts/viewmanagement/angle/displayhandler.js",
                    "~/scripts/viewmanagement/angle/resulthandler.js",

                    // download
                    "~/scripts/viewmanagement/shared/itemdownloadhandler.js",

                    "~/scripts/viewmanagement/angle/anglepageretainsurl.js",
                    "~/scripts/viewmanagement/angle/fieldsettingshandler.js",
                    "~/scripts/viewmanagement/angle/targetLineHandler.js",
                    "~/scripts/viewmanagement/angle/quickfilterhandler.js",
                    "~/scripts/viewmanagement/angle/angleactionmenuhandler.js",
                    "~/scripts/viewmanagement/angle/AngleBusinessProcessHandler.js",
                    "~/scripts/viewmanagement/angle/anglepagehandler.js"
                    ));

            bundles.Add(new ScriptBundle("~/bundles/dashboardpage.js")
                .Include(widgetFilterScripts)
                .Include(widgetDetailsScripts)
                .Include(executionparameterScripts)
                .Include(itemStateScripts)
                .Include(itemDescriptionScripts)
                .Include(itemSaveAsScripts)
                .Include(sidePanelScripts)
                .Include("~/scripts/viewmodels/models/angle/angleinfomodel.js",
                    "~/scripts/viewmodels/models/angle/displayfieldmodel.js",
                    "~/scripts/viewmodels/models/angle/displaymodel.js",
                    "~/scripts/viewmodels/models/angle/resultmodel.js",
                    "~/scripts/viewmodels/models/angle/displayqueryblockmodel.js",

                    "~/scripts/viewmanagement/angle/displayupgradehandler.js",
                    "~/scripts/viewmanagement/angle/listhandler.js",
                    "~/scripts/viewmanagement/angle/chart/charthelper.js",
                    "~/scripts/viewmanagement/angle/chart/chartoptionsview.js",
                    "~/scripts/viewmanagement/angle/chart/chartoptionshandler.js",
                    "~/scripts/viewmanagement/angle/charthandler.js",
                    "~/scripts/viewmanagement/angle/pivot/pivothelper.js",
                    "~/scripts/viewmanagement/angle/pivothandler.js",

                    "~/scripts/viewmodels/models/fieldsettings/bucketmodel.js",
                    "~/scripts/viewmodels/models/fieldsettings/fieldmodel.js",
                    "~/scripts/viewmodels/models/fieldsettings/fieldsettingsmodel.js",

                    "~/scripts/viewmanagement/angle/fieldsettingshandler.js",
                    "~/scripts/viewmanagement/angle/quickfilterhandler.js",
                    "~/scripts/viewmanagement/shared/fieldchooserhandler.js",
                    "~/scripts/viewmanagement/shared/notificationsfeedhandler.js",
                    "~/scripts/viewmanagement/shared/breadcrumb/breadcrumbhandler.js",
                    "~/scripts/viewmanagement/shared/breadcrumb/dashboardbreadcrumbhandler.js",
                    "~/scripts/viewmodels/models/dashboard/dashboardwidgetmodel.js",
                    "~/scripts/viewmodels/models/dashboard/dashboardmodel.js",
                    "~/scripts/viewmodels/models/dashboard/dashboardresultmodel.js",

                    // save actions
                    "~/scripts/viewmanagement/shared/itemsaveactionhandler.js",
                    "~/scripts/viewmanagement/dashboard/dashboardsaveactionhandler.js",

                    // dashboard sidepanel
                    "~/scripts/viewmanagement/dashboard/dashboardsidepanelview.js",
                    "~/scripts/viewmanagement/dashboard/dashboardsidepanelhandler.js",

                    // dashboard statistic
                    "~/scripts/viewmanagement/dashboard/dashboardstatisticview.js",
                    "~/scripts/viewmanagement/dashboard/dashboardstatistichandler.js", 

                    "~/scripts/viewmanagement/shared/baseitemhandler.js",

                    // dashboard user specific
                    "~/scripts/viewmanagement/dashboard/dashboarduserspecifichandler.js",

                    // business process
                    "~/scripts/viewmanagement/dashboard/dashboardbusinessprocesshandler.js",

                    // save dashboard as
                    "~/scripts/viewmanagement/dashboard/dashboardsaveashandler.js",

                    // widget definitions
                    "~/scripts/viewmanagement/dashboard/dashboardwidgetdefinitionview.js",
                    "~/scripts/viewmanagement/dashboard/dashboardwidgetdefinitionhandler.js",

                    // download
                    "~/scripts/viewmanagement/shared/itemdownloadhandler.js",

                    // states
                    "~/scripts/viewmanagement/dashboard/dashboardstateview.js",
                    "~/scripts/viewmanagement/dashboard/dashboardstatehandler.js",
                    "~/scripts/viewmanagement/dashboard/dashboardpublishstatehandler.js",
                    "~/scripts/viewmanagement/dashboard/dashboardvalidatestatehandler.js",
                    
                    "~/scripts/viewmanagement/dashboard/dashboardpagehandler.js"));

            /*** ContextMenu ***/
            bundles.Add(new ScriptBundle("~/bundles/contextmenu")
                .Include("~/scripts/contextmenu/jquery.ui.position.js",
                    "~/scripts/contextmenu/jquery.jeegoocontext-2.0.0.js",
                    "~/scripts/contextmenu/clipboard.js"));

            /*Embeded Bundle*/
            bundles.Add(new ScriptBundle("~/resources/embedded/sharedjs")
                .Include("~/resources/embedded/notificationsfeed.js")
                .Include("~/resources/embedded/shared.js")
                .Include("~/resources/embedded/customkendogridui.js"));

            bundles.Add(new ScriptBundle("~/resources/embedded/js")
                .Include("~/resources/embedded/businessprocessesmodel.js")
                .Include("~/resources/embedded/classeschooser.js")
                .Include("~/resources/embedded/fieldschooser.js"));

            bundles.Add(new StyleBundle("~/content/externalresource/externalresource.css")
                .Include("~/content/externalresource/businessprocesses.css")
                .Include("~/content/externalresource/fieldschooser.css")
                .Include("~/Content/externalresource/classeschooser.css")
                .Include("~/content/externalresource/notificationsfeed.css")
                .Include("~/content/externalresource/shared.css"));

            BundleTable.EnableOptimizations = Convert.ToBoolean(ConfigurationManager.AppSettings["EnableOptimizations"]);
        }
    }
}
