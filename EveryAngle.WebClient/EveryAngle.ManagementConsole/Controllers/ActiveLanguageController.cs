using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.SystemLanguages;
using EveryAngle.Shared.Helpers;
using Kendo.Mvc.UI;
using EveryAngle.WebClient.Service.Security;

namespace EveryAngle.ManagementConsole.Controllers
{
    public class ActiveLanguageController : BaseController
    {
        private readonly IGlobalSettingService _globalSettingService;
        private readonly ILabelService _labelService;
        private readonly IModelService _modelService;

        public ActiveLanguageController(
            IModelService service, 
            ILabelService labelService,
            IGlobalSettingService globalSettingService,
            AuthorizationHelper authorizationHelper)
        {
            // testability only
            _modelService = service;
            _labelService = labelService;
            _globalSettingService = globalSettingService;
            AuthorizationHelper = authorizationHelper;
        }

        public ActiveLanguageController(
            IModelService service, 
            ILabelService labelService,
            IGlobalSettingService globalSettingService)
        {
            _modelService = service;
            _labelService = labelService;
            _globalSettingService = globalSettingService;
            AuthorizationHelper = AuthorizationHelper.Initialize();
        }

        public ActionResult GetModelLanguages(string modelUri)
        {
            var model = _modelService.GetModel(modelUri);

            ViewBag.ModelUri = modelUri;
            ViewBag.ModelId = model.id;
            ViewData["ModelLanguages"] = model.active_languages;
            ViewData["DefaultPageSize"] = DefaultPageSize;

            return PartialView("~/Views/Model/ModelLanguages/ModelLanguagesSetting.cshtml");
        }

        public ActionResult ReadLanguages([DataSourceRequest] DataSourceRequest request)
        {
            var sortLanguages = GetSortLanguages();
            var total = sortLanguages.Count;

            sortLanguages = sortLanguages.ToList();
            var result = new DataSourceResult
            {
                Data = sortLanguages,
                Total = total
            };

            return Json(result);
        }

        public void SaveActiveLanguages(string modelUri, string activeLanguages)
        {
            _modelService.UpdateModelActiveLanguages(modelUri, activeLanguages);
        }

        private List<SystemLanguageViewModel> GetSortLanguages()
        {
            var systemInfoModel = GetSystemLanguages(1, MaxPageSize);
            var defaultLanguage = systemInfoModel.Data.Where(f => f.Id.Equals("en")).ToList();
            var languages = systemInfoModel.Data.Except(defaultLanguage).ToList();
            var sortLanguages = defaultLanguage.Union(languages.OrderBy(lang => lang.Name)).ToList();
            return sortLanguages;
        }

        private ListViewModel<SystemLanguageViewModel> GetSystemLanguages(int page, int pagesize)
        {
            var systemInfoModel = _globalSettingService.GetSystemLanguages(AuthorizationHelper.Version.GetEntryByName("system_languages").Uri +
                                                        "?enabled=true&" +
                                                        UtilitiesHelper.GetOffsetLimitQueryString(page, pagesize));
            return systemInfoModel;
        }
    }
}
