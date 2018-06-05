using EveryAngle.OData.BusinessLogic.EdmBusinessLogics;
using EveryAngle.OData.BusinessLogic.Interfaces.Authorizations;
using EveryAngle.OData.BusinessLogic.Interfaces;
using EveryAngle.OData.DTO;
using EveryAngle.OData.EAContext;
using EveryAngle.OData.IoC;
using EveryAngle.OData.Proxy;
using EveryAngle.OData.Service.Utils;
using EveryAngle.OData.Utils;
using EveryAngle.OData.Utils.Constants;
using EveryAngle.Utilities.IoC;
using System;
using System.Collections.Specialized;
using System.Linq;
using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Web;

namespace EveryAngle.OData.Service.Modules
{
    public class BasicAuthenticationHttpModule : IHttpModule
    {
        private const string _wwwAuthenticateHeaderName = "WWW-Authenticate";
        private const string _basicRealmHeader = @"Basic realm=""EA.OData-Realm""";

        private static IAppServerProxy _appServerProxy;
        private static IOdataAuthorizations _odataAuthorizations;

        public void Init(HttpApplication context)
        {
            Initial();

            // Register event handlers
            context.AuthenticateRequest += OnApplicationAuthenticateRequest;
            context.EndRequest += OnApplicationEndRequest;
        }

        private static void OnApplicationAuthenticateRequest(object sender, EventArgs e)
        {
            // then get Authorization parameter from header
            string base64EncodedCredentials = BasicAuthenticationHeaderParser.GetBasicAuthenticationBase64EncodedCredentials(HttpContext.Current.Request.Headers);

            if (!string.IsNullOrEmpty(base64EncodedCredentials))
            {
                User user = new User(base64EncodedCredentials);

                if (user.HasSecurityToken || _appServerProxy.LoginUser(user))
                {
                    AssertMayAccessOdata(user);
                    return;
                }
            }

            HttpContext.Current.Response.StatusCode = HttpStatusCode.Unauthorized.As<int>();
        }

        private static void AssertMayAccessOdata(User user)
        {
            if (!_odataAuthorizations.MayView(user))
            {
                user.RemoveSecurityToken(user.SecurityToken);
                throw new HttpException(403, "{\"reason\":\"Forbidden\",\"message\":\"Model privilege access_data_via_odata is needed to access the data of this model\"}");
            }
        }

        private static void OnApplicationEndRequest(object sender, EventArgs e)
        {
            // If the request was unauthorized, add the WWW-Authenticate header to the response.
            HttpResponse response = HttpContext.Current.Response;
            if (response.StatusCode == 401)
            {
                response.Headers.Add(_wwwAuthenticateHeaderName, _basicRealmHeader);
            }
        }

        private static void Initial()
        {
            if (_appServerProxy == null)
                _appServerProxy = ObjectFactory.GetInstance<IAppServerProxy>();

            if (_odataAuthorizations == null)
                _odataAuthorizations = ObjectFactory.GetInstance<IOdataAuthorizations>();
        }

        public void Dispose()
        {
        }
    }
}