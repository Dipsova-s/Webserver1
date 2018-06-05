using System.Linq;
using System.Web.Mvc;
using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Shared.Helpers;

using Newtonsoft.Json;
using EveryAngle.WebClient.Service.Security;
using System;

namespace EveryAngle.ManagementConsole.Controllers
{
    public class SuggestedFieldsController : BaseController
    {
        private readonly IGlobalSettingService globalSettingService;
        private readonly IModelService modelService;

        public SuggestedFieldsController(IModelService service, IGlobalSettingService globalSettingService)
        {
            modelService = service;
            this.globalSettingService = globalSettingService;
        }

        #region "Public"

        public ActionResult SuggestedFields(string modelUri)
        {
            var sessionHelper = SessionHelper.Initialize();
            var model = sessionHelper.GetModel(modelUri);

            ViewBag.ModelUri = modelUri;
            ViewBag.ModelId = model.id;
            ViewBag.FieldsUri = model.FieldsUri.ToString();
            ViewBag.DefaultPagesize = DefaultPageSize;
            ViewBag.MaxPageSize = MaxPageSize;
            ViewBag.MaxDomainElementsForSearch = sessionHelper.SystemSettings.max_domainelements_for_search;
            ViewBag.ClientSettings = sessionHelper.CurrentUser.Settings.client_settings;

            var offsetLimitQuery = UtilitiesHelper.GetOffsetLimitQueryString(1, MaxPageSize);

            var fieldCategory =
                globalSettingService.GetFieldCategories(sessionHelper.Version.GetEntryByName("field_categories").Uri +
                                                        "?" + offsetLimitQuery);
            var eventlog =
                globalSettingService.GetEventLogs(sessionHelper.Version.GetEntryByName("eventlog").Uri +
                                                  "?type=mass_change_suggested").Data.FirstOrDefault();
            var summary = modelService.GetSuggestedFieldsSummary(model.suggested_fields_summary.ToString());
            summary.suggested_fields_timestamp = eventlog != null ? eventlog.timestamp : (long?) null;
            summary.suggested_fields_last_change = eventlog != null
                ? eventlog.arguments.Where(x => x.name == "manually_started_by").FirstOrDefault() != null
                    ? Convert.ToString(eventlog.arguments.Where(x => x.name == "manually_started_by").First().value)
                    : "-"
                : "-";

            ViewData["fieldCategories"] = JsonConvert.SerializeObject(fieldCategory.Data);
            ViewData["BusinessProcesses"] =
                globalSettingService.GetBusinessProcesses(
                    sessionHelper.Version.GetEntryByName("business_processes").Uri + "?" + offsetLimitQuery);
            ViewData["ModelData"] = model;
            ViewData["SuggestedFieldsSummaryData"] = summary;

            return PartialView("~/Views/Model/SuggestedFields/SuggestedFieldsPage.cshtml");
        }

        public ActionResult GetModelClasses(string modelClassesUri)
        {
            var modelClasses = modelService.GetClasses(modelClassesUri);
            return Json(modelClasses, JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetModelAngles(string modelAnglesUri)
        {
            var modelClasses = modelService.GetModelAngles(modelAnglesUri);
            return Content(modelClasses, "application/json");
        }

        public ActionResult SaveSuggestedByClasses(string taskData)
        {
            var version = SessionHelper.Initialize().Version;
            var modelSuggestedFields = modelService.CreateTask(version.GetEntryByName("tasks").Uri.ToString(), taskData);

            modelSuggestedFields = modelService.CreateTask(modelSuggestedFields.Uri + "/execution",
                "{\"start\":true,\"reason\":\"Manual execute from MC\"}");
            return Json(modelSuggestedFields, JsonRequestBehavior.AllowGet);
        }

        public ActionResult SaveSuggestedByField(string suggestedFieldUri, string suggestedFieldData)
        {
            var result = modelService.UpdateField(suggestedFieldUri, suggestedFieldData);
            return Json(result, JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetModelSuggested(string modelSuggestedUri)
        {
            var modelSuggested = modelService.GetTask(modelSuggestedUri);
            return Json(modelSuggested, JsonRequestBehavior.AllowGet);
        }

        #endregion
    }
}
