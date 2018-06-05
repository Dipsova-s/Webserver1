using EveryAngle.OData.Service.Handlers;
using EveryAngle.OData.Utils.Exceptions;
using EveryAngle.OData.Utils.Logs;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Net;
using System.Web;
using System.Web.Http.Filters;

namespace EveryAngle.OData.Service.Attributes
{
    internal sealed class ExceptionHandlingAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuted(HttpActionExecutedContext actionExecutedContext)
        {
            if (actionExecutedContext.Exception != null)
            {
                // Web exception or HTTPException exposed from AS responded.
              
                if (actionExecutedContext.Exception is WebException || actionExecutedContext.Exception is HttpException)
                {
                    Exception ex = actionExecutedContext.Exception;
                    if (ex != null)
                    {
                        JObject body = new JObject();
                        body.Add("reason", "Unknown reason");
                        body.Add("message", ex.Message);

                        LogService.Error("WebException occurred while action executed:", ex);

                        try
                        {
                            body = JsonConvert.DeserializeObject<JObject>(ex.Message);
                        }
                        catch (JsonReaderException jEx)
                        {
                            LogService.Error("JsonReaderException occurred while action executed:", jEx);
                        }

                        string reason = body["reason"].ToString();
                        actionExecutedContext.Response = EAExceptionHandler.CreateErrorResponse(
                            actionExecutedContext.Request,
                            reason.AsHttpStatusCode(),
                            reason,
                            body["message"].ToString());
                    }
                    else
                    {
                        LogService.Error("Exception occurred while action executed:", actionExecutedContext.Exception);
                        actionExecutedContext.Response = EAExceptionHandler.CreateErrorResponse(
                            actionExecutedContext.Request,
                            (HttpStatusCode)422,
                            actionExecutedContext.Exception.Message,
                            actionExecutedContext.Exception.Message);
                    }
                }
              
            }

            base.OnActionExecuted(actionExecutedContext);
        }

        
    }
}