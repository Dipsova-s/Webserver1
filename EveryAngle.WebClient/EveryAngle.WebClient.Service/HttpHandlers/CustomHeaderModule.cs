using System;
using System.Web;

namespace EveryAngle.WebClient.Service.HttpHandlers
{
    public class CustomHeaderModule : IHttpModule
    {
        public void Dispose()
        { }

        public void Init(HttpApplication context)
        {
            context.EndRequest += new EventHandler(this.handle_EndRequest);
        }

        void handle_EndRequest(object sender, EventArgs e)
        {
            HttpRequest request = HttpContext.Current.Request;
            if (request != null)
            {
                var responseHeaders = request.Headers;
                if (responseHeaders != null)
                {
                    responseHeaders.Remove("Connection");
                }
            }
        }
    }
}
