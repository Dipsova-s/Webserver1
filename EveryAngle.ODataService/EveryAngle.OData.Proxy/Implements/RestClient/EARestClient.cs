using EveryAngle.OData.Settings;
using RestSharp;
using System;

namespace EveryAngle.OData.Proxy
{
    public class EARestClient : RestClient, IEARestClient
    {
        public EARestClient()
        {
            BaseUrl = new Uri(ODataSettings.Settings.Host, UriKind.Absolute);
            Timeout = ODataSettings.Settings.TimeOut;
            UserAgent = "EVERYANGLE.ODATA.SERVICE";
        }
    }
}
