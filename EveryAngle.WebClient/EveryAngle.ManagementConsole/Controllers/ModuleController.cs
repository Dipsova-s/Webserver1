using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Shared.Helpers;
using EveryAngle.Shared.Globalization;
using EveryAngle.WebClient.Service.HttpHandlers;

using Kendo.Mvc.Extensions;
using Kendo.Mvc.UI;
using Newtonsoft.Json;
using UrlHelper = EveryAngle.Shared.Helpers.UrlHelper;

using EveryAngle.WebClient.Service.Security;

namespace EveryAngle.ManagementConsole.Controllers
{
    public class ModuleController : BaseController
    {
        private readonly IModelService modelService;

        public ModuleController(IModelService service)
        {
            modelService = service;
        }

        private IEnumerable<ModuleListViewModel> GetModulesByUri(string modelUri)
        {
            var modules = modelService.GetModules(modelUri);
            var details = new List<ModuleListViewModel>();

            var moduleListViewModels = modelService.ModuleListViewModels.ToDictionary(x => x.id, x => x);

            int? newId = 1;
            var modelLength = modules.Count();
            for (var i = 0; i < modelLength; i++)
            {
                var item = modules.ElementAt(i);

                var output = new ModuleListViewModel();
                moduleListViewModels.TryGetValue(item.id, out output);
                if (output.Items == null)
                {
                    output.Items = new List<ModuleListViewModel>();
                }
                output.fakeId = newId;
                details.Add(output);
                FindRecursive(moduleListViewModels, item, output, details, ref newId);
                newId = newId + 1;
            }
            return details;
        }

        private List<ModuleListViewModel> FindRecursive(Dictionary<string, ModuleListViewModel> allModulesMedatada
            , ModuleViewModel module
            , ModuleListViewModel parent
            , List<ModuleListViewModel> details
            , ref int? newId)
        {
            var recursiveObjects = new List<ModuleListViewModel>();

            if (module.modules != null)
            {
                var moduleLength = module.modules.Count();
                for (var i = 0; i < moduleLength; i++)
                {
                    var item = module.modules[i];
                    newId = newId + 1;
                    var detail = new ModuleListViewModel();
                    allModulesMedatada.TryGetValue(item.id, out detail);
                    detail.fakeId = newId;
                    if (detail.Items == null)
                    {
                        detail.Items = new List<ModuleListViewModel>();
                    }

                    if (parent != null)
                    {
                        detail.parentId = parent.fakeId;
                    }
                    recursiveObjects.AddRange(FindRecursive(allModulesMedatada, item, detail, details, ref newId));
                    details.Add(detail);
                }
            }

            return recursiveObjects;
        }

        [AcceptVerbs(HttpVerbs.Get)]
        public ActionResult GetModules(string modelUri)
        {
            var model = SessionHelper.Initialize().GetModel(modelUri);
            ViewBag.ModelId = model.id;
            ViewBag.ModelUri = modelUri;
            return PartialView("~/Views/Model/Modules/ModuleList.cshtml");
        }

        [AcceptVerbs(HttpVerbs.Get)]
        public ContentResult GetModuleExtensionsDetail(string extensionUri)
        {
            var result = modelService.GetModuleExtensionsDetail(extensionUri);

            return Content(result, "application/json");
        }

        [AcceptVerbs(HttpVerbs.Put)]
        public ContentResult SaveModuleExtensionsDetail(string extensionUri, string extensionData)
        {
            var moduleExtensionsUri = extensionUri.Split('/');
            var moduleExtensionUri = string.Join("/", moduleExtensionsUri.Take(moduleExtensionsUri.Length - 2));
            var resultExtensionsDetail = modelService.UpdateModuleExtensionsDetail(extensionUri, extensionData);
            var resultExtension = modelService.GetModuleExtensionsDetail(moduleExtensionUri);
            var result = string.Format("{{\"module\":{0},\"extension\":{1}}}", resultExtension, resultExtensionsDetail);

            return Content(result, "application/json");
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public JsonResult ReadModules([DataSourceRequest] DataSourceRequest request, string modelUri)
        {
            var modules = GetModulesByUri(modelUri);
            ViewBag.ModelUri = modelUri;

            return Json(modules.ToTreeDataSourceResult(request), JsonRequestBehavior.AllowGet);
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult ValidateSaveModules(string modulesData, string modelUri)
        {
            var model = modelService.GetModel(modelUri);

            var requestManager = RequestManager.Initialize(model.Agent.ToString());
            var agentResult = requestManager.Run();

            var validateModuleUri = UrlHelper.GetRequestUrl(URLType.NOA) + agentResult.SelectToken("modules_uri") +
                                    "/validate";
            try
            {
                var validatedModules = modelService.ValidateSaveModules(validateModuleUri, modulesData);

                return new JsonResult
                {
                    Data =
                        new
                        {
                            validateStatus = 1,
                            validateResult = "",
                            errorCode = "",
                            modulesData = validatedModules,
                            errorReason = ""
                        },
                    JsonRequestBehavior = JsonRequestBehavior.AllowGet
                };
            }
            catch (HttpException ex)
            {
                return new JsonResult
                {
                    Data =
                        new
                        {
                            validateStatus = 0,
                            validateResult = ex.Message,
                            errorCode = ex.GetHttpCode(),
                            modulesData = "",
                            errorReason = ((HttpStatusCode) ex.GetHttpCode()).ToString()
                        },
                    JsonRequestBehavior = JsonRequestBehavior.AllowGet
                };
            }
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult SaveModules(string modulesData, string modelUri)
        {
            var model = modelService.GetModel(modelUri);

            var modules = JsonConvert.DeserializeObject<List<dynamic>>(modulesData);

            dynamic moduleList = new ExpandoObject();
            moduleList.module_list = modules;

            string moduleListUpdatingData = JsonConvert.SerializeObject(moduleList).ToString();

            var requestManager = RequestManager.Initialize(model.Agent.ToString());
            var agentResult = requestManager.Run();

            var moduleUri = UrlHelper.GetRequestUrl(URLType.NOA) + agentResult.SelectToken("modules_uri");

            modelService.UpdateModuleList(moduleUri, moduleListUpdatingData);

            return new JsonResult
            {
                Data = new {success = true, message = Resource.MC_ItemSuccesfullyUpdated},
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }
    }
}
