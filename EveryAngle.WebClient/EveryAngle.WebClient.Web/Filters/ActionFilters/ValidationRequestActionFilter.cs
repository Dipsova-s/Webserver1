using EveryAngle.WebClient.Service.Security;
using EveryAngle.WebClient.Service.Security.Interfaces;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;

namespace EveryAngle.WebClient.Web.Filters.ActionFilters
{
    public class ValidationRequestActionFilter : ActionFilterAttribute
    {
        public IValidationRequestService Service { get; private set; }

        public ValidationRequestActionFilter()
            : this(ValidationRequestService.Instance())
        {
        }

        public ValidationRequestActionFilter(IValidationRequestService service)
        {
            Service = service;
        }

        public override void OnActionExecuting(HttpActionContext actionContext)
        {
            Service.ValidateToken(actionContext.Request).Wait();
            base.OnActionExecuting(actionContext);
        }
    }
}