using EveryAngle.WebClient.Service.HttpHandlers;
using EveryAngle.WebClient.Service.Security;
using System;
using System.Net.Http;

namespace EveryAngle.WebClient.Web.Controllers.Apis
{
    public class CookieController : BaseApiController
    {
        public HttpResponseMessage Post()
        {
            return HttpResponseMessageBuilder.GetHttpResponseMessage(this, null);
        }

        public HttpResponseMessage Delete()
        {
            return HttpResponseMessageBuilder.GetHttpResponseMessage(this, null);
        }

        public HttpResponseMessage Put()
        {
            return HttpResponseMessageBuilder.GetHttpResponseMessage(this, null);
        }

        public DateTime UnixTimeStampToDateTime(double unixTimeStamp)
        {
            // Unix timestamp is seconds past epoch
            DateTime datetime = new DateTime(1970, 1, 1, 0, 0, 0, 0);
            datetime = datetime.AddSeconds(unixTimeStamp).ToLocalTime();
            return datetime;
        }

       
    }
}
