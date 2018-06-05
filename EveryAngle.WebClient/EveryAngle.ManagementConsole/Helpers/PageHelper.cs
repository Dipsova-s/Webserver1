using EveryAngle.Core.ViewModels.About;
using EveryAngle.Core.ViewModels.Privilege;
using EveryAngle.ManagementConsole.Models;
using EveryAngle.Shared.Globalization;
using EveryAngle.Shared.Globalization.Helpers;
using EveryAngle.Shared.Helpers;
using EveryAngle.WebClient.Service.Security;
using Kendo.Mvc.UI;
using System;
using System.Collections.Generic;
using System.Configuration;
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
            string query = string.Empty;
            if (request.Sorts.Count > 0)
            {
                if (QueryString.DownloadTable == queryString)
                {
                    query = "&sort=" + request.Sorts[0].Member.ToLower();
                }
                else if (QueryString.LabelCategories == queryString)
                {
                    switch (request.Sorts[0].Member.ToLower())
                    {
                        case "id":
                            query = "&sort=id";
                            break;

                        case "name":
                            query = "&sort=name";
                            break;

                        case "abbreviation":
                            query = "&sort=abbreviation";
                            break;

                        case "createdby.fullname":
                            query = "&sort=created_by";
                            break;

                        case "createdby.created":
                            query = "&sort=created_on";
                            break;

                        case "description":
                            query = "&sort=description";
                            break;
                    }
                }
                else if (QueryString.Users == queryString)
                {
                    switch (request.Sorts[0].Member)
                    {
                        case "UserID":
                            query = "&sort=user";
                            break;

                        case "ReanableIpAddresses":
                            query = "&sort=ip_addresses";
                            break;

                        case "IsActive":
                            query = "&sort=last_activity";
                            break;

                        case "Created":
                            query = "&sort=created";
                            break;

                        case "ExpirationTime":
                            query = "&sort=expiration_time";
                            break;

                        case "Ip":
                            query = "&sort=ip_addresses";
                            break;
                    }
                }
                else if (QueryString.SystemRole == queryString ||
                         QueryString.Role == queryString)
                {
                    switch (request.Sorts[0].Member)
                    {
                        case "Id":
                            query = "&sort=id";
                            break;
                        case "CreatedBy.Created":
                            query = "&sort=created_on";
                            break;
                        case "Description":
                            query = "&sort=description";
                            break;

                        case "CreatedBy.Fullname":
                            query = "&sort=created_by";
                            break;
                    }
                }
                else if (QueryString.Datastores == queryString)
                {
                    switch (request.Sorts[0].Member)
                    {
                        case "name":
                            query = "&sort=name";
                            break;
                        case "plugin_name":
                            query = "&sort=type";
                            break;
                        case "allow_write":
                            query = "&sort=allow_write";
                            break;
                    }
                }

                if (!string.IsNullOrEmpty(query))
                {
                    if (request.Sorts[0].SortDirection == System.ComponentModel.ListSortDirection.Descending)
                    {
                        query += "&dir=desc";
                    }
                    else
                    {
                        query += "&dir=asc";
                    }
                }

            }

            return query;
        }

        public static string GetPackagesQueryString([DataSourceRequest] DataSourceRequest request)
        {
            string query = string.Empty;
            if (request.Sorts.Count > 0)
            {
                switch (request.Sorts[0].Member)
                {
                    case "Name":
                        query = "&sort=name";
                        break;

                    case "CreatedDate":
                        query = "&sort=created";
                        break;
                    case "Description":
                        query = "&sort=description";
                        break;
                    case "status":
                        query = "&sort=status";
                        break;
                }

                if (!string.IsNullOrEmpty(query))
                {
                    if (request.Sorts[0].SortDirection.Equals(System.ComponentModel.ListSortDirection.Descending))
                    {
                        query += "&dir=desc";
                    }
                    else
                    {
                        query += "&dir=asc";
                    }
                }

            }

            return query;
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
                modelDataTimestamp = string.Format(", <span data-role=localize>{1}</span>", aboutModel.status, aboutModel.modeldata_timestamp);
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
                        bool isTaskOwner = buttons[index].UserUri == session.UserUri.ToString();
                        bool canScheduleTask = canManageSystem || (canScheduleAngles && isTaskOwner);
                        if (!canScheduleTask)
                            SetDisabledButton(buttons[index]);
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
            if (button.ButtonType == PopupChooserButtonType.Button)
            {
                return string.Format("<a{0}>{1}</a>", attributes, button.Caption);
            }
            else
            {
                return string.Format("<input{0} type=\"text\" value=\"{1}\" />", attributes, button.Caption);
            }
        }

        public static string GetServerTitle(string type)
        {
            if ("ModelServer".Equals(type, StringComparison.InvariantCultureIgnoreCase))
                return Resource.MC_ModelServer;
            else if ("Extractor".Equals(type, StringComparison.InvariantCultureIgnoreCase))
                return Resource.MC_EAXtractor;
            else
                return type;
        }

        #endregion

    }
}
