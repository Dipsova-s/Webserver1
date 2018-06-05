using EveryAngle.OData.Settings;
using EveryAngle.OData.Utils;
using EveryAngle.OData.ViewModel.Settings;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace EveryAngle.OData.Service.APIs
{
    [RoutePrefix("api")]
    public class ODataSettingsApiController : BaseApiController
    {
        [Route("settings")]
        public HttpResponseMessage Get()
        {
            return CreateResponse(ODataSettings.ViewModel);
        }

        [Route("settings")]
        public HttpResponseMessage Put()
        {
            dynamic setting = GetViewModel<dynamic>();

            if (setting == null)
                return CreateResponse(HttpStatusCode.OK, ODataSettings.ViewModel);

            ODataSettings.Update(setting);
            return CreateResponse(ODataSettings.ViewModel);
        }
    }
}