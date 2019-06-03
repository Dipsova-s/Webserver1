using System.Web.Optimization;

namespace EveryAngle.OData
{
    public static class BundleConfig
    {
        // For more information on bundling, visit http://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            #region base components

            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/Scripts/jquery-1.10.2.min.js"));

            // angularJS 
            bundles.Add(new ScriptBundle("~/bundles/angularjs").Include(
                        "~/Scripts/angular.min.js",
                        "~/Scripts/ViewModels/odataservice.viewmodel.js"));

            // kendo ui
            bundles.Add(new ScriptBundle("~/bundles/kendoUI").Include(
                        "~/Scripts/kendo.all.min.js"));

            // signal r component
            bundles.Add(new ScriptBundle("~/bundles/signalrComponent").Include(
                        "~/Scripts/jquery.signalR-2.2.1.min.js"));

            #endregion

            #region viewmodels
            // monitoring
            bundles.Add(new ScriptBundle("~/bundles/monitoringViewmodel").Include(
                        "~/Scripts/ViewModels/monitoring.viewmodel.js"));

            // odata entry
            bundles.Add(new ScriptBundle("~/bundles/odataEntryViewmodel").Include(
                        "~/Scripts/ViewModels/odataentry.viewmodel.js"));
            #endregion

            #region modernizr

            // use the development version of Modernizr to develop with and learn from. Then, when you're
            // ready for production, use the build tool at http://modernizr.com to pick only the tests you need.
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                        "~/Scripts/modernizr-*"));

            #endregion

            #region styles and css

            bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                      "~/Scripts/bootstrap.min.js",
                      "~/Scripts/respond.min.js"));

            bundles.Add(new StyleBundle("~/Content/css").Include(
                      "~/Content/bootstrap.min.css",
                      "~/Content/kendo.common.min.css",
                      "~/Content/kendo.default.min.css",
                      "~/Content/Site.css"));

            #endregion
        }
    }
}
