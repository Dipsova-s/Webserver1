using System.Net;
using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels.SystemInformation;
using EveryAngle.WebClient.Service.HttpHandlers;
using Newtonsoft.Json;

namespace EveryAngle.WebClient.Service.ApiServices
{
    public class SystemInformationService : ISystemInformationService
    {
        public SystemInformationViewModel GetSystemInformation(string systemInformationUrl)
        {
            var requestManager =  RequestManager.Initialize(systemInformationUrl); 
            var jsonResult = requestManager.Run(); 
            if (requestManager.ResponseStatus == HttpStatusCode.Unauthorized)
            {
                return null;
            }
            var models = JsonConvert.DeserializeObject<SystemInformationViewModel>(jsonResult.ToString());
            return models;
        }
    }
}
