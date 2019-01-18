using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Core.ViewModels.ModelServer;
using EveryAngle.WebClient.Domain.Enums;
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

        public JsonResult GetComponents()
        {
            List<ModelViewModel> models = SessionHelper.Models;
            List<ModelServerViewModel> modelServers = SessionHelper.GetModelServers(models);

            IEnumerable<ComponentViewModel> components = _componentService.GetItems().OrderBy(x => x.ModelId);

            // M4-53574 : Fast fix for get information
            components.Where(x => x.Type.Equals(ComponentServiceManagerType.ClassicModelQueryService)).ToList()
                .ForEach(x => x.SetModelServerInfo(modelServers, models.FirstOrDefault(y => y.id == x.ModelId)?.current_instance));

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
