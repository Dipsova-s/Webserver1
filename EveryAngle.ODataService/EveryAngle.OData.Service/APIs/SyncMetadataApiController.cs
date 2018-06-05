using EveryAngle.OData.App_Start;
using EveryAngle.OData.BackgroundWorkers;
using EveryAngle.OData.BusinessLogic.EdmBusinessLogics;
using EveryAngle.OData.BusinessLogic.Interfaces;
using EveryAngle.OData.ViewModel.Metadata;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace EveryAngle.OData.Service.APIs
{
    [RoutePrefix("api")]
    public class SyncMetadataApiController : BaseApiController
    {
        private readonly IMasterEdmModelBusinessLogic _edmModelBusinessLogic;

        public SyncMetadataApiController(IMasterEdmModelBusinessLogic edmModelBusinessLogic)
        {
            _edmModelBusinessLogic = edmModelBusinessLogic;
        }

        [Route("metadata")]
        public HttpResponseMessage Post(MetadataProcessViewModel process)
        {
            if (process != null && process.sync)
            {
                if (SyncMetadataProcess.IsRunning)
                    return CreateResponse(HttpStatusCode.Conflict, new { message = "Metadata is syncing, please wait." });

                // immediately start a process with reset the timer here.
                ODataApiConfig.RunSyncMetadataProcess();
            }

            return CreateResponse(HttpStatusCode.OK, new { });
        }

        [Route("metadata")]
        public HttpResponseMessage Get()
        {
            return CreateResponse(HttpStatusCode.OK, new { available = _edmModelBusinessLogic.IsAppServerAvailable(Context.User, retryChecking: false) });
        }
    }
}