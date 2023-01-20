using System.Web.Mvc;
using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.Users;
using EveryAngle.WebClient.Service.Security;
using EveryAngle.Shared.Helpers;
using EveryAngle.Shared.Globalization;

using Kendo.Mvc.UI;
using EveryAngle.ManagementConsole.Helpers;


namespace EveryAngle.ManagementConsole.Controllers
{
    public class SystemRoleController : BaseController
    {
        #region private variables
        private readonly IGlobalSettingService globalSettingService;
        private readonly IModelService modelService;
        private readonly ISessionService sessionService;
        private readonly IUserService userService;
        #endregion

        #region constructor

        /*
         * for the real world
         */
        public SystemRoleController(
            IModelService modelService,
            IGlobalSettingService globalSettingService,
            ISessionService sessionService,
            IUserService userService)
        {
            this.modelService = modelService;
            this.globalSettingService = globalSettingService;
            this.sessionService = sessionService;
            this.userService = userService;
        }

        /*
         * for unit test
         */
        public SystemRoleController(
            IModelService modelService,
            IGlobalSettingService globalSettingService,
            ISessionService sessionService,
            IUserService userService,
            AuthorizationHelper authorizationHelper)
        {
            this.modelService = modelService;
            this.globalSettingService = globalSettingService;
            this.sessionService = sessionService;
            this.userService = userService;
            AuthorizationHelper = authorizationHelper;
        }

        #endregion

        #region routes
        public ActionResult GetRolesDropdown()
        {
            var version = AuthorizationHelper.Version;
            var systemRolesList = modelService.GetSystemRoles(version.GetEntryByName("system_roles").Uri.ToString());
            return Json(systemRolesList, JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetAllSystemRoles()
        {
            var version = AuthorizationHelper.Version;

            var existProviders = userService.GetSystemAuthenticationProviders(version.GetEntryByName("authentication_providers").Uri.ToString());
            ViewBag.AuthenticationProviders = existProviders;

            if (version.GetEntryByName("system_roles") != null)
            {
                ViewBag.SystemRoleUri = version.GetEntryByName("system_roles").Uri.ToString();
                ViewData["DefaultPageSize"] = DefaultPageSize;
                return PartialView("~/Views/GlobalSettings/SystemRoles/AllSystemRoles.cshtml");
            }
            ViewBag.ErrorCode = 403;
            ViewBag.ErrorMessage = Resource.MC_AccessDenied;
            return PartialView("~/Views/Shared/AccessDenied.cshtml");
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult ReadSystemRoles([DataSourceRequest] DataSourceRequest request, string systemRoleUri,
            string q = "")
        {
            var roles = GetRoles(systemRoleUri, request.Page, request.PageSize, request, q);
            var result = new DataSourceResult
            {
                Data = roles.Data,
                Total = roles.Header.Total
            };
            return Json(result);
        }

        public ActionResult EditSystemRole(string systemRoleUri)
        {
            SystemRoleViewModel systemRole = new SystemRoleViewModel();
            if (systemRoleUri != "")
            {
                systemRole = modelService.GetRole(null, systemRoleUri);
            }
            ViewBag.CommentType = "Global_Roles";
            return PartialView("~/Views/GlobalSettings/SystemRoles/EditSystemRole.cshtml", systemRole);
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult SaveSystemRole(string systemRoleUri, string systemRoleData)
        {
            var version = AuthorizationHelper.Version;
            if (systemRoleUri == "")
            {
                var newSystemRole = modelService.CreateRole(version.GetEntryByName("system_roles").Uri.ToString(),
                    systemRoleData);
                systemRoleUri = newSystemRole.Uri.ToString();
            }
            else
            {
                globalSettingService.UpdateSystemRole(systemRoleUri, systemRoleData);
            }

            return new JsonResult
            {
                Data =
                    new {success = true, message = Resource.MC_ItemSuccesfullyUpdated, parameters = new {systemRoleUri}},
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [AcceptVerbs(HttpVerbs.Delete)]
        public ActionResult DeleteSystemRole(string systemRoleUri)
        {
            modelService.DeleteRole(systemRoleUri);
            return new JsonResult
            {
                Data = new {success = true, message = Resource.MC_ItemSuccesfullyUpdated},
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }
        #endregion

        #region private method
        private ListViewModel<SystemRoleViewModel> GetRoles(string systemRoleUri, int page, int pagesize,
    [DataSourceRequest] DataSourceRequest request, string q = "")
        {
            var query = systemRoleUri + "?model=null" + "&" +
                        UtilitiesHelper.GetOffsetLimitQueryString(page, pagesize, q);

            if (request != null)
            {
                query += PageHelper.GetQueryString(request, QueryString.SystemRole);
            }


            var roles = globalSettingService.GetSystemRoles(query);
            return roles;
        }
        #endregion
    }
}
