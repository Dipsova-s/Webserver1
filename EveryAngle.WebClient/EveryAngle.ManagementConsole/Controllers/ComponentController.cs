using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Core.ViewModels.ModelServer;
using EveryAngle.WebClient.Service.HttpHandlers;
using EveryAngle.WebClient.Service.Security;
using Kendo.Mvc.UI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mime;
using System.Web.Mvc;

namespace EveryAngle.ManagementConsole.Controllers
{
    public class ComponentController : BaseController
    {
        readonly IComponentService _componentService;
        readonly IModelService _modelService;

        public ComponentController(IComponentService componentService, IModelService modelService)
        {
            _componentService = componentService;
            _modelService = modelService;
        }

        public ComponentController(
            IComponentService componentService,
            IModelService modelService,
            SessionHelper sessionHelper)
            : this(componentService, modelService)
        {
            SessionHelper = sessionHelper;
        }

        public ActionResult SystemComponents()
        {
            return PartialView("~/Views/Component/SystemComponent.cshtml");
        }

        public FileResult DownloadMetadata(string modelId, string componentUri)
        {
            ModelViewModel model = SessionHelper.GetModelById(modelId);
            ListViewModel<ModelServerViewModel> modelServers = _modelService.GetModelServers(model.ServerUri.ToString());
            ModelServerViewModel modelServer = modelServers.Data.FirstOrDefault(x => new Uri(x.server_uri).ToString() == new Uri(componentUri).ToString());

            string downloadFilename = string.Format("metadata_{0}_{1}.json", modelServer.id, modelServer.instance_id);
            RequestManager requestManager = RequestManager.Initialize(modelServer.metadata);
            byte[] downloadFileByte = requestManager.GetBinary();
            return File(downloadFileByte, MediaTypeNames.Application.Octet, downloadFilename);
        }

        public JsonResult GetComponentInfo(string modelId, string componentUri)
        {
            ModelViewModel model = SessionHelper.GetModelById(modelId);
            ListViewModel<ModelServerViewModel> modelServers = _modelService.GetModelServers(model?.ServerUri?.ToString());
            ModelServerViewModel modelServer = modelServers.Data.FirstOrDefault(x => new Uri(x.server_uri).ToString() == new Uri(componentUri).ToString());

            return Json(new
            {
                modelServerUri = modelServer.Uri,
                isCurrentInstance = model.current_instance != null && model.current_instance == modelServer.instance
            }, JsonRequestBehavior.AllowGet);
        }

        public JsonResult GetComponents()
        {
            IEnumerable<ComponentViewModel> components = _componentService.GetItems().OrderBy(x => x.ModelId);

            DataSourceResult result = new DataSourceResult
            {
                Data = components,
                Total = components.Count()
            };

            return Json(result, JsonRequestBehavior.AllowGet);
        }

        [AcceptVerbs(HttpVerbs.Delete)]
        public void DeleteComponent(Guid registrationId)
        {
            _componentService.Delete(registrationId);
        }
    }
}
