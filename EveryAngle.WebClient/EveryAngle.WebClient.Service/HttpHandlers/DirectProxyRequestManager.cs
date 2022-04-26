using System;
using System.Net;
using System.Web;
using RestSharp;

namespace EveryAngle.WebClient.Service.HttpHandlers
{
    public class DirectProxyRequestManager : RequestManager
    {
        protected override string[] CookiesToIgnore => new[] { "EASECTOKEN" }; // Do not add the old EASECTOKEN, We need STSSEASECTOKEN to pass directly to Appserver

        protected DirectProxyRequestManager(string uri) : base(uri) { }

        public static new DirectProxyRequestManager Initialize(string requestUrl)
        {
            return new DirectProxyRequestManager(requestUrl);
        }

        public static new string GetProxyRequestUrl()
        {
            return GetProxyRequestUrl(null);
        }

        public static new string GetProxyRequestUrl(HttpContext context)
        {
            var currentContext = context ?? HttpContext.Current;
            var url = currentContext.Request.RawUrl;
            var transparentProxyPath = "api/directproxy/";

            var indexOfProxyPath = url.ToLowerInvariant().LastIndexOf(transparentProxyPath.ToLowerInvariant(), StringComparison.InvariantCulture);
            var startIndexOfRequestUrl = indexOfProxyPath + transparentProxyPath.Length;
            url = url.Substring(startIndexOfRequestUrl, url.Length - startIndexOfRequestUrl);
            url = url.Replace(transparentProxyPath, "");

            return url;
        }

        public new string Run()
        {
            return Execute(uri, Method.GET, string.Empty, DataFormat.Xml);
        }

        protected override void ExecuteWhenResponseCodeUnauthorized(IRestResponse response)
        {
            throw new HttpException((int)HttpStatusCode.Unauthorized, response.Content);
        }

        private string Execute(string requestUrl, Method method, string content, DataFormat requestFormat)
        {
            string responseContent = ExecuteForContent(requestFormat, requestUrl, method, content);
            return !string.IsNullOrEmpty(responseContent) ? responseContent : string.Empty;
        }
    }
}
