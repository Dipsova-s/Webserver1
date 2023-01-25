using EveryAngle.WebClient.Service.HttpHandlers;
using EveryAngle.WebClient.Service.Security;
using EveryAngle.WebClient.Web.Helpers;
using Newtonsoft.Json.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Mvc;

namespace EveryAngle.WebClient.Web.Controllers.Apis
{

    public class UserProfileController : BaseApiController
    {
        private readonly AccountService accountService = new AccountService();

        [AllowAnonymous]
        public HttpResponseMessage Post()
        {
            JObject token = UserProfileControllerHelper.GetTokenWithClientIp(Body, Shared.EmbeddedViews.Util.GetIPAddress());

            var clientSession = token.SelectToken("authorization") == null
                ? accountService.Login(token.SelectToken("user").ToString(), token.SelectToken("password").ToString(), true)
                : accountService.LoginWithAuthorizationAttribute(token.ToString(), false);
            
            return HttpResponseMessageBuilder.GetHttpResponseMessage(this, clientSession, accountService.ResponseStatus, true);
        }

        public HttpResponseMessage Put()
        {
            JObject session = JObject.Parse(this.Body);
            return HttpResponseMessageBuilder.GetHttpResponseMessage(this, session, HttpStatusCode.Created, true);
        }

        public HttpResponseMessage Get()
        {
            JObject session = accountService.VerifyRequestToAs();
            if (accountService.ResponseStatus == HttpStatusCode.Unauthorized)
            {
                session = JObject.Parse(@"{""reason"":""Unauthorized"",""message"":""The token used in the web server request is not valid.""}");
            }

            return HttpResponseMessageBuilder.GetHttpResponseMessage(this, session, accountService.ResponseStatus.GetHashCode());
        }
    }
}
