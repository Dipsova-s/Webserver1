using EveryAngle.WebClient.Service.Security;
using EveryAngle.WebClient.Service.Security.Interfaces;
using System.Web.Mvc;

namespace EveryAngle.WebClient.Web.Filters.ActionFilters
{
    public class ValidationRequestAttribute : ActionFilterAttribute
    {
        public bool IsSkippable { get; private set; }

        public IValidationRequestService Service { get; private set; }

        public ValidationRequestAttribute()
          : this(false, ValidationRequestService.Instance())
        {
        }

        public ValidationRequestAttribute(bool isSkippable)
            : this(isSkippable, ValidationRequestService.Instance())
        {
        }

        public ValidationRequestAttribute(bool isSkippable, IValidationRequestService service)
        {
            IsSkippable = isSkippable;
            Service = service;
        }

        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            if (!IsSkippable)
            {
                Service.ValidateToken(filterContext.HttpContext.Request).Wait();
            }
            base.OnActionExecuting(filterContext);
        }
    }
}