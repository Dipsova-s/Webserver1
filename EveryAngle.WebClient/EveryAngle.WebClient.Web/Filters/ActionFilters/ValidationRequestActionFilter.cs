using EveryAngle.WebClient.Service.Security;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;

namespace EveryAngle.WebClient.Web.Filters.ActionFilters
{
    public class ValidationRequestActionFilter : ActionFilterAttribute
    {
        public override void OnActionExecuting(HttpActionContext actionContext)
        {
            ValidationRequestService.ValidateToken(actionContext.Request);
            base.OnActionExecuting(actionContext);
        }
    }
}