using System.Web.Optimization;

namespace EveryAngle.ManagementConsole
{
    public class BundleConfig
    {
        // For more information on Bundling, visit http://go.microsoft.com/fwlink/?LinkId=254725
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                "~/Scripts/jQuery/jquery.min.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryplugin.js").Include(
                "~/Scripts/jstz.min.js",
                "~/Scripts/jQuery/jquery.base64.min.js",
                "~/Scripts/jQuery/jquery.address.js",
                "~/Scripts/jQuery/jquery.placeholder.min.js",
                "~/Scripts/jQuery/jquery.tagsinput.js",
                "~/Scripts/jQuery/jquery.fileupload.js",
                "~/Scripts/jQuery/jquery.mousewheel.js",
                "~/Scripts/jQuery/jquery.validate.min.js",
                "~/Scripts/jQuery/jquery.validate.additional-methods.js",
                "~/Scripts/jQuery/jquery.extension.js"));

            bundles.Add(new ScriptBundle("~/bundles/clipboard").Include(
                "~/Scripts/Clipboard/clipboard.js"));

            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                "~/Scripts/Modernizr/modernizr.min.js"));

            bundles.Add(new ScriptBundle("~/bundles/knockout").Include(
                "~/Scripts/Knockout/knockout.min.js"));

            bundles.Add(new ScriptBundle("~/bundles/master.js").Include(
                "~/Scripts/Custom/MC.js",
                "~/Scripts/Custom/MC.system.js",
                "~/Scripts/Custom/MC.storage.js",
                "~/Scripts/Custom/MC.topmenu.js",
                "~/Scripts/Custom/MC.messages.js",
                "~/Scripts/Custom/MC.util.js",
                "~/Scripts/Custom/MC.util.date.js",
                "~/Scripts/Custom/MC.util.grid.js",
                "~/Scripts/Custom/MC.util.popup.js",
                "~/Scripts/Custom/MC.util.upload.js",
                "~/Scripts/Custom/MC.util.modelserverinfo.js",
                "~/Scripts/Custom/MC.util.consolidatedrole.js",
                "~/Scripts/Custom/MC.util.massreport.js",
                "~/Scripts/Custom/MC.util.task.js",
                "~/Scripts/Custom/MC.ui.js",
                "~/Scripts/Custom/MC.ui.popup.js",
                "~/Scripts/Custom/MC.ui.loading.js",
                "~/Scripts/Custom/MC.ui.breadcrumb.js",
                "~/Scripts/Custom/MC.ui.tooltip.js",
                "~/Scripts/Custom/MC.ui.logpopup.js",
                "~/Scripts/Custom/MC.ui.masschangeuser.js",
                "~/Scripts/Custom/MC.ui.fieldschooser.js",
                "~/Scripts/Custom/MC.form.js",
                "~/Scripts/Custom/MC.form.validator.js",
                "~/Scripts/Custom/MC.form.template.js",
                "~/Scripts/Custom/MC.form.page.js",
                "~/Scripts/Custom/MC.ajax.js",
                "~/Scripts/Custom/MC.sidemenu.js",
                "~/Scripts/Custom/MC.content.js"
                ));


            bundles.Add(new ScriptBundle("~/bundles/displayjavascripterror").Include(
                "~/Scripts/Custom/MC.display.javascripterror.js"
                ));

            bundles.Add(new ScriptBundle("~/bundles/LoginPage").Include(
                "~/Scripts/Custom/Login/LoginAJAXHttpHandlers.js"
                ));

            // kendo
            bundles.Add(new StyleBundle("~/Content/KendoUI/css").Include(
                "~/Content/KendoUI/kendo.common.min.css",
                "~/Content/KendoUI/kendo.default.min.css"));

            bundles.Add(new ScriptBundle("~/bundles/kendo.js")
                .Include("~/Scripts/KendoUI/kendo.all.min.js")
                .Include("~/Scripts/KendoUI/kendo.timezones.min.js")
                .Include("~/Scripts/KendoUI/kendo.percentagetextbox.js")
                .Include("~/Scripts/KendoUI/kendo.aspnetmvc.min.js")
                .Include("~/Scripts/KendoUI/kendo.custom.js"));

            bundles.Add(new StyleBundle("~/content/default")
                .Include("~/content/fixed.css")
                .Include("~/content/default.css"));

            bundles.Add(new StyleBundle("~/content/base")
                .Include("~/content/base.css"));

            bundles.Add(new StyleBundle("~/content/login")
                .Include("~/content/login.css"));

            bundles.Add(new ScriptBundle("~/resources/embedded/sharedjs")
                .Include("~/resources/embedded/shared.js")
                .Include("~/resources/embedded/customkendogridui.js"));

            bundles.Add(new CustomScriptBundle("~/resources/embedded/js")
                .Include("~/resources/embedded/businessprocessesmodel.js")
                .Include("~/resources/embedded/classeschooser.js")
                .Include("~/resources/embedded/fieldschooser.js")
                .Include("~/resources/embedded/customkendogridui.js")
                );

            bundles.Add(new StyleBundle("~/content/externalresource/css")
                .Include("~/Content/ExternalResource/businessprocesses.css")
                .Include("~/Content/ExternalResource/fieldschooser.css")
                .Include("~/Content/ExternalResource/classeschooser.css")
                .Include("~/Content/ExternalResource/shared.css")
                );
            bundles.Add(new CustomScriptBundle("~/bundles/automationtasks/tasks")
                .Include("~/scripts/page/mc.automationtasks.tasks.js"));

            bundles.Add(new CustomScriptBundle("~/bundles/automationtasks/datastores")
                .Include("~/scripts/page/mc.automationtasks.datastores.js"));

            bundles.Add(new CustomScriptBundle("~/bundles/globalsettings/eventlog")
                .Include("~/scripts/page/mc.globalsettings.EventLog.js"));

            bundles.Add(new CustomScriptBundle("~/bundles/globalsettings/systemlog")
                .Include("~/scripts/page/mc.globalsettings.Systemlog.js"));

            bundles.Add(new CustomScriptBundle("~/bundles/globalsettings/webclientsettings")
                .Include("~/scripts/page/mc.globalsettings.webclientsettings.js"));

            bundles.Add(new CustomScriptBundle("~/bundles/globalsettings/systemsettings")
                .Include("~/scripts/page/mc.globalsettings.systemsettings.js"));

            bundles.Add(new CustomScriptBundle("~/bundles/globalsettings/authentication")
                .Include("~/scripts/page/mc.globalsettings.authentication.js"));

            bundles.Add(new CustomScriptBundle("~/bundles/globalsettings/languages")
                .Include("~/scripts/page/mc.globalsettings.languages.js"));

            bundles.Add(new CustomScriptBundle("~/bundles/globalsettings/welcomepage")
                .Include("~/scripts/page/mc.globalsettings.welcomepage.js"));

            bundles.Add(new CustomScriptBundle("~/bundles/globalsettings/fieldcategories")
                .Include("~/scripts/page/mc.globalsettings.fieldcategories.js"));

            bundles.Add(new CustomScriptBundle("~/bundles/globalsettings/packages")
                .Include("~/scripts/page/mc.globalsettings.packages.js"));

            bundles.Add(new CustomScriptBundle("~/bundles/globalsettings/businessprocesses")
                .Include("~/scripts/page/mc.globalsettings.businessprocesses.js"));

            bundles.Add(new CustomScriptBundle("~/bundles/globalsettings/labelcategories")
                .Include("~/scripts/page/mc.globalsettings.labelcategories.js"));

            bundles.Add(new CustomScriptBundle("~/bundles/globalsettings/systemroles")
                .Include("~/scripts/page/mc.globalsettings.systemroles.js"));

            bundles.Add(new CustomScriptBundle("~/bundles/globalsettings/components")
                .Include("~/scripts/page/mc.globalsettings.components.js"));

            bundles.Add(new CustomScriptBundle("~/bundles/models/allmodels")
                .Include("~/scripts/page/mc.models.allmodels.js"));

            bundles.Add(new CustomScriptBundle("~/bundles/models/model")
                .Include("~/scripts/page/mc.models.model.js"));

            bundles.Add(new CustomScriptBundle("~/bundles/models/license")
                .Include("~/scripts/page/mc.models.license.js"));

            bundles.Add(new CustomScriptBundle("~/bundles/models/communications")
                .Include("~/scripts/page/mc.models.communications.js"));

            bundles.Add(new CustomScriptBundle("~/bundles/models/modelserver")
                .Include("~/scripts/page/mc.models.modelserver.js"));

            bundles.Add(new CustomScriptBundle("~/bundles/models/refreshcycle")
                .Include("~/scripts/page/mc.models.refreshcycletemplate.js")
                .Include("~/scripts/page/mc.models.refreshcycle.js"));

            bundles.Add(new CustomScriptBundle("~/bundles/models/suggestedfields")
                .Include("~/scripts/page/mc.models.suggestedfields.js"));

            bundles.Add(new CustomScriptBundle("~/bundles/models/languages")
                .Include("~/scripts/page/mc.models.languagestemplate.js")
                .Include("~/scripts/page/mc.models.languages.js"));

            bundles.Add(new CustomScriptBundle("~/bundles/models/tablesfields")
                .Include("~/scripts/page/mc.models.tablesfields.js"));

            bundles.Add(new CustomScriptBundle("~/bundles/models/packages")
                .Include("~/scripts/page/mc.models.packages.js"));

            bundles.Add(new CustomScriptBundle("~/bundles/models/labels")
                .Include("~/scripts/page/mc.models.labels.js"));

            bundles.Add(new CustomScriptBundle("~/bundles/models/roles")
                .Include("~/scripts/page/mc.models.roles.js"));

            bundles.Add(new CustomScriptBundle("~/bundles/models/anglewarnings")
                .Include("~/scripts/page/mc.models.anglewarnings.js"));

            bundles.Add(new CustomScriptBundle("~/bundles/users/user")
                .Include("~/scripts/page/mc.users.user.js"));

            bundles.Add(new CustomScriptBundle("~/bundles/users/sessions")
                .Include("~/scripts/page/mc.users.sessions.js"));

            bundles.Add(new CustomScriptBundle("~/bundles/users/userdefaultsettings")
                .Include("~/scripts/page/mc.users.userdefaultsettings.js"));
        }
    }

#if DEVMODE
    public class CustomScriptBundle : Bundle
    {
        public CustomScriptBundle(string virtualPath)
            : base(virtualPath)
        {
            Path = virtualPath;
        }

        public CustomScriptBundle(string virtualPath, string cdnPath)
            : base(virtualPath, cdnPath)
        {
            Path = virtualPath;
            CdnPath = cdnPath;
        }
    }
#else
    public class CustomScriptBundle : ScriptBundle
    {
        public CustomScriptBundle(string virtualPath)
            : base(virtualPath)
        {
            this.Path = virtualPath;
        }

        public CustomScriptBundle(string virtualPath, string cdnPath)
            : base(virtualPath, cdnPath)
        {
            this.Path = virtualPath;
            this.CdnPath = cdnPath;
        }
    }
#endif
}
