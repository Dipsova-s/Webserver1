using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using EveryAngle.WebClient.Service.HttpHandlers;
using Newtonsoft.Json.Linq;

namespace EveryAngle.ManagementConsole.Helpers
{
    public static class UrlHelperExtension
    {
        public static string Absolute(this UrlHelper url, string relativeOrAbsolute)
        {
            var uri = new Uri(relativeOrAbsolute, UriKind.RelativeOrAbsolute);
            if (uri.IsAbsoluteUri)
            {
                return relativeOrAbsolute;
            }
            // At this point, we know the url is relative.
            return VirtualPathUtility.ToAbsolute(relativeOrAbsolute);
        }

        public static JObject GetRestClientManager(string requestUrl)
        {
            var requestManager = RequestManager.Initialize(requestUrl);
            if (requestManager != null)
            {
                JObject jsonResult = null;
                jsonResult = requestManager.Run();
                return jsonResult;
            }

            return null;
        }

        /// <summary>
        /// Parallel request, will not skip error
        /// </summary>
        /// <param name="uriList"></param>
        /// <returns></returns>
        public static List<Task<JObject>> ParallelRequest(List<string> uriList)
        {
            return ParallelRequest(uriList, false);
        }

        /// <summary>
        /// Parallel request
        /// </summary>
        /// <param name="uriList"></param>
        /// <param name="skipError"></param>
        /// <returns></returns>
        public static List<Task<JObject>> ParallelRequest(List<string> uriList, bool skipError)
        {
            List<Task<JObject>> request = new List<Task<JObject>>();

            foreach (var uri in uriList)
            {
                request.Add(GetAsync(uri));
            }

            try
            {
                Task.WaitAll(request.ToArray());
            }
            catch (AggregateException ex)
            {
                int httpStatusCode = ((System.Web.Http.HttpResponseException)(((System.Exception)(ex))
                    .InnerException)).Response.StatusCode.GetHashCode();

                if (httpStatusCode == 440)
                {
                    throw new HttpException(440, "Login Time-out");
                }
                else if (httpStatusCode == 401)
                {
                    throw new HttpException(401, "UNAUTHORIZED");
                }
                else if (!skipError)
                {
                    throw ex;
                }
            }

            return request;
        }

        public static Task<JObject> GetAsync(string requestUrl)
        {
            var requestManager = RequestManager.Initialize(requestUrl);
            return requestManager.GetAsync();

        }
    }
}
