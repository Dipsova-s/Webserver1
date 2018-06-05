using EveryAngle.OData.EAContext;
using EveryAngle.OData.Utils.Logs;
using System.Diagnostics;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;

namespace EveryAngle.OData.Service.Attributes
{
    internal sealed class AsyncLoggingFilter : ContextAwareActionFilterAttribute
    {
        public override async Task OnActionExecutingAsync(HttpActionContext actionContext, CancellationToken cancellationToken)
        {
            IContext context = GetContext(actionContext);
            HttpRequestMessage request = actionContext.Request;

            // get content size and start requesting performance measure
            StartPerformanceMeasurement(request);
            await Task.Factory.StartNew(() => LogService.Info(string.Format("[{0}] [{1} : <{2}> : >>][{3}], {4:N2}KB.",
                request.Method.Method,
                context.ClientIp,
                context.User.Username,
                request.RequestUri,
                GetContentSize(request.Content)
                )));
        }

        public override async Task OnActionExecutedAsync(HttpActionExecutedContext actionExecutedContext, CancellationToken cancellationToken)
        {
            IContext context = GetContext(actionExecutedContext);
            HttpResponseMessage response = actionExecutedContext.Response;

            // get content size and stop requesting measure performance
            int elapseTime = StopPerformanceMeasurement(actionExecutedContext.Request);
            string logMessage = string.Format("[Res:{0} : <<][Cached 304] {1}ms 0.00KB.", context.ClientIp, elapseTime);
            if (response != null)
            {
                logMessage = string.Format("[{0}] [{1} : <{2}> : <<][{3} {4}] {5}, {6}ms {7:N2}KB.",
                    response.RequestMessage.Method.Method,
                    context.ClientIp,
                    context.User.Username,
                    (int)response.StatusCode,
                    response.StatusCode,
                    response.RequestMessage.RequestUri,
                    elapseTime,
                    GetContentSize(response)
                    );
            }

            await Task.Factory.StartNew(() => LogService.Info(logMessage));
        }
    }
}