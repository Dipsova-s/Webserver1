using System.Diagnostics.CodeAnalysis;
using System.Web.Mvc;
using EveryAngle.WebClient.Service.Security;

namespace EveryAngle.WebClient.Web.Filters.ActionFilters
{
    [ExcludeFromCodeCoverage]
    public class CustomAuthorizeAttribute : AuthorizeAttribute
    {
        public override void OnAuthorization(AuthorizationContext filterContext)
        {
            base.OnAuthorization(filterContext);

            var session = AuthorizationHelper.Initialize();
            if (session.CurrentUser == null)
            {
                HandleUnauthorizedRequest(filterContext);
            }
        }
    }
}