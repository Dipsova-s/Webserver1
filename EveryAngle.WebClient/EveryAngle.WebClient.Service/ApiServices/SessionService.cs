using System.Collections.Generic;
using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.Directory;
using EveryAngle.Core.ViewModels.Privilege;
using EveryAngle.Core.ViewModels.Users;
using EveryAngle.Shared.Helpers;
using EveryAngle.Utilities;
using EveryAngle.WebClient.Service.HttpHandlers;
using Newtonsoft.Json;
using RestSharp;

namespace EveryAngle.WebClient.Service.ApiServices
{
    public class SessionService : ISessionService
    {
        public ListViewModel<SessionViewModel> GetSessions(string uri)
        {
            var model = new ListViewModel<SessionViewModel>();
            var requestManager = RequestManager.Initialize(uri);
            var jsonResult = requestManager.Run();
            model.Data =
                JsonConvert.DeserializeObject<List<SessionViewModel>>(jsonResult.SelectToken("sessions").ToString(),
                    new UnixDateTimeConverter());
            model.Header = JsonConvert.DeserializeObject<HeaderViewModel>(jsonResult.SelectToken("header").ToString());
            return model;
        }

        public SessionViewModel GetSession(string uri)
        {
            var requestManager = RequestManager.Initialize(uri);
            var jsonResult = requestManager.Run();
            var result = JsonConvert.DeserializeObject<SessionViewModel>(jsonResult.ToString(),
                new UnixDateTimeConverter());

            requestManager = RequestManager.Initialize(result.ModelPrivilegesUri.ToString());
            var json = requestManager.Run();
            if (json.SelectToken("model_privileges") != null)
            {
                result.ModelPrivileges =
                    JsonConvert.DeserializeObject<List<ModelPrivilegeViewModel>>(
                        json.SelectToken("model_privileges").ToString(), new UnixDateTimeConverter());
            }
            return result;
        }


        public void UpdateSession(string sessionUri, string isActive)
        {
            var requestManager = RequestManager.Initialize(sessionUri);
            requestManager.Run(Method.PUT,isActive);
        }


        public VersionViewModel GetSessionByIwa(string uri)
        {
            var requestManager = RequestManager.Initialize(uri);
            var jsonResult = requestManager.Run();
            return JsonConvert.DeserializeObject<VersionViewModel>(jsonResult.ToString());
        }
    }
}
