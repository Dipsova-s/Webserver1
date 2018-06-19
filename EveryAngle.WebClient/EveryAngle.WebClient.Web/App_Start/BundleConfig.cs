using System;
using System.Configuration;
using System.Web.Optimization;

namespace EveryAngle.WebClient.Web
{
    public class BundleConfig
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
                "~/scripts/jquery/jquery.address.js"
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
                "~/scripts/kendoui/kendo.core.extension.js",
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
                "~/scripts/kendoui/kendo.colorpicker.custom.js",
                "~/scripts/kendoui/kendo.combobox.min.js",
                "~/scripts/kendoui/kendo.datepicker.min.js",
                "~/scripts/kendoui/kendo.timepicker.min.js",
                "~/scripts/kendoui/kendo.datetimepicker.min.js",
                "~/scripts/kendoui/kendo.datetimepicker.custom.js",
                "~/scripts/kendoui/kendo.dropdownlist.min.js",
                "~/scripts/kendoui/kendo.resizable.min.js",
                "~/scripts/kendoui/kendo.window.min.js",
                "~/scripts/kendoui/kendo.editor.min.js",
                "~/scripts/kendoui/kendo.pager.min.js",
                "~/scripts/kendoui/kendo.selectable.min.js",
                "~/scripts/kendoui/kendo.reorderable.min.js",
                "~/scripts/kendoui/kendo.ooxml.min.js",
                "~/scripts/kendoui/kendo.progressbar.min.js",
                "~/scripts/kendoui/kendo.columnsorter.min.js",
                "~/scripts/kendoui/kendo.grid.min.js",
                "~/scripts/kendoui/kendo.numerictextbox.min.js",
                "~/scripts/kendoui/kendo.numerictextbox.custom.js",
                "~/scripts/kendoui/kendo.percentagetextbox.js",
                "~/scripts/kendoui/kendo.timespanpicker.js",
                "~/scripts/kendoui/kendo.splitter.min.js",
                "~/Scripts/KendoUI/kendo.upload.min.js",
                "~/scripts/kendoui/kendo.dataviz.core.min.js",
                "~/scripts/kendoui/kendo.dataviz.themes.min.js",
                "~/scripts/kendoui/kendo.dataviz.chart.min.js",
                "~/scripts/kendoui/kendo.dataviz.chart.polar.min.js",
                "~/scripts/kendoui/kendo.dataviz.gauge.min.js",
                "~/scripts/kendoui/kendo.touch.min.js"
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
                "~/scripts/helper/htmlhelper.js",
                "~/scripts/helper/htmlhelper.tooltip.js",
                "~/scripts/helper/htmlhelper.menunavigatable.js",
                "~/scripts/helper/globalfunction.js",
                "~/scripts/helper/utilities.js",
                "~/scripts/helper/viewengine.js",
                "~/scripts/helper/modelhelper.js",
                "~/scripts/helper/handlerhelper.js",
                "~/scripts/helper/modelhandlerhelper.js",
                "~/scripts/helper/defaultvaluehandler.js",
                "~/scripts/ajaxhttphandler/ajaxrequesthandler.js",
                "~/scripts/ajaxhttphandler/requesthistoryhandler.js"
            };

            var shareScripts = new string[] {
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
                "~/scripts/viewmanagement/user/usersettinghandler.js",
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
                "~/scripts/viewmodels/shared/datatype/datatype.js",
                "~/scripts/viewmodels/shared/queryblock/querystepmodel.js",
                "~/scripts/viewmodels/shared/queryblock/queryblockmodel.js",
                "~/scripts/viewmodels/shared/queryblock/queryblocksmodel.js"
            };

            var widgetFilterScripts = new string[] {
                "~/scripts/viewmanagement/shared/widgetfilter/widgetfilterview.js",
                "~/scripts/viewmanagement/shared/widgetfilter/widgetfiltermodel.js",
                "~/scripts/viewmanagement/shared/widgetfilter/widgetfilterhelper.js",
                "~/scripts/viewmanagement/shared/widgetfilter/widgetfilterhelper.datetranslator.js",
                "~/scripts/viewmanagement/shared/widgetfilter/widgetfilterhandler.js"
            };
            var widgetDetailsScripts = new string[] {
                "~/scripts/viewmanagement/shared/widgetdetails/widgetdetailsview.js",
                "~/scripts/viewmanagement/shared/widgetdetails/widgetdetailshandler.js"
            };
            var widgetlLanguagesScripts = new string[] {
                "~/scripts/viewmanagement/shared/widgetlanguages/widgetlanguagesview.js",
                "~/scripts/viewmanagement/shared/widgetlanguages/widgetlanguageshandler.js"
            };
            var widgetlLabelsScripts = new string[] {
                "~/scripts/viewmanagement/shared/widgetlabels/widgetlabelsview.js",
                "~/scripts/viewmanagement/shared/widgetlabels/widgetlabelshandler.js"
            };
            var executionparameterScripts = new string[] {
                "~/scripts/htmltemplate/executeparameters/executeparametershtmltemplate.js",
                "~/scripts/viewmanagement/shared/executionparameterhandler.js"
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
                    "~/content/css/search.css"));

            bundles.Add(new StyleBundle("~/content/css/anglepage.css")
                .Include("~/content/contextmenu/jquery.contextmenu.css",
                    "~/content/css/pivot.css",
                    "~/content/css/fieldsettings.css",
                    "~/content/css/customsort.css",
                    "~/content/css/exportexcel.css",
                    "~/content/css/exportcsv.css",
                    "~/content/css/jumpchooser.css",
                    "~/content/css/displaylist.css",
                    "~/content/css/displaychart.css",
                    "~/content/css/displaypivot.css",
                    "~/content/css/angle.displaydropdown.css",
                    "~/content/css/angle.css"));

            bundles.Add(new StyleBundle("~/content/css/dashboardpage.css")
                .Include("~/content/css/dashboardfilters.css",
                    "~/content/css/dashboard.css"));

            bundles.Add(new StyleBundle("~/content/css/widgets.css")
                .Include("~/content/css/widgetlanguages.css",
                    "~/content/css/widgetlabels.css",
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
            bundles.Add(new StyleBundle("~/content/searchpagecss").Include(
               "~/content/css/searchpage.css"));

            bundles.Add(new ScriptBundle("~/bundles/searchpage.js")
                .Include("~/scripts/videoplayer/jwplayer.js")
                .Include(widgetFilterScripts)
                .Include(widgetDetailsScripts)
                .Include(executionparameterScripts)
                .Include("~/scripts/viewmodels/models/dashboard/dashboardwidgetmodel.js",
                    "~/scripts/viewmanagement/search/itemInfohandler.js",
                    "~/scripts/viewmanagement/search/importAngleHandler.js",
                    "~/scripts/viewmodels/models/dashboard/dashboardmodel.js",
                    "~/scripts/viewmanagement/angle/fieldsettingshandler.js",
                    "~/scripts/viewmanagement/shared/fieldchooserhandler.js",
                    "~/scripts/viewmodels/models/angle/angleinfomodel.js",
                    "~/scripts/viewmodels/models/angle/anglequerystepmodel.js",
                    "~/scripts/viewmodels/models/angle/resultmodel.js",
                    "~/scripts/viewmodels/models/angle/displayqueryblockmodel.js",
                    "~/scripts/viewmodels/models/angle/historymodel.js",
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
                    "~/scripts/htmltemplate/search/angleexporthtmltemplate.js",
                    "~/scripts/viewmanagement/search/eapackagehandler.js",
                    "~/scripts/viewmanagement/search/angledownloadhandler.js",
                    "~/scripts/viewmanagement/search/angleexporthandler.js",

                    // create angle
                    "~/scripts/htmltemplate/createnewangle/createangleoptionhtmlpopuptemplate.js",
                    "~/scripts/htmltemplate/createnewangle/createangleschemahtmlpopuptemplate.js",
                    "~/scripts/viewmanagement/createnewangle/createnewanglepagehandler.js",
                    
                    "~/scripts/htmltemplate/advancefilter/advancefilterhtmltemplate.js",
                    "~/scripts/viewmanagement/search/searchpagetemplate.js",
                    "~/scripts/viewmanagement/search/anglecopyhandler.js",
                    "~/scripts/viewmanagement/search/searchpageretainsurl.js",
                    "~/scripts/viewmanagement/search/searchpagehandler.js"));
            /*** End - search page ***/

            bundles.Add(new ScriptBundle("~/bundles/anglepage.js")
                .Include(widgetFilterScripts)
                .Include(widgetDetailsScripts)
                .Include(widgetlLanguagesScripts)
                .Include(widgetlLabelsScripts)
                .Include(executionparameterScripts)
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
                    "~/scripts/viewmodels/models/angle/historymodel.js",
                    "~/scripts/viewmodels/models/angle/resultmodel.js",
                    "~/scripts/viewmanagement/angle/displaycopyhandler.js",
                    "~/scripts/viewmanagement/shared/fieldchooserhandler.js",
                    "~/scripts/viewmanagement/angle/ResolveAngleDisplayHandler.js",
                    "~/scripts/viewmanagement/angle/DisplayUpgradeHandler.js",
                    
                    // templates
                    "~/scripts/htmltemplate/dashboard/addtodashboardhtmltemplate.js",
                    "~/scripts/htmltemplate/resultsummary/resultsummaryhtmltemplate.js",

                    // jump
                    "~/scripts/viewmanagement/angle/followuptemplate.js",
                    "~/scripts/viewmanagement/angle/followuppagehandler.js",

                    // angle details
                    "~/scripts/htmltemplate/angledetail/anglepublishinghtmltemplate.js",
                    "~/scripts/htmltemplate/angledetail/angledetailbodyhtmltemplate.js",
                    "~/scripts/viewmanagement/angle/angledetailbodypagehandler.js",

                    // display details
                    "~/scripts/htmltemplate/displaydetail/displaydetailbodyhtmltemplate.js",
                    "~/scripts/viewmanagement/angle/displaypopupbodypagehandler.js",

                    // export to excel/csv
                    "~/scripts/htmltemplate/export/exportcsvhtmltemplate.js",
                    "~/scripts/htmltemplate/export/exportdrilldownexcelhtmltemplate.js",
                    "~/scripts/htmltemplate/export/exportexcelhtmltemplate.js",
                    "~/scripts/viewmodels/models/exports/exportmodel.js",
                    "~/scripts/viewmodels/models/exports/exportcsvmodel.js",
                    "~/scripts/viewmanagement/exports/exporthandler.js",
                    "~/scripts/viewmanagement/exports/exportexcelhandler.js",

                    // chart
                    "~/scripts/viewmanagement/angle/charttypedropdownlisttemplate.js",
                    "~/scripts/viewmanagement/angle/charthandler.js",

                    // pivot
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


                    "~/scripts/viewmanagement/angle/anglepageretainsurl.js",
                    "~/scripts/viewmanagement/angle/fieldsettingshandler.js",
                    "~/scripts/viewmanagement/angle/quickfilterhandler.js",
                    "~/scripts/viewmanagement/angle/anglehandler.js",
                    "~/scripts/viewmanagement/angle/angleactionmenuhandler.js",
                    "~/scripts/viewmanagement/angle/anglepagehandler.js"));

            bundles.Add(new ScriptBundle("~/bundles/dashboardpage.js")
                .Include(widgetFilterScripts)
                .Include(widgetDetailsScripts)
                .Include(widgetlLanguagesScripts)
                .Include(widgetlLabelsScripts)
                .Include(executionparameterScripts)
                .Include("~/scripts/viewmodels/models/angle/angleinfomodel.js",
                    "~/scripts/viewmanagement/angle/angledetailbodypagehandler.js",
                    "~/scripts/viewmodels/models/angle/displayfieldmodel.js",
                    "~/scripts/viewmodels/models/angle/displaymodel.js",
                    "~/scripts/viewmodels/models/angle/resultmodel.js",
                    "~/scripts/viewmodels/models/angle/displayqueryblockmodel.js",

                    "~/scripts/viewmanagement/angle/DisplayUpgradeHandler.js",
                    "~/scripts/viewmanagement/angle/listhandler.js",
                    "~/scripts/viewmanagement/angle/charthandler.js",
                    "~/scripts/viewmanagement/angle/pivothandler.js",
                        
                    "~/scripts/viewmodels/models/fieldsettings/bucketmodel.js",
                    "~/scripts/viewmodels/models/fieldsettings/fieldmodel.js",
                    "~/scripts/viewmodels/models/fieldsettings/fieldsettingsmodel.js", 
                    
                    "~/scripts/viewmanagement/angle/fieldsettingshandler.js",
                    "~/scripts/viewmanagement/angle/quickfilterhandler.js",
                    "~/scripts/viewmanagement/shared/fieldchooserhandler.js",
                    "~/scripts/viewmodels/models/dashboard/dashboardwidgetmodel.js",
                    "~/scripts/viewmodels/models/dashboard/dashboardmodel.js",
                    "~/scripts/viewmodels/models/dashboard/dashboardresultmodel.js",

                    "~/scripts/htmltemplate/dashboard/dashboarddetailbodyhtmltemplate.js",
                    "~/scripts/htmltemplate/dashboard/dashboardpublishinghtmltemplate.js",
                    "~/scripts/viewmanagement/dashboard/dashboarddetailshandler.js",
                    "~/scripts/viewmanagement/dashboard/dashboardfiltershandler.js",
                    "~/scripts/viewmanagement/dashboard/dashboardhandler.js"));

            /*** ContextMenu ***/
            bundles.Add(new ScriptBundle("~/bundles/contextmenu")
                .Include("~/scripts/contextmenu/jquery.ui.position.js",
                    "~/scripts/contextmenu/jquery.jeegoocontext-2.0.0.js",
                    "~/scripts/contextmenu/clipboard.js"));

            /*Embeded Bundle*/
            bundles.Add(new ScriptBundle("~/resources/embedded/sharedjs")
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
                .Include("~/content/externalresource/shared.css"));

            BundleTable.EnableOptimizations = Convert.ToBoolean(ConfigurationManager.AppSettings["EnableOptimizations"]);
        }
    }
}
