using EveryAngle.Shared.Helpers;
using EveryAngle.WebClient.Service.HttpHandlers;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using RestSharp;
using System.Configuration;
using System.Net;

namespace EveryAngle.WebClient.Service.Security
{
    public class AccountService
    {
        private HttpStatusCode responseStatus;
        public HttpStatusCode ResponseStatus
        {
            get { return responseStatus; }
        }

        public JObject Login(string username, string password, bool requierdTosetResponse)
        {
            string loginBody = JsonConvert.SerializeObject(new
                                {
                                    authorization = Base64Helper.Encode(username + ":" + password)
                                });
            return Login(loginBody, requierdTosetResponse);
        }
        public JObject LoginWithAuthorizationAttribute(string loginBody, bool requiredToSetResponseData)
        {
            return Login(loginBody, requiredToSetResponseData);
        }

        private JObject Login(string loginBody, bool requiredToSetResponseData)
        {
            var requestManager = RequestManager.Initialize("/sessions");
            var jsonResult = requestManager.Run(Method.POST, loginBody);
            this.responseStatus = requestManager.ResponseStatus;
            return jsonResult;
        }

        public JObject VerifyRequestToAs()
        {
            var requestManager = RequestManager.Initialize("/sessions");
            var jsonResult = requestManager.Run();
            this.responseStatus = requestManager.ResponseStatus;
            return jsonResult;
        }

    }
}
