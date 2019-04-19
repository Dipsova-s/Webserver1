using EveryAngle.Logging;
using EveryAngle.WebClient.Service.HttpHandlers;
using EveryAngle.WebClient.Web.Models;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.IO;
using System.Web;
using System.Web.Mvc;

namespace EveryAngle.WebClient.Web.Controllers
{
    public class PageController : BaseController
    {
        [AcceptVerbs(HttpVerbs.Post)]
        public void Exit()
        {
            using (StreamReader reader = new StreamReader(Request.InputStream))
            {
                Log.SendInfo($"Begin: requests before leaving");
                string raw = reader.ReadToEnd();
                List<RequestModel> requests = JsonConvert.DeserializeObject<List<RequestModel>>(raw);
                foreach (RequestModel request in requests)
                {
                    try
                    {
                        RequestManager requestManager = RequestManager.Initialize(request.url);
                        requestManager.Run(request.method, request.data);
                    }
                    catch (HttpException ex)
                    {
                        Log.SendWarning($"Failed: {ex.Message}");
                    }
                }
                Log.SendInfo($"End: requests before leaving");
            }
        }
    }
}