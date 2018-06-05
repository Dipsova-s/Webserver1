using System;
using System.Web;

namespace EveryAngle.Shared.Helpers.HttpModules
{
    public sealed class RemoveServerHeaderModule : IHttpModule
    {
        public void Dispose() { }

        public void Init(HttpApplication context)
        {
            try
            {
                context.PreSendRequestHeaders += (sender, e) =>
                {
                    // response
                    var application = sender as HttpApplication;
                    if (application != null)
                    {
                        HttpResponse response = application.Response;
                        response.Headers.Remove("Server");
                    }
                };
            }
            catch
            {
                // REMARK:
                // DO NOTHING:
                // Others modules or internal response have no Headers provided with returns PlatformNotSupportedException
            }
        }
    }
}
