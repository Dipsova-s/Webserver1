using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Core.ViewModels.ModelServer;
using EveryAngle.ManagementConsole.Helpers;
using EveryAngle.WebClient.Domain.Enums;
using EveryAngle.WebClient.Service.HttpHandlers;
using EveryAngle.WebClient.Service.Security;
using Kendo.Mvc.UI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mime;
using System.Web;
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
            AuthorizationHelper sessionHelper)
            : this(componentService, modelService)
        {
            AuthorizationHelper = sessionHelper;
        }

        public ActionResult SystemComponents()
        {
            return PartialView("~/Views/Component/SystemComponent.cshtml");
        }

        public ActionResult DownloadMetadata(string metadataUri, string metadataName)
        {
            try
            {
                string downloadFilename = $"metadata_{metadataName}.json";
                RequestManager requestManager = RequestManager.Initialize(metadataUri);
                byte[] downloadFileByte = requestManager.GetBinary();
                return File(downloadFileByte, MediaTypeNames.Application.Octet, downloadFilename);
            }
            catch (HttpException ex)
            {
                return JsonHelper.GetJsonStringResult(false, ex.GetHttpCode(), ex.Message, MessageType.DEFAULT, null);
            }
        }

        public JsonResult GetComponents()
        {
            List<ModelViewModel> models = AuthorizationHelper.Models;
            List<ModelServerViewModel> modelServers = AuthorizationHelper.GetModelServers(models);

            IEnumerable<ComponentViewModel> components = _componentService.GetItems().OrderBy(x => x.ModelId);

            // Set information
            components.Where(x => x.IsInfoEnabled).ToList()
                .ForEach(x => x.SetModelServerInfo(modelServers, models.FirstOrDefault(y => y.id == x.ModelId)?.current_instance));

            DataSourceResult result = new DataSourceResult
            {
                Data = components,
                Total = components.Count()
            };

            return Json(result, JsonRequestBehavior.AllowGet);
        }

        public ActionResult GoToModellingWorkbench()
        {
            IEnumerable<ComponentViewModel> components = _componentService.GetItems().OrderBy(x => x.ModelId);
            string workbenchURI = components.Any(x => x.TypeName == "ModellingWorkbench") ? components.First(x => x.TypeName == "ModellingWorkbench").Uri : Shared.Helpers.UtilitiesHelper.GetWebClientUrl("") + "workbench";

            return new RedirectResult(workbenchURI);
        }

        [AcceptVerbs(HttpVerbs.Delete)]
        public void DeleteComponent(Guid registrationId)
        {
            _componentService.Delete(registrationId);
        }
    }
}
