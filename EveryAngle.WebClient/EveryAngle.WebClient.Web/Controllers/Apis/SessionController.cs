using EveryAngle.WebClient.Service.HttpHandlers;
using EveryAngle.WebClient.Service.Security;
using Newtonsoft.Json.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Mvc;

namespace EveryAngle.WebClient.Web.Controllers.Apis
{

    public class SessionController : BaseApiController
    {
        private AccountService accountService = new AccountService();

        [AllowAnonymous]
        public HttpResponseMessage Post()
        {
            JObject token = JObject.Parse(this.Body);
            var clientSession = new JObject();
            if (token.SelectToken("authorization") == null)
            {
                clientSession = accountService.Login(token.SelectToken("user").ToString(), token.SelectToken("password").ToString(), true);
            }
            else
            {
                clientSession = accountService.LoginWithAuthorizationAttribute(this.Body, false);
            }
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
