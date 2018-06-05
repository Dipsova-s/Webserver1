using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace EveryAngle.WebClient.Service.ErrorHandlers
{
    public static class CustomErrorPageHandler
    {
        public static void RedirectToCustomErrorPage(HttpContext httpContext, IController errorController, RouteData currentRouteData, Exception ex)
        {
            string currentController = string.Empty;
            string currentAction = string.Empty;
            if (currentRouteData != null)
            {
                if (currentRouteData.Values["controller"] != null &&
                    !string.IsNullOrEmpty(currentRouteData.Values["controller"].ToString()))
                {
                    currentController = currentRouteData.Values["controller"].ToString();
                }

                if (currentRouteData.Values["action"] != null &&
                    !string.IsNullOrEmpty(currentRouteData.Values["action"].ToString()))
                {
                    currentAction = currentRouteData.Values["action"].ToString();
                }

             

                var routeData = new RouteData();
                var action = "Index";
                var errorMessage = ex.Message;

               
                httpContext.ClearError();
                httpContext.Response.Clear();
                httpContext.Response.StatusCode = ex is HttpException ? ((HttpException)ex).GetHttpCode() : 500;

               
                if (ex is HttpRequestValidationException)
                {
                    httpContext.Response.StatusCode = 400;
                    errorMessage = ex.Message.Split('(').First();
                }

                httpContext.Response.TrySkipIisCustomErrors = true;
                routeData.Values["controller"] = "Error";
                routeData.Values["action"] = action;
                routeData.Values["error"] = errorMessage;

              //  errorController.ViewData.Model = new HandleErrorInfo(ex, currentController, currentAction);
                errorController.Execute(new RequestContext(new HttpContextWrapper(httpContext), routeData));
            }
        }
    }
}
