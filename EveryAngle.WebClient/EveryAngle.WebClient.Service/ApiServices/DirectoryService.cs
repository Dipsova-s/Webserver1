using System;
using System.Configuration;
using System.Linq;
using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels.About;
using EveryAngle.Core.ViewModels.Directory;
using EveryAngle.Shared.Helpers;
using EveryAngle.WebClient.Service.HttpHandlers;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace EveryAngle.WebClient.Service.ApiServices
{
    public class DirectoryService : IDirectoryService
    {
        public string WebServiceUri { get; set; }

        public VersionViewModel GetVersion(string uri)
        {
            var requestManager = RequestManager.Initialize(uri);
            var jsonResult = requestManager.Run();
            if (requestManager.ResponseStatus.GetHashCode() == 440)
            {
                return new VersionViewModel();
            }
            else
            {
                return JsonConvert.DeserializeObject<VersionViewModel>(jsonResult.ToString());
            }
        }

        public VersionViewModel GetVersion()
        {
            string uri = !string.IsNullOrEmpty(WebServiceUri)
                ? WebServiceUri + ConfigurationManager.AppSettings["WebApiVersion"]
                : UrlHelper.GetRequestUrl(URLType.NOA) + ConfigurationManager.AppSettings["WebApiVersion"];

            RequestManager requestManager = RequestManager.Initialize(uri);
            JObject jsonResult = requestManager.Run();
            if (jsonResult != null)
            {
                if (requestManager.ResponseStatus.GetHashCode() == 440)
                {
                    return new VersionViewModel();
                }
                if (requestManager.ResponseStatus.GetHashCode() == 401)
                {
                    return null;
                }
                    
                VersionViewModel result = JsonConvert.DeserializeObject<VersionViewModel>(jsonResult.ToString());
                if (!result.Entries.Exists(filter => filter.Name == "system_settings"))
                {
                    var systemUri =
                        new Uri(UrlHelper.GetRequestUrl(URLType.NOA)).MakeRelativeUri(
                            new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + "/system/settings"));
                    result.Entries.Add(new Entry
                    {
                        Name = "system_settings",
                        Uri = systemUri
                    });
                }
                return result;
            }
            return null;
        }

        public AboutViewModel GetAbout(string uri)
        {
            RequestManager requestManager = RequestManager.Initialize(uri);
            JObject jsonResult = requestManager.Run();
            if (requestManager.ResponseStatus.GetHashCode() == 440)
            {
                return new AboutViewModel();
            }
            else
            {
                return JsonConvert.DeserializeObject<AboutViewModel>(jsonResult.ToString());
            }
        }
    }
}
