using EveryAngle.Logging;
using EveryAngle.WebClient.Service.HttpHandlers;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using RestSharp;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace EveryAngle.WebClient.Web.Controllers
{
    public class CancelController : BaseController
    {
        [AcceptVerbs(HttpVerbs.Delete)]
        public void AbortAll(IList<string> uris)
        {
            Log.SendInfo("Abort results: {0}", string.Join(", ", uris));
            HttpContext context = System.Web.HttpContext.Current;
            Task.Run(() =>
            {
                foreach (string uri in uris)
                    DeleteAsync(uri, context);
            });
            Log.SendInfo("Response to client");
        }

        private void DeleteAsync(string requestUrl, HttpContext context)
        {
            var requestManager = RequestManager.Initialize(requestUrl);
            requestManager.DeleteAsync(context, false);
        }

    }
}