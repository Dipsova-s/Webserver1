using DevExpress.Web.Mvc;
using EveryAngle.WebClient.Service.EmbededResource;
using EveryAngle.WebClient.Service.ErrorHandlers;
using EveryAngle.WebClient.Web.App_Start;
using EveryAngle.WebClient.Web.Controllers;
using EveryAngle.WebClient.Web.Helpers;
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

namespace EveryAngle.WebClient.Web
{
    public class WebApiApplication : HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            WebApiConfig.Register(GlobalConfiguration.Configuration);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);

            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleTable.VirtualPathProvider = new EmbeddedVirtualPathProvider(HostingEnvironment.VirtualPathProvider);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
            EmbededViewConfig.RegisterCustomViewEngines(ViewEngines.Engines);
            ModelBinders.Binders.DefaultBinder = new DevExpressEditorsBinder();
            MvcHandler.DisableMvcResponseHeader = true;
            LogConfig.Initial();

            GlobalConfiguration.Configuration.IncludeErrorDetailPolicy = IncludeErrorDetailPolicy.Always;
            LogConfig.InitialRequestLog(Convert.ToBoolean(ConfigurationManager.AppSettings["EnableMiniprofiler"]));
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
                    !Request.Path.ToLower().Contains(".swf") && !Request.Path.ToLower().Contains(".ico") &&
                    !Request.Path.ToLower().Contains(".flv") && !Request.Path.ToLower().Contains(".mp4") &&
                    Request.Headers["X-Requested-With"] != "XMLHttpRequest"
                    )
                {
                    PermanentRedirect(url.ToLower() + HttpContext.Current.Request.Url.Query);
                }
            }
            else if (url.ToLower().Contains("admin"))
            {
                if (url.ToLower().Contains("/admin/"))
                {
                    //do nothing
                }
                else if (url.ToLower().Contains("/admin"))
                {
                    url = url.ToLower().Replace("/admin", "/admin/");
                    PermanentRedirect(url.ToLower() + HttpContext.Current.Request.Url.Query);
                }
            }
        }

        private void PermanentRedirect(string url)
        {
            Response.Clear();
            Response.Status = "301 Moved Permanently";
            Response.AddHeader("Location", url);
            Response.End();
        }

        protected void Application_EndRequest()
        {
            if (Convert.ToBoolean(ConfigurationManager.AppSettings["EnableMiniprofiler"]))
            {
                Profiler.Stop();
            }
        }

        protected void Application_Error(object sender, EventArgs e)
        {
            var httpContext = ((HttpApplication)sender).Context;

            var currentRouteData = RouteTable.Routes.GetRouteData(new HttpContextWrapper(httpContext));

            string[] exceptExtensions404 = { ".gif", ".ico", ".png", ".jpg", ".jpeg", ".jpg", ".svg", ".js", ".css", ".map" };
            //Show the custom error page...
            var exception = Server.GetLastError();

            var httpException = exception as HttpException;

            if (httpException != null &&
                !(httpException.GetHttpCode() == 404 &&
                  exceptExtensions404.Contains(Request.CurrentExecutionFilePathExtension)))
            {
                Response.Clear();
                CustomErrorPageHandler.RedirectToCustomErrorPage(httpContext, new ErrorController(), currentRouteData, exception);
            }
        }



        protected void Application_PreSendRequestHeaders()
        {
            // remove possible leaking an information, before send a real response
            Response.Headers.Remove("Server");
        }
    }
}
