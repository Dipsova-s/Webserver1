using EveryAngle.ManagementConsole.App_Start;
using EveryAngle.ManagementConsole.Controllers;
using EveryAngle.ManagementConsole.Helpers;
using EveryAngle.Shared.Globalization;
using EveryAngle.WebClient.Service.EmbededResource;
using EveryAngle.WebClient.Service.ErrorHandlers;
using EveryAngle.WebClient.Service.LogHandlers;
using System;
using System.Configuration;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Hosting;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using System.Web.SessionState;

namespace EveryAngle.ManagementConsole
{
    // Note: For instructions on enabling IIS6 or IIS7 classic mode, 
    // visit http://go.microsoft.com/?LinkId=9394801


    public class MvcApplication : HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();

            WebApiConfig.Register(GlobalConfiguration.Configuration);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            MvcHandler.DisableMvcResponseHeader = true;

            BundleTable.VirtualPathProvider = new EmbeddedVirtualPathProvider(HostingEnvironment.VirtualPathProvider);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
            EmbededViewConfig.RegisterCustomViewEngines(ViewEngines.Engines);

            RegisterGlobalFilters(GlobalFilters.Filters);
            LogConfig.Initial();
            LogConfig.InitialRequestLog(Convert.ToBoolean(ConfigurationManager.AppSettings["EnableMiniprofiler"]));

#if !DEVMODE
            CustomIConConfig.InitialCustomImages();
#endif
        }

        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
        }

        protected void Application_AuthenticateRequest(object sender, EventArgs e)
        {
            //do nothing
        }

        protected void Application_BeginRequest(object sender, EventArgs e)
        {
            if (Convert.ToBoolean(ConfigurationManager.AppSettings["EnableMiniprofiler"]))
            {
                Profiler.Start(HttpContext.Current);
            }

            var url = Request.Url.Scheme + "://" + HttpContext.Current.Request.Url.Authority +
                      HttpContext.Current.Request.Url.AbsolutePath;

            // If we've got uppercase characters, fix
            if (Regex.IsMatch(url, @"[A-Z]"))
            {
                if (!Request.Path.ToLower().Contains(".css") && !Request.Path.ToLower().Contains(".js") &&
                    !Request.Path.ToLower().Contains(".png") && !Request.Path.ToLower().Contains(".jpg") &&
                    !Request.Path.ToLower().Contains(".gif") && !Request.Path.ToLower().Contains(".svg") &&
                    !Request.Path.ToLower().Contains(".map") &&
                    !Request.Path.ToLower().Contains(".swf") && !Request.Path.ToLower().Contains(".ico") &&
                    !Request.Path.ToLower().Contains(".flv") && !Request.Path.ToLower().Contains(".mp4")
                    )
                {
                    if (Request.Headers["X-Requested-With"] != "XMLHttpRequest")
                    {
                        PermanentRedirect(url.ToLower() + HttpContext.Current.Request.Url.Query);
                    }
                }
            }
        }

        private void PermanentRedirect(string url)
        {
            Response.Clear();
            Response.Status = Resource.MC_301MovedPermanently;
            Response.AddHeader("Location", url);
            Response.End();
        }

        protected void Application_AcquireRequestState(object sender, EventArgs e)
        {
        }

        private bool IsWebApiRequest()
        {
            return
                HttpContext.Current.Request.AppRelativeCurrentExecutionFilePath.StartsWith(
                    WebApiConfig.UrlPrefixRelative);
        }

        protected void Application_PostAuthorizeRequest()
        {
            if (IsWebApiRequest())
            {
                HttpContext.Current.SetSessionStateBehavior(SessionStateBehavior.Required);
            }
        }

        protected void Application_Error(object sender, EventArgs e)
        {
            string[] exceptExtensions404 = { ".ico", ".png", ".gif", ".jpg", ".jpeg", ".jpg", ".js", ".css", ".swf", ".flv", ".map", ".mp4" };
            var httpContext = ((HttpApplication)sender).Context;
            var currentRouteData = RouteTable.Routes.GetRouteData(new HttpContextWrapper(httpContext));
            //Show the custom error page...
        
            var exception = Server.GetLastError();
            LogManager.WriteExceptionLog(exception);
            var httpException = exception as HttpException;

            if (httpException != null &&
                !(httpException.GetHttpCode() == 404 &&
                  exceptExtensions404.Contains(Request.CurrentExecutionFilePathExtension)))
            {
                CustomErrorPageHandler.RedirectToCustomErrorPage(httpContext, new ErrorController(), currentRouteData, exception);
            }
        }

        protected void Application_EndRequest()
        {
            if (Convert.ToBoolean(ConfigurationManager.AppSettings["EnableMiniprofiler"]))
            {
                Profiler.Stop();
            }
        }
    }
}
