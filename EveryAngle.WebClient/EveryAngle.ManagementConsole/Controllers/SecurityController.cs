using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Logging;
using EveryAngle.ManagementConsole.Filters.ActionFilters;
using EveryAngle.ManagementConsole.Helpers;
using EveryAngle.WebClient.Service.HttpHandlers;
using EveryAngle.WebClient.Service.Security;
using Newtonsoft.Json.Linq;
using RestSharp;
using System;
using System.Net;
using System.Web.Mvc;

namespace EveryAngle.ManagementConsole.Controllers
{
    public class SecurityController : Controller
    {
        private readonly IUserService userService;

        public SecurityController(IUserService service)
        {
            userService = service;
        }

        [IsUserLoggedInAction]
        public ActionResult Index()
        {
            return View();
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult Login(string wc_username, string wc_password)
        {
            AccountService accountService = new AccountService();
            accountService.Login(wc_username, wc_password, true);
            if (accountService.ResponseStatus == HttpStatusCode.Created)
                return Redirect("/Home/Index");
            return RedirectToAction("Index", "Security");
        }

        public ActionResult Logout()
        {
            SessionHelper.Initialize().Logout();
#if DEVMODE
            return RedirectToAction("Index", "Security");
#else
            return new RedirectResult(HttpContext.Request.ApplicationPath.ToLowerInvariant());
#endif
        }

        public ActionResult GetLoginPage()
        {
            ViewBag.PostAction = Url.Action("Login", "Security");
            ViewBag.FileVersion = AssemblyInfoHelper.GetFileVersion();
            return PartialView("~/Views/User/LoginPage.cshtml");
        }

        public void DestroyAllSession()
        {
            try
            {
                SessionHelper.Initialize().DestroyAllSession();
            }
            catch
            {
                // do nothing
            }
        }
    }
}
