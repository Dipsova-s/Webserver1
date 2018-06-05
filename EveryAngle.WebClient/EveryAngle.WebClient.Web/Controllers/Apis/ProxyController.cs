using EveryAngle.Shared.Helpers;
using EveryAngle.WebClient.Service.HttpHandlers;
using Newtonsoft.Json.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;
using System.Net.Mime;
using RestSharp;
using System;

namespace EveryAngle.WebClient.Web.Controllers.Apis
{
    public class ProxyController : BaseApiController
    {
        public HttpResponseMessage Get()
        {
            string requestUrl = RequestManager.GetProxyRequestUrl();
            RequestManager requestManager = RequestManager.Initialize("/" + requestUrl);
            JObject jsonResult = new JObject();

            if (requestUrl.EndsWith("/file") || requestUrl.Contains("/download"))
            {
                HttpResponseMessage httpResponseMessage = new HttpResponseMessage(HttpStatusCode.OK);

                string contentDisposition = string.Empty;
                byte[] fileData = requestManager.GetBinary(ref contentDisposition);

                httpResponseMessage.Content = new ByteArrayContent(fileData);
                httpResponseMessage.Content.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
                httpResponseMessage.Content.Headers.Add("content-disposition", contentDisposition);

                return httpResponseMessage;
            }
            else
            {
                jsonResult = requestManager.Run();
            }

            return HttpResponseMessageBuilder.GetHttpResponseMessage(this, jsonResult, requestManager.ResponseStatus.GetHashCode());
        }

        public HttpResponseMessage Put()
        {
            string requestUrl = RequestManager.GetProxyRequestUrl();
            var requestManager = RequestManager.Initialize(requestUrl);
            var jsonResult = requestManager.Run(Method.PUT, this.Body);
            return HttpResponseMessageBuilder.GetHttpResponseMessage(this, jsonResult, requestManager.ResponseStatus.GetHashCode());
        }

        public HttpResponseMessage Post()
        {
            string requestUrl = RequestManager.GetProxyRequestUrl();
            var requestManager = RequestManager.Initialize(requestUrl);
            var jsonResult = requestManager.Run(Method.POST, this.Body);

            return HttpResponseMessageBuilder.GetHttpResponseMessage(this, jsonResult, requestManager.ResponseStatus.GetHashCode());
        }

        public HttpResponseMessage Delete()
        {
            string requestUrl = RequestManager.GetProxyRequestUrl();
            var requestManager = RequestManager.Initialize(requestUrl);
            var jsonResult = requestManager.Run(Method.DELETE);
            return HttpResponseMessageBuilder.GetHttpResponseMessage(this, jsonResult, requestManager.ResponseStatus.GetHashCode());
        }

    }
}
