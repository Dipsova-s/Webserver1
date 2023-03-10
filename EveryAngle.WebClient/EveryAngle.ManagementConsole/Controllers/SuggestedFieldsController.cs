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

        internal SuggestedFieldsController(IModelService service, IGlobalSettingService globalSettingService, SessionHelper sessionHelper)
            : this(service, globalSettingService)
        {
            SessionHelper = sessionHelper;
        }

        #region "Public"

        public ActionResult SuggestedFields(string modelUri)
        {
            var model = SessionHelper.GetModel(modelUri);

            ViewBag.ModelUri = modelUri;
            ViewBag.ModelId = model.id;
            ViewBag.FieldsUri = model.FieldsUri.ToString();
            ViewBag.DefaultPagesize = DefaultPageSize;
            ViewBag.MaxPageSize = MaxPageSize;
            ViewBag.MaxDomainElementsForSearch = SessionHelper.SystemSettings.max_domainelements_for_search;
            ViewBag.ClientSettings = SessionHelper.CurrentUser.Settings.client_settings;

            var offsetLimitQuery = UtilitiesHelper.GetOffsetLimitQueryString(1, MaxPageSize);

            var fieldCategory =
                globalSettingService.GetFieldCategories(SessionHelper.Version.GetEntryByName("field_categories").Uri +
                                                        "?" + offsetLimitQuery);

            var eventlog =
                globalSettingService.GetEventLogs(SessionHelper.Version.GetEntryByName("eventlog").Uri + "?type=mass_change_suggested").Data.FirstOrDefault();
            var summary = modelService.GetSuggestedFieldsSummary(model.suggested_fields_summary.ToString());
            summary.suggested_fields_timestamp = eventlog != null ? eventlog.timestamp : (long?) null;
            summary.suggested_fields_last_change = eventlog != null
                ? eventlog.arguments.FirstOrDefault(x => x.name == "manually_started_by") != null
                    ? Convert.ToString(eventlog.arguments.FirstOrDefault(x => x.name == "manually_started_by").value)
                    : "-"
                : "-";

            ViewData["fieldCategories"] = JsonConvert.SerializeObject(fieldCategory.Data);
            ViewData["BusinessProcesses"] =
                globalSettingService.GetBusinessProcesses(
                    SessionHelper.Version.GetEntryByName("business_processes").Uri + "?" + offsetLimitQuery);
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

            modelSuggestedFields = modelService.CreateTask($"{modelSuggestedFields.Uri}/execution",
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
