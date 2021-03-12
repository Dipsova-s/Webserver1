using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels;
using EveryAngle.WebClient.Service.ApiServices;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;

namespace EveryAngle.WebClient.Web.Controllers
{
    public class ComponentController : BaseController
    {

        readonly IComponentService _componentService;
        public ComponentController()
        {
            _componentService = new ComponentService();
        }
        public ComponentController(IComponentService componentService)
        {
            _componentService = componentService;
        }

        public ActionResult GoToModellingWorkbench()
        {
            IEnumerable<ComponentViewModel> components = _componentService.GetItems().OrderBy(x => x.ModelId);
            string workbenchURI = components.Any(x => x.TypeName == "ModellingWorkbench") ? components.First(x => x.TypeName == "ModellingWorkbench").Uri : Shared.Helpers.UtilitiesHelper.GetWebClientUrl("") + "workbench";

            return new RedirectResult(workbenchURI);

        }
    }
}