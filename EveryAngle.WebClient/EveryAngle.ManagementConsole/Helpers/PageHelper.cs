using EveryAngle.Core.ViewModels.About;
using EveryAngle.ManagementConsole.Models;
using EveryAngle.Shared.Globalization.Helpers;
using EveryAngle.Shared.Helpers;
using EveryAngle.WebClient.Service.Security;
using Kendo.Mvc;
using Kendo.Mvc.UI;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Configuration;
using System.Diagnostics.CodeAnalysis;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace EveryAngle.ManagementConsole.Helpers
{
    public enum QueryString
    {
        LabelCategories,
        DownloadTable,
        Users,
        SystemRole,
        Role,
        Datastores
    }

    public static class PageHelper
    {
        #region Public

        public static MvcHtmlString RenderPageToolbar(this HtmlHelper helper, List<PageToolbarButtonModel> buttons = null)
        {
            return MvcHtmlString.Create(GetHTML(helper, buttons, "~/Views/Shared/PageToolbar.cshtml"));
        }

        public static MvcHtmlString RenderPageToolbarBottom(this HtmlHelper helper, List<PageToolbarButtonModel> buttons = null)
        {
            return MvcHtmlString.Create(GetHTML(helper, buttons, "~/Views/Shared/PageToolBarBottom.cshtml"));
        }

        public static string GetGridToolbar(this HtmlHelper helper, List<PageToolbarButtonModel> buttons = null)
        {
            return GetHTML(helper, buttons, "~/Views/Shared/GridToolBar.cshtml");
        }

        public static bool UseCustomTemplate(PageToolbarButtonType type)
        {
            return type == PageToolbarButtonType.GridEditDelete || type == PageToolbarButtonType.Custom;
        }

        public static string GetQueryString([DataSourceRequest] DataSourceRequest request, QueryString queryString)
        {
            if (request.Sorts.Any())
            {
                SortDescriptor sortDescriptor = request.Sorts[0];
                if (QueryString.DownloadTable == queryString)
                {
                    string sortKey = sortDescriptor.Member.ToLowerInvariant();
                    string sortDirectrion = GetSortDirectionQuery(sortDescriptor.SortDirection);
                    return $"&sort={sortKey}{sortDirectrion}";
                }
                else if (QueryString.LabelCategories == queryString)
                {
                    Dictionary<string, string> sortLabelCategoryMappers = new Dictionary<string, string>
                    {
                        { "id", "&sort=id" },
                        { "name", "&sort=name" },
                        { "abbreviation", "&sort=abbreviation" },
                        { "createdby.fullname", "&sort=created_by" },
                        { "createdby.created", "&sort=created_on" },
                        { "description", "&sort=description" }
                    };
                    return GetSortingQuery(sortDescriptor, sortLabelCategoryMappers);
                }
                else if (QueryString.Users == queryString)
                {
                    Dictionary<string, string> sortUserMappers = new Dictionary<string, string>
                    {
                        { "userid", "&sort=user" },
                        { "reanableipaddresses", "&sort=ip_addresses" },
                        { "ip", "&sort=ip_addresses" },
                        { "isactive", "&sort=last_activity" },
                        { "created", "&sort=created" },
                        { "expirationtime", "&sort=expiration_time" }
                    };
                    return GetSortingQuery(sortDescriptor, sortUserMappers);
                }
                else if (QueryString.SystemRole == queryString || QueryString.Role == queryString)
                {
                    Dictionary<string, string> sortRoleMappers = new Dictionary<string, string>
                    {
                        { "id", "&sort=id" },
                        { "description", "&sort=description" },
                        { "createdby.created", "&sort=created_on" },
                        { "createdby.fullname", "&sort=created_by" }
                    };
                    return GetSortingQuery(sortDescriptor, sortRoleMappers);
                }
                else if (QueryString.Datastores == queryString)
                {
                    Dictionary<string, string> sortDatastoreMappers = new Dictionary<string, string>
                    {
                        { "name", "&sort=name" },
                        { "plugin_name", "&sort=type" },
                        { "allow_write", "&sort=allow_write" },
                        { "is_default", "&sort=is_default" }
                    };
                    return GetSortingQuery(sortDescriptor, sortDatastoreMappers);
                }
            }
            return string.Empty;
        }

        public static string GetPackagesQueryString([DataSourceRequest] DataSourceRequest request)
        {
            if (!request.Sorts.Any())
                return string.Empty;

            Dictionary<string, string> sortMappers = new Dictionary<string, string>
            {
                { "name", "&sort=name" },
                { "createddate", "&sort=created" },
                { "description", "&sort=description" },
                { "status", "&sort=status" }
            };
            return GetSortingQuery(request.Sorts[0], sortMappers);
        }

        public static string GetSortingQuery(SortDescriptor sortDescriptor, Dictionary<string, string> sortMappers)
        {
            string query = string.Empty;
            string sortKey = sortDescriptor.Member.ToLowerInvariant();
            if (sortMappers.ContainsKey(sortKey))
            {
                query += sortMappers[sortKey];
                query += GetSortDirectionQuery(sortDescriptor.SortDirection);
            }
            return query;
        }

        private static string GetSortDirectionQuery(ListSortDirection sortDirection)
        {
            return sortDirection == ListSortDirection.Descending ? "&dir=desc" : "&dir=asc";
        }

        public static string GetWebclientUrl()
        {
            SessionHelper sessionHelper = SessionHelper.Initialize();
            EveryAngle.Core.ViewModels.Users.UserViewModel user = sessionHelper.CurrentUser;
            string webClientAngleUrl = "";
            if (user != null && user.ModelPrivileges != null)
            {
                bool isPossibleToAccessWC = sessionHelper.Session.IsValidToAccessWebClient();
                if (isPossibleToAccessWC)
                {
                    string defaultLanguage = "{0}";
                    webClientAngleUrl = UtilitiesHelper.GetWebClientUrl(defaultLanguage + ConfigurationManager.AppSettings["WebClientAngleUrl"]);
                }
            }
            return webClientAngleUrl;
        }

        public static string HeaderWithTimezone(string header)
        {
            return string.Format("<span data-tooltip-title=\"MC.util.getTimezoneText\">{0} (<span data-role=\"timezoneinfo\"></span>)</span>", header);
        }

        public static string LocalizationText(this HtmlHelper helper, string name)
        {
            return ResourceHelper.GetLocalization(name, "en") ?? name;
        }

        public static string CaptionText(this HtmlHelper helper, string name)
        {
            return ResourceHelper.GetCaption(name, "en") ?? name;
        }

        public static MvcHtmlString ClassChooserButton(this HtmlHelper helper, PopupChooserButtonModel button)
        {
            button.Target = "#popupClassesChooser";
            button.MinWidth = Math.Max(button.MinWidth, 760);
            button.MinHeight = Math.Max(button.MinHeight, 400);
            string html = GetChooserButtonHtml(button);
            return MvcHtmlString.Create(html);
        }

        public static MvcHtmlString FieldChooserButton(this HtmlHelper helper, PopupChooserButtonModel button)
        {
            button.Target = "#popupFieldChooser";
            button.MinWidth = Math.Max(button.MinWidth, 640);
            button.MinHeight = Math.Max(button.MinHeight, 400);
            string html = GetChooserButtonHtml(button);
            return MvcHtmlString.Create(html);
        }

        public static string GetModelInfoStatus(AboutModel aboutModel)
        {
            string modelDataTimestamp = string.Empty;
            if (!aboutModel.status.Equals("down", StringComparison.InvariantCultureIgnoreCase) && aboutModel.modeldata_timestamp > 0)
            {
                modelDataTimestamp = $", <span data-role=localize>{aboutModel.modeldata_timestamp}</span>";
            }
            string modelStatus = string.Format("({0}{1})", aboutModel.status, modelDataTimestamp);
            return modelStatus;
        }

        public static MvcHtmlString RenderButton(this HtmlHelper helper, string name, string tooltip = "", bool isDisabled = false, string onClick = "return void(0)")
        {
            string encodedTooltip = HttpUtility.HtmlEncode(tooltip);
            string encodedName = HttpUtility.HtmlEncode(name);
            string button = string.Format("<span data-role=\"tooltip\"><a class=\"btn {0}\" data-type=\"html\" data-tooltip-title=\"{1}\" onclick=\"{2}\">{3}</a></span>", isDisabled ? "disabled" : string.Empty, encodedTooltip, onClick, encodedName);
            return MvcHtmlString.Create(button);
        }

        #endregion

        #region Private

        private static string GetHTML(HtmlHelper helper, List<PageToolbarButtonModel> buttons, string htlmPath)
        {
            if (buttons == null)
                buttons = new List<PageToolbarButtonModel>();

            // set priviledge to button
            AdjustButtonsPrivilege(buttons);

            using (StringWriter stringWriter = new StringWriter())
            {
                ViewEngineResult viewResult = ViewEngines.Engines.FindPartialView(helper.ViewContext, htlmPath);
                ViewContext viewContext = new ViewContext(helper.ViewContext, viewResult.View, new ViewDataDictionary(buttons), new TempDataDictionary(), stringWriter);
                viewResult.View.Render(viewContext, stringWriter);
                return stringWriter.GetStringBuilder().ToString();
            }
        }

        [ExcludeFromCodeCoverage]
        private static void AdjustButtonsPrivilege(List<PageToolbarButtonModel> buttons)
        {
            EveryAngle.Core.ViewModels.Users.SessionViewModel session = SessionHelper.Initialize().Session;
            bool canManageSystem = session.IsValidToManageSystemPrivilege();

            for (int index = 0; index < buttons.Count; index++)
            {
                // set default is enable and this will be replace if no priviledge
                if (buttons[index].Template == null)
                    buttons[index].Template = buttons[index].EnableTemplate;

                switch (buttons[index].Privilege)
                {
                    case PrivilegeType.System:
                        if (!canManageSystem)
                            SetDisabledButton(buttons[index]);
                        break;
                    case PrivilegeType.Model:
                        if (!session.IsValidToManageModelPrivilege(buttons[index].ModelUri))
                            SetDisabledButton(buttons[index]);
                        break;
                    case PrivilegeType.User:
                        if (!session.IsValidToManageUserPrivilege())
                            SetDisabledButton(buttons[index]);
                        break;
                    case PrivilegeType.SystemAndModel:
                        if (!session.IsValidToManageModelPrivilege(buttons[index].ModelUri)
                            && (!canManageSystem || buttons[index].Mode != ButtonMode.Create))
                            SetDisabledButton(buttons[index]);
                        break;
                    case PrivilegeType.ScheduleTask:
                        bool canScheduleAngles = session.IsValidToScheduleAngles();
                        bool canScheduleTask = canManageSystem || canScheduleAngles;
                        if (!canScheduleTask)
                            SetDisabledButton(buttons[index]);
                        if (canScheduleAngles && !canManageSystem && buttons[index].Type == PageToolbarButtonType.GridEditDelete)
                            SetDisabledButton(buttons[index]);
                        break;
                    default:
                        break;
                }
            }
        }

        private static void SetDisabledButton(PageToolbarButtonModel button)
        {
            button.Link = string.Empty;
            button.OnClick = string.Empty;
            button.CssClass += " disabled";
            button.Template = button.DisableTemplate;
        }

        private static string GetChooserButtonHtml(PopupChooserButtonModel button)
        {
            StringBuilder builder = new StringBuilder();

            if (button.Target == "#popupClassesChooser")
            {
                builder.Append(" data-role=\"mcPopup\"");
                builder.AppendFormat(" data-target=\"{0}\"", button.Target);
                builder.AppendFormat(" data-width=\"{0}\"", button.Width);
                builder.AppendFormat(" data-min-width=\"{0}\"", button.MinWidth);
                builder.AppendFormat(" data-height=\"{0}\"", button.Height);
                builder.AppendFormat(" data-min-height=\"{0}\"", button.MinHeight);
            }

            builder.AppendFormat(" data-title=\"{0}\"", button.PopupTitle);

            if (!string.IsNullOrEmpty(button.OnClick))
                builder.AppendFormat(" onclick=\"{0}\"", button.OnClick);

            if (!string.IsNullOrEmpty(button.ClassName))
                builder.AppendFormat(" class=\"{0}\"", button.ClassName);

            if (!string.IsNullOrEmpty(button.Attributes))
                builder.AppendFormat(" {0}", button.Attributes);

            string attributes = builder.ToString();
            return button.ButtonType == PopupChooserButtonType.Button
                ? string.Format("<a{0}>{1}</a>", attributes, button.Caption)
                : string.Format("<input{0} type=\"text\" value=\"{1}\" />", attributes, button.Caption);
        }

        #endregion
    }
}
