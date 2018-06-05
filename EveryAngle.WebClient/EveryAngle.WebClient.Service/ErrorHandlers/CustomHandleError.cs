using EveryAngle.Shared.Helpers;
using EveryAngle.WebClient.Service.Security;
using Newtonsoft.Json.Linq;
using System;
using System.Net;
using System.Web;
using System.Web.Mvc;

namespace EveryAngle.WebClient.Service.ErrorHandlers
{
    public class CustomHandleError : HandleErrorAttribute
    {
        public override void OnException(ExceptionContext filterContext)
        {
            ErrorHandler(filterContext);
        }

        private void ErrorHandler(ExceptionContext filterContext)
        {
            if (!filterContext.ExceptionHandled && filterContext.Exception.GetType() == typeof(HttpException))
            {
                HttpException httpException = filterContext.Exception as HttpException;
                int exceptionCode = httpException.GetHttpCode();

                //This will redirect to the login/search page
                if (exceptionCode == 440 || exceptionCode == 401 || exceptionCode == 503)
                {
                    SessionHelper.Initialize().DestroyAllSession();
                    //Handle AJAX Request and return JSON result
                    if (filterContext.HttpContext.Request.IsAjaxRequest())
                    {
                        SetResponseAsJSON(filterContext);
                    }
                    else if (filterContext.IsChildAction)
                    {
                        filterContext.Controller.ControllerContext.HttpContext.Response.Redirect(EveryAngle.Shared.Helpers.UrlHelper.GetLoginPath());
                        filterContext.HttpContext.Response.TrySkipIisCustomErrors = true;
                        filterContext.HttpContext.Response.SuppressFormsAuthenticationRedirect = false;
                    }
                    else
                    {
                        filterContext.Result = new RedirectResult(EveryAngle.Shared.Helpers.UrlHelper.GetLoginPath());
                    }
                }
                else
                {
                    SetResponseContent(filterContext);
                }

                filterContext.ExceptionHandled = true;
            }

        }

        private void SetResponseAsJSON(ExceptionContext filterContext)
        {
            filterContext.HttpContext.Response.ClearContent();
            filterContext.HttpContext.Response.ClearHeaders();
            filterContext.HttpContext.Response.BufferOutput = true;
            filterContext.HttpContext.Response.TrySkipIisCustomErrors = true;
            filterContext.HttpContext.Response.SuppressFormsAuthenticationRedirect = true;

            SetResponseContent(filterContext);
        }

        private void SetResponseContent(ExceptionContext filterContext)
        {
            HttpException httpException = filterContext.Exception as HttpException;
            int exceptionCode = (filterContext.Exception as HttpException).GetHttpCode();

            if (UtilitiesHelper.IsValidJson(httpException.Message))
            {
                dynamic content = JObject.Parse(httpException.Message);
                filterContext.Result = new JsonErrorResult((HttpStatusCode)exceptionCode)
                {
                    JsonRequestBehavior = JsonRequestBehavior.AllowGet,
                    Data = new
                    {
                        reason = Convert.ToString(content.reason),
                        message = Convert.ToString(content.message)
                    }
                };
            }
            else
            {
                filterContext.Result = new HttpStatusCodeResult(exceptionCode, httpException.Message);
            }
        }
    }


    public class JsonErrorResult : JsonResult
    {
        private readonly HttpStatusCode _statusCode;

        public JsonErrorResult(HttpStatusCode statusCode)
        {
            _statusCode = statusCode;
        }

        public override void ExecuteResult(ControllerContext context)
        {
            context.HttpContext.Response.StatusCode = (int)_statusCode;
            base.ExecuteResult(context);
        }
    }
}
