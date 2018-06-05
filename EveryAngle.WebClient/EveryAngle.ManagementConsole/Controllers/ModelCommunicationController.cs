using System.Collections.Generic;
using System.Web.Mvc;
using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Shared.Globalization;
using EveryAngle.WebClient.Service;

using Newtonsoft.Json;

using EveryAngle.WebClient.Service.Security;

namespace EveryAngle.ManagementConsole.Controllers
{
    public class ModelCommunicationController : BaseController
    {
        private readonly IModelService modelService;

        public ModelCommunicationController(IModelService service)
        {
            modelService = service;
        }

        public ActionResult GetCommunications(string modelUri)
        {
            var model = SessionHelper.Initialize().GetModel(modelUri);
            ViewBag.ModelId = model.id;
            return PartialView("~/Views/Model/Communications/ModelCommunications.cshtml", model);
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult SaveModelCommunication(string modelUri, string companyInformationsData,
            string emailSettingsData)
        {
            var model = SessionHelper.Initialize().GetModel(modelUri);
            model.CompanyInformation =
                JsonConvert.DeserializeObject<CompanyInformationViewModel>(companyInformationsData);
            model.EmailSettings = JsonConvert.DeserializeObject<EmailSettingsViewModel>(emailSettingsData);
            modelService.UpdateModel(modelUri, JsonConvert.SerializeObject(model, new JsonSerializerSettings
            {
                ContractResolver =
                    new CleanUpPropertiesResolver(new List<string>
                    {
                        "id",
                        "type",
                        "short_name",
                        "long_name",
                        "abbreviation",
                        "latest_instance",
                        "userModelPriveledge",
                        "agent_uri",
                        "licence_labels",
                        "environment",
                        "active_languages",
                        "authorized_users",
                        "model_status",
                        "type",
                        "ReOrderrecipients"
                    })
            }));
            return new JsonResult
            {
                Data = new {success = true, message = Resource.MC_ItemSuccesfullyUpdated},
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }
    }
}
