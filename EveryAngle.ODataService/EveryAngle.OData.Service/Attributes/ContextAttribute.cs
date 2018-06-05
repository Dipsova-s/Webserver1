using EveryAngle.OData.BusinessLogic.Interfaces;
using EveryAngle.OData.DTO;
using EveryAngle.OData.EAContext;
using EveryAngle.OData.Proxy;
using EveryAngle.OData.Service;
using EveryAngle.OData.Service.Utils;
using EveryAngle.OData.Utils;
using EveryAngle.OData.Utils.Constants;
using EveryAngle.Utilities.IoC;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;

namespace EveryAngle.OData.Service.Attributes
{
    internal sealed class ContextAttribute : ContextAwareActionFilterAttribute
    {
        private static IAppServerProxy _appServerProxy;
        
        public ContextAttribute()
        {
            if (_appServerProxy == null)
                _appServerProxy = ObjectFactory.GetInstance<IAppServerProxy>();
        }

        public override void OnActionExecuting(HttpActionContext actionContext)
        {
            AddEAContext(actionContext);
            base.OnActionExecuting(actionContext);
        }

        private static void AddEAContext(HttpActionContext actionContext)
        {
            string base64EncodedCredentials = BasicAuthenticationHeaderParser.GetBasicAuthenticationBase64EncodedCredentials(actionContext.Request.Headers);

            if (!string.IsNullOrEmpty(base64EncodedCredentials))
            {
                // Rertrieve a cached session for this user.
                User user = new User(base64EncodedCredentials);

                // Create Context to add to the request
                IContext eaActionContext = new Context(actionContext.Request, user);

                // Set Client IP in context
                eaActionContext.ClientIp = GetClientIp(actionContext.Request);

                // Add context to request properties
                actionContext.Request.Properties[Context.Key_eaac] = eaActionContext;
            }
        }
    }
}